import React, { useRef, useState } from "react";
import { FiUploadCloud, FiTrash2, FiImage, FiStar } from "react-icons/fi";
import {
  useTourImagesQuery,
  useUploadImageMutation,
  useAddImageMutation,
  useDeleteImageMutation,
  useSetCoverImageMutation,
} from "../../api/hooks/tourImageHooks";

const TourImageSection = ({ tourId }) => {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const { data: images = [], isLoading } = useTourImagesQuery(tourId);
  const uploadMut = useUploadImageMutation(tourId);
  const addImageMut = useAddImageMutation(tourId);
  const deleteMut = useDeleteImageMutation(tourId);
  const setCoverMut = useSetCoverImageMutation(tourId);

  const coverImage = images.find((img) => img.isCover) ?? images[0];
  const activeImage = images[selectedIdx] ?? coverImage;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // B1: Upload file lên S3, nhận imageUrl thật
      const result = await uploadMut.mutateAsync(file);
      const imageUrl = result?.data?.imageUrl ?? result?.imageUrl;
      if (!imageUrl || imageUrl.startsWith("blob:")) {
        throw new Error("Backend trả URL không hợp lệ");
      }
      // B2: Lưu imageUrl thật vào DB
      const isCover = images.length === 0;
      await addImageMut.mutateAsync({
        imageUrl,
        isCover,
        sortOrder: images.length + 1,
      });
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 w-full rounded-lg bg-slate-200" />
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 rounded-lg bg-slate-200" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Main preview */}
      <div className="relative mb-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        {activeImage ? (
          <img src={activeImage.imageUrl} alt="tour" className="h-64 w-full object-cover" />
        ) : (
          <div className="flex h-64 items-center justify-center">
            <FiImage className="h-12 w-12 text-slate-300" />
          </div>
        )}
        {activeImage?.isCover && (
          <span className="absolute left-3 top-3 rounded bg-blue-700 px-2 py-1 text-[10px] font-semibold text-white">
            ẢNH BÌA
          </span>
        )}
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {images.map((img, idx) => (
          <div
            key={img.id}
            onClick={() => setSelectedIdx(idx)}
            className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition ${
              selectedIdx === idx ? "border-blue-500" : "border-slate-200"
            }`}
          >
            <img src={img.imageUrl} alt="" className="h-16 w-full object-cover" />
            {/* Overlay actions */}
            <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition group-hover:opacity-100">
              {!img.isCover && (
                <button
                  onClick={(e) => { e.stopPropagation(); setCoverMut.mutate(img.id); }}
                  title="Đặt làm ảnh bìa"
                  className="rounded-full bg-white p-1.5 text-yellow-500 hover:bg-yellow-50"
                >
                  <FiStar className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Xóa ảnh này? Ảnh cũng sẽ bị xóa khỏi S3.")) {
                    deleteMut.mutate(img.id);
                  }
                }}
                title="Xóa ảnh"
                className="rounded-full bg-white p-1.5 text-red-500 hover:bg-red-50"
              >
                <FiTrash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {img.isCover && (
              <span className="absolute bottom-0 left-0 right-0 bg-blue-600 py-0.5 text-center text-[9px] font-bold text-white">
                BÌA
              </span>
            )}
          </div>
        ))}

        {/* Upload slot */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex h-16 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-blue-400 hover:text-blue-500 disabled:opacity-50"
        >
          {uploading ? (
            <span className="text-[10px]">Đang tải...</span>
          ) : (
            <>
              <FiUploadCloud className="h-4 w-4" />
              <span className="text-[10px]">Thêm ảnh</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <p className="text-[11px] text-slate-400">
        Hover vào ảnh để đặt bìa hoặc xóa. Ảnh xóa sẽ bị xóa khỏi S3.
      </p>
    </div>
  );
};

export default TourImageSection;
