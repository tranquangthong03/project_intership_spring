import cors from "cors";
import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import pdfParse from "pdf-parse";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const uploadsDir = path.join(process.cwd(), "uploads");

fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const safeBase = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeBase}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      cb(new Error("Only PDF files are allowed."));
      return;
    }

    cb(null, true);
  }
});

const normalizeList = (value: string): string[] => {
  return value
    .split(/[\n,;|]/)
    .map((item) => item.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean);
};

const findValueByLabel = (lines: string[], labels: string[]): string | null => {
  for (const line of lines) {
    const lower = line.toLowerCase();
    for (const label of labels) {
      const pattern = new RegExp(`^${label}\\s*[:\\-]\\s*(.+)$`, "i");
      const match = line.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }

      if (lower.startsWith(label + " ") && line.includes(":")) {
        const parts = line.split(":");
        if (parts[1]) {
          return parts.slice(1).join(":").trim();
        }
      }
    }
  }
  return null;
};

const extractSectionList = (lines: string[], labels: string[]): string[] => {
  for (let i = 0; i < lines.length; i += 1) {
    const lower = lines[i].toLowerCase();
    if (labels.some((label) => lower.startsWith(label))) {
      const inlineValue = lines[i].includes(":") ? lines[i].split(":").slice(1).join(":").trim() : "";
      if (inlineValue) {
        return normalizeList(inlineValue);
      }

      const nextLines = lines.slice(i + 1, i + 4);
      return normalizeList(nextLines.join("\n"));
    }
  }
  return [];
};

const extractTextFromPdf = async (filePath: string): Promise<string> => {
  try {
    const dataBuffer = await fs.promises.readFile(filePath);
    const parsed = await pdfParse(dataBuffer);
    return (parsed.text || "").trim();
  } catch (error) {
    console.warn("Failed to parse PDF", error);
    return "";
  }
};

const buildCandidateProfile = (rawText: string) => {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const emailMatch = rawText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = rawText.match(/(\+?\d[\d\s().-]{7,}\d)/);
  const yearsMatch = rawText.match(/(\d+)\+?\s+(years|year|nam)\b/i);

  return {
    fullName: findValueByLabel(lines, ["full name", "name", "ho va ten"]),
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0].trim() : null,
    location: findValueByLabel(lines, ["location", "address", "dia chi"]),
    summary: findValueByLabel(lines, ["summary", "objective", "profile", "gioi thieu"]),
    yearsOfExperience: yearsMatch ? Number(yearsMatch[1]) : 0,
    roles: extractSectionList(lines, ["roles", "role", "position", "title"]),
    skills: extractSectionList(lines, ["skills", "technical skills", "ky nang", "tech stack"]),
    education: extractSectionList(lines, ["education", "hoc van", "education history", "academic"]),
    projects: extractSectionList(lines, ["projects", "du an", "project"]),
    rawText
  };
};

type JobFixture = {
  id: string;
  source: string;
  title: string;
  company: string;
  location: string | null;
  workMode: "onsite" | "hybrid" | "remote" | "unknown";
  seniority: "intern" | "fresher" | "junior" | "middle" | "senior" | "lead" | "unknown";
  salaryMin: number | null;
  salaryMax: number | null;
  currency: "VND" | "USD" | null;
  skills: string[];
  roleKeywords: string[];
  description: string;
  url: string;
};

type JobMatch = {
  jobId: string;
  title: string;
  company: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceFit: "low" | "medium" | "high";
  roleFit: "low" | "medium" | "high";
  reasoning: string;
  recommendation: "apply" | "consider" | "low-fit";
};

const repoRoot = path.resolve(process.cwd(), "..", "..");
const jobsPath = path.resolve(repoRoot, "fixtures", "sample_jobs.json");
let cachedJobs: JobFixture[] | null = null;

const loadJobs = async (): Promise<JobFixture[]> => {
  if (cachedJobs) {
    return cachedJobs;
  }

  try {
    const raw = await fs.promises.readFile(jobsPath, "utf8");
    const parsed = JSON.parse(raw) as JobFixture[];
    cachedJobs = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to load fixtures", error);
    cachedJobs = [];
  }

  return cachedJobs;
};

const toLower = (value: string) => value.toLowerCase();

const computeRoleFit = (roles: string[], job: JobFixture): "low" | "medium" | "high" => {
  if (roles.length === 0) {
    return "medium";
  }

  const roleTokens = roles.map(toLower);
  const title = toLower(job.title);
  const keywordTokens = job.roleKeywords.map(toLower);

  const hasMatch = roleTokens.some((role) => title.includes(role) || keywordTokens.includes(role));
  return hasMatch ? "high" : "medium";
};

