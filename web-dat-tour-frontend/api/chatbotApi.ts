const API_GATEWAY =
  process.env.NEXT_PUBLIC_API_GATEWAY || "http://localhost:8080";

export interface TourSummary {
  id: string;
  title: string;
  location: string;
  price: number;
  duration_days: number;
  rating: number;
  tags: string[];
  thumbnail_url?: string;
}

export interface SuggestedQuestion {
  question: string;
}

export interface ChatHistoryItem {
  role: "user" | "model";
  content: string;
}

export interface ChatbotResponse {
  reply: string;
  intent?: string;
  sentiment?: string;
  suggested_tours?: TourSummary[];
  suggested_questions?: SuggestedQuestion[];
  requires_human_support?: boolean;
  tool_calls?: any[];
}

export async function sendChatbotMessage(
  message: string,
  history: ChatHistoryItem[] = [],
  sessionId: string = "default_session"
): Promise<ChatbotResponse> {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // FastAPI uses /api/chat/ as endpoint (routed via /ai/chat/ in Gateway)
    const res = await fetch(`${API_GATEWAY}/ai/chat/`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message,
        history: history.slice(-10),
        session_id: sessionId,
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    // If backend returns ChatResponse directly (not wrapped in status/data envelope)
    if (data && typeof data.reply === "string") {
      return {
        reply: data.reply,
        intent: data.intent,
        sentiment: data.sentiment,
        suggested_tours: data.suggested_tours || [],
        suggested_questions: data.suggested_questions || [],
        requires_human_support: data.requires_human_support || false,
        tool_calls: data.tool_calls || [],
      };
    }

    // Fallback if there's a status/data envelope
    if (data?.status === 200 && data?.data) {
      const actualData = data.data;
      return {
        reply: actualData.reply || "Đã nhận câu hỏi của bạn, vui lòng chờ!",
        intent: actualData.intent,
        sentiment: actualData.sentiment,
        suggested_tours: actualData.suggested_tours || [],
        suggested_questions: actualData.suggested_questions || [],
        requires_human_support: actualData.requires_human_support || false,
        tool_calls: actualData.tool_calls || [],
      };
    }

    return {
      reply:
        data?.message ||
        "Xin lỗi, tôi không thể trả lời ngay lúc này. Vui lòng thử lại sau!",
      suggested_tours: [],
      suggested_questions: [],
      tool_calls: [],
    };
  } catch (err) {
    console.error("Chatbot API Error:", err);
    return {
      reply:
        "Xin lỗi, không thể kết nối tới máy chủ AI. Vui lòng kiểm tra kết nối mạng và thử lại!",
      suggested_tours: [],
      suggested_questions: [],
      tool_calls: [],
    };
  }
}

