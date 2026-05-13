import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "../api/hooks/categoryHooks";
import { TourCategorySidebar } from "../components/tour-category/TourCategorySidebar";
import { TourCategoryTable } from "../components/tour-category/TourCategoryTable";

const pageSize = 5;

const statusTone = (tourCount) => {
  if (tourCount === 0) {
    return {
      label: "Chưa có tour",
      className: "border-slate-200 bg-slate-100 text-slate-600",
    };
  }

  return {
    label: "Đang hoạt động",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
};

export const TourCategoryPage = () => {
  const initialSelectionApplied = useRef(false);
  const resetSearchTimerRef = useRef(null);

  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formName, setFormName] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [isRefreshingSearch, setIsRefreshingSearch] = useState(false);

  const { data: rawCategories = [], isLoading } = useCategoriesQuery();

  const categories = useMemo(() => {
    return (rawCategories || [])
      .map((category) => {
      const tourCount = Number(category.tourCount ?? 0);
      const status = statusTone(tourCount);
      return {
        ...category,
        tourCount,
        statusLabel: status.label,
        statusClassName: status.className,
      };
      })
      .sort((left, right) => {
        if (right.tourCount !== left.tourCount) {
          return right.tourCount - left.tourCount;
        }
        return String(left.name || "").localeCompare(String(right.name || ""));
      });
  }, [rawCategories]);

  const createMutation = useCreateCategoryMutation({
    onSuccess: () => {
      setFormName("");
      setSelectedId(null);
    },
  });

  const updateMutation = useUpdateCategoryMutation();

  const deleteMutation = useDeleteCategoryMutation({
    onSuccess: () => {
      setSelectedId(null);
      setFormName("");
      setCategoryToDelete(null);
      setDeleteConfirmationInput("");
    },
  });

  const filteredCategories = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(keyword),
    );
  }, [categories, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCategories.length / pageSize),
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCategories = filteredCategories.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const totalCategories = categories.length;
  const activeCategories = categories.filter(
    (category) => category.tourCount > 0,
  ).length;

  const selectedCategory =
    categories.find((category) => category.id === selectedId) || null;

  useEffect(() => {
    return () => {
      if (resetSearchTimerRef.current) {
        clearTimeout(resetSearchTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!initialSelectionApplied.current && categories.length > 0) {
      setSelectedId(categories[0].id);
      setFormName(categories[0].name);
      initialSelectionApplied.current = true;
    }
  }, [categories]);

  const syncFormToCategory = (category) => {
    setSelectedId(category.id);
    setFormName(category.name);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextName = formName.trim();
    if (!nextName) return;

    if (selectedId) {
      updateMutation.mutate({ id: selectedId, name: nextName });
      return;
    }

    createMutation.mutate({ name: nextName });
  };

  
  const handleStartCreate = () => {
    setSelectedId(null);
    setFormName("");
  };

  const handleDeleteRequest = (category) => {
    setCategoryToDelete(category);
    setDeleteConfirmationInput("");
  };

  const handleConfirmDelete = () => {
    if (!categoryToDelete) return;
    if (deleteConfirmationInput.trim() !== categoryToDelete.name) return;
    deleteMutation.mutate(categoryToDelete.id);
  };

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(nextPage);
  };

  const handleResetSearch = () => {
    setIsRefreshingSearch(true);
    setSearchTerm("");
    setCurrentPage(1);

    if (resetSearchTimerRef.current) {
      clearTimeout(resetSearchTimerRef.current);
    }

    resetSearchTimerRef.current = setTimeout(() => {
      setIsRefreshingSearch(false);
    }, 450);
  };

  return (
    <div className="space-y-5 text-slate-700">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 bg-white px-6 py-6">
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-blue-600 md:text-[42px]">
                Quản lý Tour / Danh mục Tour
              </h2>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-6 xl:grid-cols-[minmax(0,1.4fr)_420px]">
          <TourCategoryTable
            searchTerm={searchTerm}
            onSearchTermChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            onResetSearch={handleResetSearch}
            paginatedCategories={paginatedCategories}
            filteredCategories={filteredCategories}
            isLoading={isLoading}
            selectedId={selectedId}
            onEdit={syncFormToCategory}
            onDelete={handleDeleteRequest}
            totalPages={totalPages}
            safePage={safePage}
            onGoToPage={goToPage}
            deletePending={deleteMutation.isPending}
            isRefreshingSearch={isRefreshingSearch}
          />

          <TourCategorySidebar
            totalCategories={totalCategories}
            activeCategories={activeCategories}
            formName={formName}
            onFormNameChange={setFormName}
            onStartCreate={handleStartCreate}
            onSubmit={handleSubmit}
            isSaving={createMutation.isPending || updateMutation.isPending}
            isEditing={Boolean(selectedCategory)}
            editingCategoryName={selectedCategory?.name ?? ""}
            submitLabel={selectedCategory ? "Cập nhật" : "Lưu"}
          />
        </div>
      </section>

      {categoryToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.24)]">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-rose-700">
                Xác nhận xóa
              </div>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                Xóa danh mục này?
              </h3>
            </div>

            <div className="px-6 py-5 space-y-4 text-sm text-slate-600">
              <div>
                <p>
                  Bạn đang chuẩn bị xóa danh mục <span className="font-bold text-slate-900">{categoryToDelete.name}</span>.
                </p>
                <p className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
                  Chỉ những danh mục chưa có tour mới có thể xóa.
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.22em] text-slate-600 mb-2">
                  Nhập tên danh mục để xác nhận
                </label>
                <input
                  type="text"
                  value={deleteConfirmationInput}
                  onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                  placeholder={categoryToDelete.name}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-1 focus:ring-rose-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-5">
              <button
                type="button"
                onClick={() => {
                  setCategoryToDelete(null);
                  setDeleteConfirmationInput("");
                }}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending || deleteConfirmationInput.trim() !== categoryToDelete.name}
                className="rounded-2xl border border-rose-500 bg-rose-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteMutation.isPending ? "Đang xóa..." : "Xóa danh mục"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
