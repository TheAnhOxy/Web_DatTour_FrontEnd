import React from "react";
import { FiRotateCw } from "react-icons/fi";

export const FilterBar = ({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  selectedCategoryId,
  setSelectedCategoryId,
  showHotOnly,
  setShowHotOnly,
  categories = [],
  isFetching,
  onReset,
  setPage,
}) => {
  return (
    <div className="space-y-5 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Tìm kiếm tour..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          className="h-14 w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">Trạng thái:</span>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(0);
            }}
            className="h-11 min-w-48 rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
          >
            <option value="">Tất cả</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Tạm dừng</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">Danh mục:</span>
          <select
            value={selectedCategoryId}
            onChange={(e) => {
              setSelectedCategoryId(e.target.value);
              setPage(0);
            }}
            className="h-11 min-w-48 rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <label
          htmlFor="hotFilter"
          className="inline-flex h-11 items-center gap-3 rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-700"
        >
          <input
            type="checkbox"
            id="hotFilter"
            checked={showHotOnly}
            onChange={(e) => {
              setShowHotOnly(e.target.checked);
              setPage(0);
            }}
            className="h-5 w-5 rounded border-slate-300 accent-blue-700"
          />
          Chỉ hiện Tour Nổi bật
        </label>

        <div className="ml-auto flex gap-3">
          <button
            onClick={() => {
              onReset();
            }}
            className="cursor-pointer h-11 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-600 transition hover:bg-green-100"
          >
            <FiRotateCw className="text-lg" />
            Đặt lại
          </button>
        </div>
      </div>

      <div className="h-px w-full bg-slate-300" />

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-700">
        <div>
          <span className="text-slate-500">Showing results</span>
          {isFetching && <span className="ml-2 text-xs text-slate-500">Đang tải...</span>}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
