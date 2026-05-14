import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FiArrowLeft, FiSave, FiX, FiLoader, FiClipboard } from "react-icons/fi";
import {
  useCategoriesQuery,
  useAllDestinationsQuery,
  TOUR_KEYS,
} from "../api/hooks/tourHooks";
import * as tourApi from "../api/tourApi";
import { useTransportationsQuery } from "../api/hooks/transportationHooks";
import { TourLeftPanel, TourRightPanel } from "../components/tour/TourCreatePanels";

const DRAFT_KEY = "tour-create-draft-v1";

const JSONB_DEFAULTS = {
  overview: `Khám phá những điểm đến hấp dẫn và trải nghiệm văn hóa độc đáo. Tour được thiết kế để mang lại trải nghiệm tuyệt vời cho du khách.`,
  itinerary: `Ngày 1: Khởi hành từ điểm đón...\nNgày 2: Tham quan...\nNgày 3: Kết thúc chuyến đi...`,
  inclusions: `- Vé vào cổng\n- Hướng dẫn viên tiếng Việt\n- Ăn sáng, trưa, chiều\n- Xe đi lại theo lịch trình`,
  exclusions: `- Chi phí cá nhân\n- Bảo hiểm du lịch\n- Các dịch vụ không được nêu rõ`,
  policies: `Hủy tour miễn phí: 7 ngày trước ngày khởi hành\nHủy cách 3-6 ngày: mất 50%\nHủy cách <3 ngày: mất 100%`,
};

const EMPTY_SCHEDULE = () => ({
  id: Date.now(), date: "", endDate: "", seats: 30,
  pickup: "", pickupAddress: "", pickupTime: "",
  adultPrice: "", child1014Price: "", child49Price: "", babyPrice: "",
});

const SAMPLE_SCHEDULES = () => {
  const today = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const d1 = new Date(today); d1.setDate(today.getDate() + 14);
  const d1e = new Date(d1); d1e.setDate(d1.getDate() + 2);
  const d2 = new Date(today); d2.setDate(today.getDate() + 28);
  const d2e = new Date(d2); d2e.setDate(d2.getDate() + 2);
  return [
    { id: Date.now(), date: fmt(d1), endDate: fmt(d1e), seats: 30, pickup: "Nhà hát Lớn HN", pickupAddress: "1 Tràng Tiền, Hoàn Kiếm, Hà Nội", pickupTime: "07:30", adultPrice: "2990000", child1014Price: "2390000", child49Price: "1990000", babyPrice: "0" },
    { id: Date.now() + 1, date: fmt(d2), endDate: fmt(d2e), seats: 25, pickup: "Vincom Bà Triệu", pickupAddress: "191 Bà Triệu, Hai Bà Trưng, Hà Nội", pickupTime: "07:00", adultPrice: "2990000", child1014Price: "2390000", child49Price: "1990000", babyPrice: "0" },
  ];
};

const getDraft = () => { try { const r = localStorage.getItem(DRAFT_KEY); return r ? JSON.parse(r) : null; } catch { return null; } };
const saveDraft = (d) => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch {} };
const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY); } catch {} };

