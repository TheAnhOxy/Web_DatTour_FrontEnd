import React from "react";

export const MiniStatSquares = ({ items = [] }) => {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex h-20 flex-col justify-between rounded-2xl border border-blue-100 bg-white p-3 shadow-sm"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {item.label}
          </span>
          <div className="flex items-end justify-between gap-2">
            <span className="text-lg font-semibold text-blue-700">
              {item.value}
            </span>
            {item.badge ? (
              <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                {item.badge}
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
};
