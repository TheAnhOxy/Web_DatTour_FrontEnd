import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MiniStatSquares } from "../components/MiniStatSquares";
import FilterBar from "../components/tour-page/FilterBar";
import ToursGrid from "../components/tour-page/ToursGrid";
import DeleteConfirmModal from "../components/tour-page/DeleteConfirmModal";
import ToggleHotConfirmModal from "../components/tour-page/ToggleHotConfirmModal";
import { useTourListQuery, useSearchToursQuery, useTourCategoriesQuery, useDeleteTourMutation, useToggleHotMutation } from "../api/hooks/tourHooks";

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
  const [tourToToggle, setTourToToggle] = useState(null);

  const SIZE = 9;
  const debouncedSearchTerm = useDebounce(searchTerm);

  const [columns, setColumns] = useState(() => {
    if (typeof window === "undefined") return 3;
    const w = window.innerWidth;
    return w < 768 ? 1 : w < 1024 ? 2 : 3;
  });

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setColumns(w < 768 ? 1 : w < 1024 ? 2 : 3);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Base filters (shared between list and search)
  const baseFilters = {
    status: selectedStatus || undefined,
    categoryId: selectedCategoryId ? Number(selectedCategoryId) : undefined,
    isHot: showHotOnly ? true : undefined,
    page,
    size: SIZE,
  };

  // Search filters include keyword
  const searchFilters = {
    ...baseFilters,
    keyword: debouncedSearchTerm || undefined,
  };

  const isSearching = !!debouncedSearchTerm;

  // Use search query when keyword is present, otherwise use list query
  const listQuery = useTourListQuery(baseFilters);
  const searchQuery = useSearchToursQuery(searchFilters);

  const activeQuery = isSearching ? searchQuery : listQuery;
  const { data, isLoading, isFetching } = activeQuery;

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

  const handleToggleHot = (tour) => {
    if (!tour) return;
    setTourToToggle(tour);
  };

  const handleConfirmToggleHot = () => {
    if (!tourToToggle) return;
    toggleHotMutation.mutate(tourToToggle.id, {
      onSuccess: () => setTourToToggle(null),
      onError: () => setTourToToggle(null),
    });
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
      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        showHotOnly={showHotOnly}
        setShowHotOnly={setShowHotOnly}
        categories={categories}
        isFetching={isFetching}
        onReset={handleResetFilter}
        setPage={setPage}
      />

      <ToursGrid
        isLoading={isLoading}
        tours={tours}
        columns={columns}
        navigate={navigate}
        onView={handleViewDetail}
        onToggleHot={handleToggleHot}
        onDelete={handleDeleteClick}
        togglePending={toggleHotMutation.isPending}
      />

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

      <DeleteConfirmModal
        tourToDelete={tourToDelete}
        deleteConfirmInput={deleteConfirmInput}
        setDeleteConfirmInput={setDeleteConfirmInput}
        onCancel={() => {
          setTourToDelete(null);
          setDeleteConfirmInput("");
        }}
        onConfirm={handleConfirmDelete}
        deletePending={deleteMutation.isPending}
      />

      <ToggleHotConfirmModal
        tour={tourToToggle}
        onCancel={() => setTourToToggle(null)}
        onConfirm={handleConfirmToggleHot}
        isPending={toggleHotMutation.isPending}
      />
    </div>
  );
};
