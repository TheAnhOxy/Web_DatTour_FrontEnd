import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as promotionApi from "../promotionApi";

export const PROMOTION_QUERY_KEY = ["promotions"];

export const usePromotionsQuery = (filters = {}) => {
  return useQuery({
    queryKey: [...PROMOTION_QUERY_KEY, filters],
    queryFn: () =>
      promotionApi.getAll(filters).then((response) => response.data ?? { content: [], totalElements: 0, totalPages: 0 }),
    staleTime: 1000 * 60 * 3,
    placeholderData: (previousData) => previousData,
  });
};

export const useValidatePromotionQuery = (code, enabled = false) => {
  return useQuery({
    queryKey: [...PROMOTION_QUERY_KEY, "validate", code],
    queryFn: () => promotionApi.validate(code).then((response) => response.data),
    enabled: enabled && Boolean(code),
    staleTime: 0,
  });
};

export const useCreatePromotionMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => promotionApi.create(payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: PROMOTION_QUERY_KEY });
      toast.success("Tạo khuyến mãi thành công!");
      options.onSuccess?.(...args);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Tạo khuyến mãi thất bại");
      options.onError?.(error);
    },
  });
};

export const useUpdatePromotionMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }) => promotionApi.update(id, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: PROMOTION_QUERY_KEY });
      toast.success("Cập nhật thành công!");
      options.onSuccess?.(...args);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Cập nhật thất bại");
      options.onError?.(error);
    },
  });
};

export const useDeletePromotionMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => promotionApi.remove(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: PROMOTION_QUERY_KEY });
      toast.success("Đã xóa khuyến mãi");
      options.onSuccess?.(...args);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Không thể xóa (đã có lượt dùng)");
      options.onError?.(error);
    },
  });
};

export const useTogglePromotionMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => promotionApi.toggle(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: PROMOTION_QUERY_KEY });
      toast.success("Đã đổi trạng thái");
      options.onSuccess?.(...args);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Thao tác thất bại");
      options.onError?.(error);
    },
  });
};