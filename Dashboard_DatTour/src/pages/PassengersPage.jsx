import { useEffect, useMemo, useState } from "react";
import { MiniStatSquares } from "../components/MiniStatSquares";
import authApi from "../api/authApi";
import bookingApi from "../api/bookingApi";

export const PassengersPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null); // { user, bookings }
  const [showModal, setShowModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchPassengers = async () => {
    setLoading(true);
    try {
      const res = await authApi.getUsersWithBookings();
      setLoading(false);
      if (res && res.status === 200) {
        const list = Array.isArray(res.data) ? res.data : res.data || [];
        const mapped = list
          .map((item) => ({
            user: item.user || item,
            bookings: item.bookings || [],
          }))
          .filter(
            (x) => x.user && x.user.id !== undefined && x.user.id !== null,
          );

        setRows(mapped);
      } else {
        setRows([]);
        setToast({
          type: "error",
          message: res?.message || "Không tải được danh sách users",
        });
        setTimeout(() => setToast(null), 3500);
      }
    } catch (err) {
      setLoading(false);
      console.error("fetchPassengers err", err);
      setRows([]);
      setToast({ type: "error", message: err?.message || "Lỗi khi gọi API" });
      setTimeout(() => setToast(null), 3500);
    }
  };

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) fetchPassengers();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const openDetail = async (row) => {
    setSelected(row);
    setShowModal(true);
    // Ensure we load bookings from the 2nd API: /bookings/by-users
    setDetailLoading(true);
    try {
      const res = await bookingApi.getBookingsByUsers(row.user.id);
      setDetailLoading(false);
      if (res && res.status === 200) {
        const data = res.data || {};
        const bookings = data[String(row.user.id)] || [];
        setSelected((prev) => (prev ? { ...prev, bookings } : prev));
      } else {
        setToast({
          type: "error",
          message: res?.message || "Không lấy được bookings",
        });
        setTimeout(() => setToast(null), 3500);
      }
    } catch (err) {
      setDetailLoading(false);
      setToast({
        type: "error",
        message: err?.message || "Lỗi khi lấy bookings",
      });
      setTimeout(() => setToast(null), 3500);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(({ user }) => {
      const hay =
        `${user.fullName || ""} ${user.email || ""} ${user.phone || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query]);

  return (
    <div className="space-y-4">
      <MiniStatSquares
        items={[
          { label: "Users", value: rows.length, badge: "All" },
          {
            label: "Hoạt động",
            value: rows.filter((r) => r.user?.status === "ACTIVE").length,
            badge: "Live",
          },
          {
            label: "Bookings",
            value: rows.reduce((s, r) => s + (r.bookings?.length || 0), 0),
            badge: "Trips",
          },
        ]}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="text-sm font-semibold text-slate-800">
            Passengers (Users + Bookings)
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tên / email / phone"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={fetchPassengers}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
            >
              Reload
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Tên Hành Khách
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Điện Thoại
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Số Booking
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Trạng Thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4">
                    Đang tải...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4">
                    Không có hành khách
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.user.id}
                    className="border-t border-slate-100 transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-900">
                        {row.user.fullName || row.user.email}
                      </div>
                      <div className="text-xs text-slate-500">
                        {Array.isArray(row.user.roles)
                          ? row.user.roles.join(", ")
                          : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {row.user.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {row.user.phone || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {(row.bookings || []).length}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.user.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                      >
                        {row.user.status || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDetail(row)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:bg-slate-50"
                        >
                          Chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selected && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-linear-to-r from-sky-600 to-indigo-600 text-white">
              <div>
                <div className="text-xs uppercase tracking-wide text-white/80">
                  Chi tiết user
                </div>
                <div className="text-base font-semibold">
                  {selected.user.fullName || selected.user.email}
                </div>
                <div className="text-xs text-white/80">
                  {selected.user.phone || ""}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openDetail(selected)}
                  className="rounded-md bg-white/20 px-3 py-1 text-sm"
                >
                  Reload bookings
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-md bg-white/20 px-3 py-1 text-sm"
                >
                  Đóng
                </button>
              </div>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-1 rounded-xl border border-slate-200 p-4 bg-white">
                <div className="text-xs text-slate-500">Email</div>
                <div className="font-semibold text-slate-900">
                  {selected.user.email}
                </div>
                <div className="mt-3 text-xs text-slate-500">Địa chỉ</div>
                <div className="text-sm text-slate-700">
                  {selected.user.address || "-"}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-500">DOB</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {selected.user.dob || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Gender</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {selected.user.gender || "-"}
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-500">Status</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {selected.user.status || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Roles</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {Array.isArray(selected.user.roles)
                        ? selected.user.roles.join(", ")
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 rounded-xl border border-slate-200 p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">
                    Danh sách tour đã book
                  </div>
                  {detailLoading && (
                    <div className="text-sm text-slate-500">Đang tải...</div>
                  )}
                </div>
                <div className="mt-3 space-y-3 max-h-[55vh] overflow-auto pr-1">
                  {Array.isArray(selected.bookings) &&
                  selected.bookings.length > 0 ? (
                    selected.bookings.map((bk) => (
                      <div
                        key={bk.bookingCode || bk.id}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              {bk.tourTitle || bk.tour || bk.title || "-"}
                            </div>
                            <div className="text-xs text-slate-500">
                              {bk.bookingCode} • {bk.status}
                            </div>
                          </div>
                          <div className="text-sm text-slate-600">
                            {bk.startDate
                              ? new Date(bk.startDate).toLocaleDateString()
                              : ""}
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-slate-500">Total:</span>{" "}
                            <span className="font-semibold">
                              {bk.totalAmount ?? "-"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Created:</span>{" "}
                            <span className="font-semibold">
                              {bk.createdAt
                                ? new Date(bk.createdAt).toLocaleString()
                                : "-"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Passengers:</span>{" "}
                            <span className="font-semibold">
                              {Array.isArray(bk.passengers)
                                ? bk.passengers.length
                                : "-"}
                            </span>
                          </div>
                        </div>
                        {Array.isArray(bk.passengers) &&
                          bk.passengers.length > 0 && (
                            <div className="mt-3 rounded-lg bg-slate-50 p-3">
                              <div className="text-xs font-semibold text-slate-600 mb-2">
                                Hành khách
                              </div>
                              <div className="space-y-2">
                                {bk.passengers.map((p, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <div className="font-medium text-slate-800">
                                      {p.fullName}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {p.ageGroup} • {p.gender} •{" "}
                                      {p.idCardNumber || "No ID"}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-500">
                      Chưa có booking.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed right-6 bottom-6 z-60 rounded-md px-4 py-3 shadow-md ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}
        >
          <div className="flex items-center gap-3">
            <div className="flex-1">{toast.message}</div>
          </div>
        </div>
      )}
    </div>
  );
};
