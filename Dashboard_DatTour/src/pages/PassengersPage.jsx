import { useState } from "react";
import { MiniStatSquares } from "../components/MiniStatSquares";

export const PassengersPage = () => {
  const [passengers] = useState([
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      phone: "0912345678",
      tours: 5,
      status: "Active",
      join: "2024-01-15",
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@email.com",
      phone: "0987654321",
      tours: 3,
      status: "Active",
      join: "2024-02-20",
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "levanc@email.com",
      phone: "0901234567",
      tours: 8,
      status: "Active",
      join: "2023-12-10",
    },
    {
      id: 4,
      name: "Phạm Thị D",
      email: "phamthid@email.com",
      phone: "0923456789",
      tours: 2,
      status: "Inactive",
      join: "2024-03-05",
    },
  ]);

  return (
    <div className="space-y-4">
      <MiniStatSquares
        items={[
          { label: "Hành khách", value: passengers.length, badge: "All" },
          {
            label: "Hoạt động",
            value: passengers.filter((p) => p.status === "Active").length,
            badge: "Live",
          },
          {
            label: "Tour đã đặt",
            value: passengers.reduce((sum, p) => sum + p.tours, 0),
            badge: "Trips",
          },
        ]}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Tên Hành Khách
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Điện Thoại
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Số Tour
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Ngày Tham Gia
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
              {passengers.map((passenger) => (
                <tr
                  key={passenger.id}
                  className="border-t border-slate-100 transition-colors hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {passenger.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {passenger.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {passenger.phone}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {passenger.tours} tours
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {passenger.join}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${passenger.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {passenger.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:bg-slate-50">
                        👁️
                      </button>
                      <button className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:bg-blue-50 hover:text-blue-700">
                        ✏️
                      </button>
                      <button className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:bg-rose-50 hover:text-rose-600">
                        🗑️
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
