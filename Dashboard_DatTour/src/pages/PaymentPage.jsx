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

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Mã Booking
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Khách Hàng
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Số Tiền
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Phương Thức
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Ngày
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
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-t border-slate-100 transition-colors hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">
                    {payment.booking}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {payment.customer}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-emerald-600">
                    {payment.amount}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {payment.method === "Credit Card" && "💳"}
                    {payment.method === "Bank Transfer" && "🏦"}
                    {payment.method === "E-Wallet" && "📱"}
                    {" " + payment.method}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {payment.date}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        payment.status === "Success"
                          ? "bg-emerald-50 text-emerald-700"
                          : payment.status === "Pending"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                        📄
                      </button>
                      <button className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700">
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
    </div>
  );
};
