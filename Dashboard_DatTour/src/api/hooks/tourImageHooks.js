import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as tourImageApi from "../tourImageApi";
import { TOUR_KEYS } from "./tourKeys";

export const useTourImagesQuery = (tourId) =>
  useQuery({
    queryKey: TOUR_KEYS.images(tourId),
    queryFn: () => tourImageApi.getTourImages(tourId).then((response) => response.data ?? []),
    enabled: !!tourId,
    staleTime: 1000 * 60 * 2,
  });

export const useAddImageMutation = (tourId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => tourImageApi.addTourImage(tourId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.images(tourId) });
      toast.success("Thêm ảnh thành công");
    },
    onError: () => toast.error("Thêm ảnh thất bại"),
  });
};

export const useUploadImageMutation = (tourId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file) => tourImageApi.uploadTourImage(tourId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.images(tourId) });
      toast.success("Upload ảnh thành công");
    },
    onError: () => toast.error("Upload ảnh thất bại"),
  });
};

export const useDeleteImageMutation = (tourId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId) => tourImageApi.deleteTourImage(tourId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.images(tourId) });
      toast.success("Đã xóa ảnh");
    },
    onError: () => toast.error("Xóa ảnh thất bại"),
  });
};

export const useSetCoverImageMutation = (tourId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId) => tourImageApi.setCoverImage(tourId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOUR_KEYS.images(tourId) });
      toast.success("Đã đặt ảnh bìa");
    },
    onError: () => toast.error("Thao tác thất bại"),
  });
};
