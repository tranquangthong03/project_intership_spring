"use client";

import { useState, useRef, useEffect } from "react";
import type { CandidateProfile, JobMatch, ChatMessage, ApiResponse, ChatResponsePayload } from "packages/shared/src/index";

type Props = {
  profile: CandidateProfile;
  matches: JobMatch[];
};

export function ChatAssistant({ profile, matches }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const conversation = [...messages, userMessage];
    setMessages(conversation);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000") + "/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: conversation,
            candidateProfile: profile,
            matches: matches,
          }),
        }
      );

      const payload: ApiResponse<ChatResponsePayload> = await response.json();
      if (!payload.success || !payload.data) {
        throw new Error(payload.error?.message || "Lỗi phản hồi từ server");
      }

      setMessages([
        ...conversation,
        { role: "assistant", content: payload.data.reply },
      ]);
    } catch (error) {
      setMessages([
        ...conversation,
        { role: "assistant", content: `❌ Lỗi: ${error instanceof Error ? error.message : "Đã có lỗi xảy ra."}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        className="chat-toggle-btn"
        onClick={() => setIsOpen(true)}
      >
        💬 Ask AI Assistant
      </button>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>✨ AI Career Assistant</h3>
        <button onClick={() => setIsOpen(false)}>✕</button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <p>Hỏi tôi bất kỳ điều gì về hồ sơ của bạn! Ví dụ:</p>
            <ul>
              <li>"Công việc nào phù hợp nhất với tôi?"</li>
              <li>"Tôi đang thiếu kỹ năng gì?"</li>
            </ul>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`chat-bubble chat-bubble-${msg.role}`}>
              {msg.content}
            </div>
          ))
        )}
        {loading && (
          <div className="chat-bubble chat-bubble-assistant">
            <span className="chat-loading-dots">...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Nhập câu hỏi..."
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          Gửi
        </button>
      </div>
    </div>
  );
}
