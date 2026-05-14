import React, { useRef, useState, useCallback } from "react";
import { HiPhotograph } from "react-icons/hi";
import { inputCls } from "../../utils/tourUtils";

const ImageUploadSection = ({ images, setImages }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = useCallback((files) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      setImages((prev) => [...prev, { url, name: file.name, file }]);
    });
  }, [setImages]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleRemove = (idx) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const setCover = (idx) => {
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      return [item, ...next];
    });
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`mb-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-8 transition ${
          dragging ? "border-blue-400 bg-blue-50" : "border-slate-300 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl"><HiPhotograph className="h-7 w-7 text-blue-600" /></div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">Kéo thả ảnh vào đây</p>
          <p className="text-xs text-slate-400">hoặc bấm để chọn từ máy tính</p>
        </div>
        <span className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white">Chọn ảnh</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img, idx) => (
            <div key={idx} className="group relative overflow-hidden rounded-xl border border-slate-200">
              <img src={img.url} alt={img.name} className="h-24 w-full object-cover transition group-hover:scale-105" />
              {idx === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-md bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">ẢNH BÌA</span>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition group-hover:opacity-100">
                {idx !== 0 && (
                  <button onClick={() => setCover(idx)} title="Đặt làm ảnh bìa" className="rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-white">📌 Bìa</button>
                )}
                <button onClick={() => handleRemove(idx)} className="rounded-lg bg-red-500/90 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-600">Xóa</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="mt-2 text-xs text-slate-400">{images.length} ảnh · Hover để đặt ảnh bìa hoặc xóa</p>
      )}
    </div>
  );
};

export default ImageUploadSection;
