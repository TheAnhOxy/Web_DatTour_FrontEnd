import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as categoryApi from "../categoryApi";

export const CATEGORY_QUERY_KEY = ["categories"];

export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEY,
    queryFn: () => categoryApi.getAll().then((response) => response.data ?? []),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateCategoryMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name }) => categoryApi.create({ name }),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY });
      toast.success("Thêm danh mục thành công!");
      options.onSuccess?.(...args);
    },
    onError: (...args) => {
      toast.error("Thêm danh mục thất bại");
      options.onError?.(...args);
    },
  });
};

export const useUpdateCategoryMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }) => categoryApi.update(id, { name }),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY });
      toast.success("Cập nhật danh mục thành công!");
      options.onSuccess?.(...args);
    },
    onError: (...args) => {
      toast.error("Cập nhật thất bại");
      options.onError?.(...args);
    },
  });
};

export const useDeleteCategoryMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => categoryApi.remove(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY });
      toast.success("Đã xóa danh mục");
      options.onSuccess?.(...args);
    },
    onError: (...args) => {
      toast.error("Xóa thất bại");
      options.onError?.(...args);
    },
  });
};
