import React, { useState } from "react";
import { MiniStatSquares } from "../components/MiniStatSquares";

export const PaymentPage = () => {
  const [payments] = useState([
    {
      id: 1,
      booking: "BK001",
      customer: "Nguyễn Văn A",
      amount: "20.0M",
      method: "Credit Card",
      date: "2024-05-08",
      status: "Success",
    },
    {
      id: 2,
      booking: "BK002",
      customer: "Trần Thị B",
      amount: "7.0M",
      method: "Bank Transfer",
      date: "2024-05-07",
      status: "Pending",
    },
    {
      id: 3,
      booking: "BK003",
      customer: "Lê Văn C",
      amount: "12.6M",
      method: "E-Wallet",
      date: "2024-05-06",
      status: "Success",
    },
    {
      id: 4,
      booking: "BK004",
      customer: "Phạm Thị D",
      amount: "14.0M",
      method: "Credit Card",
      date: "2024-05-05",
      status: "Failed",
    },
    {
      id: 5,
      booking: "BK005",
      customer: "Nguyễn Thị E",
      amount: "9.5M",
      method: "Bank Transfer",
      date: "2024-05-04",
      status: "Success",
    },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const paginatedPayments = payments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-4">
      <MiniStatSquares
        items={[
          {
            label: "Thành công",
            value: payments.filter((p) => p.status === "Success").length,
            badge: "OK",
          },
          {
            label: "Chờ xử lý",
            value: payments.filter((p) => p.status === "Pending").length,
            badge: "Wait",
          },
          {
            label: "Thất bại",
            value: payments.filter((p) => p.status === "Failed").length,
            badge: "Fail",
          },
          { label: "Tổng thu", value: "145.1M", badge: "VNĐ" },
        ]}
      />

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-950 to-slate-800 px-5 py-4 text-white shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-blue-200">
            Payment management
          </p>
          <h2 className="text-lg font-black">Lịch sử giao dịch</h2>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15">
            Lọc
          </button>
          <button className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15">
            Xuất báo cáo
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-[0.16em]">
                  Mã Booking
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-[0.16em]">
                  Khách Hàng
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-[0.16em]">
                  Số Tiền
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-[0.16em]">
                  Phương Thức
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-[0.16em]">
                  Ngày
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-[0.16em]">
                  Trạng Thái
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-[0.16em]">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-t border-slate-100 transition-colors hover:bg-slate-50/80"
                >
                  <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-700">
                    {payment.booking}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-700">
                    {payment.customer}
                  </td>
                  <td className="px-5 py-4 text-sm font-black text-blue-700">
                    {payment.amount}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {payment.method === "Credit Card" && "💳"}
                    {payment.method === "Bank Transfer" && "🏦"}
                    {payment.method === "E-Wallet" && "📱"}
                    {" " + payment.method}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {payment.date}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-bold ${
                        payment.status === "Success"
                          ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                          : payment.status === "Pending"
                            ? "border-amber-200 bg-amber-100 text-amber-700"
                            : "border-rose-200 bg-rose-100 text-rose-700"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                        📄
                      </button>
                      <button className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700">
                        🔄
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-sm text-slate-600">
          Hiển thị {paginatedPayments.length} trên tổng số {payments.length} giao dịch
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`min-w-9 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${currentPage === page ? "bg-blue-600 text-white shadow-sm" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
