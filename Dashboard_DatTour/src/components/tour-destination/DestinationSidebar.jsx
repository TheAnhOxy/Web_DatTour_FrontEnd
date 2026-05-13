import React, { useRef, useState } from "react";

export const DestinationSidebar = ({
  cityName,
  region,
  country,
  imagePreviewUrl,
  onCityNameChange,
  onRegionChange,
  onCountryChange,
  onSelectImageFile,
  onClearImage,
  onStartCreate,
  onSubmit,
  isSaving,
  isEditing,
  editingDestinationName,
  submitLabel = "Lưu điểm đến",
}) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const pickFile = (files) => {
    const file = Array.from(files || []).find((item) => item.type.startsWith("image/"));
    if (file) {
      onSelectImageFile(file);
    }
  };

  return (
    <aside className={`space-y-4 rounded-3xl border p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] ${isEditing ? "border-blue-200 bg-blue-50/70" : "border-slate-200 bg-slate-50/80"}`}>
      {isEditing ? (
        <button
          type="button"
          onClick={onStartCreate}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50"
        >
          ← Thêm điểm đến mới
        </button>
      ) : null}

      <div className={`rounded-3xl border bg-white px-4 py-4 shadow-sm ${isEditing ? "border-blue-200" : "border-blue-100"}`}>
        <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] ${isEditing ? "border-blue-200 bg-blue-50 text-blue-700" : "border-blue-200 bg-blue-50 text-blue-700"}`}>
          {isEditing ? "Đang chỉnh sửa" : "Quản lý thông tin điểm đến"}
        </div>
        <h2 className="mt-3 text-lg font-extrabold tracking-tight text-slate-950">
          {isEditing ? "Cập nhật điểm đến" : "Thêm điểm đến"}
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {isEditing
            ? `Đang sửa điểm đến: ${editingDestinationName || "--"}. Nhấn ${submitLabel.toLowerCase()} để cập nhật.`
            : "Nhập thông tin điểm đến rồi lưu để thêm mới."}
        </p>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          pickFile(event.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 transition ${dragging ? "border-blue-400 bg-blue-50" : "border-slate-300 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl">🖼️</div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">Kéo thả ảnh vào đây</p>
          <p className="text-xs text-slate-400">hoặc bấm để chọn ảnh từ máy tính</p>
        </div>
        <span className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white">
          Chọn ảnh
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => pickFile(event.target.files)}
          onClick={(event) => event.stopPropagation()}
        />
      </div>

      {imagePreviewUrl ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-32 w-full overflow-hidden bg-slate-100">
            <img src={imagePreviewUrl} alt={cityName || "Điểm đến"} className="h-full w-full object-cover" />
          </div>
          <div className="px-3 py-2 text-xs text-slate-500">
            <span>Ảnh đã chọn</span>
          </div>
        </div>
      ) : null}

      <form className="space-y-3" onSubmit={onSubmit}>
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Tên điểm đến <span className="text-rose-500">*</span>
          </label>
          <input
            value={cityName}
            onChange={(event) => onCityNameChange(event.target.value)}
            placeholder="Ví dụ: Bà Nà Hills"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Tỉnh / Thành phố
          </label>
          <input
            value={region}
            onChange={(event) => onRegionChange(event.target.value)}
            placeholder="Ví dụ: Đà Nẵng"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Quốc gia <span className="text-rose-500">*</span>
          </label>
          <select
            value={country}
            onChange={(event) => onCountryChange(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
          >
            <option value="Việt Nam">Việt Nam</option>
            <option value="Thái Lan">Thái Lan</option>
            <option value="Hàn Quốc">Hàn Quốc</option>
            <option value="Singapore">Singapore</option>
            <option value="Nhật Bản">Nhật Bản</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-xl border border-slate-950 bg-slate-950 px-3 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? "Đang lưu..." : submitLabel}
        </button>
      </form>
    </aside>
  );
};