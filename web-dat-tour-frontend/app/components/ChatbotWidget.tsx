"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  sendChatbotMessage,
  ChatHistoryItem,
  TourSummary,
  SuggestedQuestion,
} from "../../api/chatbotApi";

import { useAuthStore } from "../../store/authStore";
import bookingApi from "../../api/bookingApi";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  createdAt: Date;
  isLoading?: boolean;
  toolCalls?: any[];
  intent?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const QUICK_REPLIES = [
  "🗺️ Tour nổi bật hiện tại?",
  "💰 Tour giá rẻ nhất?",
  "✈️ Tour nước ngoài hấp dẫn?",
  "🏖️ Tour du lịch biển?",
  "⛰️ Tour khám phá miền núi?",
  "📅 Hướng dẫn đặt tour",
];

const WELCOME_MSG = `Xin chào! Tôi là trợ lý du lịch HTravel 🌏

Tôi có thể giúp bạn:
• Tìm tour phù hợp với nhu cầu & ngân sách
• Tư vấn điểm đến du lịch lý tưởng
• Hướng dẫn đặt tour & thanh toán trực tuyến
• Giải đáp mọi thắc mắc về hành trình

Hãy hỏi tôi bất cứ điều gì! 😊`;

// ─────────────────────────────────────────────────────────────────────────────
// ChatbotWidget — floating chat button + panel
// ─────────────────────────────────────────────────────────────────────────────

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", content: WELCOME_MSG, isUser: false, createdAt: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [suggestedTours, setSuggestedTours] = useState<TourSummary[]>([]);
  const [showAllTours, setShowAllTours] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const [requiresHumanSupport, setRequiresHumanSupport] = useState(false);
  const [showBookingsTab, setShowBookingsTab] = useState(false);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const [showQR, setShowQR] = useState(true);

  const { user, isLoggedIn } = useAuthStore();

  const fetchBookings = useCallback(async () => {
    if (!isLoggedIn || !user?.userId) return;
    setLoadingBookings(true);
    try {
      const res = await bookingApi.getBookingsByUserId(user.userId, undefined, 0, 20);
      if (res && res.status === 200 && res.data) {
        setUserBookings(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching user bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    if (showBookingsTab) {
      fetchBookings();
    }
  }, [showBookingsTab, fetchBookings]);

  useEffect(() => {
    // Generate session ID on mount
    setSessionId(`sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`);
  }, []);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollEnd = useCallback(() => {
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollEnd();
      setTimeout(() => inputRef.current?.focus(), 180);
    }
  }, [isOpen, scrollEnd]);

  useEffect(() => {
    if (isOpen) scrollEnd();
  }, [messages, isOpen, scrollEnd]);

  const sendMsg = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;

      setInput("");
      setShowQR(false);
      if (inputRef.current) inputRef.current.style.height = "auto";

      const uid = `u_${Date.now()}`;
      const lid = `ai_${Date.now() + 1}`;

      setMessages((prev) => [
        ...prev,
        { id: uid, content: trimmed, isUser: true, createdAt: new Date() },
        { id: lid, content: "", isUser: false, createdAt: new Date(), isLoading: true },
      ]);
      setIsSending(true);

      try {
        const history: ChatHistoryItem[] = messages
          .filter((m) => !m.isLoading && m.id !== "welcome")
          .slice(-10)
          .map((m) => ({
            role: m.isUser ? "user" : "model",
            content: m.content,
          }));

        const result = await sendChatbotMessage(trimmed, history, sessionId);

        if (result.suggested_tours && result.suggested_tours.length > 0) {
          setSuggestedTours(result.suggested_tours);
          setShowAllTours(false);
        }

        if (result.suggested_questions && result.suggested_questions.length > 0) {
          setSuggestedQuestions(result.suggested_questions);
        } else {
          setSuggestedQuestions([]);
        }

        if (result.requires_human_support || result.intent === "complaint" || result.sentiment === "negative") {
          setRequiresHumanSupport(true);
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === lid
              ? {
                  ...m,
                  content: result.reply,
                  isLoading: false,
                  toolCalls: result.tool_calls,
                  intent: result.intent,
                }
              : m
          )
        );
        if (!isOpen) setHasNew(true);
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === lid
              ? { ...m, content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại!", isLoading: false }
              : m
          )
        );
      } finally {
        setIsSending(false);
      }
    },
    [isSending, messages, sessionId, isOpen]
  );

  const startNewChat = () => {
    setMessages([
      { id: "welcome", content: WELCOME_MSG, isUser: false, createdAt: new Date() },
    ]);
    setSessionId(`sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`);
    setSuggestedTours([]);
    setShowAllTours(false);
    setSuggestedQuestions([]);
    setRequiresHumanSupport(false);
    setShowQR(true);
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMsg(input);
    }
  };

  const fmtTime = (d: Date) =>
    `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;

  const canSend = input.trim().length > 0 && !isSending;

  return (
    <>
      {/* ── Keyframes & utility styles ── */}
      <style>{`
        @keyframes ht-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: .4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes ht-spin { to { transform: rotate(360deg); } }
        @keyframes ht-pulse-btn {
          0%, 100% { box-shadow: 0 6px 22px rgba(99,171,69,.45); }
          50% { box-shadow: 0 6px 32px rgba(99,171,69,.7), 0 0 0 9px rgba(99,171,69,.12); }
        }
        .ht-scroll::-webkit-scrollbar { width: 4px; }
        .ht-scroll::-webkit-scrollbar-track { background: transparent; }
        .ht-scroll::-webkit-scrollbar-thumb { background: #ccc; border-radius: 2px; }
        .ht-dot {
          display: inline-block; width: 7px; height: 7px; border-radius: 50%;
          background: #63AB45; margin: 0 2.5px;
          animation: ht-dot 1.2s ease-in-out infinite;
        }
        .ht-dot:nth-child(2) { animation-delay: .2s; }
        .ht-dot:nth-child(3) { animation-delay: .4s; }
        .ht-spin { animation: ht-spin .7s linear infinite; }
        .ht-qr:hover { background: #d9f2d0 !important; border-color: #63AB45 !important; }
        .ht-icon-btn:hover { background: rgba(255,255,255,.28) !important; }
        .ht-send:hover:not(:disabled) { opacity: .9; transform: scale(1.06); }
        .ht-send:active:not(:disabled) { transform: scale(.93); }
        .ht-fab:hover { transform: scale(1.09); }
        .ht-fab:active { transform: scale(.92); }
        .ht-tour-card:hover {
          border-color: #63AB45 !important;
          background: #EEF8EC !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99,171,69,.08);
        }
      `}</style>

      {/* ────────────────────────── Chat Panel ────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.88 }}
            transition={{ type: "spring", stiffness: 370, damping: 26 }}
            style={{
              position: "fixed",
              bottom: 92,
              right: 20,
              width: 460,
              maxWidth: "calc(100vw - 24px)",
              height: 680,
              maxHeight: "calc(100vh - 120px)",
              background: "#fff",
              borderRadius: 22,
              boxShadow:
                "0 28px 70px rgba(0,0,0,.18), 0 8px 24px rgba(0,0,0,.1)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              zIndex: 9999,
              fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
            }}
          >
            {/* ── Header ── */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, #63AB45 0%, #4a8f33 50%, #2e6520 100%)",
                padding: "14px 14px 13px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 10,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* decorative blobs */}
              <div
                style={{
                  position: "absolute",
                  top: -28,
                  right: -18,
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,.07)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -22,
                  left: 24,
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  background: "rgba(247,146,30,.14)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  left: "40%",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,.04)",
                  pointerEvents: "none",
                }}
              />

              {/* avatar */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 13,
                  background: "rgba(255,255,255,.18)",
                  border: "1.5px solid rgba(255,255,255,.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                  backdropFilter: "blur(6px)",
                }}
              >
                🌏
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: 0.2,
                  }}
                >
                  HTravel AI
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,.78)",
                    fontSize: 11,
                    marginTop: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#a8e89c",
                      display: "inline-block",
                      boxShadow: "0 0 5px #a8e89c",
                    }}
                  />
                  Trợ lý du lịch thông minh
                </div>
              </div>

              {/* My bookings toggle */}
              <button
                className="ht-icon-btn"
                onClick={() => setShowBookingsTab((prev) => !prev)}
                title={showBookingsTab ? "Quay lại chat" : "Đơn hàng của tôi"}
                style={{
                  background: showBookingsTab ? "#F7921E" : "rgba(255,255,255,.15)",
                  border: "1px solid rgba(255,255,255,.2)",
                  borderRadius: 9,
                  width: 33,
                  height: 33,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "all .15s",
                  marginRight: 4,
                }}
              >
                <span style={{ fontSize: 15 }}>{showBookingsTab ? "💬" : "📋"}</span>
              </button>

              {/* new chat */}
              <button
                className="ht-icon-btn"
                onClick={startNewChat}
                title="Cuộc trò chuyện mới"
                style={{
                  background: "rgba(255,255,255,.15)",
                  border: "1px solid rgba(255,255,255,.2)",
                  borderRadius: 9,
                  width: 33,
                  height: 33,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "background .15s",
                }}
              >
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* close */}
              <button
                className="ht-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Đóng"
                style={{
                  background: "rgba(255,255,255,.15)",
                  border: "1px solid rgba(255,255,255,.2)",
                  borderRadius: 9,
                  width: 33,
                  height: 33,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#fff",
                  fontSize: 22,
                  fontWeight: 300,
                  lineHeight: 1,
                  flexShrink: 0,
                  transition: "background .15s",
                }}
              >
                ×
              </button>
            </div>

            {/* ── Suggested Tours Header Panel ── */}
            {suggestedTours.length > 0 && (
              <div
                style={{
                  background: "#ffffff",
                  borderBottom: "1px solid #E8EDE8",
                  padding: "12px 14px",
                  maxHeight: showAllTours ? 300 : "auto",
                  overflowY: "auto",
                  flexShrink: 0,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                  transition: "max-height 0.3s ease-out",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 16 }}>🎯</span>
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: "#2e6520",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Tour gợi ý cho bạn ({suggestedTours.length})
                    </span>
                  </div>
                  {suggestedTours.length > 1 && (
                    <button
                      onClick={() => setShowAllTours((prev) => !prev)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#63AB45",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        padding: "2px 6px",
                        borderRadius: 6,
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F0F9EE")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                      {showAllTours ? "Ẩn bớt" : "Xem thêm"}
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{
                          transform: showAllTours ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}
                      >
                        <path
                          d="M6 9l6 6 6-6"
                          stroke="#63AB45"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {(showAllTours ? suggestedTours : [suggestedTours[0]]).map((tour) => (
                    <a
                      key={tour.id}
                      href={`/tours/${tour.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        gap: 10,
                        background: "#F8FAF8",
                        border: "1px solid #EEF2EE",
                        borderRadius: 10,
                        padding: 8,
                        textDecoration: "none",
                        color: "inherit",
                        transition: "all 0.2s ease",
                      }}
                      className="ht-tour-card"
                    >
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 8,
                          background: "#E8EDE8",
                          backgroundImage: tour.thumbnail_url ? `url(${tour.thumbnail_url})` : "none",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 20,
                          flexShrink: 0,
                        }}
                      >
                        {!tour.thumbnail_url && "🏖️"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <h4
                            style={{
                              margin: 0,
                              fontSize: 13,
                              fontWeight: 650,
                              color: "#1C231F",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              lineHeight: 1.2,
                            }}
                          >
                            {tour.title}
                          </h4>
                          <p
                            style={{
                              margin: "3px 0 0",
                              fontSize: 11,
                              color: "#707A70",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                            }}
                          >
                            📍 {tour.location}
                          </p>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            marginTop: 4,
                          }}
                        >
                          <span style={{ fontSize: 11, color: "#63AB45", fontWeight: 600 }}>
                            ⏱️ {tour.duration_days} ngày
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 750, color: "#F7921E" }}>
                            {tour.price.toLocaleString("vi-VN")} đ
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* ── Human Escalation Banner ── */}
            {requiresHumanSupport && (
              <div
                style={{
                  background: "#FFF0F0",
                  borderBottom: "1px solid #FFE3E3",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  flexShrink: 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🚨</span>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#C53030" }}>
                      Đang kết nối hỗ trợ trực tuyến
                    </span>
                    <span style={{ fontSize: 10.5, color: "#9B2C2C", marginTop: 1 }}>
                      Yêu cầu của bạn đã được chuyển đến CSKH.
                    </span>
                  </div>
                </div>
                <a
                  href="/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "#E53E3E",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "4px 10px",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#C53030")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#E53E3E")}
                >
                  Liên hệ
                </a>
              </div>
            )}

            {showBookingsTab ? (
              <div
                className="ht-scroll"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "14px 12px",
                  background: "#F4F7F4",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#2e6520" }}>
                    📋 Đơn hàng của tôi
                  </h3>
                  <button
                    onClick={() => setShowBookingsTab(false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#63AB45",
                      fontSize: 12,
                      fontWeight: 650,
                      cursor: "pointer",
                    }}
                  >
                    Quay lại chat ➔
                  </button>
                </div>

                {!isLoggedIn ? (
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 14,
                      padding: "20px 16px",
                      textAlign: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,.04)",
                      marginTop: 20,
                    }}
                  >
                    <span style={{ fontSize: 32 }}>🔑</span>
                    <h4 style={{ margin: "10px 0 6px", fontSize: 14, color: "#1C231F" }}>
                      Yêu cầu đăng nhập
                    </h4>
                    <p style={{ margin: 0, fontSize: 12, color: "#707A70", lineHeight: 1.5 }}>
                      Vui lòng đăng nhập để xem danh sách đơn hàng đã đặt và sử dụng các tính năng hỗ trợ AI.
                    </p>
                    <a
                      href="/login"
                      style={{
                        display: "inline-block",
                        marginTop: 14,
                        background: "#63AB45",
                        color: "#fff",
                        padding: "8px 18px",
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 700,
                        textDecoration: "none",
                        boxShadow: "0 4px 10px rgba(99,171,69,.2)",
                      }}
                    >
                      Đăng nhập ngay
                    </a>
                  </div>
                ) : loadingBookings ? (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 120 }}>
                    <div
                      className="ht-spin"
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        border: "3px solid #63AB45",
                        borderTopColor: "transparent",
                      }}
                    />
                  </div>
                ) : userBookings.length === 0 ? (
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 14,
                      padding: "20px 16px",
                      textAlign: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,.04)",
                      marginTop: 20,
                    }}
                  >
                    <span style={{ fontSize: 32 }}>✈️</span>
                    <h4 style={{ margin: "10px 0 6px", fontSize: 14, color: "#1C231F" }}>
                      Chưa có đơn hàng nào
                    </h4>
                    <p style={{ margin: 0, fontSize: 12, color: "#707A70", lineHeight: 1.5 }}>
                      Bạn chưa thực hiện đặt tour nào trên hệ thống HTravel. Hãy khám phá và đặt tour ngay nhé!
                    </p>
                  </div>
                ) : (
                  userBookings.map((booking: any) => {
                    const statusColors: Record<string, string> = {
                      PENDING: "#F7921E",
                      CONFIRMED: "#63AB45",
                      CANCELLED: "#EF4444",
                      COMPLETED: "#3B82F6",
                    };
                    const statusLabel: Record<string, string> = {
                      PENDING: "Chờ thanh toán",
                      CONFIRMED: "Đã xác nhận",
                      CANCELLED: "Đã hủy",
                      COMPLETED: "Hoàn thành",
                    };
                    const bColor = statusColors[booking.status] || "#707A70";
                    const bLabel = statusLabel[booking.status] || booking.status;

                    return (
                      <div
                        key={booking.bookingId || booking.bookingCode}
                        style={{
                          background: "#fff",
                          borderRadius: 14,
                          padding: 12,
                          boxShadow: "0 2px 8px rgba(0,0,0,.04)",
                          border: "1px solid #EEF2EE",
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#1C231F" }}>
                            Mã: {booking.bookingCode}
                          </span>
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 700,
                              color: bColor,
                              background: `${bColor}12`,
                              padding: "2px 8px",
                              borderRadius: 20,
                            }}
                          >
                            {bLabel}
                          </span>
                        </div>

                        <div>
                          <h4 style={{ margin: 0, fontSize: 13, fontWeight: 650, color: "#2E3A2F", lineHeight: 1.3 }}>
                            {booking.tourTitle || "Đơn đặt tour"}
                          </h4>
                          <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                            <span style={{ fontSize: 11, color: "#707A70" }}>
                              📅 Đi: {booking.startDate ? new Date(booking.startDate).toLocaleDateString("vi-VN") : "---"}
                            </span>
                            <span style={{ fontSize: 11, color: "#707A70" }}>
                              💰 Tổng: {booking.totalAmount?.toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            borderTop: "1px solid #F0F4F0",
                            paddingTop: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            onClick={() => {
                              sendMsg(`Kiểm tra trạng thái booking ${booking.bookingCode}`);
                              setShowBookingsTab(false);
                            }}
                            style={{
                              flex: 1,
                              background: "#EEF8EC",
                              border: "1.5px solid rgba(99,171,69,.2)",
                              borderRadius: 8,
                              color: "#3d7a2a",
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "5px 2px",
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#DDF2D7")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#EEF8EC")}
                          >
                            🔎 Trạng thái
                          </button>
                          
                          {booking.status !== "CANCELLED" && (
                            <button
                              onClick={() => {
                                sendMsg(`Tôi muốn hủy booking ${booking.bookingCode}`);
                                setShowBookingsTab(false);
                              }}
                              style={{
                                flex: 1,
                                background: "#FFF0F0",
                                border: "1.5px solid rgba(239,68,68,.2)",
                                borderRadius: 8,
                                color: "#EF4444",
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "5px 2px",
                                cursor: "pointer",
                                transition: "all 0.15s",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#FFE3E3")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "#FFF0F0")}
                            >
                              ❌ Hủy đặt
                            </button>
                          )}

                          <button
                            onClick={() => {
                              sendMsg(`Tôi muốn góp ý/phản hồi chất lượng về booking ${booking.bookingCode}`);
                              setShowBookingsTab(false);
                            }}
                            style={{
                              flex: 1,
                              background: "#FFF9F2",
                              border: "1.5px solid rgba(247,146,30,.2)",
                              borderRadius: 8,
                              color: "#F7921E",
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "5px 2px",
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#FFEEDD")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#FFF9F2")}
                          >
                            ✍️ Feedback
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <>
                {/* ── Messages ── */}
                <div
                  className="ht-scroll"
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "14px 12px 10px",
                    background: "#F4F7F4",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {messages.map((msg) => (
                    <Bubble key={msg.id} msg={msg} fmtTime={fmtTime} />
                  ))}
                  <div ref={endRef} />
                </div>

                {/* ── Quick replies & Suggested questions ── */}
                {((suggestedQuestions.length > 0) || (showQR && messages.length <= 1)) && !isSending && (
                  <div
                    style={{
                      padding: "8px 12px 7px",
                      background: "#fff",
                      borderTop: "1px solid #EEF0EE",
                      flexShrink: 0,
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 6px",
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#A0A8A0",
                        letterSpacing: 0.6,
                        textTransform: "uppercase",
                      }}
                    >
                      {suggestedQuestions.length > 0 ? "💡 Gợi ý câu hỏi tiếp theo" : "Gợi ý câu hỏi"}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {(suggestedQuestions.length > 0
                        ? suggestedQuestions.map((q) => q.question)
                        : QUICK_REPLIES
                      ).map((q) => (
                        <button
                          key={q}
                          className="ht-qr"
                          onClick={() => sendMsg(q)}
                          style={{
                            padding: "5px 11px",
                            background: "#EEF8EC",
                            border: "1px solid rgba(99,171,69,.25)",
                            borderRadius: 20,
                            fontSize: 12,
                            color: "#3d7a2a",
                            cursor: "pointer",
                            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
                            fontWeight: 500,
                            transition: "all .15s",
                            lineHeight: 1.5,
                          }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── Input bar ── */}
            <div
              style={{
                padding: "10px 12px 13px",
                background: "#fff",
                borderTop: "1px solid #E8EDE8",
                display: "flex",
                gap: 8,
                alignItems: "flex-end",
                flexShrink: 0,
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={autoResize}
                onKeyDown={onKeyDown}
                placeholder="Hỏi về tour du lịch..."
                rows={1}
                disabled={isSending}
                style={{
                  flex: 1,
                  border: "1.5px solid #DDE8DD",
                  borderRadius: 14,
                  padding: "9px 13px",
                  fontSize: 13.5,
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
                  color: "#1C231F",
                  background: "#F8FAF8",
                  outline: "none",
                  resize: "none",
                  lineHeight: 1.5,
                  maxHeight: 100,
                  overflowY: "auto",
                  transition: "border-color .18s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#63AB45";
                  e.target.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#DDE8DD";
                  e.target.style.background = "#F8FAF8";
                }}
              />
              <button
                className="ht-send"
                onClick={() => sendMsg(input)}
                disabled={!canSend}
                style={{
                  width: 43,
                  height: 43,
                  borderRadius: "50%",
                  background: canSend
                    ? "linear-gradient(135deg, #63AB45, #4a8f33)"
                    : "#E8EDE8",
                  border: "none",
                  cursor: canSend ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all .18s",
                  boxShadow: canSend ? "0 4px 14px rgba(99,171,69,.42)" : "none",
                }}
              >
                {isSending ? (
                  <div
                    className="ht-spin"
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      border: "2.5px solid rgba(255,255,255,.3)",
                      borderTopColor: "rgba(255,255,255,.9)",
                    }}
                  />
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"
                      stroke={canSend ? "#fff" : "#aaa"}
                      strokeWidth="2.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* branding strip */}
            <div
              style={{
                background: "#F4F7F4",
                borderTop: "1px solid #EEF0EE",
                padding: "5px 0",
                textAlign: "center",
                fontSize: 10,
                color: "#A0A8A0",
                fontWeight: 500,
                letterSpacing: 0.3,
                flexShrink: 0,
              }}
            >
              Powered by{" "}
              <span style={{ color: "#63AB45", fontWeight: 700 }}>
                HTravel AI
              </span>{" "}
              ✈️
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ────────────────────────── Floating Button ────────────────────────── */}
      <button
        className="ht-fab"
        onClick={() => {
          setIsOpen((v) => !v);
          setHasNew(false);
        }}
        style={{
          position: "fixed",
          bottom: 24,
          right: 20,
          width: 58,
          height: 58,
          borderRadius: "50%",
          background: isOpen
            ? "linear-gradient(135deg, #4a8f33, #63AB45)"
            : "linear-gradient(135deg, #63AB45 0%, #F7921E 100%)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          transition: "transform .18s, background .3s",
          boxShadow: hasNew
            ? "0 6px 24px rgba(99,171,69,.5)"
            : "0 6px 20px rgba(99,171,69,.38)",
          animation: hasNew && !isOpen ? "ht-pulse-btn 1.8s infinite" : "none",
        }}
        aria-label={isOpen ? "Đóng chat" : "Mở trợ lý AI"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="x"
              initial={{ rotate: -80, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 80, opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ display: "flex", alignItems: "center" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 80, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -80, opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ display: "flex", alignItems: "center" }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                  fill="rgba(255,255,255,.22)"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="11" r="1.1" fill="#fff" />
                <circle cx="12" cy="11" r="1.1" fill="#fff" />
                <circle cx="15" cy="11" r="1.1" fill="#fff" />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>

        {/* unread badge */}
        {hasNew && !isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              width: 15,
              height: 15,
              borderRadius: "50%",
              background: "#EF4444",
              border: "2.5px solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 8,
              color: "#fff",
              fontWeight: 700,
            }}
          >
            1
          </motion.div>
        )}
      </button>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bubble — single message bubble
// ─────────────────────────────────────────────────────────────────────────────

function Bubble({
  msg,
  fmtTime,
}: {
  msg: Message;
  fmtTime: (d: Date) => string;
}) {
  const isUser = msg.isUser;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: isUser ? "flex-end" : "flex-start",
        gap: 7,
      }}
    >
      {/* AI avatar */}
      {!isUser && (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "linear-gradient(135deg, #63AB45, #4a8f33)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            flexShrink: 0,
            boxShadow: "0 2px 6px rgba(99,171,69,.3)",
          }}
        >
          🌿
        </div>
      )}

      <div
        style={{
          maxWidth: "75%",
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
          gap: 3,
        }}
      >
        {/* Bubble body */}
        <div
          style={{
            padding: "9px 13px",
            borderRadius: isUser
              ? "18px 18px 4px 18px"
              : "18px 18px 18px 4px",
            background: isUser
              ? "linear-gradient(135deg, #63AB45, #4a8f33)"
              : "#ffffff",
            color: isUser ? "#fff" : "#1C231F",
            fontSize: 13.5,
            lineHeight: 1.52,
            boxShadow: isUser
              ? "0 3px 10px rgba(99,171,69,.35)"
              : "0 1px 4px rgba(0,0,0,.08)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {msg.isLoading ? (
            <span>
              <span className="ht-dot" />
              <span className="ht-dot" />
              <span className="ht-dot" />
            </span>
          ) : (
            msg.content
          )}
        </div>

        {/* Visual cards for executed tool calls */}
        {msg.toolCalls && msg.toolCalls.map((tc: any, index: number) => {
          if (tc.status !== "success") return null;
          let label = "";
          let details = "";
          let icon = "⚙️";
          let color = "#4A5568";

          if (tc.tool_name === "check_booking_status") {
            label = "Đã truy vấn trạng thái đặt tour";
            details = `Mã đơn hàng: ${tc.arguments?.booking_id}`;
            icon = "🔎";
            color = "#3182CE";
          } else if (tc.tool_name === "cancel_booking") {
            label = "Đã hủy đơn đặt tour";
            details = `Mã đơn hàng: ${tc.arguments?.booking_id}. Lý do: ${tc.arguments?.reason || "Không có"}`;
            icon = "❌";
            color = "#E53E3E";
          } else if (tc.tool_name === "create_support_ticket") {
            label = "Khởi tạo Ticket hỗ trợ CSKH";
            details = `Vấn đề: ${tc.arguments?.issue_type}. Mô tả: ${tc.arguments?.description || "Yêu cầu từ AI chatbot"}`;
            icon = "🎫";
            color = "#D69E2E";
          } else if (tc.tool_name === "get_current_weather") {
            label = "Cập nhật thời tiết";
            details = `Khu vực: ${tc.arguments?.location}`;
            icon = "☀️";
            color = "#DD6B20";
          } else {
            return null;
          }

          return (
            <div
              key={index}
              style={{
                marginTop: 6,
                padding: "8px 10px",
                background: "#f7fafc",
                borderLeft: `3px solid ${color}`,
                borderRadius: "4px 8px 8px 4px",
                fontSize: 11,
                color: "#2D3748",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                width: "100%",
                minWidth: 200,
              }}
            >
              <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 4, color }}>
                <span>{icon}</span> {label}
              </div>
              <div style={{ color: "#718096" }}>{details}</div>
              <div style={{ fontSize: 9, color: "#A0AEC0", marginTop: 2, textAlign: "right" }}>
                Hệ thống tự động thực thi
              </div>
            </div>
          );
        })}

        {/* Timestamp */}
        <span style={{ fontSize: 10, color: "#A0A8A0" }}>
          {fmtTime(msg.createdAt)}
        </span>
      </div>
    </div>
  );
}
