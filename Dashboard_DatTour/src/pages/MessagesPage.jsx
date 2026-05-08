import React, { useState } from "react";
import { MiniStatSquares } from "../components/MiniStatSquares";

export const MessagesPage = () => {
  const [conversations] = useState([
    {
      id: 1,
      name: "Nguyễn Văn A",
      lastMessage: "Tour Hạ Long có sẵn không?",
      time: "5 phút trước",
      unread: true,
      avatar: "👨",
    },
    {
      id: 2,
      name: "Trần Thị B",
      lastMessage: "Cảm ơn đã giúp đỡ!",
      time: "30 phút trước",
      unread: false,
      avatar: "👩",
    },
    {
      id: 3,
      name: "Lê Văn C",
      lastMessage: "Tôi muốn đặt tour cho tháng 6",
      time: "1 giờ trước",
      unread: true,
      avatar: "👨",
    },
    {
      id: 4,
      name: "Phạm Thị D",
      lastMessage: "Booking đã được xác nhận",
      time: "2 giờ trước",
      unread: false,
      avatar: "👩",
    },
  ]);

  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="space-y-4">
      <MiniStatSquares
        items={[
          { label: "Trò chuyện", value: conversations.length, badge: "All" },
          {
            label: "Chưa đọc",
            value: conversations.filter((c) => c.unread).length,
            badge: "New",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Cuộc Trò Chuyện
            </h2>
          </div>
          <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv)}
                className={`w-full p-3 text-left transition-colors hover:bg-slate-50 ${selectedChat?.id === conv.id ? "bg-blue-50/70" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3 min-w-0">
                    <span className="text-2xl">{conv.avatar}</span>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold ${conv.unread ? "text-slate-900" : "text-slate-600"}`}
                      >
                        {conv.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                  {conv.unread ? (
                    <span className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
                  ) : null}
                </div>
                <p className="mt-2 text-[11px] text-slate-400">{conv.time}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {selectedChat ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{selectedChat.avatar}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {selectedChat.name}
                    </h3>
                    <p className="text-xs text-slate-500">Đang hoạt động</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50">
                    📞
                  </button>
                  <button className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50">
                    📹
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4">
                <div className="flex justify-start">
                  <div className="max-w-xs rounded-lg bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                    Tour Hạ Long 3 ngày 2 đêm có sẵn không?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-xs rounded-lg bg-blue-600 px-3 py-2 text-sm text-white shadow-sm">
                    Có sẵn, giá 5.0M cho 4 người
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-xs rounded-lg bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                    Tôi muốn đặt cho tháng 6, có thể được không?
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                  <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                    📤
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-slate-400">
              <div className="text-center">
                <p className="mb-4 text-5xl">💬</p>
                <p className="text-sm">Chọn một cuộc trò chuyện</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
