import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiEdit2, FiTrash2, FiSave, FiLoader } from "react-icons/fi";
import { useTourDetailQuery, useUpdateTourMutation, useTourCategoriesQuery, useSearchDestinationsQuery } from "../api/hooks/tourHooks";
import { useDeparturesQuery, useCreateDepartureMutation, useUpdateDepartureMutation, useDeleteDepartureMutation } from "../api/hooks/departureHooks";
import { useAddDestinationMutation, useRemoveDestinationMutation } from "../api/hooks/tourDestinationHooks";
import { useTransportationsQuery } from "../api/hooks/transportationHooks";
import { useAllDestinationsQuery } from "../api/hooks/tourHooks";
import TourImageSection from "../components/tour/TourImageSection";
import DeparturePricePanel from "../components/tour/DeparturePricePanel";

const fmtPrice = (v) => { const n = Number(String(v ?? "").replace(/\D/g, "")); return Number.isFinite(n) ? new Intl.NumberFormat("vi-VN").format(n) : ""; };
const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return `${String(dt.getDate()).padStart(2,"0")} Th${String(dt.getMonth()+1).padStart(2,"0")}, ${dt.getFullYear()}`;
};
const fmtTime = (t) => {
  if (!t) return "";
  if (t && t.includes("T")) return t.slice(11, 16);
  return t;
};
// Convert date input (yyyy-MM-dd) to LocalDateTime string (yyyy-MM-ddT00:00:00)
const toDateTime = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr.includes("T")) return dateStr; // already datetime
  return `${dateStr}T00:00:00`;
};
// Convert time input (HH:mm) + date to full LocalDateTime
const toPickupDateTime = (timeStr, dateStr) => {
  if (!timeStr) return null;
  if (timeStr.includes("T")) return timeStr; // already datetime
  const base = dateStr ? dateStr.slice(0, 10) : new Date().toISOString().slice(0, 10);
  return `${base}T${timeStr}:00`;
};
// Extract date part from datetime for date input value
const toDateInput = (dt) => {
  if (!dt) return "";
  return String(dt).slice(0, 10);
};
// Extract time part from datetime for time input value
const toTimeInput = (dt) => {
  if (!dt) return "";
  if (dt.includes("T")) return dt.slice(11, 16);
  return dt;
};
// Parse JSONB string → human-readable text
const parseJsonbText = (val) => {
  if (!val) return "";
  try {
    const parsed = JSON.parse(val);
    if (typeof parsed === "string") return parsed.replace(/\\n/g, "\n");
    if (Array.isArray(parsed)) return parsed.join("\n");
    if (parsed && typeof parsed.content === "string") return parsed.content.replace(/\\n/g, "\n");
    return JSON.stringify(parsed, null, 2);
  } catch { return String(val); }
};
// Re-serialize text back to JSONB format for object fields
const toJsonbObject = (text) => JSON.stringify({ content: text });
// Re-serialize text back to JSONB format for array fields (each line = one item)
const toJsonbArray = (text) => JSON.stringify(text.split("\n").map(s => s.trim()).filter(Boolean));

const Lbl = ({ children }) => <label className="mb-1 block text-xs font-semibold text-slate-500">{children}</label>;
const inputCls = "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100";
const taCls = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100";
const Card = ({ title, children, className = "" }) => (
  <div className={`rounded-xl border border-slate-200 bg-white p-5 ${className}`}>
    {title && <h3 className="mb-4 text-base font-bold text-slate-900">{title}</h3>}
    {children}
  </div>
);

const SlotBar = ({ booked = 0, max = 0 }) => {
  const remain = Math.max(0, max - booked);
  const ratio = max > 0 ? (booked / max) * 100 : 0;
  const color = remain === 0 ? "#dc2626" : remain <= 3 ? "#f59e0b" : "#2563eb";
  return (
    <div className="space-y-1">
      <div className="h-2 w-full max-w-[120px] overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(4, ratio)}%`, background: color }} />
      </div>
      <p className="text-xs font-semibold" style={{ color }}>{booked}/{max} · còn {remain}</p>
    </div>
  );
};