const experienceMinYears = (seniority: JobFixture["seniority"]) => {
  switch (seniority) {
    case "intern":
    case "fresher":
      return 0;
    case "junior":
      return 1;
    case "middle":
      return 3;
    case "senior":
      return 5;
    case "lead":
      return 7;
    default:
      return null;
  }
};

const computeExperienceFit = (years: number, job: JobFixture): "low" | "medium" | "high" => {
  const minYears = experienceMinYears(job.seniority);
  if (minYears === null) {
    return "medium";
  }

  if (years >= minYears) {
    return "high";
  }

  if (years === 0 && minYears > 0) {
    return "low";
  }

  return "medium";
};

const computeLocationFit = (location: string | null, jobLocation: string | null): boolean => {
  if (!location || !jobLocation) {
    return false;
  }

  const candidateLocation = toLower(location);
  const targetLocation = toLower(jobLocation);
  return candidateLocation.includes(targetLocation) || targetLocation.includes(candidateLocation);
};

const computeMatchScore = (
  matchedSkills: string[],
  totalSkills: number,
  roleFit: "low" | "medium" | "high",
  experienceFit: "low" | "medium" | "high",
  locationFit: boolean
) => {
  const skillScore = totalSkills > 0 ? matchedSkills.length / totalSkills : 0;
  const roleScore = roleFit === "high" ? 1 : roleFit === "medium" ? 0.6 : 0.2;
  const expScore = experienceFit === "high" ? 1 : experienceFit === "medium" ? 0.6 : 0.2;
  const locationScore = locationFit ? 1 : 0;
  const weighted = skillScore * 45 + roleScore * 25 + expScore * 20 + locationScore * 10;
  return Math.round(weighted);
};

const buildReasoning = (
  matched: number,
  total: number,
  roleFit: string,
  experienceFit: string,
  locationFit: boolean
) => {
  const locationNote = locationFit ? "location match" : "location not matched";
  return `Skills ${matched}/${total}, role ${roleFit}, experience ${experienceFit}, ${locationNote}.`;
};

const computeRecommendation = (matchScore: number): "apply" | "consider" | "low-fit" => {
  if (matchScore >= 75) {
    return "apply";
  }

  if (matchScore >= 50) {
    return "consider";
  }

  return "low-fit";
};

const matchJobs = (candidateProfile: ReturnType<typeof buildCandidateProfile>, jobs: JobFixture[]): JobMatch[] => {
  const candidateSkills = new Set(candidateProfile.skills.map(toLower));
  const candidateRoles = candidateProfile.roles || [];

  return jobs
    .map((job) => {
      const matchedSkills = job.skills.filter((skill) => candidateSkills.has(toLower(skill)));
      const missingSkills = job.skills.filter((skill) => !candidateSkills.has(toLower(skill)));
      const roleFit = computeRoleFit(candidateRoles, job);
      const experienceFit = computeExperienceFit(candidateProfile.yearsOfExperience, job);
      const locationFit = computeLocationFit(candidateProfile.location, job.location);
      const matchScore = computeMatchScore(matchedSkills, job.skills.length, roleFit, experienceFit, locationFit);

      return {
        jobId: job.id,
        title: job.title,
        company: job.company,
        matchScore,
        matchedSkills,
        missingSkills,
        experienceFit,
        roleFit,
        reasoning: buildReasoning(matchedSkills.length, job.skills.length, roleFit, experienceFit, locationFit),
        recommendation: computeRecommendation(matchScore)
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
};

app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.post("/upload-cv", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, error: { message: "Missing file." } });
    return;
  }

  const rawText = await extractTextFromPdf(req.file.path);
  const candidateProfile = buildCandidateProfile(rawText);
  const jobs = await loadJobs();
  const matches = matchJobs(candidateProfile, jobs);

  res.json({
    success: true,
    data: {
      fileName: req.file.originalname,
      size: req.file.size,
      storagePath: path.join("uploads", req.file.filename),
      candidateProfile,
      matches
    }
  });
});

app.post("/match", async (req, res) => {
  const candidateProfile = req.body?.candidateProfile as ReturnType<typeof buildCandidateProfile> | undefined;

  if (!candidateProfile || !Array.isArray(candidateProfile.skills)) {
    res.status(400).json({ success: false, error: { message: "Missing candidateProfile." } });
    return;
  }

  const jobs = await loadJobs();
  const matches = matchJobs(candidateProfile, jobs);

  res.json({
    success: true,
    data: {
      candidateProfile,
      matches
    }
  });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(400).json({ success: false, error: { message: err.message } });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
