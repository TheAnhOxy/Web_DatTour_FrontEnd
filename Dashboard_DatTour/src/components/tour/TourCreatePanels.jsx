import React from "react";
import {
  FiMapPin, FiLayers, FiClock, FiImage,
  FiDollarSign, FiZap, FiFileText, FiCalendar, FiPlus,
  FiInfo,
} from "react-icons/fi";
import { FaPlane } from "react-icons/fa";
import SectionCard from "./SectionCard";
import FieldLabel from "./FieldLabel";
import ImageUploadSection from "./ImageUploadSection";
import DestinationPicker from "./DestinationPicker";
import DepartureRow from "./DepartureRow";
import { inputCls, formatPrice } from "../../utils/tourUtils";

const textareaCls =
  "w-full min-h-[110px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400";

/* ─────────────────────────────────────────
   Left Panel: Basic info + Images + Departures
───────────────────────────────────────── */
export const TourLeftPanel = ({
  // basic info
  title, setTitle,
  description, setDescription,
  durationDays, setDurationDays,
  categoryId, setCategoryId,
  transportationId, setTransportationId,
  categories, transportations,
  errors, setErrors,
  // images
  images, setImages,
  // departures
  schedules, updateSchedule, addSchedule, removeSchedule,
}) => (
  <div className="space-y-4">
    {/* Basic info */}
    <SectionCard title="Thông tin cơ bản" icon={<FiInfo />}>
      <div className="space-y-4">
        {/* Tour name */}
        <div>
          <FieldLabel required error={errors.title}>Tên Tour</FieldLabel>
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors(p => ({ ...p, title: "" })); }}
            placeholder="VD: Tour Hạ Long 3N2Đ - Khám phá vịnh biển huyền thoại"
            className={inputCls + (errors.title ? " border-red-400 bg-red-50" : "")}
          />
        </div>

        {/* Description */}
        <div>
          <FieldLabel required error={errors.description}>Mô tả chi tiết</FieldLabel>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors(p => ({ ...p, description: "" })); }}
            placeholder="Viết mô tả hành trình, các điểm tham quan, dịch vụ bao gồm..."
            className={"w-full min-h-[140px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400" + (errors.description ? " border-red-400 bg-red-50" : "")}
          />
        </div>

        {/* Duration + Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel required error={errors.durationDays}>
              <FiClock className="mr-1 inline h-3.5 w-3.5" />Số ngày
            </FieldLabel>
            <input
              type="number" min={1} value={durationDays}
              onChange={(e) => { setDurationDays(e.target.value); if (errors.durationDays) setErrors(p => ({ ...p, durationDays: "" })); }}
              placeholder="VD: 3"
              className={inputCls + (errors.durationDays ? " border-red-400 bg-red-50" : "")}
            />
          </div>
          <div>
            <FieldLabel required error={errors.categoryId}>
              <FiLayers className="mr-1 inline h-3.5 w-3.5" />Danh mục
            </FieldLabel>
            <select
              value={categoryId || ""}
              onChange={(e) => { setCategoryId(Number(e.target.value)); if (errors.categoryId) setErrors(p => ({ ...p, categoryId: "" })); }}
              className={inputCls + (errors.categoryId ? " border-red-400 bg-red-50" : "")}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
        </div>

        {/* Transportation */}
        <div>
          <FieldLabel required error={errors.transportationId}>
            <FaPlane className="mr-1 inline h-3.5 w-3.5" />Phương tiện
          </FieldLabel>
          <select
            value={transportationId || ""}
            onChange={(e) => { setTransportationId(Number(e.target.value)); if (errors.transportationId) setErrors(p => ({ ...p, transportationId: "" })); }}
            className={inputCls + (errors.transportationId ? " border-red-400 bg-red-50" : "")}
          >
            <option value="">-- Chọn phương tiện --</option>
            {transportations.map((trans) => <option key={trans.id} value={trans.id}>{trans.type || trans.name || `Phương tiện #${trans.id}`}</option>)}
          </select>
        </div>
      </div>
    </SectionCard>

    {/* Images */}
    <SectionCard title="Thư viện hình ảnh" icon={<FiImage />}>
      <ImageUploadSection images={images} setImages={setImages} />
    </SectionCard>

    {/* Departures */}
    <SectionCard title="Lịch khởi hành" icon={<FiCalendar />}>
      {errors.schedules && (
        <p className="mb-3 text-sm font-medium text-red-600">{errors.schedules}</p>
      )}
      <div className="space-y-3">
        {schedules.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 py-6 text-center text-sm text-slate-400">
            Chưa có lịch nào. Bấm "+ Thêm lịch" để tạo.
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
          <FiPlus className="h-4 w-4" />
          Thêm lịch khởi hành
        </button>
      </div>
    </SectionCard>
  </div>
);