// ── Main Page ──────────────────────────────────────────────────────────────────
export const TourCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useCategoriesQuery();
  const { data: transportations = [] } = useTransportationsQuery();
  const { data: allDestinations = [] } = useAllDestinationsQuery();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [overview, setOverview] = useState("");
  const [itinerary, setItinerary] = useState("");
  const [inclusions, setInclusions] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [policies, setPolicies] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [transportationId, setTransportationId] = useState(null);
  const [price, setPrice] = useState("");
  const [isHot, setIsHot] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [images, setImages] = useState([]);
  const [schedules, setSchedules] = useState([EMPTY_SCHEDULE()]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Restore draft
  useEffect(() => {
    const d = getDraft();
    if (!d) return;
    if (d.title !== undefined) setTitle(d.title ?? "");
    if (d.description !== undefined) setDescription(d.description ?? "");
    if (d.overview !== undefined) setOverview(d.overview ?? "");
    if (d.itinerary !== undefined) setItinerary(d.itinerary ?? "");
    if (d.inclusions !== undefined) setInclusions(d.inclusions ?? "");
    if (d.exclusions !== undefined) setExclusions(d.exclusions ?? "");
    if (d.policies !== undefined) setPolicies(d.policies ?? "");
    if (d.durationDays !== undefined) setDurationDays(String(d.durationDays ?? ""));
    if (d.categoryId !== undefined) setCategoryId(d.categoryId ?? null);
    if (d.transportationId !== undefined) setTransportationId(d.transportationId ?? null);
    if (d.price !== undefined) setPrice(String(d.price ?? ""));
    if (d.isHot !== undefined) setIsHot(Boolean(d.isHot));
    if (Array.isArray(d.destinations)) setDestinations(d.destinations);
    if (Array.isArray(d.schedules) && d.schedules.length > 0) setSchedules(d.schedules);
  }, []);

  // Auto-save draft
  useEffect(() => {
    saveDraft({ title, description, overview, itinerary, inclusions, exclusions, policies, durationDays, categoryId, transportationId, price, isHot, destinations, schedules });
  }, [title, description, overview, itinerary, inclusions, exclusions, policies, durationDays, categoryId, transportationId, price, isHot, destinations, schedules]);

  // Default selections when data loads
  useEffect(() => { if (categories.length > 0 && !categoryId) setCategoryId(categories[0].id); }, [categories, categoryId]);
  useEffect(() => { if (transportations.length > 0 && !transportationId) setTransportationId(transportations[0].id); }, [transportations, transportationId]);

  // Schedules
  const updateSchedule = (id, field, value) => setSchedules(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  const addSchedule = () => setSchedules(prev => [...prev, EMPTY_SCHEDULE()]);
  const removeSchedule = (id) => {
    if (schedules.length === 1) { toast.warn("Phải có ít nhất 1 lịch khởi hành"); return; }
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  // Validate
  const validateForm = () => {
    const e = {};
    if (!title.trim()) e.title = "Vui lòng nhập tên tour";
    if (!description.trim()) e.description = "Vui lòng nhập mô tả";
    if (!categoryId) e.categoryId = "Vui lòng chọn danh mục";
    if (!transportationId) e.transportationId = "Vui lòng chọn phương tiện";
    if (!durationDays || Number(durationDays) < 1) e.durationDays = "Số ngày phải từ 1 trở lên";
    if (!price || Number(price.replace(/\D/g, "")) <= 0) e.price = "Vui lòng nhập giá";
    if (!schedules.some(s => s.date && s.endDate && s.seats)) e.schedules = "Phải có ít nhất 1 lịch hợp lệ";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Save
  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const payload = {
        title: title.trim(), description: description.trim(), overview: overview.trim(),
        itinerary: itinerary ? JSON.stringify({ content: itinerary }) : null,
        inclusions: inclusions ? JSON.stringify(inclusions.split("\n").map(v => v.trim()).filter(Boolean)) : null,
        exclusions: exclusions ? JSON.stringify(exclusions.split("\n").map(v => v.trim()).filter(Boolean)) : null,
        policies: policies ? JSON.stringify({ content: policies }) : null,
        durationDays: Number(durationDays),
        basePrice: Number(price.replace(/\D/g, "")),
        status: "ACTIVE", isHot, categoryId, transportationId,
        destinationIds: destinations.map(d => d.id),
        departures: schedules.map(s => ({
          tourId: 0,
          startDate: s.date + "T" + (s.pickupTime || "08:00") + ":00",
          endDate: s.endDate + "T23:59:00",
          maxSlots: Number(s.seats),
          pickupName: s.pickup, pickupAddress: s.pickupAddress || "",
          pickupTime: s.date + "T" + (s.pickupTime || "08:00") + ":00",
          status: "OPEN",
          priceConfig: {
            adultPrice: Number(s.adultPrice || 0), child1014Price: Number(s.child1014Price || 0),
            child49Price: Number(s.child49Price || 0), babyPrice: Number(s.babyPrice || 0),
          },
        })),
      };

      const imageFiles = images.filter(img => img.file).map(img => img.file);
      const created = await tourApi.createTour(payload, imageFiles);
      const tourId = created?.data?.id;
      if (!tourId) throw new Error("Không lấy được tourId sau khi tạo");

      toast.success("Tạo tour thành công!");
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.searches() });
      clearDraft();
      navigate("/tour");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Lưu thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFillAll = () => {
    // Tính ngày mẫu: khởi hành 15 ngày từ hôm nay, kết thúc +2 ngày
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 15);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2);
    const fmt = (d) => d.toISOString().slice(0, 10);

    setTitle("Tour Đà Lạt 3N2Đ - Thành Phố Ngàn Hoa");
    setDescription("Khám phá thành phố Đà Lạt mộng mơ với những đồi thông xanh mát, vườn hoa rực rỡ và không khí se lạnh dễ chịu. Tour được thiết kế để mang đến trải nghiệm trọn vẹn nhất cho du khách.");
    setDurationDays("3");
    setPrice("2990000");
    setOverview(JSONB_DEFAULTS.overview);
    setItinerary(JSONB_DEFAULTS.itinerary);
    setInclusions(JSONB_DEFAULTS.inclusions);
    setExclusions(JSONB_DEFAULTS.exclusions);
    setPolicies(JSONB_DEFAULTS.policies);
    setSchedules([{
      id: Date.now(),
      date: fmt(startDate),
      endDate: fmt(endDate),
      seats: 30,
      pickup: "Nhà hát Lớn Hà Nội",
      pickupAddress: "1 Tràng Tiền, Hoàn Kiếm, Hà Nội",
      pickupTime: "06:00",
      adultPrice: "2990000",
      child1014Price: "2200000",
      child49Price: "1500000",
      babyPrice: "0",
    }]);
    toast.info("Đã điền toàn bộ dữ liệu mẫu. Hãy chỉnh sửa cho phù hợp!");
  };

  const handleFillTemplate = () => {
    setOverview(JSONB_DEFAULTS.overview);
    setItinerary(JSONB_DEFAULTS.itinerary);
    setInclusions(JSONB_DEFAULTS.inclusions);
    setExclusions(JSONB_DEFAULTS.exclusions);
    setPolicies(JSONB_DEFAULTS.policies);
    setSchedules(SAMPLE_SCHEDULES());
    toast.info("Đã điền mẫu nội dung và lịch khởi hành. Hãy chỉnh sửa cho phù hợp.");
  };

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-2.5 backdrop-blur md:px-6">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-blue-700 cursor-pointer"
            >
              <FiArrowLeft className="h-4 w-4" /> Quay lại
            </button>
            <div>
              <h1 className="text-[22px] font-bold leading-7 text-blue-600 md:text-2xl">Thêm Tour Mới</h1>
              <p className="text-xs text-slate-400 md:text-sm">Điền đầy đủ thông tin bên dưới để tạo tour trong hệ thống quản lý.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start pt-0.5 lg:self-center lg:pt-0">
            <button
              onClick={handleFillAll}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 md:px-4 md:text-sm cursor-pointer"
            >
              <FiClipboard className="h-3.5 w-3.5" /> Điền mẫu
            </button>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-red-400 hover:text-white hover:border-red-200 md:px-4 md:text-sm cursor-pointer"
            >
              <FiX className="h-3.5 w-3.5" /> Hủy bỏ
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-400 md:px-5 md:py-2 md:text-sm cursor-pointer"
            >
              {isSaving
                ? <><FiLoader className="h-3.5 w-3.5 animate-spin" /> Đang lưu...</>
                : <><FiSave className="h-3.5 w-3.5" /> Lưu Tour</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-screen-xl px-6 py-5">
        <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
          <TourLeftPanel
            title={title} setTitle={setTitle}
            description={description} setDescription={setDescription}
            durationDays={durationDays} setDurationDays={setDurationDays}
            categoryId={categoryId} setCategoryId={setCategoryId}
            transportationId={transportationId} setTransportationId={setTransportationId}
            categories={categories} transportations={transportations}
            errors={errors} setErrors={setErrors}
            images={images} setImages={setImages}
            schedules={schedules}
            updateSchedule={updateSchedule}
            addSchedule={addSchedule}
            removeSchedule={removeSchedule}
          />
          <TourRightPanel
            price={price} setPrice={setPrice}
            isHot={isHot} setIsHot={setIsHot}
            destinations={destinations} setDestinations={setDestinations}
            allDestinations={allDestinations}
            overview={overview} setOverview={setOverview}
            itinerary={itinerary} setItinerary={setItinerary}
            inclusions={inclusions} setInclusions={setInclusions}
            exclusions={exclusions} setExclusions={setExclusions}
            policies={policies} setPolicies={setPolicies}
            errors={errors} setErrors={setErrors}
            onFillTemplate={handleFillTemplate}
          />
        </div>
      </div>

    </div>
  );
};
