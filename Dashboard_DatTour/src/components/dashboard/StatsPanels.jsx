import React from "react";
import { DashSection, Skeleton } from "./DashCommon";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";

const RICH_COLORS = ["#6366f1","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6"];

const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null;
  const R = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.56;
  const x = cx + r * Math.cos(-midAngle * R);
  const y = cy + r * Math.sin(-midAngle * R);
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={800}>{`${(percent * 100).toFixed(0)}%`}</text>;
};

// ── Tours by category bar chart ───────────────────────────────────────────────
export const ToursByCategoryChart = ({ toursByCategory = {}, loading }) => {
  const data = Object.entries(toursByCategory).map(([name, value]) => ({ name, value }));
  return (
    <DashSection title="📊 Tour theo danh mục" subtitle="Phân bổ tour theo từng danh mục">
      {loading ? <Skeleton className="h-52 w-full" /> : data.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
      ) : (
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 4 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.12)", fontSize: 12 }}
              formatter={(v) => [v, "Tour"]}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={56}>
              {data.map((_, i) => <Cell key={i} fill={RICH_COLORS[i % RICH_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </DashSection>
  );
};

// ── Slot occupancy donut ──────────────────────────────────────────────────────
export const SlotOccupancyChart = ({ tourStats = {}, loading }) => {
  const booked = tourStats.bookedSlots ?? 0;
  const available = tourStats.availableSlots ?? 0;
  const rate = tourStats.occupancyRate ?? 0;
  const data = [
    { name: "Đã đặt", value: booked, fill: "#6366f1" },
    { name: "Còn lại", value: available, fill: "#e0e7ff" },
  ];
  const validData = booked + available > 0;
  const rateColor = rate >= 90 ? "#ef4444" : rate >= 70 ? "#f59e0b" : "#6366f1";
  return (
    <DashSection title="💺 Tỷ lệ lấp đầy" subtitle="Lịch đang OPEN">
      {loading ? <Skeleton className="h-64 w-full" /> : !validData ? (
        <p className="py-10 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative w-full" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={62} outerRadius={88} paddingAngle={3} startAngle={90} endAngle={-270}>
                  {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-4xl font-black leading-none" style={{ color: rateColor }}>{rate}%</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">Lấp đầy</p>
            </div>
          </div>
          <div className="flex gap-5 mt-2 text-xs">
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-indigo-500"/><span className="text-slate-600 font-semibold">Đặt: <b className="text-indigo-600">{Number(booked).toLocaleString("vi-VN")}</b></span></div>
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-indigo-100"/><span className="text-slate-600 font-semibold">Còn: <b className="text-slate-500">{Number(available).toLocaleString("vi-VN")}</b></span></div>
          </div>
        </div>
      )}
    </DashSection>
  );
};

// ── Departure status pie ──────────────────────────────────────────────────────
export const DepartureStatusChart = ({ tourStats = {}, loading }) => {
  const open = tourStats.openDepartures ?? 0;
  const total = tourStats.totalDepartures ?? 0;
  const closed = total - open;
  const data = [
    { name: "OPEN", value: open, fill: "#10b981" },
    { name: "CLOSED", value: closed, fill: "#f43f5e" },
  ].filter(d => d.value > 0);
  return (
    <DashSection title="🗓️ Trạng thái lịch" subtitle={`Tổng ${total} lịch khởi hành`}>
      {loading ? <Skeleton className="h-64 w-full" /> : total === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">Chưa có lịch</p>
      ) : (
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={88} paddingAngle={4} labelLine={false} label={PieLabel}>
                {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex gap-5 mt-2 text-xs">
            {data.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ background: d.fill }} />
                <span className="font-semibold text-slate-600">{d.name}: <b style={{ color: d.fill }}>{d.value}</b></span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashSection>
  );
};

// ── Tour status pie ───────────────────────────────────────────────────────────
export const TourStatusChart = ({ tourStats = {}, loading }) => {
  const data = [
    { name: "Active", value: tourStats.activeTours ?? 0, fill: "#6366f1" },
    { name: "Inactive", value: tourStats.inactiveTours ?? 0, fill: "#94a3b8" },
    { name: "Hot 🔥", value: tourStats.hotTours ?? 0, fill: "#f59e0b" },
  ].filter(d => d.value > 0);
  const total = tourStats.totalTours ?? 0;
  return (
    <DashSection title="🗺️ Trạng thái Tour" subtitle={`Tổng ${total} tour`}>
      {loading ? <Skeleton className="h-64 w-full" /> : !data.length ? (
        <p className="py-10 text-center text-sm text-slate-400">Chưa có tour</p>
      ) : (
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={88} paddingAngle={4} labelLine={false} label={PieLabel}>
                {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs flex-wrap justify-center">
            {data.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ background: d.fill }} />
                <span className="font-semibold text-slate-600">{d.name}: <b style={{ color: d.fill }}>{d.value}</b></span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashSection>
  );
};

// ── Promotion stats ───────────────────────────────────────────────────────────
export const PromotionStatsPanel = ({ stats = {}, loading }) => (
  <DashSection title="🎫 Khuyến mãi" subtitle="Tổng quan mã giảm giá">
    {loading ? <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}</div> : (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {[
            ["Tổng", stats.totalPromotions, "#6366f1", "bg-indigo-50"],
            ["Active", stats.activePromotions, "#10b981", "bg-emerald-50"],
            ["Hết hạn", stats.expiredPromotions, "#f43f5e", "bg-rose-50"],
            ["Hết lượt", stats.fullyUsedPromotions, "#f59e0b", "bg-amber-50"],
          ].map(([label, val, color, bg]) => (
            <div key={label} className={`rounded-xl ${bg} px-3 py-2.5 text-center`}>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">{label}</p>
              <p className="text-2xl font-black mt-0.5" style={{ color }}>{val ?? 0}</p>
            </div>
          ))}
        </div>
        {stats.topUsed?.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">Top sử dụng</p>
            <div className="space-y-2">
              {stats.topUsed.map((p) => (
                <div key={p.code} className="flex items-center gap-2.5">
                  <span className="shrink-0 font-mono text-[11px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-0.5">{p.code}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400" style={{ width: `${Math.min(100, p.usageRate)}%` }} />
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold text-slate-500">{p.usedCount}/{p.usageLimit}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
  </DashSection>
);

// ── Wishlist ranking ──────────────────────────────────────────────────────────
const MEDAL = ["bg-amber-400","bg-slate-400","bg-orange-500"];
export const WishlistRankingPanel = ({ stats = {}, loading }) => (
  <DashSection title="❤️ Wishlist" subtitle={`Tổng ${stats.totalWishlists ?? 0} lượt yêu thích`}>
    {loading ? <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}</div>
    : !stats.mostWishlisted?.length ? (
      <p className="py-8 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
    ) : (
      <div className="space-y-2">
        {stats.mostWishlisted.map((item, idx) => (
          <div key={item.tourId} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${idx < 3 ? "bg-gradient-to-r from-slate-50 to-white border border-slate-100" : ""}`}>
            <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white ${MEDAL[idx] ?? "bg-slate-100"} ${idx >= 3 ? "!bg-slate-100 !text-slate-400" : ""}`}>
              {idx + 1}
            </span>
            {item.coverImageUrl && <img src={item.coverImageUrl} alt={item.tourTitle} className="shrink-0 h-9 w-14 rounded-lg object-cover border border-slate-200 shadow-sm" />}
            <p className="flex-1 min-w-0 truncate text-xs font-semibold text-slate-700">{item.tourTitle}</p>
            <span className="shrink-0 text-xs font-black text-rose-500">♥ {item.wishlistCount}</span>
          </div>
        ))}
      </div>
    )}
  </DashSection>
);
