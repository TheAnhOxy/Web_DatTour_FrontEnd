import React from "react";
import { FiEdit2, FiRefreshCw, FiTrash2, FiSearch } from "react-icons/fi";

const getCategoryBadge = (name) => {
  const words = name.trim().split(/\s+/).filter(w => w.length > 0);
  if (words.length >= 2) {
    return words.slice(-2).map(w => w[0].toUpperCase()).join('');
  }
  return words[0]?.substring(0, 2).toUpperCase() || "--";
};

export const TourCategoryTable = ({
  searchTerm,
  onSearchTermChange,
  onResetSearch,
  paginatedCategories,
  filteredCategories,
  isLoading,
  selectedId,
  onEdit,
  onDelete,
  totalPages,
  safePage,
  onGoToPage,
  deletePending,
  isRefreshingSearch,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
            <FiSearch className="h-5 w-5 flex-shrink-0 text-slate-600" />

            <input
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              placeholder="Tìm danh mục..."
              className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="button"
            onClick={onResetSearch}
            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            <FiRefreshCw className={`${isRefreshingSearch ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.22em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Danh mục</th>
                <th className="px-5 py-4">Tours</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            {isLoading ? (
              <tbody>
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-5 py-3">
                        <div className="h-10 animate-pulse rounded-xl bg-slate-200" />
                      </td>
                    </tr>
                  ))}
              </tbody>
            ) : (
              <tbody>
                {paginatedCategories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-10 text-center text-sm text-slate-500"
                    >
                      Không tìm thấy danh mục phù hợp.
                    </td>
                  </tr>
                ) : (
                  paginatedCategories.map((category) => (
                    <tr
                      key={category.id}
                      className={`border-t border-slate-100 text-sm transition hover:bg-sky-100 ${selectedId === category.id ? "bg-blue-50/70" : ""}`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-black text-white shadow-sm shadow-blue-600/20">
                            {getCategoryBadge(category.name)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-950">
                              {category.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {category.tourCount}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${category.statusClassName}`}
                        >
                          {category.statusLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onEdit(category)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                          >
                            <FiEdit2 />
                            Sửa
                          </button>
                          {Number(category.tourCount ?? 0) === 0 ? (
                            <button
                              type="button"
                              onClick={() => onDelete(category)}
                              disabled={deletePending}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                            >
                              <FiTrash2 />
                              Xóa
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            Hiển thị{" "}
            {Math.min((safePage - 1) * 5 + 1, filteredCategories.length)} - {" "}
            {Math.min(safePage * 5, filteredCategories.length)} / trong tổng số {" "}
            {filteredCategories.length || 0}
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
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => onGoToPage(page)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${page === safePage ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"}`}
                >
                  {page}
                </button>
              ),
            )}
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
