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
    },
    {
      id: 2,
      name: "Tour Phan Thiết - Mũi Né",
      location: "Bình Thuận",
      price: "3.5M",
      days: "2N1D",
      rating: 4.5,
      booking: 98,
    },
    {
      id: 3,
      name: "Du lịch Đà Nẵng",
      location: "Đà Nẵng",
      price: "4.2M",
      days: "3N2D",
      rating: 4.7,
      booking: 134,
    },
    {
      id: 4,
      name: "Tour Nha Trang",
      location: "Khánh Hòa",
      price: "2.8M",
      days: "2N1D",
      rating: 4.6,
      booking: 87,
    },
    {
      id: 5,
      name: "Du lịch Hội An - Huế",
      location: "Quảng Nam",
      price: "6.5M",
      days: "4N3D",
      rating: 4.9,
      booking: 203,
    },
  ]);

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

      {/* Tours Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tours.map((tour) => (
          <div
            key={tour.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
          >
            {/* Image Placeholder */}
            <div className="flex h-32 items-center justify-center bg-sky-100 text-4xl text-blue-700">
              🌴
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="mb-2 text-base font-semibold text-slate-900">
                {tour.name}
              </h3>

              {/* Details */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center text-sm text-slate-500">
                  <span>📍</span>
                  <span className="ml-2">{tour.location}</span>
                </div>
                <div className="flex items-center text-sm text-slate-500">
                  <span>⏱️</span>
                  <span className="ml-2">{tour.days}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    ⭐ {tour.rating}
                  </span>
                  <span className="text-sm text-slate-500">
                    📅 {tour.booking} booking
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-4 border-b border-slate-100 pb-4">
                <p className="text-xl font-semibold text-emerald-600">
                  {tour.price}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                  ✏️ Sửa
                </button>
                <button className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
                  🗑️ Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