/* ─────────────────────────────────────────
   Right Panel: Price, Destinations, Content, Tips
───────────────────────────────────────── */
export const TourRightPanel = ({
  price, setPrice,
  isHot, setIsHot,
  destinations, setDestinations,
  allDestinations,
  overview, setOverview,
  itinerary, setItinerary,
  inclusions, setInclusions,
  exclusions, setExclusions,
  policies, setPolicies,
  errors, setErrors,
  onFillTemplate,
}) => (
  <div className="space-y-4">
    {/* Price & Status */}
    <SectionCard title="Giá & trạng thái" icon={<FiDollarSign />}>
      <div className="space-y-4">
        <div>
          <div className={"flex items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100" + (errors.price ? " border-red-400 bg-red-50" : "")}>
            <input
              value={formatPrice(price)}
              onChange={(e) => { setPrice(e.target.value.replace(/\D/g, "")); if (errors.price) setErrors(p => ({ ...p, price: "" })); }}
              placeholder="0"
              className="h-11 flex-1 bg-transparent px-4 text-sm font-bold text-blue-600 outline-none"
            />
            <span className="pr-4 text-xs font-semibold text-slate-400">VND</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              <FiZap className="h-4 w-4 text-orange-500" />
              Tour nổi bật
            </p>
            <p className="text-xs text-slate-400">Hiển thị ưu tiên trên trang chủ</p>
          </div>
          <button
            onClick={() => setIsHot(v => !v)}
            className={`relative h-6 w-11 rounded-full transition-colors ${isHot ? "bg-blue-600" : "bg-slate-300"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${isHot ? "left-5" : "left-0.5"}`} />
          </button>
        </div>
      </div>
    </SectionCard>

    {/* Destinations */}
    <SectionCard title="Điểm đến" icon={<FiMapPin />}>
      <DestinationPicker selected={destinations} setSelected={setDestinations} allDestinations={allDestinations} />
    </SectionCard>

    {/* Detail content */}
    <SectionCard title="Nội dung chi tiết" icon={<FiFileText />}>
      <div className="space-y-3">
        <div>
          <FieldLabel>Tổng quan</FieldLabel>
          <textarea rows={5} value={overview} onChange={e => setOverview(e.target.value)} placeholder="Giới thiệu ngắn về tour" className={textareaCls} />
        </div>
        <div>
          <FieldLabel>Lịch trình</FieldLabel>
          <textarea rows={6} value={itinerary} onChange={e => setItinerary(e.target.value)} placeholder="Mô tả lịch trình theo ngày/chặng" className={textareaCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Dịch vụ bao gồm</FieldLabel>
            <textarea rows={5} value={inclusions} onChange={e => setInclusions(e.target.value)} placeholder="Các dịch vụ đã bao gồm trong giá" className={textareaCls} />
          </div>
          <div>
            <FieldLabel>Không bao gồm</FieldLabel>
            <textarea rows={5} value={exclusions} onChange={e => setExclusions(e.target.value)} placeholder="Các chi phí không bao gồm" className={textareaCls} />
          </div>
        </div>
        <div>
          <FieldLabel>Chính sách</FieldLabel>
          <textarea rows={5} value={policies} onChange={e => setPolicies(e.target.value)} placeholder="Điều khoản, chính sách hủy/đổi, lưu ý" className={textareaCls} />
        </div>
      </div>
    </SectionCard>

    {/* Tips */}
    <div className="rounded-2xl bg-[#071126] p-4 text-white">
      <h4 className="mb-2 flex items-center gap-2 font-bold">
        <FiInfo className="h-4 w-4 text-blue-400" />
        Mẹo tạo tour hiệu quả
      </h4>
      <ul className="space-y-1.5 text-xs leading-relaxed text-slate-300">
        <li className="flex items-start gap-1.5"><span className="mt-0.5 text-blue-400">•</span> Tên tour rõ ràng, bao gồm số ngày/đêm và điểm nổi bật</li>
        <li className="flex items-start gap-1.5"><span className="mt-0.5 text-blue-400">•</span> Ảnh bìa nên là ảnh phong cảnh đẹp nhất, tỉ lệ 16:9</li>
        <li className="flex items-start gap-1.5"><span className="mt-0.5 text-blue-400">•</span> Ít nhất 1 lịch khởi hành để tăng tỉ lệ đặt tour</li>
        <li className="flex items-start gap-1.5"><span className="mt-0.5 text-blue-400">•</span> Mô tả chi tiết dịch vụ bao gồm & không bao gồm</li>
        <li className="flex items-start gap-1.5"><span className="mt-0.5 text-blue-400">•</span> Cấu hình giá rõ ràng cho từng nhóm tuổi</li>
      </ul>
    </div>
  </div>
);
