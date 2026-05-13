import React from "react";
import { FiEdit2, FiRefreshCw, FiTrash2, FiToggleLeft, FiToggleRight, FiSearch } from "react-icons/fi";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const getPromotionState = (promotion) => {
  const now = Date.now();
  const from = new Date(promotion.validFrom).getTime();
  const to = new Date(promotion.validTo).getTime();

  if (!promotion.isActive) {
    return {
      label: "Tạm dừng",
      className: "bg-amber-100 text-amber-700",
      note: "Đã tắt",
    };
  }

  if (now < from) {
    return {
      label: "Chưa bắt đầu",
      className: "bg-slate-100 text-slate-600",
      note: "Sắp diễn ra",
    };
  }

  if (now > to) {
    return {
      label: "Hết hạn",
      className: "bg-rose-100 text-rose-600",
      note: "Đã hết hạn",
    };
  }

  const diffDays = Math.ceil((to - now) / (1000 * 60 * 60 * 24));
  return {
    label: "Đang chạy",
    className: "bg-emerald-100 text-emerald-700",
    note: diffDays > 0 ? `Còn ${diffDays} ngày` : "Hết hôm nay",
  };
};

const getUsagePercent = (promotion) => {
  const usageLimit = Number(promotion.usageLimit || 0);
  if (!usageLimit) return 0;
  return Math.round((Number(promotion.usedCount || 0) / usageLimit) * 100);
};

export const PromotionTable = ({
  promotions,
  isLoading,
  onEdit,
  onDelete,
  onToggle,
  togglePending,
  deletePending,
  page,
  totalPages,
  totalElements,
  pageSize = 10,
  onPageChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
            <FiSearch className="h-5 w-5 flex-shrink-0 text-slate-600" />
            <input
              disabled
              value=""
              placeholder="Tìm kiếm khuyến mãi..."
              className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            <FiRefreshCw />
            Làm mới
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px]">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.22em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Mã &amp; Tên</th>
                <th className="px-5 py-4">Thời hạn</th>
                <th className="px-5 py-4">Lượt dùng</th>
                <th className="px-5 py-4 text-right">Thao tác</th>
              </tr>
            </thead>

            {isLoading ? (
              <tbody>
                {Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <tr key={index}>
                          <td colSpan={4} className="px-5 py-3">
                        <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
                      </td>
                    </tr>
                  ))}
              </tbody>
            ) : (
              <tbody>
                {promotions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-500">
                      Không tìm thấy khuyến mãi nào.
                    </td>
                  </tr>
                ) : (
                  promotions.map((promotion) => {
                    const state = getPromotionState(promotion);
                    const usagePercent = getUsagePercent(promotion);

                    return (
                      <tr key={promotion.id} className="border-t border-slate-100 align-top text-sm transition hover:bg-sky-100">
                        <td className="px-5 py-4">
                          <div className="space-y-2">
                            <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 font-mono text-xs font-bold tracking-[0.18em] text-blue-700">
                              {promotion.code}
                            </div>
                            <p className="text-base font-black text-blue-700">
                              {promotion.discountPercent}% OFF
                            </p>
                            <p className="text-xs font-medium text-slate-500">
                              Giảm tối đa {formatCurrency(promotion.maxDiscount)}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          <p>{formatDate(promotion.validFrom)} → {formatDate(promotion.validTo)}</p>
                          <p className="mt-1 text-xs font-medium text-rose-500">{state.note}</p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-2">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full transition-all ${usagePercent >= 100 ? "bg-rose-500" : usagePercent >= 80 ? "bg-amber-500" : "bg-blue-500"}`}
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                              />
                            </div>
                            <p className="text-xs font-medium text-slate-500">
                              {promotion.usedCount}/{promotion.usageLimit} lượt ({usagePercent}%)
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => onEdit(promotion)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                            >
                              <FiEdit2 />
                              Sửa
                            </button>

                            <button
                              type="button"
                              onClick={() => onToggle(promotion)}
                              disabled={togglePending}
                              className={`inline-flex min-w-[92px] items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer ${promotion.isActive ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
                            >
                              {promotion.isActive ? <FiToggleLeft /> : <FiToggleRight />}
                              {promotion.isActive ? "Tắt" : "Bật"}
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            )}
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            Hiển thị {totalElements === 0 ? 0 : Math.min(page * pageSize + 1, totalElements)} - {Math.min((page + 1) * pageSize, totalElements)} / trong tổng số {totalElements || 0}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 0}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((displayPage) => (
              <button
                key={displayPage}
                type="button"
                onClick={() => onPageChange(displayPage - 1)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${displayPage - 1 === page ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"}`}
              >
                {displayPage}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};