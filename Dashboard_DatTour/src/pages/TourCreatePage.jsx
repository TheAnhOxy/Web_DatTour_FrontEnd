import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORY_OPTIONS = [
  "Du lịch biển",
  "Du lịch biển đảo",
  "Nghỉ dưỡng",
  "Du lịch lịch sử",
  "Du lịch khám phá",
];

const TRANSPORT_OPTIONS = [
  "Máy bay",
  "Xe du lịch chất lượng cao",
  "Xe giường nằm cao cấp",
  "Máy bay + xe du lịch",
];

const DESTINATION_OPTIONS = [
  "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hội An", "Huế",
  "Nha Trang", "Đà Lạt", "Phú Quốc", "Hạ Long", "Cát Bà",
  "Sapa", "Mũi Né", "Quy Nhơn", "Phan Thiết", "Côn Đảo",
  "Cần Thơ", "Vũng Tàu", "Ninh Bình", "Hà Giang", "Mai Châu",
];

const formatPrice = (value) => {
  const num = Number(String(value || "").replace(/\D/g, ""));
  if (!num) return "";
  return new Intl.NumberFormat("vi-VN").format(num);
};

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionCard = ({ title, children, className = "" }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white p-5 ${className}`}>
    <h3 className="mb-4 text-base font-bold text-slate-900">{title}</h3>
    {children}
  </div>
);

const FieldLabel = ({ children, required }) => (
  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
    {children}{required && <span className="ml-0.5 text-red-500">*</span>}
  </label>
);

const inputCls =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400";

// ── Image Upload Section ──────────────────────────────────────────────────────
const ImageUploadSection = ({ images, setImages }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = useCallback((files) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      setImages((prev) => [...prev, { url, name: file.name, file }]);
    });
  }, [setImages]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleRemove = (idx) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const setCover = (idx) => {
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      return [item, ...next];
    });
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`mb-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-8 transition ${
          dragging
            ? "border-blue-400 bg-blue-50"
            : "border-slate-300 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl">🖼️</div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">Kéo thả ảnh vào đây</p>
          <p className="text-xs text-slate-400">hoặc bấm để chọn từ máy tính</p>
        </div>
        <span className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white">
          Chọn ảnh
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img, idx) => (
            <div key={idx} className="group relative overflow-hidden rounded-xl border border-slate-200">
              <img
                src={img.url}
                alt={img.name}
                className="h-24 w-full object-cover transition group-hover:scale-105"
              />
              {/* Cover badge */}
              {idx === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-md bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  ẢNH BÌA
                </span>
              )}
              {/* Overlay actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition group-hover:opacity-100">
                {idx !== 0 && (
                  <button
                    onClick={() => setCover(idx)}
                    title="Đặt làm ảnh bìa"
                    className="rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-white"
                  >
                    📌 Bìa
                  </button>
                )}
                <button
                  onClick={() => handleRemove(idx)}
                  className="rounded-lg bg-red-500/90 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-600"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="mt-2 text-xs text-slate-400">
          {images.length} ảnh · Hover để đặt ảnh bìa hoặc xóa
        </p>
      )}
    </div>
  );
};

// ── Destination Picker ────────────────────────────────────────────────────────
const DestinationPicker = ({ selected, setSelected }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const filtered = DESTINATION_OPTIONS.filter(
    (d) =>
      d.toLowerCase().includes(query.toLowerCase()) &&
      !selected.includes(d)
  );

  const add = (dest) => {
    setSelected((prev) => [...prev, dest]);
    setQuery("");
    setOpen(false);
  };

  const remove = (dest) => setSelected((prev) => prev.filter((d) => d !== dest));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim()) {
      const match = filtered[0];
      if (match) add(match);
      else if (!selected.includes(query.trim())) {
        add(query.trim());
      }
    }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={containerRef}>
      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((dest) => (
            <span
              key={dest}
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 py-1 pl-3 pr-2 text-sm font-semibold text-blue-700"
            >
              📍 {dest}
              <button
                onClick={() => remove(dest)}
                className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold text-blue-700 transition hover:bg-red-200 hover:text-red-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder="Tìm hoặc nhập điểm đến..."
          className={inputCls + " pl-10"}
        />
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          🔍
        </span>

        {/* Dropdown */}
        {open && (
          <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
            {filtered.length === 0 && query.trim() ? (
              <button
                onMouseDown={() => add(query.trim())}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-slate-50"
              >
                <span className="text-blue-600">+</span>
                <span>Thêm "<strong>{query.trim()}</strong>"</span>
              </button>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-400">Không có gợi ý</div>
            ) : (
              filtered.map((dest) => (
                <button
                  key={dest}
                  onMouseDown={() => add(dest)}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  <span className="text-slate-400">📍</span>
                  {dest}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      <p className="mt-1.5 text-[11px] text-slate-400">
        Gõ để tìm kiếm hoặc nhập tên điểm đến tùy chỉnh, nhấn Enter để thêm
      </p>
    </div>
  );
};

// ── Departure Row ─────────────────────────────────────────────────────────────
const DepartureRow = ({ schedule, onChange, onRemove }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <div>
        <FieldLabel>📅 Ngày khởi hành</FieldLabel>
        <input
          type="date"
          value={schedule.date}
          onChange={(e) => onChange("date", e.target.value)}
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
        />
      </div>
      <div>
        <FieldLabel>📍 Điểm đón</FieldLabel>
        <input
          value={schedule.pickup}
          onChange={(e) => onChange("pickup", e.target.value)}
          placeholder="VD: Nhà hát Lớn HN"
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 placeholder:text-slate-400"
        />
      </div>
      <div>
        <FieldLabel>👥 Số chỗ</FieldLabel>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={schedule.seats}
            onChange={(e) => onChange("seats", e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
          />
          <button
            onClick={onRemove}
            className="shrink-0 rounded-lg border border-red-200 bg-white px-2 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
export const TourCreatePage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [transport, setTransport] = useState(TRANSPORT_OPTIONS[0]);
  const [price, setPrice] = useState("");
  const [isHot, setIsHot] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [images, setImages] = useState([]);
  const [schedules, setSchedules] = useState([
    { id: 1, date: "", seats: 30, pickup: "" },
  ]);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const updateSchedule = (id, field, value) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const addSchedule = () => {
    setSchedules((prev) => [
      ...prev,
      { id: Date.now(), date: "", seats: 30, pickup: "" },
    ]);
  };

  const removeSchedule = (id) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) return showToast("⚠️ Vui lòng nhập tên tour.");
    showToast("✅ Đã lưu tour thành công!");
  };

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-6 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              ← Quay lại
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Thêm Tour Mới</h1>
              <p className="text-xs text-slate-400">Điền đầy đủ thông tin bên dưới để tạo tour</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSave}
              className="rounded-xl bg-blue-700 px-5 py-2 text-sm font-bold text-white hover:bg-blue-800"
            >
              💾 Lưu Tour
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl px-6 py-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">

          {/* ── Left column ── */}
          <div className="space-y-4">

            {/* Basic info */}
            <SectionCard title="Thông tin cơ bản">
              <div className="space-y-4">
                <div>
                  <FieldLabel required>Tên Tour</FieldLabel>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Tour Hạ Long 3N2Đ - Khám phá vịnh biển huyền thoại"
                    className={inputCls}
                  />
                </div>

                <div>
                  <FieldLabel>Mô tả chi tiết</FieldLabel>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Viết mô tả hành trình, các điểm tham quan, dịch vụ bao gồm..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Danh mục</FieldLabel>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={inputCls}
                    >
                      {CATEGORY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Phương tiện</FieldLabel>
                    <select
                      value={transport}
                      onChange={(e) => setTransport(e.target.value)}
                      className={inputCls}
                    >
                      {TRANSPORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Images */}
            <SectionCard title="Thư viện hình ảnh">
              <ImageUploadSection images={images} setImages={setImages} />
            </SectionCard>

            {/* Departures */}
            <SectionCard title="Lịch khởi hành">
              <div className="space-y-3">
                {schedules.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-300 py-6 text-center text-sm text-slate-400">
                    Chưa có lịch nào. Bấm "+ Thêm ngày" để tạo.
                  </div>
                )}
                {schedules.map((s) => (
                  <DepartureRow
                    key={s.id}
                    schedule={s}
                    onChange={(field, value) => updateSchedule(s.id, field, value)}
                    onRemove={() => removeSchedule(s.id)}
                  />
                ))}
                <button
                  onClick={addSchedule}
                  className="inline-flex items-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  🗓️ + Thêm ngày khởi hành
                </button>
              </div>
            </SectionCard>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-4">

            {/* Price & Status */}
            <SectionCard title="Giá & trạng thái">
              <div className="space-y-4">
                <div>
                  <FieldLabel required>Giá khởi điểm (VND)</FieldLabel>
                  <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
                    <input
                      value={formatPrice(price)}
                      onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
                      placeholder="0"
                      className="h-11 flex-1 bg-transparent px-4 text-sm font-bold text-blue-600 outline-none"
                    />
                    <span className="pr-4 text-xs font-semibold text-slate-400">VND</span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Tour nổi bật 🔥</p>
                    <p className="text-xs text-slate-400">Hiển thị ưu tiên trên trang chủ</p>
                  </div>
                  <button
                    onClick={() => setIsHot((v) => !v)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      isHot ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                        isHot ? "left-5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* Destinations */}
            <SectionCard title="Điểm đến">
              <DestinationPicker
                selected={destinations}
                setSelected={setDestinations}
              />
            </SectionCard>

            {/* Tips */}
            <div className="rounded-2xl bg-[#071126] p-4 text-white">
              <h4 className="mb-2 font-bold">💡 Mẹo tạo tour hiệu quả</h4>
              <ul className="space-y-1.5 text-xs leading-relaxed text-slate-300">
                <li>• Tên tour rõ ràng, bao gồm số ngày/đêm và điểm nổi bật</li>
                <li>• Ảnh bìa nên là ảnh phong cảnh đẹp nhất, tỉ lệ 16:9</li>
                <li>• Ít nhất 1 lịch khởi hành để tăng tỉ lệ đặt tour</li>
                <li>• Mô tả chi tiết dịch vụ bao gồm & không bao gồm</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
};