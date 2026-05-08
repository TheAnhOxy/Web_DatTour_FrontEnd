import React, { useEffect, useMemo, useState } from "react";
import { MiniStatSquares } from "../components/MiniStatSquares";
import Icon from "../components/Icon";
import paymentApi from "../api/paymentApi";

const normalizeStatus = (status) => String(status || "").toUpperCase();

const PaymentStatusPill = ({ status }) => {
  const s = normalizeStatus(status);
  const map = {
    SUCCESS: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    FAILED: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
    CANCELLED: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[s] || "bg-slate-50 text-slate-700"}`}
    >
      {status || "-"}
    </span>
  );
};

const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return String(value);
  return n.toLocaleString("vi-VN");
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("vi-VN");
};

const PRICE_LABELS = {
  id: "ID",
  departureId: "Mã lịch khởi hành",
  adultPrice: "Giá người lớn",
  child49Price: "Giá trẻ em (4-9)",
  child1014Price: "Giá trẻ em (10-14)",
  babyPrice: "Giá em bé",
};

export const PaymentPage = () => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 7;

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [toast, setToast] = useState(null);

  const [detail, setDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await paymentApi.getPaymentReport();
      setLoading(false);
      if (res && res.status === 200) {
        const data = Array.isArray(res.data) ? res.data : res.data || [];
        setItems(data);
      } else {
        setItems([]);
        setToast({
          type: "error",
          message: res?.message || "Không tải được payment report",
        });
        setTimeout(() => setToast(null), 4000);
      }
    } catch (err) {
      setLoading(false);
      setItems([]);
      setToast({ type: "error", message: err?.message || "Lỗi khi gọi API" });
      setTimeout(() => setToast(null), 4000);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const stats = useMemo(() => {
    const list = items || [];
    const success = list.filter(
      (x) => normalizeStatus(x.paymentStatus) === "SUCCESS",
    ).length;
    const pending = list.filter(
      (x) => normalizeStatus(x.paymentStatus) === "PENDING",
    ).length;
    const failed = list.filter((x) =>
      ["FAILED", "CANCELLED"].includes(normalizeStatus(x.paymentStatus)),
    ).length;
    const totalRevenue = list
      .filter((x) => normalizeStatus(x.paymentStatus) === "SUCCESS")
      .reduce(
        (sum, x) =>
          sum +
          (typeof x.amount === "number" ? x.amount : Number(x.amount) || 0),
        0,
      );
    return { success, pending, failed, totalRevenue };
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items || []).filter((x) => {
      const s = normalizeStatus(x.paymentStatus);
      if (statusFilter !== "ALL" && s !== statusFilter) return false;
      if (!q) return true;
      const bookingCode =
        x?.bookingDetails?.bookingCode || x?.transactionId || "";
      const customerName =
        x?.customerDetails?.fullName || x?.customerDetails?.email || "";
      const hay =
        `${x.transactionId || ""} ${bookingCode} ${customerName} ${x.paymentMethodName || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page],
  );

  const pageButtons = useMemo(() => {
    if (totalPages <= 2)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 1) return [1, 2];
    if (page >= totalPages) return [totalPages - 1, totalPages];
    return [page, Math.min(totalPages, page + 1)];
  }, [page, totalPages]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const openDetail = async (row) => {
    setShowDetailModal(true);
    setDetail(row);

    // If paymentUrl is missing, try to fetch from payment-service by transactionId (bookingCode)
    const txn = row?.transactionId;
    if (!txn || row?.paymentUrl) return;

    setDetailLoading(true);
    try {
      const res = await paymentApi.getPaymentByTransactionId(txn);
      setDetailLoading(false);
      if (res && res.status === 200) {
        const data = res.data || res;
        setDetail((prev) => ({ ...(prev || {}), ...(data || {}) }));
      }
    } catch {
      setDetailLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <MiniStatSquares
          items={[
            { label: "Thành công", value: stats.success, badge: "OK" },
            { label: "Chờ xử lý", value: stats.pending, badge: "WAIT" },
            { label: "Thất bại", value: stats.failed, badge: "FAIL" },
            {
              label: "Tổng thu",
              value: formatMoney(stats.totalRevenue),
              badge: "VNĐ",
            },
          ]}
        />

        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
          <div className="mb-3 text-sm text-slate-500">
            {loading ? "Đang tải payment report..." : ""}
          </div>
          <div className="flex items-center justify-between mb-3 gap-3">
            <div className="flex items-center gap-3 w-full">
              <div className="relative flex-1">
                <Icon
                  name="search"
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Tìm transactionId, bookingCode, khách hàng..."
                  className="rounded-lg border bg-slate-50 pl-9 pr-3 py-2 text-sm w-full focus:outline-none"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border bg-slate-50 px-3 py-2 text-sm"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="PENDING">PENDING</option>
                <option value="FAILED">FAILED</option>
              </select>
              <button
                onClick={fetchReport}
                disabled={loading}
                className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
                title="Reload"
              >
                <span className="inline-flex items-center gap-2">
                  <Icon name="refresh" className="h-4 w-4" />
                  Refresh
                </span>
              </button>
            </div>
            <div className="text-sm text-slate-500">
              Hiển thị {filtered.length} kết quả
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100 relative">
            {loading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-500 border-t-transparent" />
              </div>
            )}
            <table className="w-full table-auto text-sm">
              <thead className="text-xs text-slate-500 bg-slate-50 border-b">
                <tr>
                  <th className="p-3 text-left">Transaction</th>
                  <th className="p-3 text-left">Khách hàng</th>
                  <th className="p-3 text-left">Số tiền</th>
                  <th className="p-3 text-left">Phương thức</th>
                  <th className="p-3 text-left">Paid at</th>
                  <th className="p-3 text-left">Trạng thái</th>
                  <th className="p-3 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center">
                      Không có kết quả
                    </td>
                  </tr>
                ) : (
                  paged.map((x) => {
                    const bookingCode =
                      x?.bookingDetails?.bookingCode || x?.transactionId;
                    const customer = x?.customerDetails;
                    return (
                      <tr
                        key={x.id || x.transactionId}
                        className="border-b last:border-0 odd:bg-white even:bg-slate-50/50 hover:bg-sky-50/40 transition"
                      >
                        <td className="p-3">
                          <div className="font-semibold">
                            {x.transactionId || "-"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {bookingCode ? `Booking: ${bookingCode}` : ""}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold">
                            {customer?.fullName || customer?.email || "-"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {customer?.phone || "-"}
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-sky-600">
                          {formatMoney(x.amount)}
                        </td>
                        <td className="p-3 text-slate-600">
                          {x.paymentMethodName || "-"}
                        </td>
                        <td className="p-3 text-slate-600">
                          {formatDateTime(x.paidAt)}
                        </td>
                        <td className="p-3">
                          <PaymentStatusPill status={x.paymentStatus} />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openDetail(x)}
                              className="rounded-full border px-2 py-1 text-xs bg-white hover:bg-slate-50"
                              title="Xem chi tiết"
                            >
                              <Icon name="eye" className="h-4 w-4" />
                            </button>
                            {x.paymentUrl ? (
                              <a
                                href={x.paymentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-md border px-2 py-1 text-xs hover:bg-slate-50"
                                title="Mở link thanh toán"
                              >
                                Pay
                              </a>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Hiển thị {paged.length} trên {filtered.length} giao dịch
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-sm hover:bg-slate-50 transition disabled:opacity-50"
              >
                <Icon name="chev-left" className="h-4 w-4" />
                <Icon name="chev-left" className="h-4 w-4 -ml-1" />
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-sm hover:bg-slate-50 transition disabled:opacity-50"
              >
                <Icon name="chev-left" className="h-4 w-4" />
              </button>
              {pageButtons.map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-md border px-3 py-1 text-sm transition ${p === page ? "bg-sky-600 text-white" : "hover:bg-slate-50"}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-sm hover:bg-slate-50 transition disabled:opacity-50"
              >
                <Icon name="chev-right" className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-sm hover:bg-slate-50 transition disabled:opacity-50"
              >
                <Icon name="chev-right" className="h-4 w-4" />
                <Icon name="chev-right" className="h-4 w-4 -ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Detail modal */}
        {showDetailModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-6 overflow-y-auto">
            <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl max-h-[calc(100vh-3rem)] flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 rounded-t-2xl bg-linear-to-r from-sky-600 to-indigo-600 text-white">
                <div>
                  <div className="text-xs uppercase tracking-wide text-white/80">
                    Chi tiết payment
                  </div>
                  <h3 className="text-base font-semibold">
                    {detail?.transactionId || "-"}
                  </h3>
                  <div className="text-xs text-white/80">
                    {detail?.bookingDetails?.tourTitle || ""}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="rounded-md bg-white/20 px-2 py-1 text-white hover:bg-white/30"
                  >
                    <Icon name="x" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 overflow-y-auto overscroll-contain">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-500">
                      Trạng thái payment
                    </div>
                    <div className="font-semibold">
                      <PaymentStatusPill status={detail?.paymentStatus} />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Phương thức</div>
                    <div className="font-semibold">
                      {detail?.paymentMethodName || detail?.gateway || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Số tiền</div>
                    <div className="font-semibold text-sky-700">
                      {formatMoney(detail?.amount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Paid at</div>
                    <div className="font-semibold">
                      {formatDateTime(detail?.paidAt)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {detail?.paymentUrl ? (
                    <a
                      href={detail.paymentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md bg-sky-600 px-3 py-2 text-sm text-white hover:bg-sky-700"
                    >
                      Mở link thanh toán
                    </a>
                  ) : (
                    <button
                      disabled
                      className="rounded-md bg-slate-200 px-3 py-2 text-sm text-slate-500"
                    >
                      Không có paymentUrl
                    </button>
                  )}
                  {detailLoading ? (
                    <div className="text-sm text-slate-500">
                      Đang lấy paymentUrl...
                    </div>
                  ) : null}
                </div>

                {/* Booking details */}
                {detail?.bookingDetails && (
                  <div className="mt-5 rounded-xl border border-slate-100 bg-white p-4">
                    <div className="text-sm font-semibold mb-2">Booking</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-500 mr-2">
                          Booking code:
                        </span>{" "}
                        <span className="font-medium">
                          {detail.bookingDetails.bookingCode || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 mr-2">Trạng thái:</span>{" "}
                        <span className="font-medium">
                          {detail.bookingDetails.status || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 mr-2">Tổng tiền:</span>{" "}
                        <span className="font-medium">
                          {formatMoney(detail.bookingDetails.totalAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 mr-2">Ngày tạo:</span>{" "}
                        <span className="font-medium">
                          {formatDateTime(detail.bookingDetails.createdAt)}
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-slate-500 mr-2">Tour:</span>{" "}
                        <span className="font-medium">
                          {detail.bookingDetails.tourTitle || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 mr-2">Ngày đi:</span>{" "}
                        <span className="font-medium">
                          {formatDateTime(detail.bookingDetails.startDate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 mr-2">User ID:</span>{" "}
                        <span className="font-medium">
                          {detail.bookingDetails.userId ?? "-"}
                        </span>
                      </div>
                    </div>

                    {detail.bookingDetails.priceDetail && (
                      <div className="mt-4">
                        <div className="text-sm font-semibold mb-2">
                          Chi tiết giá
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-700">
                          {Object.entries(
                            detail.bookingDetails.priceDetail,
                          ).map(([k, v]) => (
                            <div key={k}>
                              <span className="text-slate-500 mr-2">
                                {PRICE_LABELS[k] || k}:
                              </span>{" "}
                              <span className="font-medium">
                                {formatMoney(v)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {Array.isArray(detail.bookingDetails.passengers) &&
                      detail.bookingDetails.passengers.length > 0 && (
                        <div className="mt-5">
                          <div className="text-sm font-semibold mb-2">
                            Passengers
                          </div>
                          <div className="space-y-2">
                            {detail.bookingDetails.passengers.map((p, idx) => (
                              <div key={idx} className="rounded-md border p-3">
                                <div className="font-semibold">
                                  {p.fullName || "-"}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {p.idCardNumber || "No ID"} •{" "}
                                  {p.ageGroup || "-"} • {p.gender || "-"} •{" "}
                                  {p.dob || "-"}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* Customer details */}
                {detail?.customerDetails && (
                  <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="text-sm font-semibold mb-2">Khách hàng</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-700">
                      <div>
                        <span className="text-slate-500 mr-2">Họ tên:</span>{" "}
                        <span className="font-medium">
                          {detail.customerDetails.fullName || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 mr-2">SĐT:</span>{" "}
                        <span className="font-medium">
                          {detail.customerDetails.phone || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 mr-2">Email:</span>{" "}
                        <span className="font-medium">
                          {detail.customerDetails.email || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 mr-2">Trạng thái:</span>{" "}
                        <span className="font-medium">
                          {detail.customerDetails.status || "-"}
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-slate-500 mr-2">Địa chỉ:</span>{" "}
                        <span className="font-medium">
                          {detail.customerDetails.address || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 mr-2">Ngày sinh:</span>{" "}
                        <span className="font-medium">
                          {detail.customerDetails.dob || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 mr-2">Giới tính:</span>{" "}
                        <span className="font-medium">
                          {detail.customerDetails.gender || "-"}
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-slate-500 mr-2">Roles:</span>{" "}
                        <span className="font-medium">
                          {Array.isArray(detail.customerDetails.roles)
                            ? detail.customerDetails.roles.join(", ")
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="rounded-md border px-3 py-2 text-sm"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div
            className={`fixed right-6 bottom-6 z-60 rounded-md px-4 py-3 shadow-md ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex-1">{toast.message}</div>
              {toast.type === "error" ? (
                <button
                  onClick={fetchReport}
                  className="rounded-md bg-white/20 px-2 py-1 text-white text-xs"
                >
                  Retry
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
