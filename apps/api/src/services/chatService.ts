import { getOpenAIClient } from "./aiMatcher";
import type { ChatMessage, CandidateProfile, JobMatch } from "packages/shared/src/index";

export const handleChat = async (
  messages: ChatMessage[],
  profile?: CandidateProfile,
  matches?: JobMatch[]
): Promise<string> => {
  if (!messages || messages.length === 0) {
    return "Xin chào, tôi có thể giúp gì cho bạn?";
  }

  const lastUserMessage = messages[messages.length - 1].content.toLowerCase();
  const topMatches = (matches || []).slice(0, 5);

  const contextText = `
Candidate Profile:
- Skills: ${profile?.skills?.join(", ") || "None"}
- Experience: ${profile?.yearsOfExperience || 0} years
- Roles: ${profile?.roles?.join(", ") || "None"}

Top ${topMatches.length} Matches Context:
${topMatches.map((m, i) => `${i + 1}. Job ID: ${m.jobId} | Title: ${m.title} | Company: ${m.company} | Score: ${m.matchScore}% | Recommendation: ${m.recommendation} | Missing Skills: ${m.missingSkills.join(", ") || "None"}`).join("\n")}
  `.trim();

  const openai = getOpenAIClient();

  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `You are an AI Job Matching Assistant. Answer the user's questions clearly, concisely, and exclusively in Vietnamese.\nHere is the current context (based on actual user data):\n${contextText}`,
          },
          ...messages,
        ],
      });

      const reply = completion.choices[0]?.message?.content?.trim();
      if (reply) return reply;
    } catch (error) {
      console.error("OpenAI Chat error, falling back locally:", error);
    }
  }

  // Fallback: Template/Rule-based responses
  if (lastUserMessage.includes("phù hợp nhất") || lastUserMessage.includes("tốt nhất")) {
    if (topMatches.length > 0) {
      const best = topMatches[0];
      return `Dựa trên kết quả chấm điểm, công việc phù hợp nhất với bạn là **${best.title}** tại **${best.company}** với điểm độ khớp là ${best.matchScore}%.`;
    }
    return "Hiện tại tôi chưa tìm thấy công việc nào phù hợp trong hệ thống.";
  }

  if (lastUserMessage.includes("thiếu") || lastUserMessage.includes("kỹ năng")) {
    if (topMatches.length > 0) {
      const best = topMatches[0];
      if (best.missingSkills.length > 0) {
        return `Để ứng tuyển tốt hơn vào job top 1 (${best.title}), bạn đang còn thiếu các kỹ năng: ${best.missingSkills.join(", ")}.`;
      }
      return `Bạn đã có đủ kỹ năng yêu cầu cho vị trí top 1 (${best.title}) nhé!`;
    }
  }
  
  if (lastUserMessage.includes("chào")) {
    return "Chào bạn, tôi là trợ lý AI, hiện đang chạy ở chế độ Local (Rule-based). Bạn có muốn hỏi tôi job nào phù hợp nhất với bạn không?";
  }

  return `Tôi là trợ lý AI (Local Sandbox Mode). Hiện bạn có ${topMatches.length} jobs nổi bật. Vui lòng thêm OpenAI API Key để tôi có thể phân tích ngữ nghĩa sâu hơn về ${profile?.fullName ?? "hồ sơ của bạn"}.`;
};
