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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(promotions.length / itemsPerPage);
  const paginatedPromotions = promotions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-950 to-slate-800 px-5 py-4 text-white shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-blue-200">
            Promotion center
          </p>
          <h2 className="text-lg font-black">Danh sách khuyến mãi</h2>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15">
            Lọc
          </button>
          <button className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15">
            Xuất
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-[0.16em]">
                  Tên Promotion
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-[0.16em]">
                  Mã Code
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-[0.16em]">
                  Giảm Giá
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-[0.16em]">
                  Hiệu Lực
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
              {paginatedPromotions.map((promo) => (
                <tr
                  key={promo.id}
                  className="border-t border-slate-100 transition-colors hover:bg-slate-50/80"
                >
                  <td className="px-5 py-4 text-sm font-bold text-slate-950">
                    {promo.name}
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded-lg bg-slate-900 px-2.5 py-1 font-mono text-xs font-semibold text-white">
                      {promo.code}
                    </code>
                  </td>
                  <td className="px-5 py-4 text-sm font-black text-blue-700">
                    {promo.discount}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {promo.validity}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${promo.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {promo.active ? "✓ Hoạt động" : "✗ Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                        ✏️
                      </button>
                      <button className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
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

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-sm text-slate-600">
          Hiển thị {paginatedPromotions.length} trên tổng số {promotions.length} khuyến mãi
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
