import React from "react";
import { FiMapPin, FiMap, FiGlobe } from "react-icons/fi";

const cards = [
  { label: "Tổng điểm đến", accent: "from-blue-600 to-indigo-600", icon: FiMapPin },
  { label: "Tỉnh / Thành phố", accent: "from-slate-700 to-slate-900", icon: FiMap },
  { label: "Quốc gia", accent: "from-rose-500 to-orange-500", icon: FiGlobe },
];

export const DestinationStats = ({ totalDestinations, totalCities, totalCountries }) => {
  const values = [totalDestinations, totalCities, totalCountries];

  return (
    <div className="grid gap-4 px-6 py-6 lg:grid-cols-3">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-4">
              <div className={`grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br ${card.accent} text-white shadow-lg shadow-blue-600/10`}>
                <IconComponent className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
                <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">{values[index]}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};