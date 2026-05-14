import React from 'react';
import { FiMapPin, FiClock, FiCalendar, FiEye, FiToggleLeft, FiToggleRight, FiStar, FiZap } from 'react-icons/fi';

export const TourCard = ({ tour, onView, onToggleHot, onDelete, togglePending }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return null;
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);

  const isActive = tour.status === 'ACTIVE';
  const rating = tour.rating ? Number(tour.rating) : null;
  const departureDate = formatDate(tour.departureStartDate);
  const location = tour.pickupName || tour.region;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)] ring-1 ring-slate-200/80 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:ring-blue-200 hover:-translate-y-1">

      {/* ── Image ── */}
      <div className="relative h-44 overflow-hidden bg-slate-100">
        {tour.coverImageUrl ? (
          <img
            src={tour.coverImageUrl}
            alt={tour.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-blue-50">
            <span className="text-5xl">🏖️</span>
            <span className="text-xs text-slate-400">Chưa có ảnh</span>
          </div>
        )}

        {/* Dark gradient bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* HOT badge – top left */}
        {tour.isHot && (
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-orange-500 to-rose-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg">
              <FiZap className="h-3 w-3" />
              Hot Deal
            </span>
          </div>
        )}

        {/* Rating – top right */}
        {rating !== null && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 shadow backdrop-blur-sm">
            <FiStar className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-slate-800">{rating.toFixed(1)}</span>
          </div>
        )}

        {/* Location – bottom left */}
        {location && (
          <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5">
            <FiMapPin className="h-3 w-3 flex-shrink-0 text-white/80" />
            <span className="max-w-[160px] truncate text-xs font-medium text-white/90 drop-shadow">
              {location}
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 flex-col px-4 py-3.5">

        {/* Category + Status row */}
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="truncate text-[11px] font-semibold uppercase tracking-widest text-blue-500">
            {tour.categoryName || 'Tour'}
          </span>
          <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            isActive
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-slate-100 text-slate-400'
          }`}>
            {isActive ? '● Hoạt động' : '● Tạm dừng'}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-3 line-clamp-2 text-[14px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-700">
          {tour.title}
        </h3>

        {/* Info row */}
        <div className="mb-4 flex flex-wrap gap-x-3 gap-y-1.5">
          {tour.durationDays && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <FiClock className="h-3 w-3 text-slate-400" />
              <span>{tour.durationDays} Ngày {tour.durationDays - 1} Đêm</span>
            </div>
          )}
          {departureDate && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <FiCalendar className="h-3 w-3 text-slate-400" />
              <span>{departureDate}</span>
            </div>
          )}
        </div>

        {/* Spacer pushes price+actions to bottom */}
        <div className="mt-auto" />

        {/* Divider */}
        <div className="mb-3 h-px bg-slate-100" />

        {/* Price + Action buttons */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Giá từ</p>
            <p className="truncate text-[17px] font-extrabold leading-tight text-blue-600">
              {formatPrice(tour.basePrice)}
            </p>
          </div>

          <div className="flex flex-shrink-0 items-center gap-1.5">
            <button
              onClick={() => onView(tour.id)}
              title="Xem / Chỉnh sửa"
              className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-300/40 transition hover:bg-blue-700 active:scale-95"
            >
              <FiEye className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onToggleHot?.(tour)}
              title={isActive ? 'Tạm dừng tour' : 'Kích hoạt tour'}
              className={`cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-xl border transition active:scale-95 ${
                isActive
                  ? 'border-orange-200 bg-orange-50 text-orange-500 hover:bg-orange-100'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-500 hover:bg-emerald-100'
              }`}
            >
              {isActive
                ? <FiToggleRight className="h-4 w-4" />
                : <FiToggleLeft className="h-4 w-4" />
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
