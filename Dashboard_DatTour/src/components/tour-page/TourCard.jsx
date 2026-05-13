import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

export const TourCard = ({ tour, onView, onToggleHot, onDelete, togglePending }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
      <div className="relative h-40 overflow-hidden bg-slate-100">
        <img
          src={tour.coverImageUrl}
          alt={tour.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/20" />

        {tour.isHot && (
          <div className="absolute left-2.5 top-2.5">
            <span className="inline-block rounded-full bg-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow-md">
              🔥 HOT DEAL
            </span>
          </div>
        )}

        <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 shadow-md backdrop-blur">
          <span>⭐</span>
          <span className="text-xs font-bold text-slate-900">{tour.rating ? Number(tour.rating).toFixed(1) : '0.0'}</span>
        </div>
      </div>

      <div className="flex flex-col p-3.5">
        <h3 className="mb-1 line-clamp-2 text-sm font-bold text-slate-900">{tour.title}</h3>
        <p className="mb-2 text-xs text-slate-500">{tour.categoryName}</p>

        <div className="mb-3 space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">📍</span>
            <span>{tour.pickupName || tour.region || '—'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">⏱️</span>
            <span>{tour.durationDays} Ngày {tour.durationDays - 1} Đêm</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">📅 Khởi hành</span>
            <span className="text-slate-400">{formatDate(tour.departureStartDate)}</span>
          </div>
        </div>

        <div className="mb-3 border-t border-slate-100" />

        <div className="mb-3">
          <p className="text-xs text-slate-500">Giá cơ bản</p>
          <p className="text-lg font-bold text-blue-600">{formatPrice(tour.basePrice)}</p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => onView(tour.id)} className="cursor-pointer inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-2 py-2 text-xs font-semibold text-white transition hover:bg-blue-700">
            <FiEdit2 /> Xem / Sửa
          </button>
          {/* <button onClick={() => onToggleHot(tour.id)} disabled={togglePending} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-amber-50 hover:text-amber-600">
            ⚡ Hot
          </button>
          <button onClick={() => onDelete(tour)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-600">
            <FiTrash2 /> Xóa
          </button> */}
        </div>
      </div>
    </div>
  );
};
