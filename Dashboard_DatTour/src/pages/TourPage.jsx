import React, { useState } from "react";
import { MiniStatSquares } from "../components/MiniStatSquares";

export const TourPage = () => {
  const [tours] = useState([
    {
      id: 1,
      name: "Du lịch Hạ Long Bay",
      location: "Quảng Ninh",
      price: "5.0M",
      days: "3N2D",
      rating: 4.8,
      booking: 156,
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: 2,
      name: "Tour Phan Thiết - Mũi Né",
      location: "Bình Thuận",
      price: "3.5M",
      days: "2N1D",
      rating: 4.5,
      booking: 98,
      image:
        "https://images.unsplash.com/photo-1507525428034-2d1a4f4d0f8c?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: 3,
      name: "Du lịch Đà Nẵng",
      location: "Đà Nẵng",
      price: "4.2M",
      days: "3N2D",
      rating: 4.7,
      booking: 134,
      image:
        "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: 4,
      name: "Tour Nha Trang",
      location: "Khánh Hòa",
      price: "2.8M",
      days: "2N1D",
      rating: 4.6,
      booking: 87,
      image:
        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: 5,
      name: "Du lịch Hội An - Huế",
      location: "Quảng Nam",
      price: "6.5M",
      days: "4N3D",
      rating: 4.9,
      booking: 203,
      image:
        "https://images.unsplash.com/photo-1577717903315-1691ae25ab3e?auto=format&fit=crop&w=1200&q=80",
    },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const totalPages = Math.ceil(tours.length / itemsPerPage);
  const paginatedTours = tours.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-4">
      <MiniStatSquares
        items={[
          { label: "Tour", value: tours.length, badge: "Live" },
          {
            label: "Booking",
            value: tours.reduce((sum, t) => sum + t.booking, 0),
            badge: "Total",
          },
          {
            label: "Rating",
            value: (
              tours.reduce((sum, t) => sum + t.rating, 0) / tours.length
            ).toFixed(1),
            badge: "Score",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {paginatedTours.map((tour) => (
          <div
            key={tour.id}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]"
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src={tour.image}
                alt={tour.name}
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
              <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-800 shadow-sm backdrop-blur">
                Hot deal
              </span>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="text-base font-bold leading-snug text-slate-950">
                {tour.name}
                </h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                  ⭐ {tour.rating}
                </span>
              </div>

              {/* Details */}
              <div className="mb-4 space-y-2.5 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">📍</span>
                  <span>{tour.location}, Việt Nam</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">⏱️</span>
                  <span>{tour.days.replace("N", " Ngày ").replace("D", " Đêm")}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-medium text-slate-500">
                    📅 {tour.booking} booking
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-4 border-b border-slate-100 pb-4">
                <p className="text-2xl font-black text-blue-700">
                  {tour.price}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                  ✏️ Sửa
                </button>
                <button className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
                  🗑️ Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-sm text-slate-600">
          Hiển thị {paginatedTours.length} trên tổng số {tours.length} tour
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            disabled={currentPage === 1}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`min-w-9 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${currentPage === page ? "bg-blue-600 text-white shadow-sm" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                {page}
              </button>
            ),
          )}
          <button
            onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
