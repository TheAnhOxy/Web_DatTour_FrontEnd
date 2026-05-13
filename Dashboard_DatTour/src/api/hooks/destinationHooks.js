import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as destinationApi from "../destinationApi";

export const DESTINATION_QUERY_KEY = ["destinations"];

export const useDestinationsQuery = () => {
  return useQuery({
    queryKey: DESTINATION_QUERY_KEY,
    queryFn: () => destinationApi.getAll().then((response) => response.data?.content ?? response.data ?? []),
    staleTime: 1000 * 60 * 5,
  });
};

export const useSearchDestinationsQuery = (keyword = "", page = 0, enabled = true) => {
  return useQuery({
    queryKey: ["destinations-search", keyword, page],
    queryFn: () => 
      destinationApi.search(keyword, page, 6).then((response) => {
        const data = response.data;
        return {
          content: data?.content ?? data?.data ?? [],
          totalElements: data?.totalElements ?? 0,
          totalPages: data?.totalPages ?? 1,
          currentPage: data?.pageable?.pageNumber ?? page,
          pageSize: data?.pageable?.pageSize ?? 6,
        };
      }),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

export const useCreateDestinationMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => destinationApi.create(payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: DESTINATION_QUERY_KEY });
      toast.success("Thêm điểm đến thành công!");
      options.onSuccess?.(...args);
    },
    onError: (...args) => {
      toast.error("Thêm điểm đến thất bại");
      options.onError?.(...args);
    },
  });
};

export const useUpdateDestinationMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }) => destinationApi.update(id, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: DESTINATION_QUERY_KEY });
      toast.success("Cập nhật điểm đến thành công!");
      options.onSuccess?.(...args);
    },
    onError: (...args) => {
      toast.error("Cập nhật thất bại");
      options.onError?.(...args);
    },
  });
};

export const useDeleteDestinationMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => destinationApi.remove(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: DESTINATION_QUERY_KEY });
      toast.success("Đã xóa điểm đến");
      options.onSuccess?.(...args);
    },
    onError: (...args) => {
      toast.error("Xóa thất bại");
      options.onError?.(...args);
    },
  });
};