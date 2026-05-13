import React from "react";
import { FiEdit2, FiRefreshCw, FiSearch, FiTrash2 } from "react-icons/fi";

const getDestinationBadge = (name) => {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return words.slice(0, 2).map((word) => word[0].toUpperCase()).join("");
  }
  return words[0]?.substring(0, 2).toUpperCase() || "--";
};

const getDestinationImage = (destination) => destination.imageUrl || destination.image_url || "";

export const DestinationTable = ({
  searchTerm,
  onSearchTermChange,
  onResetSearch,
  isRefreshingSearch,
  regionFilter,
  onRegionFilterChange,
  uniqueRegions,
  paginatedDestinations,
  filteredDestinations,
  isLoading,
  selectedId,
  onSelectDestination,
  onDelete,
  deletePending,
  totalPages,
  safePage,
  pageSize = 6,
  onGoToPage,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
            <FiSearch className="h-5 w-5 flex-shrink-0 text-slate-600" />

            <input
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              placeholder="Tìm tên điểm đến..."
              className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <select
            value={regionFilter}
            onChange={(event) => onRegionFilterChange(event.target.value)}
            className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
          >
            <option value="ALL">Tất cả Tỉnh/Thành</option>
            {uniqueRegions.map((regionItem) => (
              <option key={regionItem} value={regionItem}>
                {regionItem}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onResetSearch}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            <FiRefreshCw className={`${isRefreshingSearch ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.22em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Ảnh</th>
                <th className="px-5 py-4">Tên điểm đến</th>
                <th className="px-5 py-4">Tỉnh / Thành</th>
                <th className="px-5 py-4 text-right">Thao tác</th>
              </tr>
            </thead>

            {isLoading ? (
              <tbody>
                {Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <tr key={index}>
                      <td colSpan={4} className="px-5 py-3">
                        <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
                      </td>
                    </tr>
                  ))}
              </tbody>
            ) : (
              <tbody>
                {paginatedDestinations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-500">
                      Không tìm thấy điểm đến phù hợp.
                    </td>
                  </tr>
                ) : (
                  paginatedDestinations.map((destination, index) => {
                    const imageUrl = getDestinationImage(destination);
                    return (
                      <tr
                        key={destination.id}
                        className={`border-t border-slate-100 text-sm transition hover:bg-sky-100 ${selectedId === destination.id ? "bg-blue-50/70" : ""}`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={destination.cityName}
                                className="h-11 w-11 rounded-2xl object-cover shadow-sm"
                              />
                            ) : (
                              <div className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${index % 2 === 0 ? "from-blue-600 to-cyan-500" : "from-emerald-600 to-teal-500"} text-sm font-black text-white shadow-sm`}>
                                {getDestinationBadge(destination.cityName)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-950">{destination.cityName}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            {destination.region || "Khác"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => onSelectDestination(destination)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                            >
                              <FiEdit2 />
                              Sửa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            )}
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            Hiển thị {filteredDestinations.length === 0 ? 0 : Math.min((safePage - 1) * pageSize + 1, filteredDestinations.length)} - {Math.min(safePage * pageSize, filteredDestinations.length)} / trong tổng số {filteredDestinations.length || 0}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onGoToPage(safePage - 1)}
              disabled={safePage <= 1}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => onGoToPage(page)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${page === safePage ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"}`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onGoToPage(safePage + 1)}
              disabled={safePage >= totalPages}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};