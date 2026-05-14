import React from "react";
import { FiLoader } from "react-icons/fi";

// ── KPI Card với gradient ─────────────────────────────────────────────────────
const CARD_THEMES = {
  blue:   { grad: "from-blue-600 to-blue-400",   light: "bg-blue-50",   border: "border-blue-100",  text: "text-blue-600",  iconBg: "bg-blue-100",  shadow: "shadow-blue-100" },
  green:  { grad: "from-emerald-600 to-emerald-400", light: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-600", iconBg: "bg-emerald-100", shadow: "shadow-emerald-100" },
  violet: { grad: "from-violet-600 to-violet-400", light: "bg-violet-50", border: "border-violet-100", text: "text-violet-600", iconBg: "bg-violet-100", shadow: "shadow-violet-100" },
  amber:  { grad: "from-amber-500 to-amber-300",  light: "bg-amber-50",  border: "border-amber-100",  text: "text-amber-600",  iconBg: "bg-amber-100",  shadow: "shadow-amber-100" },
  rose:   { grad: "from-rose-600 to-rose-400",    light: "bg-rose-50",   border: "border-rose-100",   text: "text-rose-600",   iconBg: "bg-rose-100",   shadow: "shadow-rose-100" },
  slate:  { grad: "from-slate-600 to-slate-400",  light: "bg-slate-50",  border: "border-slate-200",  text: "text-slate-600",  iconBg: "bg-slate-100",  shadow: "shadow-slate-100" },
};

export const KpiCard = ({ icon, label, value, sub, color = "blue", loading }) => {
  const t = CARD_THEMES[color] ?? CARD_THEMES.blue;
  return (
    <div className={`relative overflow-hidden rounded-2xl border ${t.border} ${t.light} p-5 shadow-sm ${t.shadow}`}>
      {/* Decorative blurred circle */}
      <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${t.grad} opacity-10`} />
      <div className="relative">
        <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${t.iconBg} text-xl`}>
          {icon}
        </div>
        <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        {loading ? (
          <FiLoader className={`animate-spin h-7 w-7 ${t.text}`} />
        ) : (
          <p className={`text-3xl font-black ${t.text} leading-none`}>{value ?? "—"}</p>
        )}
        {sub && <p className="mt-1.5 text-[11px] text-slate-400 leading-tight">{sub}</p>}
      </div>
    </div>
  );
};

// ── Section card ──────────────────────────────────────────────────────────────
export const DashSection = ({ title, subtitle, children, action, accent }) => (
  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
    <div className={`flex items-center justify-between px-5 py-4 ${accent ? `bg-gradient-to-r ${accent} text-white` : "border-b border-slate-100 bg-white"}`}>
      <div>
        <h3 className={`text-sm font-extrabold ${accent ? "text-white" : "text-slate-800"}`}>{title}</h3>
        {subtitle && <p className={`text-[11px] mt-0.5 ${accent ? "text-white/70" : "text-slate-400"}`}>{subtitle}</p>}
      </div>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ── Skeleton ──────────────────────────────────────────────────────────────────
export const Skeleton = ({ className = "h-6 w-full" }) => (
  <div className={`animate-pulse rounded-xl bg-slate-100 ${className}`} />
);

// ── Occupancy bar ─────────────────────────────────────────────────────────────
export const OccupancyBar = ({ rate = 0, booked = 0, max = 0 }) => {
  const pct = Math.min(100, Math.max(0, rate));
  const color = pct >= 90 ? "from-rose-500 to-rose-400" : pct >= 70 ? "from-amber-400 to-amber-300" : "from-blue-500 to-blue-400";
  return (
    <div className="space-y-1">
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all`} style={{ width: `${Math.max(3, pct)}%` }} />
      </div>
      <p className="text-[10px] font-semibold text-slate-400">{booked}/{max} · {pct.toFixed(1)}%</p>
    </div>
  );
};

// ── Status badge ──────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const map = {
    OPEN:   "bg-emerald-100 text-emerald-700 border border-emerald-200",
    CLOSED: "bg-rose-100 text-rose-700 border border-rose-200",
    FULL:   "bg-amber-100 text-amber-700 border border-amber-200",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-wide ${map[status] ?? "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
};
