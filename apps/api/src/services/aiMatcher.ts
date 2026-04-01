import OpenAI from "openai";
import type { CandidateProfile, JobRecord, JobMatch } from "packages/shared/src/index";

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
};

const SYSTEM_PROMPT = `
You are an expert technical recruiter and AI job matcher.
Your task is to analyze a candidate's profile against a specific job record and output a structured JSON evaluation.

Rules:
1. ONLY return a valid JSON object. Do not wrap in markdown blocks like \`\`\`json.
2. The JSON object must exactly match this expected structure:
{
  "matchScore": <number 0-100>,
  "matchedSkills": [<string>],
  "missingSkills": [<string>],
  "experienceFit": "low" | "medium" | "high",
  "roleFit": "low" | "medium" | "high",
  "reasoning": "<short string explaining the fit, max 2 sentences>",
  "recommendation": "apply" | "consider" | "low-fit"
}
3. "matchScore" should reflect the overall fit based on skills (40%), role (25%), experience (20%), location/mode (10%), and domain (5%).
4. "reasoning" must be concise and based purely on the provided data.
5. "recommendation" must strictly be one of: "apply" (score >= 75), "consider" (score 50-74), or "low-fit" (score < 50).
`;

type AIResult = Omit<JobMatch, "jobId" | "title" | "company">;

export const evaluateMatchWithAI = async (
  candidateProfile: CandidateProfile,
  job: JobRecord
): Promise<AIResult | null> => {
  const openai = getOpenAIClient();
  if (!openai) {
    return null; // Signals fallback to rule-based
  }

  const promptMessage = `
Candidate Profile:
${JSON.stringify({
  roles: candidateProfile.roles,
  skills: candidateProfile.skills,
  experience: candidateProfile.yearsOfExperience,
  summary: candidateProfile.summary,
  projects: candidateProfile.projects
}, null, 2)}

Job Record:
${JSON.stringify({
  title: job.title,
  company: job.company,
  skills: job.skills,
  roleKeywords: job.roleKeywords,
  experience: job.seniority,
  description: job.description
}, null, 2)}

Evaluate and return the structured JSON strictly following the rules.
  `.trim();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective model for text tasks
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: promptMessage }
      ],
      temperature: 0.2, // Low temp for more deterministic output
      response_format: { type: "json_object" } 
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as Partial<AIResult>;

    // Basic Structure Validation
    if (
      typeof parsed.matchScore !== "number" ||
      !Array.isArray(parsed.matchedSkills) ||
      !Array.isArray(parsed.missingSkills) ||
      !["low", "medium", "high"].includes(parsed.experienceFit as string) ||
      !["low", "medium", "high"].includes(parsed.roleFit as string) ||
      typeof parsed.reasoning !== "string" ||
      !["apply", "consider", "low-fit"].includes(parsed.recommendation as string)
    ) {
      console.warn(`[AI Matcher] Invalid AI output format for job ${job.id}`, parsed);
      return null;
    }

    return {
      matchScore: parsed.matchScore,
      matchedSkills: parsed.matchedSkills as string[],
      missingSkills: parsed.missingSkills as string[],
      experienceFit: parsed.experienceFit as "low" | "medium" | "high",
      roleFit: parsed.roleFit as "low" | "medium" | "high",
      reasoning: parsed.reasoning,
      recommendation: parsed.recommendation as "apply" | "consider" | "low-fit"
    };
  } catch (error) {
    console.error(`[AI Matcher] API Error for job ${job.id}:`, error);
    return null;
  }
};
