import React, { useMemo, useState } from "react";
import { FiCalendar, FiChevronLeft, FiChevronRight, FiEdit2, FiFilter, FiMoreVertical, FiRefreshCw, FiTrash2 } from "react-icons/fi";

const mockPromotionResponses = [
  {
    id: 1,
    code: "SUMMER24",
    discountPercent: 15,
    maxDiscount: 500000,
    usageLimit: 1000,
    usedCount: 624,
    validFrom: "2026-05-01T00:00:00",
    validTo: "2026-08-31T23:59:59",
    isActive: true,
  },
  {
    id: 2,
    code: "LOYALTY500",
    discountPercent: 10,
    maxDiscount: 500000,
    usageLimit: 300,
    usedCount: 300,
    validFrom: "2026-01-01T00:00:00",
    validTo: "2026-12-31T23:59:59",
    isActive: false,
  },
  {
    id: 3,
    code: "WEEKEND30",
    discountPercent: 30,
    maxDiscount: 350000,
    usageLimit: 120,
    usedCount: 118,
    validFrom: "2026-04-05T00:00:00",
    validTo: "2026-04-07T23:59:59",
    isActive: true,
  },
  {
    id: 4,
    code: "FLASH50",
    discountPercent: 50,
    maxDiscount: 1000000,
    usageLimit: 80,
    usedCount: 23,
    validFrom: "2026-06-01T00:00:00",
    validTo: "2026-06-10T23:59:59",
    isActive: true,
  },
  {
    id: 5,
    code: "WELCOME10",
    discountPercent: 10,
    maxDiscount: 200000,
    usageLimit: 2000,
    usedCount: 1540,
    validFrom: "2026-01-01T00:00:00",
    validTo: "2026-12-31T23:59:59",
    isActive: true,
  },
];

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
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
      label: "Lưu trữ",
      className: "bg-slate-100 text-slate-600",
      note: "Chưa bắt đầu",
    };
  }

  if (now > to) {
    return {
      label: "Lưu trữ",
      className: "bg-slate-100 text-slate-600",
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

export const PromotionPage = () => {
  const [promotions] = useState(mockPromotionResponses);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    code: "",
    discountPercent: "",
    maxDiscount: "",
    usageLimit: "",
    validFrom: "",
    validTo: "",
    isActive: true,
  });

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(promotions.length / itemsPerPage));
  const paginatedPromotions = promotions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const usageRate = useMemo(() => {
    const totalLimit = promotions.reduce((sum, item) => sum + (item.usageLimit || 0), 0);
    const totalUsed = promotions.reduce((sum, item) => sum + (item.usedCount || 0), 0);
    if (!totalLimit) return 0;
    return Math.round((totalUsed / totalLimit) * 100);
  }, [promotions]);

  const totalPotentialDiscount = useMemo(
    () => promotions.reduce((sum, item) => sum + Number(item.maxDiscount || 0), 0),
    [promotions],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-3xl uppercase font-black tracking-tight text-blue-600 md:text-[42px]">
                Quản lý Khuyến mãi
          </h2>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Export CSV
          </button>
          <button className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900">
            + Tạo khuyến mãi mới
          </button>
        </div>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.55fr_0.85fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Danh sách khuyến mãi</h2>
            <div className="flex items-center gap-2 text-slate-500">
              <button className="rounded-lg p-2 transition hover:bg-slate-100"><FiFilter /></button>
              <button className="rounded-lg p-2 transition hover:bg-slate-100"><FiMoreVertical /></button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-5 py-3">Tên & Mã code</th>
                  <th className="px-5 py-3">Loại & Giá trị</th>
                  <th className="px-5 py-3">Thời hạn</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPromotions.map((promotion) => {
                  const status = getPromotionState(promotion);
                  return (
                    <tr key={promotion.id} className="border-t border-slate-100 align-top hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <p className="text-lg font-semibold leading-tight text-slate-900">Ưu đãi mã {promotion.code}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">{promotion.code}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-500">Phần trăm (%)</p>
                        <p className="mt-1 text-base font-black text-blue-700">{promotion.discountPercent}% OFF</p>
                        <p className="mt-1 text-xs text-slate-500">Tối đa {formatCurrency(promotion.maxDiscount)}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        <p>{formatDate(promotion.validFrom)} - {formatDate(promotion.validTo)}</p>
                        <p className="mt-1 text-xs font-medium text-rose-500">{status.note}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
                        <p className="mt-2 text-xs text-slate-500">{promotion.usedCount}/{promotion.usageLimit} lượt</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"><FiEdit2 /></button>
                          <button className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
            <p>
              Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, promotions.length)}-{Math.min(currentPage * itemsPerPage, promotions.length)} trên {promotions.length} khuyến mãi
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                <FiChevronLeft />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 min-w-8 rounded-lg px-2 text-sm font-semibold ${currentPage === page ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">Tạo Khuyến mãi</h2>
              <span className="text-blue-600">✦</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Mã code</label>
                <div className="flex gap-2">
                  <input
                    value={formData.code}
                    onChange={(event) => setFormData((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))}
                    placeholder="VD: DISCOUNT10"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-blue-400 focus:bg-white"
                  />
                  <button className="rounded-xl border border-slate-300 bg-slate-50 px-3 text-slate-600 hover:bg-slate-100">
                    <FiRefreshCw />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Phần trăm (%)</label>
                  <input
                    type="number"
                    value={formData.discountPercent}
                    onChange={(event) => setFormData((prev) => ({ ...prev, discountPercent: event.target.value }))}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-400 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Giảm tối đa</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(event) => setFormData((prev) => ({ ...prev, maxDiscount: event.target.value }))}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-400 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Giới hạn sử dụng</label>
                <input
                  type="number"
                  min="1"
                  value={formData.usageLimit}
                  onChange={(event) => setFormData((prev) => ({ ...prev, usageLimit: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Thời hạn áp dụng</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={formData.validFrom}
                      onChange={(event) => setFormData((prev) => ({ ...prev, validFrom: event.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 pr-9 text-sm text-slate-900 outline-none focus:border-blue-400 focus:bg-white"
                    />
                    <FiCalendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  </div>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={formData.validTo}
                      onChange={(event) => setFormData((prev) => ({ ...prev, validTo: event.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 pr-9 text-sm text-slate-900 outline-none focus:border-blue-400 focus:bg-white"
                    />
                    <FiCalendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                <span className="text-sm font-semibold text-slate-700">Kích hoạt ngay</span>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
                  className={`h-6 w-11 rounded-full p-0.5 transition ${formData.isActive ? "bg-blue-600" : "bg-slate-300"}`}
                >
                  <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${formData.isActive ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>

              <button className="mt-2 w-full rounded-xl bg-black py-3 text-sm font-bold text-white transition hover:bg-slate-900">
                Lưu & Xuất bản
              </button>
              <button className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                Hủy bỏ
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-slate-950 to-blue-950 p-5 text-white shadow-[0_12px_30px_rgba(15,23,42,0.2)]">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Hiệu suất mã khuyến mãi</p>
            <p className="mt-2 text-4xl font-black">{usageRate}%</p>
            <p className="mt-1 text-sm text-emerald-300">Tổng mức giảm tối đa: {formatCurrency(totalPotentialDiscount)}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
