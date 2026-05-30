import React from "react";

export const MiniStatSquares = ({ items = [] }) => {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => {
        const color = item.color || "from-white to-slate-50";
        const textColor = item.textColor || "text-slate-900";
        const badgeColor = item.badgeColor || "bg-blue-600";

        return (
          <div
            key={item.label}
            className={`relative flex h-20 flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 p-3 shadow-sm bg-gradient-to-br ${color}`}
          >
            <div className="absolute -top-4 -right-8 h-36 w-36 rounded-full opacity-10 blur-3xl" style={{ background: item.accent || undefined }} />

            <span className={`text-[10px] font-extrabold uppercase tracking-[0.18em] ${textColor}`}>
              {item.label}
            </span>
            <div className="flex items-end justify-between gap-2">
              <span className={`text-xl font-black ${textColor}`}>
                {item.value}
              </span>
              {item.badge ? (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-sm ${badgeColor}`}>
                  {item.badge}
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};
