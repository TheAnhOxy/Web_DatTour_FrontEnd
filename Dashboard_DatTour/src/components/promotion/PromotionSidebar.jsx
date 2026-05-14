import React from "react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const StatBox = ({ label, value, tone }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
    <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${tone.labelClass}`}>{label}</p>
    <p className={`mt-2 text-2xl font-black leading-none ${tone.valueClass}`}>{value}</p>
  </div>
);

export const PromotionSidebar = ({
  isEditing,
  editingPromotion,
  formData,
  onFormChange,
  onSubmit,
  onStartCreate,
  isSaving,
}) => {
  const isCodeLocked = Boolean(isEditing);

  return (
    <aside className={`space-y-4 rounded-3xl border p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] ${isEditing ? "border-blue-200 bg-blue-50/70" : "border-slate-200 bg-slate-50/80"}`}>
      {isEditing ? (
        <button
          type="button"
          onClick={onStartCreate}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50"
        >
          ← Thêm khuyến mãi mới
        </button>
      ) : null}

      <div className={`rounded-3xl border bg-white px-4 py-4 shadow-sm ${isEditing ? "border-blue-200" : "border-blue-100"}`}>
        <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] ${isEditing ? "border-blue-200 bg-blue-50 text-blue-700" : "border-blue-200 bg-blue-50 text-blue-700"}`}>
          {isEditing ? "Đang chỉnh sửa" : "Tạo khuyến mãi mới"}
        </div>
        <h2 className="mt-3 text-lg font-extrabold tracking-tight text-slate-950">
          {isEditing ? "Cập nhật mã" : "Thêm mã mới"}
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {isEditing
            ? `Đang sửa mã ${editingPromotion?.code || "--"}. Nhấn cập nhật để lưu thay đổi.`
            : "Nhập thông tin khuyến mãi rồi lưu để xuất bản."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatBox
          label="Trạng thái"
          value={isEditing ? (editingPromotion?.isActive ? "Bật" : "Tắt") : "Mới"}
          tone={{ labelClass: "text-blue-500", valueClass: "text-blue-600" }}
        />
        <StatBox
          label="Lượt dùng"
          value={isEditing ? `${editingPromotion?.usedCount ?? 0}/${editingPromotion?.usageLimit ?? 0}` : "0/0"}
          tone={{ labelClass: "text-emerald-500", valueClass: "text-emerald-600" }}
        />
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Mã code <span className="text-rose-500">*</span>
          </label>
          <input
            value={formData.code}
            onChange={(event) => onFormChange("code", event.target.value.toUpperCase())}
            placeholder="VD: SUMMER24"
            disabled={isCodeLocked}
            className={`w-full rounded-2xl border px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white ${isCodeLocked ? "cursor-not-allowed border-slate-200 bg-slate-100" : "border-slate-200 bg-slate-50 focus:border-blue-400"}`}
          />
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Giảm %
          </label>
          <input
            type="number"
            value={formData.discountPercent}
            onChange={(event) => onFormChange("discountPercent", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Giảm tối đa (VND)
          </label>
          <input
            type="number"
            value={formData.maxDiscount}
            onChange={(event) => onFormChange("maxDiscount", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Giới hạn lượt dùng <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={formData.usageLimit}
            onChange={(event) => onFormChange("usageLimit", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Thời hạn áp dụng
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="datetime-local"
              value={formData.validFrom}
              onChange={(event) => onFormChange("validFrom", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
            />
            <input
              type="datetime-local"
              value={formData.validTo}
              onChange={(event) => onFormChange("validTo", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
          <span className="text-sm font-semibold text-slate-700">Kích hoạt</span>
          <button
            type="button"
            onClick={() => onFormChange("isActive", !Boolean(formData.isActive))}
            className={`h-6 w-11 rounded-full p-0.5 transition ${formData.isActive ? "bg-blue-600" : "bg-slate-300"}`}
          >
            <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${formData.isActive ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-2xl border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? "Đang lưu..." : isEditing ? "Cập nhật" : "Lưu"}
        </button>
      </form>
    </aside>
  );
};