import React from "react";

export const TourCategorySidebar = ({
  totalCategories,
  activeCategories,
  formName,
  onFormNameChange,
  onStartCreate,
  onSubmit,
  isSaving,
  isEditing,
  editingCategoryName,
  submitLabel = "Lưu",
}) => {
  return (
    <aside className={`space-y-4 rounded-3xl border p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] ${isEditing ? "border-blue-200 bg-blue-50/70" : "border-slate-200 bg-slate-50/80"}`}>
      {isEditing ? (
        <button
          type="button"
          onClick={onStartCreate}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50"
        >
          ← Thêm danh mục mới
        </button>
      ) : null}

      <div className={`rounded-3xl border bg-white px-4 py-4 shadow-sm ${isEditing ? "border-blue-200" : "border-blue-100"}`}>
        <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] ${isEditing ? "border-blue-200 bg-blue-50 text-blue-700" : "border-blue-200 bg-blue-50 text-blue-700"}`}>
          {isEditing ? "Đang chỉnh sửa" : "Quản lý thông tin danh mục"}
        </div>
        <h2 className="mt-3 text-lg font-extrabold tracking-tight text-slate-950">
          {isEditing ? "Cập nhật danh mục" : "Thêm danh mục mới"}
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {isEditing
            ? `Đang sửa danh mục: ${editingCategoryName || "--"}.`
            : "Nhập tên danh mục rồi lưu để thêm danh mục."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-500">
            Tổng danh mục
          </p>
          <p className="mt-2 text-2xl font-black leading-none text-blue-600">
            {totalCategories}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-green-500">
            Đang hoạt động
          </p>
          <p className="mt-2 text-2xl font-black leading-none text-green-600">
            {activeCategories}
          </p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>

        <div>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Tên danh mục <span className="text-rose-500">*</span>
          </label>
          <input
            value={formName}
            onChange={(event) => onFormNameChange(event.target.value)}
            placeholder="Ví dụ: Du lịch biển"
            className={`w-full rounded-2xl border px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white ${isEditing ? "border-blue-300 bg-blue-50 focus:border-blue-500" : "border-slate-200 bg-slate-50 focus:border-blue-400"}`}
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-2xl border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? "Đang lưu..." : submitLabel}
        </button>
      </form>
    </aside>
  );
};