// │ DepEditFields is MODULE-LEVEL to prevent focus loss on re-render
const DepEditFields = ({ form, setForm }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div>
        <Lbl>Ngày khởi hành *</Lbl>
        <input type="date" value={toDateInput(form.startDate)} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className={inputCls} />
      </div>
      <div>
        <Lbl>Ngày kết thúc *</Lbl>
        <input type="date" value={toDateInput(form.endDate)} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className={inputCls} />
      </div>
      <div>
        <Lbl>Giờ đón</Lbl>
        <input type="time" value={toTimeInput(form.pickupTime)} onChange={e => setForm(p => ({ ...p, pickupTime: e.target.value }))} className={inputCls} />
      </div>
    </div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div><Lbl>Điểm đón</Lbl><input value={form.pickupName ?? ""} onChange={e => setForm(p => ({ ...p, pickupName: e.target.value }))} className={inputCls} /></div>
      <div><Lbl>Địa chỉ</Lbl><input value={form.pickupAddress ?? ""} onChange={e => setForm(p => ({ ...p, pickupAddress: e.target.value }))} className={inputCls} /></div>
    </div>
    <div className="grid grid-cols-3 gap-3">
      <div><Lbl>Tổng chỗ</Lbl><input type="number" min={1} value={form.maxSlots ?? 20} onChange={e => setForm(p => ({ ...p, maxSlots: e.target.value }))} className={inputCls} /></div>
      <div><Lbl>Đã đặt</Lbl><input type="number" min={0} value={form.bookedSlots ?? 0} onChange={e => setForm(p => ({ ...p, bookedSlots: e.target.value }))} className={inputCls} /></div>
      <div>
        <Lbl>Trạng thái</Lbl>
        <select value={form.status ?? "OPEN"} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className={inputCls}>
          <option value="OPEN">OPEN</option>
          <option value="CLOSED">CLOSED</option>
          <option value="FULL">FULL</option>
        </select>
      </div>
    </div>
  </div>
);

const EMPTY_DEP = { startDate: "", endDate: "", maxSlots: 20, bookedSlots: 0, status: "OPEN", pickupName: "", pickupAddress: "", pickupTime: "" };

