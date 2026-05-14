import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as departureApi from "../departureApi";
import { TOUR_KEYS } from "./tourKeys";

export const useDeparturesQuery = (tourId) =>
  useQuery({
    queryKey: TOUR_KEYS.departures(tourId),
    queryFn: () => departureApi.getDepartures(tourId).then((response) => response.data?.content ?? []),
    enabled: !!tourId,
    staleTime: 1000 * 60 * 2,
  });

export const useCreateDepartureMutation = (tourId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => departureApi.createDeparture(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.departures(tourId) });
      toast.success("Thêm lịch khởi hành thành công");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Thêm lịch thất bại"),
  });
};

export const useUpdateDepartureMutation = (tourId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => departureApi.updateDeparture(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.departures(tourId) });
      toast.success("Cập nhật lịch thành công");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Cập nhật thất bại"),
  });
};

export const useDeleteDepartureMutation = (tourId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => departureApi.deleteDeparture(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.departures(tourId) });
      toast.success("Đã xóa lịch khởi hành");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Không thể xóa (đã có booking)"),
  });
};

export const useUpsertPriceConfigMutation = (departureId, tourId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => departureApi.upsertPriceConfig(departureId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.departures(tourId) });
      toast.success("Lưu cấu hình giá thành công");
    },
    onError: () => toast.error("Lưu giá thất bại"),
  });
};

export const usePricingRulesQuery = (departureId) =>
  useQuery({
    queryKey: TOUR_KEYS.pricingRules(departureId),
    queryFn: () => departureApi.getPricingRules(departureId).then((response) => response.data ?? []),
    enabled: !!departureId,
    staleTime: 1000 * 60 * 2,
  });

export const useCreatePricingRuleMutation = (departureId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => departureApi.createPricingRule(departureId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.pricingRules(departureId) });
      toast.success("Thêm rule thành công");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Thêm rule thất bại"),
  });
};

export const useUpdatePricingRuleMutation = (departureId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, payload }) => departureApi.updatePricingRule(ruleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.pricingRules(departureId) });
    },
    onError: () => toast.error("Cập nhật rule thất bại"),
  });
};

export const useDeletePricingRuleMutation = (departureId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId) => departureApi.deletePricingRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.pricingRules(departureId) });
      toast.success("Đã xóa rule");
    },
    onError: () => toast.error("Xóa rule thất bại"),
  });
};

export const useTogglePricingRuleMutation = (departureId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId) => departureApi.togglePricingRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.pricingRules(departureId) });
    },
    onError: () => toast.error("Toggle rule thất bại"),
  });
};

export const useCalculatePriceQuery = (departureId, params, enabled = false) =>
  useQuery({
    queryKey: ["calculate-price", departureId, params],
    queryFn: () => departureApi.calculatePrice(departureId, params).then((response) => response.data),
    enabled: enabled && !!departureId,
    staleTime: 0,
  });
