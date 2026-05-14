import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../utils/toast";
import * as tourApi from "../tourApi";
import * as categoryApi from "../categoryApi";
import * as destinationApi from "../destinationApi";
import { TOUR_KEYS } from "./tourKeys";

export { TOUR_KEYS };

export const useCategoriesQuery = () =>
  useQuery({
    queryKey: TOUR_KEYS.categories,
    queryFn: () => categoryApi.getAll().then((response) => response.data ?? []),
    staleTime: 1000 * 60 * 10,
  });

export const useTourCategoriesQuery = useCategoriesQuery;

export const useAllDestinationsQuery = () =>
  useQuery({
    queryKey: TOUR_KEYS.destinations,
    queryFn: () => destinationApi.getAll().then((response) => response.data?.content ?? response.data ?? []),
    staleTime: 1000 * 60 * 10,
  });

export const useSearchDestinationsQuery = (keyword = "") =>
  useQuery({
    queryKey: ["destinations", "search", keyword],
    queryFn: () =>
      destinationApi.search(keyword, 0, 20).then((r) => r.data?.content ?? r.data ?? []),
    enabled: keyword.trim().length >= 1,
    staleTime: 500,
    keepPreviousData: true,
  });

export const useTourListQuery = (filters) =>
  useQuery({
    queryKey: TOUR_KEYS.list(filters),
    queryFn: () =>
      tourApi
        .getToursAdmin(filters)
        .then((response) => response.data ?? { content: [], totalElements: 0, totalPages: 0 }),
    staleTime: 1000 * 60 * 3,
    keepPreviousData: true,
  });

export const useSearchToursQuery = (filters) =>
  useQuery({
    queryKey: TOUR_KEYS.search(filters),
    queryFn: () =>
      tourApi
        .searchToursAdmin(filters)
        .then((response) => response.data ?? { content: [], totalElements: 0, totalPages: 0 }),
    staleTime: 1000 * 60 * 2,
    keepPreviousData: true,
    enabled: !!filters.keyword,
  });

export const useTourDetailQuery = (id) =>
  useQuery({
    queryKey: TOUR_KEYS.detail(id),
    queryFn: () => tourApi.getTourById(id).then((response) => response.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

export const useCreateTourMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, imageFiles }) => tourApi.createTour(payload, imageFiles),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.searches() });
      toast.success("Tạo tour thành công!");
      options.onSuccess?.(...args);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Tạo tour thất bại");
      options.onError?.(error);
    },
  });
};

export const useUpdateTourMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => tourApi.updateTour(id, payload),
    onSuccess: (_, { id }, ...rest) => {
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.searches() });
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.detail(id) });
      toast.success("Cập nhật tour thành công!");
      options.onSuccess?.(_, { id }, ...rest);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Cập nhật thất bại");
      options.onError?.(error);
    },
  });
};

export const useDeleteTourMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => tourApi.deleteTour(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.searches() });
      toast.success("Đã xóa tour");
      options.onSuccess?.(...args);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Xóa tour thất bại");
      options.onError?.(error);
    },
  });
};

export const useToggleHotMutation = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => tourApi.toggleHot(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.searches() });
      toast.success("Cập nhật trạng thái hot thành công");
      options.onSuccess?.(...args);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Thao tác thất bại");
      options.onError?.(error);
    },
  });
};

