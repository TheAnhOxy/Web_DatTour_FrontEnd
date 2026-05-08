import React, { useState } from "react";

export const TourBookingPage = () => {
  const [bookings] = useState([
    {
      id: 1,
      customer: "Nguyễn Văn A",
      tour: "Hạ Long Bay",
      date: "2024-05-15",
      persons: 4,
      total: "20.0M",
      status: "Confirmed",
      phone: "0912345678",
    },
    {
      id: 2,
      customer: "Trần Thị B",
      tour: "Phan Thiết",
      date: "2024-05-18",
      persons: 2,
      total: "7.0M",
      status: "Pending",
      phone: "0987654321",
    },
    {
      id: 3,
      customer: "Lê Văn C",
      tour: "Đà Nẵng",
      date: "2024-05-20",
      persons: 3,
      total: "12.6M",
      status: "Confirmed",
      phone: "0901234567",
    },
    {
      id: 4,
      customer: "Phạm Thị D",
      tour: "Nha Trang",
      date: "2024-05-22",
      persons: 5,
      total: "14.0M",
      status: "Cancelled",
      phone: "0923456789",
    },
  ]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="flex h-20 flex-col justify-between rounded-2xl border border-blue-100 bg-white p-3 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Tổng booking
          </span>
          <span className="text-lg font-semibold text-blue-700">
            {bookings.length}
          </span>
        </div>
        <div className="flex h-20 flex-col justify-between rounded-2xl border border-blue-100 bg-white p-3 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Xác nhận
          </span>
          <span className="text-lg font-semibold text-blue-700">
            {bookings.filter((b) => b.status === "Confirmed").length}
          </span>
        </div>
        <div className="flex h-20 flex-col justify-between rounded-2xl border border-blue-100 bg-white p-3 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Chờ xử lý
          </span>
          <span className="text-lg font-semibold text-blue-700">
            {bookings.filter((b) => b.status === "Pending").length}
          </span>
        </div>
        <div className="flex h-20 flex-col justify-between rounded-2xl border border-blue-100 bg-white p-3 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Đã hủy
          </span>
          <span className="text-lg font-semibold text-blue-700">
            {bookings.filter((b) => b.status === "Cancelled").length}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:flex-row">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm khách hàng..."
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
        />
        <select className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100">
          <option>Tất cả trạng thái</option>
          <option>Confirmed</option>
          <option>Pending</option>
          <option>Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Khách Hàng
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Tour
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Ngày Đi
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Số Người
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Tổng Tiền
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Trạng Thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-t border-slate-100 transition-colors hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {booking.customer}
                      </p>
                      <p className="text-xs text-slate-500">{booking.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {booking.tour}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {booking.date}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {booking.persons} người
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-emerald-600">
                    {booking.total}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        booking.status === "Confirmed"
                          ? "bg-emerald-50 text-emerald-700"
                          : booking.status === "Pending"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:bg-slate-50">
                        📋
                      </button>
                      <button className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700">
                        ✓
                      </button>
                      <button className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:bg-rose-50 hover:text-rose-600">
                        ✗
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
