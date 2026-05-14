import React from "react";
import { FiRefreshCw } from "react-icons/fi";
import { useDashboardSummaryQuery, useRefreshDashboardMutation } from "../api/hooks/statsHooks";
import { KpiCard } from "../components/dashboard/DashCommon";
import {
  ToursByCategoryChart, PromotionStatsPanel, WishlistRankingPanel,
  SlotOccupancyChart, DepartureStatusChart, TourStatusChart,
} from "../components/dashboard/StatsPanels";
import { UpcomingDeparturesPanel, NearlyFullPanel } from "../components/dashboard/DeparturePanels";

const fmtNum = (n) => (n != null ? Number(n).toLocaleString("vi-VN") : "—");

export function Dashboard() {
  const { data: summary, isLoading, isFetching } = useDashboardSummaryQuery();
  const refresh = useRefreshDashboardMutation();

  const tour  = summary?.tourStats ?? {};
  const promo = summary?.promotionStats ?? {};
  const wish  = summary?.wishlistStats ?? {};
  const upcoming   = summary?.upcomingDepartures ?? [];
  const nearlyFull = summary?.nearlyFullDepartures ?? [];
  const occupancyRate = Number(tour.occupancyRate ?? 0);
  const healthLabel = occupancyRate >= 90 ? "Rất cao" : occupancyRate >= 70 ? "Khá tải" : "Ổn định";

  const kpis = [
    { icon: "🗺️", label: "Tổng Tour",          value: fmtNum(tour.totalTours),        sub: `${tour.activeTours ?? 0} active · ${tour.hotTours ?? 0} hot 🔥`,           color: "blue"   },
    { icon: "🗓️", label: "Lịch Khởi Hành",     value: fmtNum(tour.totalDepartures),   sub: `${tour.openDepartures ?? 0} đang mở`,                                       color: "green"  },
    { icon: "💺", label: "Chỗ Đã Đặt",          value: fmtNum(tour.bookedSlots),       sub: `Còn ${fmtNum(tour.availableSlots)} · ${tour.occupancyRate ?? 0}%`,           color: "violet" },
    { icon: "🎫", label: "Khuyến Mãi Active",   value: fmtNum(promo.activePromotions), sub: `${promo.totalPromotions ?? 0} tổng · ${promo.fullyUsedPromotions ?? 0} hết`, color: "amber"  },
    { icon: "❤️", label: "Wishlist",            value: fmtNum(wish.totalWishlists),    sub: "Tổng lượt yêu thích",                                                       color: "rose"   },
    { icon: "⚠️", label: "Sắp Kín Chỗ",        value: nearlyFull.length,              sub: "Lịch ≥ 90% đặt chỗ",                                                        color: nearlyFull.length > 0 ? "rose" : "slate" },
  ];

  const lastUpdated = summary?.generatedAt
    ? new Date(summary.generatedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    : null;

  const quickInsights = [
    {
      label: "Tình trạng tổng thể",
      value: isLoading ? "Đang tải" : healthLabel,
      note: `${occupancyRate.toFixed(1)}% công suất đang dùng`,
      accent: occupancyRate >= 90 ? "from-rose-500 to-orange-500" : occupancyRate >= 70 ? "from-amber-500 to-yellow-500" : "from-blue-500 to-cyan-500",
    },
    {
      label: "Cảnh báo gần chạm",
      value: nearlyFull.length,
      note: nearlyFull.length > 0 ? "Nên kiểm tra các lịch sắp kín" : "Chưa có lịch quá tải",
      accent: nearlyFull.length > 0 ? "from-rose-500 to-pink-500" : "from-emerald-500 to-teal-500",
    },
    {
      label: "Đồng bộ dữ liệu",
      value: lastUpdated || "Chưa có",
      note: "Bấm làm mới nếu vừa cập nhật dữ liệu",
      accent: "from-violet-500 to-indigo-500",
    },
  ];

  return (
    <div className="relative space-y-6 pb-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_38%),radial-gradient(circle_at_left,_rgba(168,85,247,0.12),_transparent_28%),linear-gradient(to_bottom,_rgba(248,250,252,0.96),_rgba(248,250,252,0.65),transparent)]" />

      {/* ── Gradient header banner ── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 px-6 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-10 -top-8 h-52 w-52 rounded-full bg-blue-400/30 blur-3xl" />
          <div className="absolute -bottom-12 left-16 h-40 w-40 rounded-full bg-violet-400/25 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.38em] text-blue-200/80">
                Enterprise Tour Control Center
              </p>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Tổng quan vận hành tour
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                Theo dõi nhanh trạng thái tour, lịch khởi hành, chỗ đã đặt và cảnh báo sớm ở một màn hình gọn, rõ, có trọng tâm.
              </p>
            </div>
            <button
              onClick={() => refresh.mutate()}
              disabled={refresh.isPending || isFetching}
              className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/15 bg-white/12 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20 disabled:opacity-60"
            >
              <FiRefreshCw className={`h-4 w-4 ${(refresh.isPending || isFetching) ? "animate-spin" : ""}`} />
              Làm mới dữ liệu
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {quickInsights.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-md">
                <div className={`mb-3 h-1.5 w-16 rounded-full bg-gradient-to-r ${item.accent}`} />
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-300">{item.label}</p>
                <p className="mt-1 text-lg font-extrabold text-white">{item.value}</p>
                <p className="mt-1 text-[12px] leading-5 text-slate-300">{item.note}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">Dữ liệu cập nhật: {lastUpdated || "đang xử lý"}</span>
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">Tour nổi bật: {tour.hotTours ?? 0}</span>
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">Cảnh báo gần kín: {nearlyFull.length}</span>
          </div>
        </div>
      </div>

      {/* ── KPI grid ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => <KpiCard key={k.label} {...k} loading={isLoading} />)}
      </div>

      {/* ── 3 donut/pie charts row ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <SlotOccupancyChart  tourStats={tour} loading={isLoading} />
        <DepartureStatusChart tourStats={tour} loading={isLoading} />
        <TourStatusChart      tourStats={tour} loading={isLoading} />
      </div>

      {/* ── Main content 2+1 layout ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <ToursByCategoryChart toursByCategory={tour.toursByCategory} loading={isLoading} />
          <UpcomingDeparturesPanel departures={upcoming} loading={isLoading} />
        </div>
        <div className="space-y-5">
          <NearlyFullPanel      departures={nearlyFull} loading={isLoading} />
          <PromotionStatsPanel  stats={promo}           loading={isLoading} />
          <WishlistRankingPanel stats={wish}            loading={isLoading} />
        </div>
      </div>
    </div>
  );
}
