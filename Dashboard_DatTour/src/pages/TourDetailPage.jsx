import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mockTourDetails } from "../data/mockTourData";

const categoryOptions = [
  "Du lịch biển",
  "Du lịch biển đảo",
  "Nghỉ dưỡng",
  "Du lịch lịch sử",
  "Du lịch khám phá",
];

const transportOptions = [
  "Xe du lịch chất lượng cao",
  "Máy bay",
  "Xe giường nằm cao cấp",
  "Máy bay + xe du lịch",
];

// ── Mock price config & pricing rules per departure ──────────────────────────
const mockPriceConfigs = {
  1: { adultPrice: "4500000", child1014Price: "3800000", child49Price: "2500000", babyPrice: "0" },
  2: { adultPrice: "4500000", child1014Price: "3800000", child49Price: "2500000", babyPrice: "0" },
  3: { adultPrice: "4500000", child1014Price: "3800000", child49Price: "2500000", babyPrice: "0" },
};

const mockPricingRules = {
  1: [
    {
      id: 101, ruleName: "Early Bird - Đặt sớm 30 ngày", ruleType: "EARLY_BIRD",
      adjustmentType: "PERCENT", adjustmentValue: "-10",
      minDaysBefore: "30", maxDaysBefore: "60", minSlotsLeft: "", maxSlotsLeft: "",
      priority: 1, isActive: true,
    },
    {
      id: 102, ruleName: "Last Minute - Dưới 5 chỗ", ruleType: "LAST_MINUTE",
      adjustmentType: "FIXED", adjustmentValue: "-200000",
      minDaysBefore: "", maxDaysBefore: "3", minSlotsLeft: "1", maxSlotsLeft: "5",
      priority: 2, isActive: false,
    },
  ],
  2: [
    {
      id: 201, ruleName: "Early Bird - Đặt sớm 45 ngày", ruleType: "EARLY_BIRD",
      adjustmentType: "PERCENT", adjustmentValue: "-15",
      minDaysBefore: "45", maxDaysBefore: "90", minSlotsLeft: "", maxSlotsLeft: "",
      priority: 1, isActive: true,
    },
  ],
  3: [],
};

const toTourCode = (id) => `HLB-2024-${String(id).padStart(3, "0")}`;

const formatDateVN = (dateStr) => {
  const date = new Date(`${dateStr}T00:00:00`);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day} Th${month}, ${year}`;
};

const formatPrice = (value) => {
  const num = Number(String(value || "").replace(/\D/g, ""));
  if (!Number.isFinite(num)) return "";
  return new Intl.NumberFormat("vi-VN").format(num);
};

// ─── Slot indicator: shows both booked & remaining ───────────────────────────
const SlotIndicator = ({ booked, max }) => {
  const remain = Math.max(0, max - booked);
  const ratio = max > 0 ? (booked / max) * 100 : 0;
  const isFull = remain === 0;
  const isLow = remain <= 3 && remain > 0;
  const barColor = isFull ? "#dc2626" : isLow ? "#f59e0b" : "#2563eb";

  return (
    <div className="flex flex-col gap-1">
      {/* Progress bar */}
      <div className="h-2 w-full max-w-[120px] rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.max(4, ratio)}%`, background: barColor }}
        />
      </div>
      {/* Dual label */}
      <div className="flex items-center gap-2 text-xs font-semibold">
        <span style={{ color: barColor }}>
          {booked}/{max} đã đặt
        </span>
        <span className="text-slate-400">·</span>
        <span className={isFull ? "text-red-500" : isLow ? "text-amber-500" : "text-slate-500"}>
          {remain} còn nhận
        </span>
      </div>
    </div>
  );
};

// ─── Labeled input helper ─────────────────────────────────────────────────────
const LabeledInput = ({ label, children }) => (
  <div>
    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </label>
    {children}
  </div>
);

