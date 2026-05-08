import React, { useMemo, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const initialDestinations = [
  { id: 1, cityName: "Bà Nà Hills", region: "Đà Nẵng", country: "Việt Nam" },
  { id: 2, cityName: "Vịnh Hạ Long", region: "Quảng Ninh", country: "Việt Nam" },
  { id: 3, cityName: "Thung lũng Mường Hoa", region: "Lào Cai", country: "Việt Nam" },
  { id: 4, cityName: "Phố cổ Hội An", region: "Quảng Nam", country: "Việt Nam" },
  { id: 5, cityName: "Nha Trang", region: "Khánh Hòa", country: "Việt Nam" },
  { id: 6, cityName: "Sapa", region: "Lào Cai", country: "Việt Nam" },
  { id: 7, cityName: "Đà Lạt", region: "Lâm Đồng", country: "Việt Nam" },
  { id: 8, cityName: "Phú Quốc", region: "Kiên Giang", country: "Việt Nam" },
];

const pageSize = 6;

const countryOptions = ["Việt Nam", "Thái Lan", "Hàn Quốc", "Singapore", "Nhật Bản"];

const destinationTone = (index) => {
  const variants = [
    "border-blue-200 bg-blue-50 text-blue-700",
    "border-emerald-200 bg-emerald-50 text-emerald-700",
    "border-amber-200 bg-amber-50 text-amber-700",
    "border-rose-200 bg-rose-50 text-rose-700",
  ];
  return variants[index % variants.length];
};

const initials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

export const TourDestinationPage = () => {
  const [destinations, setDestinations] = useState(initialDestinations);
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState(initialDestinations[0]?.id ?? null);
  const [cityName, setCityName] = useState(initialDestinations[0]?.cityName ?? "");
  const [region, setRegion] = useState(initialDestinations[0]?.region ?? "");
  const [country, setCountry] = useState(initialDestinations[0]?.country ?? "Việt Nam");
  const [expandedEditId, setExpandedEditId] = useState(null);
  const [editDraft, setEditDraft] = useState({ cityName: "", region: "", country: "Việt Nam" });

  const uniqueRegions = useMemo(
    () => Array.from(new Set(destinations.map((destination) => destination.region).filter(Boolean))),
    [destinations],
  );

  const filteredDestinations = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return destinations.filter((destination) => {
      const matchSearch =
        !keyword ||
        destination.cityName.toLowerCase().includes(keyword) ||
        destination.region.toLowerCase().includes(keyword) ||
        destination.country.toLowerCase().includes(keyword);
      const matchRegion = regionFilter === "ALL" || destination.region === regionFilter;
      return matchSearch && matchRegion;
    });
  }, [destinations, searchTerm, regionFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredDestinations.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedDestinations = filteredDestinations.slice((safePage - 1) * pageSize, safePage * pageSize);

  const totalDestinations = destinations.length;
  const totalCities = uniqueRegions.length;
  const totalCountries = useMemo(
    () => Array.from(new Set(destinations.map((destination) => destination.country))).length,
    [destinations],
  );

  const selectedDestination = destinations.find((destination) => destination.id === selectedId) || null;

  const syncFormToDestination = (destination) => {
    setSelectedId(destination.id);
    setCityName(destination.cityName);
    setRegion(destination.region || "");
    setCountry(destination.country || "");
  };

  const startInlineEdit = (destination) => {
    setExpandedEditId((currentId) => (currentId === destination.id ? null : destination.id));
    setEditDraft({
      cityName: destination.cityName || "",
      region: destination.region || "",
      country: destination.country || "Việt Nam",
    });
  };

  const saveInlineEdit = (destinationId) => {
    const nextCityName = editDraft.cityName.trim();
    const nextCountry = editDraft.country.trim();
    if (!nextCityName || !nextCountry) return;

    setDestinations((currentDestinations) =>
      currentDestinations.map((destination) =>
        destination.id === destinationId
          ? {
              ...destination,
              cityName: nextCityName,
              region: editDraft.region.trim(),
              country: nextCountry,
            }
          : destination,
      ),
    );
    setExpandedEditId(null);
  };

  const startCreate = () => {
    setSelectedId(null);
    setCityName("");
    setRegion("");
    setCountry("Việt Nam");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextCityName = cityName.trim();
    const nextCountry = country.trim();
    if (!nextCityName || !nextCountry) return;

    setDestinations((currentDestinations) => {
      const exists = currentDestinations.some((destination) => destination.id === selectedId);
      if (exists) {
        return currentDestinations.map((destination) =>
          destination.id === selectedId
            ? { ...destination, cityName: nextCityName, region: region.trim(), country: nextCountry }
            : destination,
        );
      }

      const nextId = Math.max(0, ...currentDestinations.map((destination) => destination.id)) + 1;
      setSelectedId(nextId);
      return [{ id: nextId, cityName: nextCityName, region: region.trim(), country: nextCountry }, ...currentDestinations];
    });
  };

  const handleReset = () => {
    if (selectedDestination) {
      syncFormToDestination(selectedDestination);
      return;
    }
    startCreate();
  };

  const handleDelete = (destinationId) => {
    setDestinations((currentDestinations) => {
      const nextDestinations = currentDestinations.filter((destination) => destination.id !== destinationId);
      const fallback = nextDestinations[0] || null;
      if (selectedId === destinationId) {
        setSelectedId(fallback?.id ?? null);
        setCityName(fallback?.cityName ?? "");
        setRegion(fallback?.region ?? "");
        setCountry(fallback?.country ?? "Việt Nam");
      }
      return nextDestinations;
    });
    if (expandedEditId === destinationId) {
      setExpandedEditId(null);
    }
  };

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(nextPage);
  };

  return (
    <div className="space-y-5 text-slate-700">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 bg-white px-6 py-6">
          <h2 className="text-3xl uppercase font-black tracking-tight text-blue-600 md:text-[42px]">
                Quản lý Tour / Điểm đến
          </h2>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">Cập nhật và điều chỉnh các địa danh trong hệ thống tour.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 px-6 py-6 lg:grid-cols-3">
          {[
            { label: "Tổng điểm đến", value: totalDestinations, accent: "from-blue-600 to-indigo-600", icon: "⌘" },
            { label: "Tỉnh / Thành phố", value: totalCities, accent: "from-slate-700 to-slate-900", icon: "⌂" },
            { label: "Quốc gia", value: totalCountries, accent: "from-rose-500 to-orange-500", icon: "↗" },
          ].map((card) => (
            <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
              <div className="flex items-center gap-4">
                <div className={`grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br ${card.accent} text-white shadow-lg shadow-blue-600/10`}>
                  <span className="text-lg font-black">{card.icon}</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
                  <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-5 px-6 pb-6 xl:grid-cols-[minmax(0,1.4fr)_420px]">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
                  <span className="text-slate-500">⌕</span>
                  <input
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Tìm tên điểm đến..."
                    className="w-56 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>
                <select
                  value={regionFilter}
                  onChange={(event) => {
                    setRegionFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
                >
                  <option value="ALL">Tất cả Tỉnh/Thành</option>
                  {uniqueRegions.map((regionItem) => (
                    <option key={regionItem} value={regionItem}>
                      {regionItem}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                ⤓ Xuất danh sách
              </button>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.22em] text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Ảnh</th>
                      <th className="px-5 py-4">Tên điểm đến</th>
                      <th className="px-5 py-4">Tỉnh / Thành</th>
                      <th className="px-5 py-4">Mô tả ngắn</th>
                      <th className="px-5 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDestinations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">Không tìm thấy điểm đến phù hợp.</td>
                      </tr>
                    ) : (
                      paginatedDestinations.map((destination, index) => (
                        <React.Fragment key={destination.id}>
                          <tr
                            className={`border-t border-slate-100 text-sm transition hover:bg-sky-50/60 ${expandedEditId === destination.id ? "bg-blue-50/70" : ""}`}
                          >
                            <td className="px-5 py-4">
                              <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${destinationTone(index)} font-black`}>
                                {initials(destination.cityName)}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-bold text-slate-950">{destination.cityName}</p>
                            </td>
                            <td className="px-5 py-4">
                              <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{destination.region || "Khác"}</span>
                            </td>
                            <td className="px-5 py-4 text-slate-600">
                              <div className="max-w-[280px] truncate">{destination.cityName} là điểm đến thuộc {destination.region || destination.country}.</div>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => startInlineEdit(destination)}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                                >
                                  <FiEdit2 />
                                  {expandedEditId === destination.id ? "Đóng" : "Sửa"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(destination.id)}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                                >
                                  <FiTrash2 />
                                  Xóa
                                </button>
                              </div>
                            </td>
                          </tr>

                          {expandedEditId === destination.id && (
                            <tr className="border-t border-slate-200 bg-slate-100/90">
                              <td colSpan={5} className="px-5 py-4">
                                <div className="rounded-2xl border border-slate-300 bg-slate-100 p-4">
                                  <div className="grid gap-3 md:grid-cols-3">
                                    <input
                                      value={editDraft.cityName}
                                      onChange={(event) =>
                                        setEditDraft((current) => ({ ...current, cityName: event.target.value }))
                                      }
                                      placeholder="Tên điểm đến"
                                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-400"
                                    />
                                    <input
                                      value={editDraft.region}
                                      onChange={(event) =>
                                        setEditDraft((current) => ({ ...current, region: event.target.value }))
                                      }
                                      placeholder="Tỉnh / Thành"
                                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-400"
                                    />
                                    <select
                                      value={editDraft.country}
                                      onChange={(event) =>
                                        setEditDraft((current) => ({ ...current, country: event.target.value }))
                                      }
                                      className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
                                    >
                                      {countryOptions.map((option) => (
                                        <option key={option} value={option}>
                                          {option}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="mt-3 flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedEditId(null)}
                                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                      Hủy
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => saveInlineEdit(destination.id)}
                                      className="rounded-xl border border-blue-700 bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                                    >
                                      Lưu thay đổi
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                <p>Hiển thị {Math.min((safePage - 1) * pageSize + 1, filteredDestinations.length)} - {Math.min(safePage * pageSize, filteredDestinations.length)} / trong tổng số {filteredDestinations.length}</p>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => goToPage(safePage - 1)} disabled={safePage <= 1} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">←</button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => goToPage(page)}
                      className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${page === safePage ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button type="button" onClick={() => goToPage(safePage + 1)} disabled={safePage >= totalPages} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">→</button>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <div>
              <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-blue-700">Quản lý điểm đến</div>
              <h2 className="mt-3 text-xl font-extrabold tracking-tight text-slate-950">Điểm đến</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Thêm mới hoặc chỉnh sửa tên địa danh theo khu vực.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Tên điểm đến</label>
                <input
                  value={cityName}
                  onChange={(event) => setCityName(event.target.value)}
                  placeholder="Ví dụ: Bà Nà Hills"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Tỉnh / Thành phố</label>
                <input
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                  placeholder="Ví dụ: Đà Nẵng"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Quốc gia</label>
                <select
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
                >
                  {countryOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">Xem trước</p>
                <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-lg font-black text-slate-950">{cityName.trim() || "Tên điểm đến"}</p>
                  <p className="mt-1 text-sm text-slate-600">{region.trim() || "Tỉnh / Thành phố"}</p>
                  <p className="mt-1 text-sm text-slate-500">{country.trim() || "Quốc gia"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={handleReset} className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">Hủy</button>
                <button type="submit" className="flex-1 rounded-2xl border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800">{selectedDestination ? "Cập nhật" : "Lưu điểm đến"}</button>
              </div>
            </form>
          </aside>
        </div>
      </section>
    </div>
  );
};