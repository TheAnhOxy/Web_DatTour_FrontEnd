import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../utils/toast";
import statsApi from "../statsApi";

export const STATS_KEYS = {
  dashboard: ["stats", "dashboard"],
  tours: ["stats", "tours"],
  promotions: ["stats", "promotions"],
  wishlists: ["stats", "wishlists"],
  upcoming: (limit) => ["stats", "departures", "upcoming", limit],
  nearlyFull: ["stats", "departures", "nearly-full"],
};

export const useDashboardSummaryQuery = () =>
  useQuery({
    queryKey: STATS_KEYS.dashboard,
    queryFn: () => statsApi.getDashboardSummary().then((r) => r.data ?? {}),
    staleTime: 1000 * 60 * 3,
    retry: 2,
  });

export const useTourStatsQuery = () =>
  useQuery({
    queryKey: STATS_KEYS.tours,
    queryFn: () => statsApi.getTourStats().then((r) => r.data ?? {}),
    staleTime: 1000 * 60 * 3,
  });

export const usePromotionStatsQuery = () =>
  useQuery({
    queryKey: STATS_KEYS.promotions,
    queryFn: () => statsApi.getPromotionStats().then((r) => r.data ?? {}),
    staleTime: 1000 * 60 * 3,
  });

export const useWishlistStatsQuery = () =>
  useQuery({
    queryKey: STATS_KEYS.wishlists,
    queryFn: () => statsApi.getWishlistStats().then((r) => r.data ?? {}),
    staleTime: 1000 * 60 * 3,
  });

export const useUpcomingDeparturesQuery = (limit = 5) =>
  useQuery({
    queryKey: STATS_KEYS.upcoming(limit),
    queryFn: () => statsApi.getUpcomingDepartures(limit).then((r) => r.data ?? []),
    staleTime: 1000 * 60 * 2,
  });

export const useNearlyFullDeparturesQuery = () =>
  useQuery({
    queryKey: STATS_KEYS.nearlyFull,
    queryFn: () => statsApi.getNearlyFullDepartures().then((r) => r.data ?? []),
    staleTime: 1000 * 60 * 2,
  });

export const useRefreshDashboardMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => statsApi.refreshDashboard(),
    onSuccess: () => {
      Object.values(STATS_KEYS).forEach((key) => {
        const k = typeof key === "function" ? key(5) : key;
        queryClient.invalidateQueries({ queryKey: k });
      });
      toast.success("Dashboard đã được làm mới");
    },
    onError: () => toast.error("Làm mới thất bại"),
  });
};
