import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { MiniStatSquares } from "../components/MiniStatSquares";
import { useTourListQuery, useTourCategoriesQuery, useDeleteTourMutation, useToggleHotMutation } from "../api/hooks/tourHooks";

const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

export const TourPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [showHotOnly, setShowHotOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [tourToDelete, setTourToDelete] = useState(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  const SIZE = 9;
  const debouncedSearchTerm = useDebounce(searchTerm);

  // Filters
  const filters = {
    status: selectedStatus || undefined,
    categoryId: selectedCategoryId ? Number(selectedCategoryId) : undefined,
    isHot: showHotOnly ? true : undefined,
    page,
    size: SIZE,
  };

  // Queries
  const { data, isLoading, isFetching } = useTourListQuery(filters);
  const { data: categories = [] } = useTourCategoriesQuery();

  // Mutations
  const deleteMutation = useDeleteTourMutation({
    onSuccess: () => {
      setTourToDelete(null);
      setDeleteConfirmInput("");
    },
  });
  const toggleHotMutation = useToggleHotMutation();

  const tours = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // Calculate stats
  const activeCount = tours.filter((t) => t.status === "ACTIVE").length;
  const inactiveCount = tours.filter((t) => t.status === "INACTIVE").length;
  const hotCount = tours.filter((t) => t.isHot).length;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleViewDetail = (tourId) => {
    navigate(`/tour/${tourId}`);
  };

  const handleResetFilter = () => {
    setSearchTerm("");
    setSelectedStatus("");
    setSelectedCategoryId("");
    setShowHotOnly(false);
    setPage(0);
  };

  const handleDeleteClick = (tour) => {
    setTourToDelete(tour);
    setDeleteConfirmInput("");
  };

  const handleConfirmDelete = () => {
    if (tourToDelete && deleteConfirmInput.trim() === tourToDelete.title) {
      deleteMutation.mutate(tourToDelete.id);
    }
  };

  const handleToggleHot = (tourId) => {
    toggleHotMutation.mutate(tourId);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <MiniStatSquares
        items={[
          { label: "Tổng Tour", value: totalElements, badge: "Live" },
          { label: "Đang hoạt động", value: activeCount, badge: "Active" },
          { label: "Dừng hoạt động", value: inactiveCount, badge: "Inactive" },
          { label: "Tour nổi bật", value: hotCount, badge: "Hot" },
        ]}
      />

      {/* Header with title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.34em] text-blue-600">
            Quản lý Tour / Danh sách Tour
          </h2>
        </div>
        <button
          onClick={() => navigate("/tour/new")}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-500 cursor-pointer px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          + Thêm Tour Mới
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="space-y-5 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
        {/* Search Input */}
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
            placeholder="Tìm kiếm tour, mã đặt chỗ..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            className="h-14 w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Filter Controls */}
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
            <button className="h-11 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800">
              Áp dụng
            </button>
            <button
              onClick={handleResetFilter}
              className="h-11 rounded-xl border border-slate-300 bg-slate-50 px-6 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Đặt lại
            </button>
          </div>
        </div>

        <div className="h-px w-full bg-slate-300" />

        {/* Results Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-700">
          <div>
            Hiển thị <span className="font-semibold">{tours.length}</span> trong{" "}
            <span className="font-semibold">{totalElements}</span> tours
            {isFetching && <span className="ml-2 text-xs text-slate-500">Đang tải...</span>}
          </div>
          <button className="inline-flex items-center gap-2 text-sm">
            <span className="text-slate-500">Sắp xếp:</span>
            <span className="font-semibold text-blue-700">Mới nhất</span>
            <svg className="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tours Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-2xl bg-slate-200 animate-pulse"
            />
          ))}
        </div>
      ) : tours.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => (
            <div
              key={tour.id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
            >
              {/* Image Section */}
              <div className="relative h-40 overflow-hidden bg-slate-100">
                <img
                  src={tour.coverImageUrl}
                  alt={tour.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/20" />

                {/* Hot Badge */}
                {tour.isHot && (
                  <div className="absolute left-2.5 top-2.5">
                    <span className="inline-block rounded-full bg-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                      🔥 HOT DEAL
                    </span>
                  </div>
                )}

                {/* Rating */}
                <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 shadow-md backdrop-blur">
                  <span>⭐</span>
                  <span className="text-xs font-bold text-slate-900">
                    {tour.rating ? tour.rating.toFixed(1) : "0.0"}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex flex-col p-3.5">
                {/* Title and Category */}
                <h3 className="mb-1 line-clamp-2 text-sm font-bold text-slate-900">
                  {tour.title}
                </h3>
                <p className="mb-2 text-xs text-slate-500">{tour.categoryName}</p>

                {/* Details */}
                <div className="mb-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">📍</span>
                    <span>{tour.pickupName || tour.region || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">⏱️</span>
                    <span>{tour.durationDays} Ngày {tour.durationDays - 1} Đêm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">📅 Khởi hành</span>
                    <span className="text-slate-400">{formatDate(tour.departureStartDate)}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="mb-3 border-t border-slate-100" />

                {/* Price */}
                <div className="mb-3">
                  <p className="text-xs text-slate-500">Giá cơ bản</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatPrice(tour.basePrice)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetail(tour.id)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-2 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                  >
                    <FiEdit2 /> Xem / Sửa
                  </button>
                  <button
                    onClick={() => handleToggleHot(tour.id)}
                    disabled={toggleHotMutation.isPending}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-amber-50 hover:text-amber-600"
                  >
                    ⚡ Hot
                  </button>
                  <button
                    onClick={() => handleDeleteClick(tour)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <FiTrash2 /> Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Tour Card */}
          <button
            onClick={() => navigate("/tour/new")}
            className="group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl text-blue-600 transition group-hover:bg-blue-200">
              +
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Thêm Tour Mới</p>
              <p className="text-xs text-slate-500">Bắt đầu tạo lịch tour từ đây</p>
            </div>
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
          <p className="text-slate-600">Không tìm thấy tour nào phù hợp</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            Hiển thị {Math.min(page * SIZE + 1, totalElements)} -{" "}
            {Math.min((page + 1) * SIZE, totalElements)} / trong tổng số {totalElements}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={page === 0}
            >
              ←
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (page <= 2) {
                pageNum = i;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    page === pageNum
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={page === totalPages - 1}
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {tourToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Xóa tour này?</h3>
            <p className="mb-4 text-sm text-slate-600">
              Để xác nhận, vui lòng nhập tên tour: <span className="font-semibold">{tourToDelete.title}</span>
            </p>
            <input
              type="text"
              placeholder="Nhập tên tour..."
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              className="mb-4 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-red-400 focus:outline-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setTourToDelete(null);
                  setDeleteConfirmInput("");
                }}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={
                  deleteConfirmInput.trim() !== tourToDelete.title || deleteMutation.isPending
                }
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
