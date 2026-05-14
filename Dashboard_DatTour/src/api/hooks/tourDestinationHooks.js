import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import tourDestinationApi from "../tourDestinationApi";
import { TOUR_KEYS } from "./tourKeys";

export const useAddDestinationMutation = (tourId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (destinationId) => tourDestinationApi.addDestination(tourId, destinationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.detail(tourId) });
      toast.success("Đã thêm điểm đến");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Thêm điểm đến thất bại"),
  });
};

export const useRemoveDestinationMutation = (tourId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (destinationId) => tourDestinationApi.removeDestination(tourId, destinationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.detail(tourId) });
      toast.success("Đã xóa điểm đến");
    },
    onError: () => toast.error("Xóa điểm đến thất bại"),
  });
};
