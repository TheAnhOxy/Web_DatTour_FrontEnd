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

  return (
    <div className="space-y-6 pb-10">
      {/* ── Gradient header banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-700 via-blue-700 to-violet-700 px-6 py-5 shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white" />
          <div className="absolute -bottom-10 left-20 h-32 w-32 rounded-full bg-white" />
        </div>
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">📈 Dashboard</h1>
            <p className="text-sm text-indigo-200 mt-0.5">
              {lastUpdated ? `Dữ liệu cập nhật lúc ${lastUpdated}` : "Đang tải dữ liệu..."}
            </p>
          </div>
          <button
            onClick={() => refresh.mutate()}
            disabled={refresh.isPending || isFetching}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-white/15 border border-white/25 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/25 disabled:opacity-60 transition backdrop-blur-sm"
          >
            <FiRefreshCw className={`h-4 w-4 ${(refresh.isPending || isFetching) ? "animate-spin" : ""}`} />
            Làm mới
          </button>
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
