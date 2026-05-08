import React, { useState } from "react";
import { MiniStatSquares } from "../components/MiniStatSquares";

export const PromotionPage = () => {
  const [promotions] = useState([
    {
      id: 1,
      name: "Hè 2024 - Giảm 20%",
      discount: "20%",
      code: "HE2024",
      validity: "Đến 31/08/2024",
      active: true,
    },
    {
      id: 2,
      name: "Member VIP - Giảm 30%",
      discount: "30%",
      code: "VIPMEM",
      validity: "Đến 30/06/2024",
      active: true,
    },
    {
      id: 3,
      name: "Khách Tân Tạo - Giảm 15%",
      discount: "15%",
      code: "WELCOME",
      validity: "Mãi mãi",
      active: true,
    },
    {
      id: 4,
      name: "Flash Sale Cuối Tuần",
      discount: "25%",
      code: "FLASH25",
      validity: "Cuối tuần",
      active: false,
    },
  ]);

  return (
    <div className="space-y-4">
      <MiniStatSquares
        items={[
          {
            label: "Hoạt động",
            value: promotions.filter((p) => p.active).length,
            badge: "Live",
          },
          { label: "Mã KM", value: promotions.length, badge: "All" },
        ]}
      />

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Tên Promotion
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Mã Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Giảm Giá
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Hiệu Lực
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
              {promotions.map((promo) => (
                <tr
                  key={promo.id}
                  className="border-t border-slate-100 transition-colors hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {promo.name}
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-700">
                      {promo.code}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-emerald-600">
                    {promo.discount}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {promo.validity}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${promo.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {promo.active ? "✓ Hoạt động" : "✗ Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                        ✏️
                      </button>
                      <button className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
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
