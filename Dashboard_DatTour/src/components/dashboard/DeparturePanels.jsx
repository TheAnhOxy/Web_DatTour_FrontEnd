import React from "react";
import { DashSection, OccupancyBar, StatusBadge, Skeleton } from "./DashCommon";

const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt) ? "—" : `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${dt.getFullYear()}`;
};

// ── Upcoming Departures ───────────────────────────────────────────────────────
export const UpcomingDeparturesPanel = ({ departures = [], loading }) => (
  <DashSection title="🗓️ Lịch khởi hành sắp tới" subtitle="5 chuyến gần nhất">
    {loading ? (
      <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
    ) : departures.length === 0 ? (
      <p className="py-8 text-center text-sm text-slate-400">Không có lịch nào sắp tới</p>
    ) : (
      <div className="divide-y divide-slate-100">
        {departures.map((dep, idx) => (
          <div key={dep.departureId} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
            <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-black text-sm">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-bold text-slate-800">{dep.tourTitle}</p>
              <p className="text-[11px] font-semibold text-slate-400">{fmtDate(dep.startDate)} → {fmtDate(dep.endDate)}</p>
            </div>
            <div className="shrink-0 w-32">
              <OccupancyBar rate={dep.occupancyRate} booked={dep.bookedSlots} max={dep.maxSlots} />
            </div>
            <StatusBadge status={dep.status} />
          </div>
        ))}
      </div>
    )}
  </DashSection>
);

// ── Nearly Full ───────────────────────────────────────────────────────────────
export const NearlyFullPanel = ({ departures = [], loading }) => (
  <DashSection title="⚠️ Sắp kín chỗ" subtitle="Tỷ lệ đặt ≥ 90%">
    {loading ? (
      <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
    ) : departures.length === 0 ? (
      <div className="py-8 text-center">
        <p className="text-2xl mb-1">✅</p>
        <p className="text-sm font-semibold text-slate-400">Chưa có lịch sắp kín</p>
      </div>
    ) : (
      <div className="space-y-2.5">
        {departures.map((dep) => {
          const pct = dep.occupancyRate ?? 0;
          const urgent = pct >= 95;
          return (
            <div key={dep.departureId} className={`rounded-xl border px-4 py-3 ${urgent ? "border-rose-200 bg-rose-50" : "border-amber-200 bg-amber-50"}`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-sm font-bold text-slate-800 truncate flex-1">{dep.tourTitle}</p>
                <span className={`shrink-0 text-sm font-black ${urgent ? "text-rose-600" : "text-amber-600"}`}>{pct}%</span>
              </div>
              <OccupancyBar rate={pct} booked={dep.bookedSlots} max={dep.maxSlots} />
              <p className="mt-1.5 text-[10px] font-semibold text-slate-400">{fmtDate(dep.startDate)}</p>
            </div>
          );
        })}
      </div>
    )}
  </DashSection>
);
