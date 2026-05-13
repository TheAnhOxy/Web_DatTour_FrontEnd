import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as tourApi from "../tourApi";

export const TOUR_KEYS = {
  lists: () => ["tours", "list"],
  list: (filters) => ["tours", "list", filters],
  categories: ["tours", "categories"],
};

export const useTourListQuery = (filters) =>
  useQuery({
    queryKey: TOUR_KEYS.list(filters),
    queryFn: () =>
      tourApi.getToursAdmin(filters).then((r) => r.data ?? { content: [], totalElements: 0, totalPages: 0 }),
    staleTime: 1000 * 60 * 3,
    keepPreviousData: true,
  });

export const useTourCategoriesQuery = () =>
  useQuery({
    queryKey: TOUR_KEYS.categories,
    queryFn: () => tourApi.getCategories().then((r) => r.data ?? []),
    staleTime: 1000 * 60 * 10,
  });

export const useDeleteTourMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => tourApi.deleteTour(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.lists() });
      toast.success("Đã xóa tour");
      options.onSuccess?.(...args);
    },
    onError: () => toast.error("Xóa tour thất bại"),
  });
};

export const useToggleHotMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => tourApi.toggleHot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.lists() });
      toast.success("Cập nhật trạng thái hot thành công");
    },
    onError: () => toast.error("Thao tác thất bại"),
  });
};
