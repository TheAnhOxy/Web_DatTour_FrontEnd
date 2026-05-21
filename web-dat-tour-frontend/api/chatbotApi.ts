const API_GATEWAY =
  process.env.NEXT_PUBLIC_API_GATEWAY || "http://localhost:8080";

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface ChatbotResponse {
  reply: string;
  conversationId?: string;
}

export async function sendChatbotMessage(
  message: string,
  history: ChatHistoryItem[] = [],
  conversationId?: string
): Promise<ChatbotResponse> {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_GATEWAY}/ai/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message,
        history: history.slice(-10),
        conversationId,
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    if (data?.status === 200 && data?.data) {
      return {
        reply:
          data.data.reply ||
          data.data.message ||
          "Đã nhận câu hỏi của bạn, vui lòng chờ!",
        conversationId: data.data.conversationId,
      };
    }

    return {
      reply:
        data?.message ||
        "Xin lỗi, tôi không thể trả lời ngay lúc này. Vui lòng thử lại sau!",
    };
  } catch {
    return {
      reply:
        "Xin lỗi, không thể kết nối tới máy chủ AI. Vui lòng kiểm tra kết nối mạng và thử lại!",
    };
  }
}
