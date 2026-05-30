import React from "react";
import { TourCard } from "./TourCard";
import { AddTourCard } from "./AddTourCard";

export const ToursGrid = ({
  isLoading,
  tours,
  columns,
  navigate,
  onView,
  onToggleStatus,
  onDelete,
  togglePending,
  size = 9,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 rounded-2xl bg-slate-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!tours || tours.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
        <p className="text-slate-600">Không tìm thấy tour nào phù hợp</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tours.map((tour) => (
        <TourCard
          key={tour.id}
          tour={tour}
          onView={onView}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          togglePending={togglePending}
        />
      ))}

      <AddTourCard onClick={() => navigate('/tour/new')} spanFull={(tours.length % columns) === 0} />
    </div>
  );
};

export default ToursGrid;