// ── Searchable destination combobox — MODULE-LEVEL (dùng API search có debounce) ─────────────
const DestSearchSelect = ({ staticOptions = [], onSelect }) => {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  // 300ms debounce
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: apiResults = [], isFetching } = useSearchDestinationsQuery(debouncedSearch);

  // When no keyword → show pre-loaded static list; when typing → show API results
  const displayList = debouncedSearch.length >= 1 ? apiResults : staticOptions;

  // Close on outside click
  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      {/* Search input */}
      <div
        className={`flex h-10 w-full cursor-text items-center gap-2 rounded-lg border px-3 text-sm bg-white transition
          ${open ? "border-blue-400 ring-1 ring-blue-100" : "border-slate-300"}`}
        onClick={() => setOpen(true)}
      >
        <span className="text-slate-400 text-sm">🔍</span>
        <input
          autoFocus={open}
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Tìm theo tên thành phố, quốc gia..."
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400"
        />
        {isFetching && <span className="shrink-0 text-[10px] text-slate-400 animate-pulse">...</span>}
        {search && (
          <button onClick={e => { e.stopPropagation(); setSearch(""); }}
            className="shrink-0 cursor-pointer text-slate-300 hover:text-red-400 text-lg leading-none">×</button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
          {isFetching && debouncedSearch.length >= 1 ? (
            <p className="px-4 py-3 text-xs text-slate-400 text-center animate-pulse">Đang tìm kiếm...</p>
          ) : displayList.length === 0 ? (
            <p className="px-4 py-3 text-xs text-slate-400 text-center">
              {debouncedSearch ? `Không tìm thấy “${debouncedSearch}”` : "Chưa có điểm đến khả dụng"}
            </p>
          ) : (
            displayList.map(d => (
              <button key={d.id}
                onClick={() => { onSelect(String(d.id)); setSearch(""); setOpen(false); }}
                className="w-full cursor-pointer px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex items-center gap-2 transition text-slate-700 group"
              >
                <span className="flex-1 truncate font-medium">{d.cityName ?? d.name}</span>
                {(d.region || d.country) && (
                  <span className="shrink-0 text-[10px] text-slate-400">{[d.region, d.country].filter(Boolean).join(" · ")}</span>
                )}
                <span className="shrink-0 text-[10px] text-blue-500 opacity-0 group-hover:opacity-100 transition">+ Thêm</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export const TourDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: tour, isLoading } = useTourDetailQuery(id);
  const { data: departures = [] } = useDeparturesQuery(id);
  const { data: categories = [] } = useTourCategoriesQuery();
  const { data: transportations = [] } = useTransportationsQuery();
  const { data: allDestinations = [] } = useAllDestinationsQuery();

  const updateTour = useUpdateTourMutation();
  const addDest = useAddDestinationMutation(id);
  const removeDest = useRemoveDestinationMutation(id);
  const createDep = useCreateDepartureMutation(id);
  const updateDep = useUpdateDepartureMutation(id);
  const deleteDep = useDeleteDepartureMutation(id);

  const [formData, setFormData] = useState(null);
  const [editingDepId, setEditingDepId] = useState(null);
  const [depForm, setDepForm] = useState({});
  const [isNewDep, setIsNewDep] = useState(false);
  const [newDepForm, setNewDepForm] = useState({ ...EMPTY_DEP });
  const [priceOpen, setPriceOpen] = useState({});
  const [isAddingDest, setIsAddingDest] = useState(false);
  const [isEditingDest, setIsEditingDest] = useState(false);
  const [selectedDestId, setSelectedDestId] = useState("");

  useEffect(() => {
    // Only init once (formData === null) — prevents destination/image
    // mutations from re-fetching tour and wiping unsaved edits
    if (tour && formData === null) setFormData({
      title: tour.title ?? "",
      slug: tour.slug ?? "",
      description: tour.description ?? "",
      overview: tour.overview ?? "",
      itinerary: parseJsonbText(tour.itinerary),
      inclusions: parseJsonbText(tour.inclusions),
      exclusions: parseJsonbText(tour.exclusions),
      policies: parseJsonbText(tour.policies),
      durationDays: tour.durationDays ?? 1,
      basePrice: String(tour.basePrice ?? ""),
      status: tour.status ?? "ACTIVE",
      isHot: tour.isHot ?? false,
      categoryId: tour.categoryId ?? "",
      transportationId: tour.transportationId ?? "",
    });
  }, [tour]);

  useEffect(() => {
    if (!tour?.slug || !formData || formData.slug === tour.slug) return;
    setFormData((prev) => (prev ? { ...prev, slug: tour.slug ?? "" } : prev));
  }, [tour?.slug, formData]);

  if (isLoading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 w-64 rounded-lg bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-5 space-y-4">
          <div className="h-80 rounded-xl bg-slate-200" />
          <div className="h-40 rounded-xl bg-slate-200" />
        </div>
        <div className="xl:col-span-7 space-y-4">
          <div className="h-64 rounded-xl bg-slate-200" />
          <div className="h-40 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );

  if (!tour || !formData) return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
      <p className="text-slate-600">Không tìm thấy tour.</p>
      <button onClick={() => navigate("/tour")} className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">Quay lại</button>
    </div>
  );

  const set = (f, v) => setFormData(p => ({ ...p, [f]: v }));

  const handleSave = () => {
    updateTour.mutate({
      id: Number(id),
      payload: {
        title: formData.title,
        description: formData.description,
        overview: formData.overview,
        // Re-serialize JSONB fields
        itinerary: formData.itinerary ? toJsonbObject(formData.itinerary) : null,
        inclusions: formData.inclusions ? toJsonbArray(formData.inclusions) : null,
        exclusions: formData.exclusions ? toJsonbArray(formData.exclusions) : null,
        policies: formData.policies ? toJsonbObject(formData.policies) : null,
        durationDays: Number(formData.durationDays) || 1,
        basePrice: Number(String(formData.basePrice).replace(/\D/g, "")) || 0,
        status: formData.status,
        isHot: formData.isHot,
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        transportationId: formData.transportationId ? Number(formData.transportationId) : null,
      },
    },
    {
      onSuccess: (response) => {
        const savedSlug = response?.data?.slug ?? response?.slug;
        if (savedSlug) {
          setFormData((prev) => (prev ? { ...prev, slug: savedSlug } : prev));
        }
      },
    });
  };

  const handleAddDest = () => {
    if (!selectedDestId) return;
    addDest.mutate(Number(selectedDestId));
    setSelectedDestId("");
    setIsAddingDest(false);
  };

  const startEditDep = (dep) => {
    setEditingDepId(dep.id);
    setDepForm({
      ...dep,
      startDate: toDateInput(dep.startDate),
      endDate: toDateInput(dep.endDate),
      pickupTime: toTimeInput(dep.pickupTime),
    });
  };

  // Build departure payload with proper LocalDateTime format
  const buildDepPayload = (form) => ({
    tourId: Number(id),
    startDate: toDateTime(form.startDate),
    endDate: toDateTime(form.endDate),
    pickupTime: toPickupDateTime(form.pickupTime, form.startDate),
    maxSlots: Number(form.maxSlots) || 20,
    bookedSlots: Number(form.bookedSlots) || 0,
    status: form.status || "OPEN",
    pickupName: form.pickupName || "",
    pickupAddress: form.pickupAddress || "",
    pickupLatitude: form.pickupLatitude ?? null,
    pickupLongitude: form.pickupLongitude ?? null,
  });

  const handleSaveDep = () => {
    updateDep.mutate({ id: editingDepId, payload: buildDepPayload(depForm) });
    setEditingDepId(null);
  };

  const handleCreateDep = () => {
    if (!newDepForm.startDate || !newDepForm.endDate) {
      alert("Vui lòng chọn ngày khởi hành và ngày kết thúc");
      return;
    }
    createDep.mutate(buildDepPayload(newDepForm), {
      onSuccess: () => {
        setIsNewDep(false);
        setNewDepForm({ ...EMPTY_DEP });
      },
    });
  };

  const handleDeleteDep = (depId) => {
    if (confirm("Xóa lịch khởi hành này?")) deleteDep.mutate(depId);
  };

  const availableDestinations = allDestinations.filter(d => !(tour.destinations ?? []).some(td => td.id === d.id));

  // DepEditFields is now module-level (above) - do NOT redeclare here

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => { window.location.href = "/tour"; }} className="shrink-0 cursor-pointer text-sm text-slate-500 hover:text-blue-700">← Quay lại</button>
          <span className="text-slate-300">|</span>
          <h2 className="shrink-0 text-xl font-bold text-blue-700">Chi tiết Tour</h2>
          <span className="truncate max-w-sm text-sm font-semibold text-slate-600">— {tour.title}</span>
        </div>
        <button onClick={handleSave} disabled={updateTour.isPending}
          className="fixed right-6 top-26 z-50 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2 text-sm font-bold text-white shadow-xl shadow-blue-950/20 hover:bg-blue-800 disabled:opacity-60 sm:right-8">
          {updateTour.isPending ? <><FiLoader className="animate-spin" /> Đang lưu...</> : <><FiSave /> Lưu thay đổi</>}
        </button>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* LEFT */}
        <div className="space-y-4 xl:col-span-5">
          <Card title="Hình ảnh Tour">
            <TourImageSection tourId={id} />
          </Card>

          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-lg">
            <h4 className="mb-4 text-lg font-semibold">Thông tin nhanh</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-white/80">Trạng thái</span>
                <div className="flex items-center gap-3">
                  <select value={formData.status} onChange={e => set("status", e.target.value)}
                    className={`rounded-md px-3 py-1 text-sm font-semibold bg-white text-slate-800 outline-none border border-white/10 shadow-sm transition ${
                      formData.status === "ACTIVE" ? "ring-2 ring-emerald-500" : "ring-2 ring-red-500"
                    }`}>
                    <option value="ACTIVE" style={{ color: '#0f172a' }}>ACTIVE</option>
                    <option value="INACTIVE" style={{ color: '#0f172a' }}>INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-white/80">Số ngày</span>
                <input type="number" min={1} value={formData.durationDays}
                  onChange={e => set("durationDays", e.target.value)}
                  className="w-20 rounded-md bg-white/6 px-2 py-1 text-center text-sm font-semibold text-white outline-none border border-white/6" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/80">Tour nổi bật</span>
                <button onClick={() => set("isHot", !formData.isHot)}
                  aria-label="Toggle hot"
                  className={`relative h-6 w-11 rounded-full transition ${formData.isHot ? "bg-amber-400/90" : "bg-white/12"}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${formData.isHot ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Destinations */}
          <Card title="Điểm đến">
            <div className="mb-3 flex gap-2">
              <button onClick={() => { setIsEditingDest(v => !v); setIsAddingDest(false); }}
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${isEditingDest ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-300 bg-white text-slate-600"}`}>
                {isEditingDest ? "✓ Xong" : <span className="inline-flex items-center gap-1"><FiEdit2 /> Sửa</span>}
              </button>
              <button onClick={() => { setIsAddingDest(v => !v); setIsEditingDest(false); }}
                className="rounded-lg bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-800">
                + Thêm
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(tour.destinations ?? []).map((dest) => (
                <span key={dest.id} className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 py-1 pl-3 pr-2 text-sm font-semibold text-blue-700">
                  {dest.cityName ?? dest.name}
                  {isEditingDest && (
                    <button onClick={() => removeDest.mutate(dest.id)}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-200 text-[10px] text-blue-700 hover:bg-red-200 hover:text-red-600">
                      <FiTrash2 />
                    </button>
                  )}
                </span>
              ))}
              {(tour.destinations ?? []).length === 0 && <p className="text-sm italic text-slate-400">Chưa có điểm đến.</p>}
            </div>
            {isAddingDest && (
              <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-blue-700">Chọn điểm đến — nhấp vào để thêm ngay</p>
                  <button onClick={() => setIsAddingDest(false)}
                    className="cursor-pointer text-xs text-slate-400 hover:text-slate-600">Hủy ×</button>
                </div>
                <DestSearchSelect
                  staticOptions={availableDestinations}
                  onSelect={(destId) => {
                    setSelectedDestId(destId);
                    addDest.mutate(Number(destId));
                    setIsAddingDest(false);
                  }}
                />
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-4 xl:col-span-7">
          <Card title="Thông tin cơ bản">
            <div className="space-y-3">
              <div><Lbl>Tiêu đề Tour</Lbl><input value={formData.title} onChange={e => set("title", e.target.value)} className={inputCls} /></div>
              <div><Lbl>Slug (URL)</Lbl><input value={formData.slug} readOnly className={`${inputCls} bg-slate-100 italic text-slate-500 cursor-not-allowed`} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Lbl>Danh mục</Lbl>
                  <select value={formData.categoryId} onChange={e => set("categoryId", e.target.value)} className={inputCls}>
                    <option value="">-- Chọn --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <Lbl>Phương tiện</Lbl>
                  <select value={formData.transportationId} onChange={e => set("transportationId", e.target.value)} className={inputCls}>
                    <option value="">-- Chọn --</option>
                    {transportations.map(t => <option key={t.id} value={t.id}>{t.type ?? t.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <Lbl>Giá khởi điểm (VND)</Lbl>
                <input value={fmtPrice(formData.basePrice)} onChange={e => set("basePrice", e.target.value.replace(/\D/g, ""))}
                  className={`${inputCls} font-bold text-blue-600`} />
              </div>
              <div><Lbl>Mô tả ngắn</Lbl><textarea rows={4} value={formData.description} onChange={e => set("description", e.target.value)} className={taCls} /></div>
            </div>
          </Card>

          <Card title="Nội dung chi tiết">
            <div className="space-y-3">
              {[
                ["Tổng quan", "overview", 4],
                ["Lịch trình", "itinerary", 5],
              ].map(([label, field, rows]) => (
                <div key={field}><Lbl>{label}</Lbl><textarea rows={rows} value={formData[field]} onChange={e => set(field, e.target.value)} className={taCls} /></div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {[["Dịch vụ bao gồm","inclusions"],["Không bao gồm","exclusions"]].map(([label, field]) => (
                  <div key={field}><Lbl>{label}</Lbl><textarea rows={4} value={formData[field]} onChange={e => set(field, e.target.value)} className={taCls} /></div>
                ))}
              </div>
              <div><Lbl>Chính sách</Lbl><textarea rows={4} value={formData.policies} onChange={e => set("policies", e.target.value)} className={taCls} /></div>
            </div>
          </Card>
        </div>
      </div>

      {/* Departures */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Lịch khởi hành & Điểm đón</h3>
            <p className="text-sm text-slate-500">Quản lý các đợt khởi hành</p>
          </div>
          <button onClick={() => { setIsNewDep(true); setNewDepForm({ ...EMPTY_DEP }); }}
            disabled={isNewDep}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-40">
            🗓️ Thêm ngày khởi hành
          </button>
        </div>

        {/* New departure inline form */}
        {isNewDep && (
          <div className="border-t border-blue-100 bg-blue-50/30 px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">+ Lịch mới</span>
              <div className="flex gap-2">
                <button onClick={handleCreateDep} disabled={createDep.isPending}
                  className="rounded-lg bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-800">
                  {createDep.isPending ? "Đang lưu..." : "✓ Lưu lịch"}
                </button>
                <button onClick={() => setIsNewDep(false)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600">Hủy</button>
              </div>
            </div>
            <DepEditFields form={newDepForm} setForm={setNewDepForm} />
          </div>
        )}

        {/* Table header */}
        <div className="grid grid-cols-13 bg-slate-100 px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
          <div className="col-span-1">STT</div>
          <div className="col-span-3">Ngày khởi hành</div>
          <div className="col-span-4">Điểm đón & Thời gian</div>
          <div className="col-span-3">Đã đặt / Còn</div>
          <div className="col-span-2 text-right">Thao tác</div>
        </div>

        {departures.length === 0 && (
          <p className="py-6 text-center text-sm italic text-slate-400">Chưa có lịch khởi hành.</p>
        )}

        {departures.map((dep, idx) => {
          const isEditing = editingDepId === dep.id;
          const isPriceOpen = !!priceOpen[dep.id];
          return (
            <div key={dep.id} className="border-t border-slate-200">
              {isEditing ? (
                <div className="px-5 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600"><FiEdit2 className="inline mr-1" />Đang chỉnh sửa</span>
                    <div className="flex gap-2">
                      <button onClick={handleSaveDep} disabled={updateDep.isPending}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                        {updateDep.isPending ? "Đang lưu..." : "✓ Xong"}
                      </button>
                      <button onClick={() => handleDeleteDep(dep.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                        <FiTrash2 /> Xóa
                      </button>
                    </div>
                  </div>
                  <DepEditFields form={depForm} setForm={setDepForm} />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-13 items-center gap-2 px-5 py-4">
                    <div className="col-span-1 text-sm font-semibold text-slate-700">{idx + 1}</div>
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="shrink-0 rounded-xl bg-blue-100 p-3 text-blue-700">📅</div>
                      <p className="text-[15px] font-semibold text-slate-800">{fmtDate(dep.startDate)}</p>
                    </div>
                    <div className="col-span-4">
                      <p className="text-[15px] font-semibold text-slate-800">{dep.pickupName}</p>
                      <p className="text-xs text-slate-400">{fmtTime(dep.pickupTime)} · {dep.pickupAddress}</p>
                    </div>
                    <div className="col-span-2"><SlotBar booked={dep.bookedSlots ?? 0} max={dep.maxSlots ?? 0} /></div>
                    <div className="col-span-3 flex items-center justify-end gap-2">
                      <button onClick={() => setPriceOpen(p => ({ ...p, [dep.id]: !p[dep.id] }))}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${isPriceOpen ? "border-blue-400 bg-blue-600 text-white" : "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"}`}>
                        💰 Cấu hình giá
                      </button>
                      <button onClick={() => startEditDep(dep)} className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:bg-slate-50"><FiEdit2 /></button>
                      <button onClick={() => handleDeleteDep(dep.id)} className="rounded border border-red-300 px-2 py-1 text-sm text-red-600 hover:bg-red-50"><FiTrash2 /></button>
                    </div>
                  </div>
                  {isPriceOpen && <DeparturePricePanel departure={dep} tourId={id} />}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};