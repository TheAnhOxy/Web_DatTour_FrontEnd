import React, { useMemo, useState } from "react";
import { mockTours } from "../data/mockTourData";

const initialCategories = [
  { id: 1, name: "Du lịch biển" },
  { id: 2, name: "Nghỉ dưỡng" },
  { id: 3, name: "Du lịch lịch sử" },
  { id: 4, name: "Du lịch khám phá" },
  { id: 5, name: "Du lịch văn hóa" },
  { id: 6, name: "Du lịch sinh thái" },
];

const pageSize = 5;

const statusTone = (tourCount) => {
  if (tourCount === 0) {
    return {
      label: "Chưa có tour",
      className: "border-slate-200 bg-slate-100 text-slate-600",
    };
  }

  if (tourCount < 3) {
    return {
      label: "Ít tour",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Đang hoạt động",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
};

export const TourCategoryPage = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [selectedId, setSelectedId] = useState(
    initialCategories[0]?.id ?? null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formName, setFormName] = useState(initialCategories[0]?.name ?? "");

  const tourCounts = useMemo(() => {
    return mockTours.reduce((accumulator, tour) => {
      accumulator[tour.categoryName] =
        (accumulator[tour.categoryName] || 0) + 1;
      return accumulator;
    }, {});
  }, []);

  const enrichedCategories = useMemo(() => {
    return categories.map((category) => {
      const tourCount = tourCounts[category.name] || 0;
      const status = statusTone(tourCount);
      return {
        ...category,
        tourCount,
        statusLabel: status.label,
        statusClassName: status.className,
      };
    });
  }, [categories, tourCounts]);

  const filteredCategories = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return enrichedCategories;
    return enrichedCategories.filter((category) =>
      category.name.toLowerCase().includes(keyword),
    );
  }, [enrichedCategories, searchTerm]);

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
  const activeCategories = enrichedCategories.filter(
    (category) => category.tourCount > 0,
  ).length;
  const totalAssignedTours = Object.values(tourCounts).reduce(
    (sum, value) => sum + value,
    0,
  );

  const selectedCategory =
    enrichedCategories.find((category) => category.id === selectedId) || null;

  const startCreate = () => {
    setSelectedId(null);
    setFormName("");
  };

  const syncFormToCategory = (category) => {
    setSelectedId(category.id);
    setFormName(category.name);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextName = formName.trim();
    if (!nextName) return;

    setCategories((currentCategories) => {
      const exists = currentCategories.some(
        (category) => category.id === selectedId,
      );
      if (exists) {
        return currentCategories.map((category) =>
          category.id === selectedId
            ? { ...category, name: nextName }
            : category,
        );
      }

      const nextId =
        Math.max(0, ...currentCategories.map((category) => category.id)) + 1;
      setSelectedId(nextId);
      return [...currentCategories, { id: nextId, name: nextName }];
    });
  };

  const handleReset = () => {
    if (selectedCategory) {
      setFormName(selectedCategory.name);
      return;
    }

    setSelectedId(null);
    setFormName("");
  };

  const handleDelete = (categoryId) => {
    setCategories((currentCategories) => {
      const nextCategories = currentCategories.filter(
        (category) => category.id !== categoryId,
      );
      const fallback = nextCategories[0] || null;
      if (selectedId === categoryId) {
        setSelectedId(fallback?.id ?? null);
        setFormName(fallback?.name ?? "");
      }
      return nextCategories;
    });
  };

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(nextPage);
  };

  return (
    <div className="space-y-5 text-slate-700">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 bg-white px-6 py-6">
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-3xl uppercase font-black tracking-tight text-blue-600 md:text-[42px]">
                Quản lý Tour / Danh mục Tour
              </h2>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-6 xl:grid-cols-[minmax(0,1.4fr)_420px]">
          <div className="space-y-4">
            <div className="flex gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 items-center gap-3">
                <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
                  <span className="text-slate-500">⌕</span>

                  <input
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Tìm danh mục..."
                    className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
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
                          className={`border-t border-slate-100 text-sm transition hover:bg-sky-50/60 ${selectedId === category.id ? "bg-blue-50/70" : ""}`}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-black text-white shadow-sm shadow-blue-600/20">
                                {String(category.id).padStart(2, "0")}
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
                                onClick={() => syncFormToCategory(category)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                              >
                                Sửa
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(category.id)}
                                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                <p>
                  Hiển thị{" "}
                  {Math.min(
                    (safePage - 1) * pageSize + 1,
                    filteredCategories.length,
                  )}{" "}
                  - {Math.min(safePage * pageSize, filteredCategories.length)} /{" "}
                  {filteredCategories.length || 0}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage <= 1}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ←
                  </button>
                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => goToPage(page)}
                      className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${page === safePage ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage >= totalPages}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <div className="rounded-3xl border border-blue-100 bg-white px-4 py-4 shadow-sm">
              <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-blue-700">
                Quản lý thông tin danh mục
              </div>
              <h2 className="mt-3 text-lg font-extrabold tracking-tight text-slate-950">
                Danh mục Tour
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Nhập tên danh mục rồi lưu để thêm danh mục.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Tổng danh mục
                </p>
                <p className="mt-2 text-2xl font-black leading-none text-slate-900">
                  {totalCategories}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Đang hoạt động
                </p>
                <p className="mt-2 text-2xl font-black leading-none text-slate-900">
                  {activeCategories}
                </p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Tên danh mục *
                </label>
                <input
                  value={formName}
                  onChange={(event) => setFormName(event.target.value)}
                  placeholder="Ví dụ: Du lịch biển"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800"
                >
                  Lưu
                </button>
              </div>
            </form>
          </aside>
        </div>
      </section>
    </div>
  );
};
