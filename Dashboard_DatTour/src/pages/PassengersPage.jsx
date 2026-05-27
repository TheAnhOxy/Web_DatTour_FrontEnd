import { useEffect, useMemo, useState } from "react";
import { MiniStatSquares } from "../components/MiniStatSquares";
import authApi from "../api/authApi";
import bookingApi from "../api/bookingApi";

export const PassengersPage = () => {
  const [activeTab, setActiveTab] = useState("USERS");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [selected, setSelected] = useState(null); // { user, bookings }
  const [showModal, setShowModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [guestRows, setGuestRows] = useState([]);
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestQuery, setGuestQuery] = useState("");
  const [guestStatusFilter, setGuestStatusFilter] = useState("ALL");
  const [guestPage, setGuestPage] = useState(1);
  const [guestSelected, setGuestSelected] = useState(null);
  const [guestShowModal, setGuestShowModal] = useState(false);
  const pageSize = 10;

  const formatDateTime = (value) => {
    if (!value) return "-";
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "-";
    const date = dt.toLocaleDateString("vi-VN");
    const time = dt.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${date} ${time}`;
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleDateString("vi-VN");
  };

  const formatMoney = (value) => {
    if (value === null || value === undefined) return "-";
    const num = Number(value);
    if (Number.isNaN(num)) return "-";
    return `${num.toLocaleString("vi-VN")} đ`;
  };

  const statusTone = (status) => {
    const s = String(status || "").toUpperCase();
    if (s.startsWith("CANCEL")) {
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-100";
    }
    if (s === "CONFIRMED") {
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
    }
    if (s === "PENDING") {
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
    }
    return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  };

  const statusLabel = (status) => {
    const s = String(status || "").toUpperCase();
    if (s.startsWith("CANCEL")) return "Đã hủy";
    if (s === "CONFIRMED") return "Đã xác nhận";
    if (s === "PENDING") return "Chờ thanh toán";
    return status || "-";
  };

  const ageGroupLabel = (value) => {
    const v = String(value || "").toUpperCase();
    if (v === "ADULT") return "Người lớn";
    if (v === "CHILD" || v === "CHILDREN" || v === "CHILD_4_9") return "Trẻ em";
    if (v === "CHILD_10_14") return "Trẻ em";
    if (v === "BABY" || v === "INFANT") return "Em bé";
    return value || "-";
  };

  const ageGroupTone = (value) => {
    const v = String(value || "").toUpperCase();
    if (v === "ADULT") return "bg-slate-100 text-slate-700";
    if (
      v === "CHILD" ||
      v === "CHILDREN" ||
      v === "CHILD_4_9" ||
      v === "CHILD_10_14"
    ) {
      return "bg-amber-50 text-amber-700";
    }
    if (v === "BABY" || v === "INFANT") return "bg-sky-50 text-sky-700";
    return "bg-slate-100 text-slate-600";
  };

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

  const fetchGuestBookings = async () => {
    setGuestLoading(true);
    try {
      const res = await bookingApi.getGuestBookingsForAdmin();
      setGuestLoading(false);
      if (res && res.status === 200) {
        const list = Array.isArray(res.data) ? res.data : res.data || [];
        setGuestRows(list);
      } else {
        setGuestRows([]);
        setToast({
          type: "error",
          message: res?.message || "Không tải được danh sách khách vãng lai",
        });
        setTimeout(() => setToast(null), 3500);
      }
    } catch (err) {
      setGuestLoading(false);
      setGuestRows([]);
      setToast({
        type: "error",
        message: err?.message || "Lỗi khi gọi API khách vãng lai",
      });
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

  useEffect(() => {
    if (activeTab !== "GUESTS") return;
    if (guestRows.length > 0) return;
    fetchGuestBookings();
  }, [activeTab, guestRows.length]);

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

  useEffect(() => {
    setUserPage(1);
  }, [query, rows.length]);

  const filteredGuests = useMemo(() => {
    const q = guestQuery.trim().toLowerCase();
    return (guestRows || []).filter((item) => {
      const s = String(item.status || "").toUpperCase();
      if (guestStatusFilter !== "ALL") {
        if (guestStatusFilter === "CANCELLED") {
          if (!s.startsWith("CANCEL")) return false;
        } else if (s !== guestStatusFilter) {
          return false;
        }
      }
      if (!q) return true;
      const hay =
        `${item.bookingCode || ""} ${item.contactName || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [guestRows, guestQuery, guestStatusFilter]);

  useEffect(() => {
    setGuestPage(1);
  }, [guestQuery, guestStatusFilter, guestRows.length]);

  const userTotalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const guestTotalPages = Math.max(
    1,
    Math.ceil(filteredGuests.length / pageSize),
  );

  const pagedUsers = filtered.slice(
    (userPage - 1) * pageSize,
    userPage * pageSize,
  );
  const pagedGuests = filteredGuests.slice(
    (guestPage - 1) * pageSize,
    guestPage * pageSize,
  );

  return (
    <div className="space-y-4">
      {activeTab === "USERS" ? (
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
      ) : (
        <MiniStatSquares
          items={[
            { label: "Guest Bookings", value: guestRows.length, badge: "All" },
            {
              label: "Chờ thanh toán",
              value: guestRows.filter(
                (b) => String(b.status || "").toUpperCase() === "PENDING",
              ).length,
              badge: "Pending",
            },
            {
              label: "Đã hủy",
              value: guestRows.filter((b) =>
                String(b.status || "")
                  .toUpperCase()
                  .startsWith("CANCEL"),
              ).length,
              badge: "Cancelled",
            },
          ]}
        />
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab("USERS")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${activeTab === "USERS" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
        >
          Hành khách (User)
        </button>
        <button
          onClick={() => setActiveTab("GUESTS")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${activeTab === "GUESTS" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
        >
          Khách vãng lai
        </button>
      </div>

      {activeTab === "USERS" ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
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
                  pagedUsers.map((row) => (
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
            <div>
              Hiển thị {(userPage - 1) * pageSize + 1} -{" "}
              {Math.min(userPage * pageSize, filtered.length)} trên{" "}
              {filtered.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                disabled={userPage === 1}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs disabled:opacity-50"
              >
                Trước
              </button>
              <span className="text-xs text-slate-500">
                {userPage}/{userTotalPages}
              </span>
              <button
                onClick={() =>
                  setUserPage((p) => Math.min(userTotalPages, p + 1))
                }
                disabled={userPage === userTotalPages}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3">
            <input
              value={guestQuery}
              onChange={(e) => setGuestQuery(e.target.value)}
              placeholder="Tìm theo mã đơn / tên khách"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
            <select
              value={guestStatusFilter}
              onChange={(e) => setGuestStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <button
              onClick={fetchGuestBookings}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
            >
              Reload
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                    Mã Đơn
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                    Khách Đặt
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                    Tour Đăng Ký
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]">
                    Ngày Khởi Hành
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em]">
                    Tổng Tiền
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
                {guestLoading ? (
                  <tr>
                    <td colSpan={7} className="p-4">
                      Đang tải...
                    </td>
                  </tr>
                ) : filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4">
                      Không có đơn đặt tour
                    </td>
                  </tr>
                ) : (
                  pagedGuests.map((item) => (
                    <tr
                      key={item.bookingCode || item.id}
                      className="border-t border-slate-100 transition-colors hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-indigo-700 font-mono">
                          {item.bookingCode || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-slate-900">
                          {item.contactName || "-"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.contactPhone || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-[260px] truncate text-sm font-medium text-slate-900">
                          {item.priceSnapshot?.tourTitle || "-"}
                        </div>
                        <span className="inline-flex mt-1 items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                          {item.priceSnapshot?.cityName || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {formatDateTime(item.priceSnapshot?.startDate)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">
                        {formatMoney(item.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(item.status)}`}
                        >
                          {statusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setGuestSelected(item);
                            setGuestShowModal(true);
                          }}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:bg-slate-50"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
            <div>
              Hiển thị {(guestPage - 1) * pageSize + 1} -{" "}
              {Math.min(guestPage * pageSize, filteredGuests.length)} trên{" "}
              {filteredGuests.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGuestPage((p) => Math.max(1, p - 1))}
                disabled={guestPage === 1}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs disabled:opacity-50"
              >
                Trước
              </button>
              <span className="text-xs text-slate-500">
                {guestPage}/{guestTotalPages}
              </span>
              <button
                onClick={() =>
                  setGuestPage((p) => Math.min(guestTotalPages, p + 1))
                }
                disabled={guestPage === guestTotalPages}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}

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

      {guestShowModal && guestSelected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Chi tiết đơn đặt tour
                </div>
                <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <span>
                    Chi Tiết Đơn Đặt Tour - {guestSelected.bookingCode || "-"}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(guestSelected.status)}`}
                  >
                    {statusLabel(guestSelected.status)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Ngày tạo: {formatDateTime(guestSelected.createdAt)}
                </div>
              </div>
              <button
                onClick={() => setGuestShowModal(false)}
                className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 gap-5 border-b border-slate-100 p-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="text-xs font-semibold uppercase text-slate-500">
                      Thông tin liên hệ
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      <div>
                        <div className="text-xs text-slate-500">Người đặt</div>
                        <div className="font-semibold text-slate-900">
                          {guestSelected.contactName || "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Email</div>
                        <div className="font-medium text-slate-900">
                          {guestSelected.contactEmail || "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">
                          Số điện thoại
                        </div>
                        <div className="font-medium text-slate-900">
                          {guestSelected.contactPhone || "-"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="text-xs font-semibold uppercase text-slate-500">
                      Thanh toán
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-700">
                      <div>
                        <div className="text-xs text-slate-500">
                          Phương thức
                        </div>
                        <div className="font-semibold text-slate-900">
                          {guestSelected.paymentMethod || "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">
                          Hạn thanh toán
                        </div>
                        <div className="font-semibold text-slate-900">
                          {formatDateTime(guestSelected.paymentDueAt)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">
                          Số tiền đã trả
                        </div>
                        <div className="font-semibold text-slate-900">
                          {formatMoney(guestSelected.paidAmount)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="text-xs font-semibold uppercase text-slate-500">
                      Thông tin tour
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      <div>
                        <div className="text-xs text-slate-500">Tên tour</div>
                        <div className="font-semibold text-slate-900">
                          {guestSelected.priceSnapshot?.tourTitle || "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Điểm đến</div>
                        <div className="font-semibold text-slate-900">
                          {guestSelected.priceSnapshot?.cityName || "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">
                          Ngày khởi hành
                        </div>
                        <div className="font-semibold text-slate-900">
                          {formatDateTime(
                            guestSelected.priceSnapshot?.startDate,
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="text-xs font-semibold uppercase text-slate-500">
                      Điểm đón
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      <div>
                        <div className="text-xs text-slate-500">
                          Tên điểm đón
                        </div>
                        <div className="font-semibold text-slate-900">
                          {guestSelected.priceSnapshot?.pickupName || "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">
                          Địa chỉ đón
                        </div>
                        <div className="font-semibold text-slate-900">
                          {guestSelected.priceSnapshot?.pickupAddress || "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">
                          Thời gian đón
                        </div>
                        <div className="font-semibold text-slate-900">
                          {formatDateTime(
                            guestSelected.priceSnapshot?.pickupTime,
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-3 text-sm font-semibold text-slate-800">
                  Danh sách hành khách
                </div>
                {Array.isArray(guestSelected.passengers) &&
                guestSelected.passengers.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {guestSelected.passengers.map((p, idx) => (
                      <div
                        key={p.id || idx}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {p.fullName || "-"}
                            </div>
                            <div className="text-xs text-slate-500">
                              {p.gender || "-"} • {formatDate(p.dob)}
                            </div>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ageGroupTone(p.ageGroup)}`}
                          >
                            {ageGroupLabel(p.ageGroup)}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                          CCCD/Hộ chiếu
                        </div>
                        <div className="text-sm font-medium text-slate-800">
                          {p.idCardNumber || p.passportNumber || "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">
                    Chưa có hành khách.
                  </div>
                )}
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
