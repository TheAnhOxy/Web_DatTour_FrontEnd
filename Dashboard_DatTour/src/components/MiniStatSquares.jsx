import React from "react";

export const MiniStatSquares = ({ items = [] }) => {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex h-20 flex-col justify-between rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3 shadow-sm"
        >
          <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-900">
            {item.label}
          </span>
          <div className="flex items-end justify-between gap-2">
            <span className="text-xl font-black text-slate-950">
              {item.value}
            </span>
            {item.badge ? (
              <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                {item.badge}
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
};
