import React, { useState, useRef } from "react";
import { HiSearch, HiLocationMarker } from "react-icons/hi";
import { inputCls } from "../../utils/tourUtils";

const DestinationPicker = ({ selected, setSelected, allDestinations = [] }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const filtered = allDestinations.filter(
    (d) =>
      d.cityName?.toLowerCase().includes(query.toLowerCase()) &&
      !selected.some(sel => sel.id === d.id)
  );

  const add = (dest) => {
    setSelected((prev) => [...prev, { id: dest.id, cityName: dest.cityName }]);
    setQuery("");
    setOpen(false);
  };

  const remove = (destId) => setSelected((prev) => prev.filter((d) => d.id !== destId));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim()) {
      const match = filtered[0];
      if (match) {
        add(match);
      }
    }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={containerRef}>
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((dest) => (
            <span key={dest.id} className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 py-1 pl-3 pr-2 text-sm font-semibold text-blue-700">
              📍 {dest.cityName}
              <button onClick={() => remove(dest.id)} className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold text-blue-700 transition hover:bg-red-200 hover:text-red-600">×</button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder="Tìm hoặc chọn điểm đến..."
          className={inputCls + " pl-10"}
        />
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>

        {open && (
          <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
            {filtered.length === 0 && query.trim() ? (
              <div className="px-4 py-3 text-sm text-slate-400">Không tìm thấy điểm đến</div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-400">Chọn điểm đến từ danh sách</div>
            ) : (
              filtered.map((dest) => (
                <button key={dest.id} onMouseDown={() => add(dest)} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                  <span className="text-slate-400"><HiLocationMarker /></span>
                  {dest.cityName}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      <p className="mt-1.5 text-[11px] text-slate-400">Tìm và chọn các điểm đến từ danh sách</p>
    </div>
  );
};

export default DestinationPicker;
