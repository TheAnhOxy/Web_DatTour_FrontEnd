import React, { useState } from "react";
import { FiCalendar, FiUsers, FiTrash2, FiMapPin, FiDollarSign, FiChevronDown } from "react-icons/fi";
import FieldLabel from "./FieldLabel";
import { inputCls } from "../../utils/tourUtils";

const DepartureRow = ({ schedule, onChange, onRemove }) => {
  const [showPrices, setShowPrices] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
        <div>
          <FieldLabel><FiCalendar className="inline-block mr-1.5 h-3.5 w-3.5" /> Ngày khởi hành</FieldLabel>
          <input type="date" value={schedule.date} onChange={(e) => onChange("date", e.target.value)} className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
        </div>
        <div>
          <FieldLabel><FiCalendar className="inline-block mr-1.5 h-3.5 w-3.5" /> Ngày kết thúc</FieldLabel>
          <input type="date" value={schedule.endDate} onChange={(e) => onChange("endDate", e.target.value)} className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
        </div>
        <div>
          <FieldLabel>Giờ đón (HH:mm)</FieldLabel>
          <input type="time" value={schedule.pickupTime} onChange={(e) => onChange("pickupTime", e.target.value)} className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
        </div>
        <div>
          <FieldLabel><FiUsers className="inline-block mr-1.5 h-3.5 w-3.5" /> Số chỗ</FieldLabel>
          <input type="number" min={1} value={schedule.seats} onChange={(e) => onChange("seats", e.target.value)} className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div>
          <FieldLabel><FiMapPin className="inline-block mr-1.5 h-3.5 w-3.5 text-rose-400" /> Điểm đón</FieldLabel>
          <input value={schedule.pickup} onChange={(e) => onChange("pickup", e.target.value)} placeholder="VD: Nhà hát Lớn HN" className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 placeholder:text-slate-400" />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel><FiMapPin className="inline-block mr-1.5 h-3.5 w-3.5 text-rose-400" /> Địa chỉ chi tiết</FieldLabel>
          <input value={schedule.pickupAddress} onChange={(e) => onChange("pickupAddress", e.target.value)} placeholder="VD: 1 Tràng Tiền, Hà Nội" className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 placeholder:text-slate-400" />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => setShowPrices(!showPrices)}
          className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-600"
        >
          <span className="flex items-center gap-1.5">
            <FiDollarSign className="h-4 w-4 text-emerald-500" />
            Cấu hình giá
          </span>
          <FiChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showPrices ? "rotate-180" : ""}`} />
        </button>

        {showPrices && (
          <div className="border-t border-slate-100 p-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <FieldLabel>Người lớn (VND)</FieldLabel>
              <input type="number" min={0} value={schedule.adultPrice} onChange={(e) => onChange("adultPrice", e.target.value)} placeholder="0" className={inputCls} />
            </div>
            <div>
              <FieldLabel>Trẻ 10-14 (VND)</FieldLabel>
              <input type="number" min={0} value={schedule.child1014Price} onChange={(e) => onChange("child1014Price", e.target.value)} placeholder="0" className={inputCls} />
            </div>
            <div>
              <FieldLabel>Trẻ 4-9 (VND)</FieldLabel>
              <input type="number" min={0} value={schedule.child49Price} onChange={(e) => onChange("child49Price", e.target.value)} placeholder="0" className={inputCls} />
            </div>
            <div>
              <FieldLabel>Em bé &lt;4 (VND)</FieldLabel>
              <input type="number" min={0} value={schedule.babyPrice} onChange={(e) => onChange("babyPrice", e.target.value)} placeholder="0" className={inputCls} />
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
      >
        <FiTrash2 className="h-3.5 w-3.5" /> Xóa lịch này
      </button>
    </div>
  );
};

export default DepartureRow;