export const TourDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const tourId = Number(id);
  const tour = mockTourDetails[tourId];

  const [selectedImage, setSelectedImage] = useState(0);
  const [editingDepartureId, setEditingDepartureId] = useState(null);
  const [priceConfigOpen, setPriceConfigOpen] = useState({});          // { [id]: bool }
  const [expandedRules, setExpandedRules] = useState({});               // { [ruleKey]: bool }
  const [toast, setToast] = useState("");

  // ── Destination state ──
  const [isEditingDest, setIsEditingDest] = useState(false);
  const [isAddingDest, setIsAddingDest] = useState(false);
  const [newDestName, setNewDestName] = useState("");

  const [formData, setFormData] = useState(() => {
    if (!tour) return null;
    return {
      title: tour.title,
      slug: tour.slug,
      categoryName: tour.categoryName,
      transportationType: tour.transportationType,
      basePrice: String(tour.basePrice),
      description: tour.description,
      isHot: tour.isHot,
      destinations: [...(tour.destinations || [])],
      departures: (tour.departures || []).map((dep) => ({
        ...dep,
        priceConfig: mockPriceConfigs[dep.id] || {},
        pricingRules: (mockPricingRules[dep.id] || []).map((r) => ({ ...r })),
      })),
    };
  });

  if (!tour || !formData) {
    return (
      <div className="rounded-xl border border-slate-300 bg-white p-8 text-center">
        <p className="text-slate-700">Không tìm thấy tour.</p>
        <button
          onClick={() => navigate("/tour")}
          className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const images = tour.images || [];
  const activeImage = images[selectedImage] || images[0];

  const setField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const setDepartureField = (departureId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      departures: prev.departures.map((dep) =>
        dep.id === departureId
          ? {
              ...dep,
              [field]:
                field === "maxSlots" || field === "bookedSlots"
                  ? Number(value || 0)
                  : value,
            }
          : dep,
      ),
    }));
  };

  const togglePriceConfig = (id) =>
    setPriceConfigOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleRule = (key) =>
    setExpandedRules((prev) => ({ ...prev, [key]: !prev[key] }));

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  };

  const onSave = () =>
    showToast("Đã lưu thay đổi. Thông tin tour đã được cập nhật thành công.");

  // ── Departure handlers ──
  const onDeleteDeparture = (departureId) => {
    setFormData((prev) => ({
      ...prev,
      departures: prev.departures.filter((dep) => dep.id !== departureId),
    }));
    if (editingDepartureId === departureId) setEditingDepartureId(null);
    showToast("Đã xóa lịch khởi hành.");
  };

  const onAddDeparture = () => {
    const nextId = Math.max(0, ...formData.departures.map((d) => d.id)) + 1;
    setFormData((prev) => ({
      ...prev,
      departures: [
        {
          id: nextId,
          startDate: "",
          endDate: "",
          maxSlots: 20,
          bookedSlots: 0,
          pickupName: "",
          pickupAddress: "",
          pickupTime: "",
          priceConfig: {},
          pricingRules: [],
          _isNew: true,
        },
        ...prev.departures,
      ],
    }));
    setEditingDepartureId(nextId);
    // No toast — user hasn't filled anything yet
  };

  // ── Destination handlers ──
  const onAddDestination = () => {
    const name = newDestName.trim();
    if (!name) return;
    const nextId = Math.max(0, ...formData.destinations.map((d) => d.id)) + 1;
    setFormData((prev) => ({
      ...prev,
      destinations: [...prev.destinations, { id: nextId, name }],
    }));
    setNewDestName("");
    setIsAddingDest(false);
    showToast("Đã thêm điểm đến mới.");
  };

  const onRemoveDestination = (destId) => {
    setFormData((prev) => ({
      ...prev,
      destinations: prev.destinations.filter((d) => d.id !== destId),
    }));
    showToast("Đã xóa điểm đến.");
  };

  const moreDepartureText = useMemo(
    () => `Xem thêm ${Math.max(3, formData.departures.length + 2)} lịch khởi hành`,
    [formData.departures.length],
  );

  return (
    <div className="space-y-4">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Chi tiết Tour</h1>
          <span className="text-slate-400">/</span>
          <p className="border-b-2 border-blue-600 pb-1 text-xs font-semibold text-blue-700">
            {formData.title}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Preview Tour
          </button>
          <button
            onClick={onSave}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>

      <button
        onClick={() => navigate("/tour")}
        className="text-sm text-slate-600 transition hover:text-slate-900"
      >
        ← Back to List
      </button>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Left column */}
        <div className="space-y-4 xl:col-span-5">
          {/* Images */}
          <div className="rounded-xl border border-slate-300 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Hình ảnh Tour</h3>
              <button className="text-sm font-semibold text-blue-700 hover:text-blue-800">
                ↥ Tải ảnh lên
              </button>
            </div>
            <div className="relative overflow-hidden rounded-lg border border-blue-500">
              <img
                src={activeImage?.imageUrl}
                alt={formData.title}
                className="h-64 w-full object-cover"
              />
              <span className="absolute left-3 top-3 rounded bg-blue-700 px-2 py-1 text-[10px] font-semibold text-white">
                ẢNH BÌA
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {images.slice(0, 2).map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(idx)}
                  className={`overflow-hidden rounded-lg border ${
                    selectedImage === idx ? "border-blue-600" : "border-slate-300"
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt={`tour-thumb-${idx}`}
                    className="h-20 w-full object-cover"
                  />
                </button>
              ))}
              <button className="flex h-20 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50">
                🖼️
              </button>
            </div>
          </div>

          {/* Quick info */}
          <div className="rounded-xl bg-[#0B1837] p-4 text-white">
            <h4 className="mb-4 text-lg font-semibold">Thông tin nhanh</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-white/20 pb-2">
                <span className="text-white/70">Mã Tour</span>
                <span className="font-semibold">{toTourCode(tour.id)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/20 pb-2">
                <span className="text-white/70">Trạng thái</span>
                <span className="rounded-full bg-blue-700 px-3 py-1 text-xs font-semibold">
                  {tour.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Hot Tour</span>
                <button
                  onClick={() => setField("isHot", !formData.isHot)}
                  className={`relative h-6 w-11 rounded-full transition ${
                    formData.isHot ? "bg-blue-500" : "bg-white/25"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                      formData.isHot ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4 xl:col-span-7">
          {/* Basic info */}
          <div className="rounded-xl border border-slate-300 bg-white p-4">
            <h3 className="mb-4 text-xl font-bold text-slate-900">Thông tin cơ bản</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Tiêu đề Tour
                </label>
                <input
                  value={formData.title}
                  onChange={(e) => setField("title", e.target.value)}
                  className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Slug (URL)
                  </label>
                  <input
                    value={formData.slug}
                    onChange={(e) => setField("slug", e.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-slate-100 px-3 text-sm italic text-slate-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Danh mục
                  </label>
                  <select
                    value={formData.categoryName}
                    onChange={(e) => setField("categoryName", e.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700"
                  >
                    {categoryOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Phương tiện
                  </label>
                  <select
                    value={formData.transportationType}
                    onChange={(e) => setField("transportationType", e.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700"
                  >
                    {transportOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Giá khởi điểm (VND)
                  </label>
                  <input
                    value={formatPrice(formData.basePrice)}
                    onChange={(e) =>
                      setField("basePrice", e.target.value.replace(/\D/g, ""))
                    }
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm font-bold text-blue-600"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Mô tả chi tiết
                </label>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setField("description", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm leading-6 text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* ── Destinations ── */}
          <div className="rounded-xl border border-slate-300 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Điểm đến</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditingDest((v) => !v);
                    setIsAddingDest(false);
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                    isEditingDest
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {isEditingDest ? "✓ Xong" : "✎ Sửa"}
                </button>
                <button
                  onClick={() => {
                    setIsAddingDest((v) => !v);
                    setIsEditingDest(false);
                  }}
                  className="rounded-lg bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  + Thêm
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.destinations.map((dest) => (
                <span
                  key={dest.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 py-1 pl-3 pr-2 text-sm font-semibold text-blue-700"
                >
                  {dest.name}
                  {isEditingDest && (
                    <button
                      onClick={() => onRemoveDestination(dest.id)}
                      className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold text-blue-700 transition hover:bg-red-200 hover:text-red-600"
                      title="Xóa"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}

              {formData.destinations.length === 0 && (
                <p className="text-sm text-slate-400 italic">Chưa có điểm đến nào.</p>
              )}
            </div>

            {/* Add destination form */}
            {isAddingDest && (
              <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Tên điểm đến mới
                </label>
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={newDestName}
                    onChange={(e) => setNewDestName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onAddDestination()}
                    placeholder="VD: Đà Nẵng, Phú Quốc..."
                    className="h-9 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                  />
                  <button
                    onClick={onAddDestination}
                    className="rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700"
                  >
                    Thêm
                  </button>
                  <button
                    onClick={() => { setIsAddingDest(false); setNewDestName(""); }}
                    className="rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-500 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Departures table ── */}
      <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
        {/* Section header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Lịch khởi hành & Điểm đón</h3>
            <p className="text-sm text-slate-500">Quản lý các đợt khởi hành trong tương lai</p>
          </div>
          <button
            onClick={onAddDeparture}
            disabled={editingDepartureId !== null}
            title={editingDepartureId !== null ? "Hoàn thành lịch đang chỉnh sửa trước" : ""}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              editingDepartureId !== null
                ? "cursor-not-allowed bg-slate-200 text-slate-400"
                : "bg-black text-white hover:bg-slate-800"
            }`}
          >
            🗓️ Thêm ngày khởi hành
          </button>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-13 bg-slate-100 px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
          <div className="col-span-1">STT</div>
          <div className="col-span-3">Ngày khởi hành</div>
          <div className="col-span-4">Điểm đón & Thời gian</div>
          <div className="col-span-3">Đã đặt / Còn nhận</div>
          <div className="col-span-2 text-right">Thao tác</div>
        </div>

        {/* Departure rows */}
        {formData.departures.map((departure) => {
          const isEditing = editingDepartureId === departure.id;
          const isPriceOpen = !!priceConfigOpen[departure.id];

          return (
            <div key={departure.id} className="border-t border-slate-200">
              {isEditing ? (
                /* ── Edit mode (full-width, labeled) ── */
                <div className="px-5 py-4">
                  {/* Edit mode badge + action buttons */}
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
                      ✏️ Đang chỉnh sửa lịch khởi hành
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const dep = formData.departures.find(d => d.id === departure.id);
                          if (dep?._isNew) {
                            setFormData(prev => ({
                              ...prev,
                              departures: prev.departures.map(d =>
                                d.id === departure.id ? { ...d, _isNew: false } : d
                              ),
                            }));
                            showToast("Đã thêm lịch khởi hành mới.");
                          } else {
                            showToast("Đã lưu thay đổi lịch khởi hành.");
                          }
                          setEditingDepartureId(null);
                        }}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        ✓ Xong
                      </button>
                      <button
                        onClick={() => onDeleteDeparture(departure.id)}
                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        🗑 Xóa
                      </button>
                    </div>
                  </div>

                  {/* Row 1: dates + time */}
                  <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <LabeledInput label="📅 Ngày khởi hành">
                      <input
                        type="date"
                        value={departure.startDate}
                        onChange={(e) =>
                          setDepartureField(departure.id, "startDate", e.target.value)
                        }
                        className="h-9 w-full rounded-lg border border-slate-300 px-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200"
                      />
                    </LabeledInput>
                    <LabeledInput label="🏁 Ngày kết thúc">
                      <input
                        type="date"
                        value={departure.endDate}
                        onChange={(e) =>
                          setDepartureField(departure.id, "endDate", e.target.value)
                        }
                        className="h-9 w-full rounded-lg border border-slate-300 px-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200"
                      />
                    </LabeledInput>
                    <LabeledInput label="⏰ Giờ đón khách">
                      <input
                        value={departure.pickupTime}
                        onChange={(e) =>
                          setDepartureField(departure.id, "pickupTime", e.target.value)
                        }
                        placeholder="VD: 07:30 AM"
                        className="h-9 w-full rounded-lg border border-slate-300 px-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200"
                      />
                    </LabeledInput>
                  </div>

                  {/* Row 2: pickup */}
                  <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <LabeledInput label="📍 Tên điểm đón">
                      <input
                        value={departure.pickupName}
                        onChange={(e) =>
                          setDepartureField(departure.id, "pickupName", e.target.value)
                        }
                        className="h-9 w-full rounded-lg border border-slate-300 px-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200"
                      />
                    </LabeledInput>
                    <LabeledInput label="🗺️ Địa chỉ cụ thể">
                      <input
                        value={departure.pickupAddress}
                        onChange={(e) =>
                          setDepartureField(departure.id, "pickupAddress", e.target.value)
                        }
                        className="h-9 w-full rounded-lg border border-slate-300 px-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200"
                      />
                    </LabeledInput>
                  </div>

                  {/* Row 3: slots */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <LabeledInput label="👥 Tổng chỗ (maxSlots)">
                      <input
                        type="number"
                        min={0}
                        value={departure.maxSlots}
                        onChange={(e) =>
                          setDepartureField(departure.id, "maxSlots", e.target.value)
                        }
                        className="h-9 w-full rounded-lg border border-slate-300 px-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200"
                      />
                    </LabeledInput>
                    <LabeledInput label="✅ Đã đặt (bookedSlots)">
                      <input
                        type="number"
                        min={0}
                        value={departure.bookedSlots}
                        onChange={(e) =>
                          setDepartureField(departure.id, "bookedSlots", e.target.value)
                        }
                        className="h-9 w-full rounded-lg border border-slate-300 px-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200"
                      />
                    </LabeledInput>
                    {/* Preview of slot indicator while editing */}
                    <div className="col-span-2 flex items-end pb-1">
                      <div className="w-full rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                        Preview:&nbsp;
                        <SlotIndicator
                          booked={departure.bookedSlots}
                          max={departure.maxSlots}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── View mode ── */
                <>
                  <div className="grid grid-cols-13 items-center px-5 py-4 gap-2">
                    <div className="col-span-1">
                      <p className="text-sm font-semibold text-slate-700">
                        {formData.departures.indexOf(departure) + 1}
                      </p>
                    </div>

                    <div className="col-span-3 flex items-center gap-3">
                      <div className="shrink-0 rounded-xl bg-blue-100 p-3 text-blue-700">📅</div>
                      <p className="text-[15px] font-semibold text-slate-800">
                        {formatDateVN(departure.startDate)}
                      </p>
                    </div>

                    <div className="col-span-4">
                      <p className="text-[15px] font-semibold text-slate-800">{departure.pickupName}</p>
                      <p className="text-xs text-slate-400">
                        {departure.pickupTime} · {departure.pickupAddress}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <SlotIndicator
                        booked={departure.bookedSlots}
                        max={departure.maxSlots}
                      />
                    </div>

                    <div className="col-span-3 flex items-center justify-end gap-2">
                      {/* Price config button */}
                      <button
                        onClick={() => togglePriceConfig(departure.id)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                          isPriceOpen
                            ? "border-blue-400 bg-blue-600 text-white"
                            : "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
                        }`}
                        title="Cấu hình giá"
                      >
                        <span>💰</span>
                        <span>Cấu hình giá</span>
                      </button>
                      <button
                        onClick={() => setEditingDepartureId(isEditing ? null : departure.id)}
                        className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:bg-slate-50"
                        title="Sửa"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => onDeleteDeparture(departure.id)}
                        className="rounded border border-red-300 px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                        title="Xóa"
                      >
                        🗑
                      </button>
                    </div>
                  </div>

                  {/* ── Price config panel ── */}
                  {isPriceOpen && (
                    <div className="border-t border-blue-100 bg-slate-50 px-5 py-5">

                      {/* ── SECTION 1: Price config ── */}
                      <div className="mb-5">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="text-base">👥</span>
                          <h4 className="text-sm font-bold text-slate-700">Cấu hình giá theo độ tuổi</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {[
                            { label: "Người lớn", sub: "Adult", field: "adultPrice", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
                            { label: "Trẻ em", sub: "10–14 tuổi", field: "child1014Price", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
                            { label: "Trẻ em", sub: "4–9 tuổi", field: "child49Price", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
                            { label: "Em bé", sub: "Dưới 4 tuổi", field: "babyPrice", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
                          ].map(({ label, sub, field, color, bg, border }) => (
                            <div key={field} className={`rounded-xl border ${border} ${bg} p-3`}>
                              <p className="mb-0.5 text-[11px] font-bold text-slate-500">{label}</p>
                              <p className="mb-2 text-[10px] text-slate-400">{sub}</p>
                              <div className="flex items-baseline gap-1">
                                <input
                                  type="text"
                                  value={formatPrice(departure.priceConfig?.[field] ?? "")}
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(/\D/g, "");
                                    setFormData((prev) => ({
                                      ...prev,
                                      departures: prev.departures.map((d) =>
                                        d.id === departure.id
                                          ? { ...d, priceConfig: { ...(d.priceConfig || {}), [field]: raw } }
                                          : d
                                      ),
                                    }));
                                  }}
                                  placeholder="0"
                                  className={`w-full bg-transparent text-lg font-bold outline-none ${color}`}
                                />
                                <span className="shrink-0 text-[10px] font-semibold text-slate-400">VND</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ── SECTION 2: Pricing rules ── */}
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🛡️</span>
                            <h4 className="text-sm font-bold text-slate-700">Quy tắc giảm giá</h4>
                            {departure.pricingRules?.length > 0 && (
                              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                                {departure.pricingRules.length}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              const newRule = {
                                _tempId: Date.now(),
                                ruleName: "",
                                ruleType: "EARLY_BIRD",
                                adjustmentType: "PERCENT",
                                adjustmentValue: "",
                                minDaysBefore: "",
                                maxDaysBefore: "",
                                minSlotsLeft: "",
                                maxSlotsLeft: "",
                                priority: (departure.pricingRules?.length ?? 0) + 1,
                                isActive: true,
                              };
                              const key = newRule._tempId;
                              setFormData((prev) => ({
                                ...prev,
                                departures: prev.departures.map((d) =>
                                  d.id === departure.id
                                    ? { ...d, pricingRules: [...(d.pricingRules || []), newRule] }
                                    : d
                                ),
                              }));
                              setExpandedRules((prev) => ({ ...prev, [key]: true }));
                            }}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            + Thêm quy tắc
                          </button>
                        </div>

                        {(!departure.pricingRules || departure.pricingRules.length === 0) && (
                          <div className="rounded-xl border border-dashed border-slate-300 py-6 text-center text-sm text-slate-400">
                            Chưa có quy tắc nào. Bấm "+ Thêm quy tắc" để tạo.
                          </div>
                        )}

                        <div className="space-y-2">
                          {(departure.pricingRules || []).map((rule) => {
                            const ruleKey = rule.id ?? rule._tempId;
                            const isExpanded = !!expandedRules[ruleKey];
                            const ruleTypeLabel = {
                              EARLY_BIRD: "Early Bird", LAST_MINUTE: "Last Minute",
                              GROUP_DISCOUNT: "Group Discount", SLOT_BASED: "Slot Based",
                            }[rule.ruleType] ?? rule.ruleType;

                            const setRuleField = (f, v) =>
                              setFormData((prev) => ({
                                ...prev,
                                departures: prev.departures.map((d) =>
                                  d.id === departure.id
                                    ? { ...d, pricingRules: d.pricingRules.map((r) =>
                                        (r.id ?? r._tempId) === ruleKey ? { ...r, [f]: v } : r
                                      )}
                                    : d
                                ),
                              }));

                            const removeRule = () =>
                              setFormData((prev) => ({
                                ...prev,
                                departures: prev.departures.map((d) =>
                                  d.id === departure.id
                                    ? { ...d, pricingRules: d.pricingRules.filter((r) => (r.id ?? r._tempId) !== ruleKey) }
                                    : d
                                ),
                              }));

                            return (
                              <div key={ruleKey} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                                {/* ── Pill summary row (always visible) ── */}
                                <div
                                  className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-slate-50"
                                  onClick={() => toggleRule(ruleKey)}
                                >
                                  {/* Expand chevron */}
                                  <span
                                    className="shrink-0 text-xs text-slate-400 transition-transform"
                                    style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block", transition: "transform .2s" }}
                                  >
                                    ∧
                                  </span>

                                  {/* Rule name */}
                                  <p className="flex-1 text-sm font-semibold text-slate-800">
                                    {rule.ruleName || <span className="italic text-slate-400">Chưa đặt tên</span>}
                                  </p>

                                  {/* Pills */}
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                      {ruleTypeLabel}
                                    </span>
                                    {rule.adjustmentValue && (
                                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">
                                        {rule.adjustmentValue}{rule.adjustmentType === "PERCENT" ? "%" : " VND"}
                                      </span>
                                    )}
                                    {(rule.minDaysBefore || rule.maxDaysBefore) && (
                                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
                                        {rule.minDaysBefore || "?"}&ndash;{rule.maxDaysBefore || "?"} ngày trước
                                      </span>
                                    )}
                                    {(rule.minSlotsLeft || rule.maxSlotsLeft) && (
                                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                                        Slot {rule.minSlotsLeft || "?"}&ndash;{rule.maxSlotsLeft || "?"}
                                      </span>
                                    )}
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                                      P{rule.priority}
                                    </span>
                                  </div>

                                  {/* Active toggle */}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setRuleField("isActive", !rule.isActive); }}
                                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition ${
                                      rule.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"
                                    }`}
                                  >
                                    {rule.isActive ? "Active" : "Inactive"}
                                  </button>

                                  {/* Delete */}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); removeRule(); }}
                                    className="shrink-0 rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-500"
                                  >
                                    ×
                                  </button>
                                </div>

                                {/* ── Expanded form ── */}
                                {isExpanded && (
                                  <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
                                    {/* Rule name input */}
                                    <div className="mb-4">
                                      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">Tên quy tắc</label>
                                      <input
                                        value={rule.ruleName}
                                        onChange={(e) => setRuleField("ruleName", e.target.value)}
                                        placeholder="VD: Early Bird - Đặt sớm 30 ngày"
                                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                                      />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                      <div>
                                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">Loại rule</label>
                                        <select
                                          value={rule.ruleType}
                                          onChange={(e) => setRuleField("ruleType", e.target.value)}
                                          className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-sm outline-none focus:border-blue-400"
                                        >
                                          <option value="EARLY_BIRD">Early Bird</option>
                                          <option value="LAST_MINUTE">Last Minute</option>
                                          <option value="GROUP_DISCOUNT">Group Discount</option>
                                          <option value="SLOT_BASED">Slot Based</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">Loại điều chỉnh</label>
                                        <select
                                          value={rule.adjustmentType}
                                          onChange={(e) => setRuleField("adjustmentType", e.target.value)}
                                          className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-sm outline-none focus:border-blue-400"
                                        >
                                          <option value="PERCENT">% Giảm</option>
                                          <option value="FIXED">Cố định (VND)</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">Mức điều chỉnh</label>
                                        <input
                                          value={rule.adjustmentValue}
                                          onChange={(e) => setRuleField("adjustmentValue", e.target.value)}
                                          placeholder={rule.adjustmentType === "PERCENT" ? "-10" : "-200000"}
                                          className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-400"
                                        />
                                      </div>
                                      <div>
                                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">Priority</label>
                                        <input
                                          type="number"
                                          value={rule.priority}
                                          onChange={(e) => setRuleField("priority", Number(e.target.value))}
                                          className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-400"
                                        />
                                      </div>
                                      <div>
                                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">Min ngày trước</label>
                                        <input
                                          type="number"
                                          value={rule.minDaysBefore}
                                          onChange={(e) => setRuleField("minDaysBefore", e.target.value)}
                                          placeholder="VD: 30"
                                          className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-400"
                                        />
                                      </div>
                                      <div>
                                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">Max ngày trước</label>
                                        <input
                                          type="number"
                                          value={rule.maxDaysBefore}
                                          onChange={(e) => setRuleField("maxDaysBefore", e.target.value)}
                                          placeholder="VD: 60"
                                          className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-400"
                                        />
                                      </div>
                                      <div>
                                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">Min slot còn</label>
                                        <input
                                          type="number"
                                          value={rule.minSlotsLeft}
                                          onChange={(e) => setRuleField("minSlotsLeft", e.target.value)}
                                          placeholder="VD: 1"
                                          className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-400"
                                        />
                                      </div>
                                      <div>
                                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">Max slot còn</label>
                                        <input
                                          type="number"
                                          value={rule.maxSlotsLeft}
                                          onChange={(e) => setRuleField("maxSlotsLeft", e.target.value)}
                                          placeholder="VD: 5"
                                          className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-400"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* ── Save button ── */}
                      <div className="mt-5 flex justify-end border-t border-slate-200 pt-4">
                        <button
                          onClick={() => showToast("Đã lưu cấu hình giá cho lịch khởi hành.")}
                          className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                        >
                          💾 Lưu cấu hình giá
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

        <button className="w-full border-t border-slate-200 bg-slate-50 py-3 text-sm font-semibold text-blue-700 hover:bg-slate-100">
          ˇ {moreDepartureText}
        </button>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
};