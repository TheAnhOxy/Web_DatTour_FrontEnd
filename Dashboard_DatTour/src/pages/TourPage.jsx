import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MiniStatSquares } from "../components/MiniStatSquares";
import { mockTours, mockCategories } from "../data/mockTourData";

export const TourPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showHotOnly, setShowHotOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Filter tours
  const filteredTours = useMemo(() => {
    return mockTours.filter((tour) => {
      const matchSearch =
        tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.categoryName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        selectedStatus === "ALL" || tour.status === selectedStatus;

      const matchCategory =
        selectedCategory === "ALL" || tour.categoryName === selectedCategory;

      const matchHot = !showHotOnly || tour.isHot;

      return matchSearch && matchStatus && matchCategory && matchHot;
    });
  }, [searchTerm, selectedStatus, selectedCategory, showHotOnly]);

  const totalPages = Math.ceil(filteredTours.length / itemsPerPage);
  const paginatedTours = filteredTours.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate stats
  const totalHotTours = mockTours.filter((t) => t.isHot).length;
  const totalInactiveTours = mockTours.filter(
    (t) => t.status === "INACTIVE"
  ).length;
  const totalActiveToursCount = mockTours.filter(
    (t) => t.status === "ACTIVE"
  ).length;

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

  return (
    <div className="space-y-6">
      {/* Stats */}
      <MiniStatSquares
        items={[
          { label: "Tổng Tour", value: mockTours.length, badge: "Live" },
          { label: "Đang hoạt động", value: totalActiveToursCount, badge: "Active" },
          { label: "Dừng hoạt động", value: totalInactiveTours, badge: "Inactive" },
          { label: "Tour nổi bật", value: totalHotTours, badge: "Hot" },
        ]}
      />

      {/* Header with title */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-[0.34em] text-blue-600">
            Quản lý Tour / Danh sách Tour
          </h2>
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
              setCurrentPage(1);
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
                setCurrentPage(1);
              }}
              className="h-11 min-w-48 rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
            >
              <option value="ALL">Tất cả</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Tạm dừng</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Danh mục:</span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 min-w-48 rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
            >
              <option value="ALL">Tất cả danh mục</option>
              {mockCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
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
                setCurrentPage(1);
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
              onClick={() => {
                setSearchTerm("");
                setSelectedStatus("ALL");
                setSelectedCategory("ALL");
                setShowHotOnly(false);
                setCurrentPage(1);
              }}
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
            Hiển thị <span className="font-semibold">{paginatedTours.length}</span> trong <span className="font-semibold">{filteredTours.length}</span> tours
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
      {paginatedTours.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedTours.map((tour) => (
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
                    {tour.rating}
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
                    <span>{tour.pickupName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">⏱️</span>
                    <span>{tour.durationDays} Ngày {tour.durationDays - 1} Đêm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">📅 {tour.bookingCount} đặt</span>
                    <span className="text-slate-400">{tour.departureStartDate}</span>
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
                    className="flex-1 rounded-lg bg-blue-600 px-2 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                  >
                    👁️ Xem / ✏️ Sửa
                  </button>
                  <button className="flex-1 rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-600">
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Tour Card */}
          <button className="group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50">
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
      {true && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <button
            onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            disabled={currentPage === 1}
          >
            ← Trước
          </button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`min-w-9 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white shadow-md"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            disabled={currentPage === totalPages}
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
};
