import React, { useMemo, useState, useEffect } from 'react';
import Icon from '../components/Icon';
import bookingApi from '../api/bookingApi';
import authApi from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { recentBookings } from '../data/adminMockData';

const StatusPill = ({ status }) => {
  const s = String(status || '').toUpperCase();
  const map = {
    CONFIRMED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    PENDING: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
    CANCELLED: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
    COMPLETED: 'bg-sky-50 text-sky-700 ring-1 ring-sky-100',
  };
  const tone = s.startsWith('CANCEL') ? map.CANCELLED : (map[s] || 'bg-slate-50 text-slate-700');
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${tone}`}>{status}</span>;
};

const KPI = ({ title, value, note, gradient }) => (
  <div className="rounded-xl border bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-xs text-slate-400">{title}</div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-xs text-slate-500 mt-1">{note}</div>
      </div>
      <div className={`h-10 w-10 rounded-md ${gradient} flex items-center justify-center text-white`}>📊</div>
    </div>
  </div>
);

const getBookingUserId = (booking) => (
  booking?.userId ||
  booking?.userID ||
  booking?.idUser ||
  booking?.user_id ||
  booking?.user?.id ||
  booking?.bookerId ||
  booking?.bookerID ||
  booking?.booker_id ||
  booking?.booker?.id ||
  booking?.customerId ||
  booking?.customerID ||
  booking?.customer_id ||
  booking?.customer?.id ||
  booking?.accountId ||
  booking?.accountID ||
  booking?.account_id ||
  null
);

const getCustomerNameRaw = (booking) => (
  booking?.passengers?.[0]?.fullName ||
  booking?.customer ||
  booking?.customer?.fullName ||
  booking?.customer?.name ||
  booking?.customer?.email ||
  booking?.customerName ||
  booking?.customer_full_name ||
  booking?.bookerName ||
  booking?.booker?.fullName ||
  booking?.booker?.name ||
  booking?.booker?.email ||
  booking?.bookerFullName ||
  booking?.booker_full_name ||
  booking?.userFullName ||
  booking?.fullName ||
  booking?.user?.fullName ||
  booking?.user?.fullname ||
  booking?.user?.full_name ||
  booking?.user?.name ||
  booking?.bookingUser?.fullName ||
  booking?.account?.fullName ||
  booking?.userEmail ||
  booking?.email ||
  booking?.user?.email ||
  booking?.bookingUser?.email ||
  booking?.account?.email ||
  '-'
);

const getCustomerPhoneRaw = (booking) => (
  booking?.phone ||
  booking?.customer?.phone ||
  booking?.customer?.phoneNumber ||
  booking?.booker?.phone ||
  booking?.booker?.phoneNumber ||
  booking?.customerPhone ||
  booking?.customer_phone ||
  booking?.userPhone ||
  booking?.user?.phone ||
  booking?.user?.phoneNumber ||
  booking?.bookingUser?.phone ||
  booking?.account?.phone ||
  '-'
);

const getTourTitle = (booking) => (
  booking?.tourTitle ||
  booking?.tourName ||
  booking?.tour?.title ||
  booking?.tour?.name ||
  booking?.tour ||
  '-'
);

const normalizeStatus = (status) => String(status || '').toUpperCase();

const PRICE_LABELS = {
  id: 'ID',
  departureId: 'Mã lịch khởi hành',
  adultPrice: 'Giá người lớn',
  child49Price: 'Giá trẻ em (4-9)',
  child1014Price: 'Giá trẻ em (10-14)',
  babyPrice: 'Giá em bé',
};

const BookingsPage = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [userById, setUserById] = useState({});
  const [detailByCode, setDetailByCode] = useState({});
  const [toast, setToast] = useState(null);
  const [detail, setDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [lastDetailCode, setLastDetailCode] = useState(null);
  const pageSize = 7;

  const getCustomerName = (booking) => {
    const raw = getCustomerNameRaw(booking);
    if (raw && raw !== '-') return raw;
    const uid = getBookingUserId(booking);
    const cached = uid != null ? userById[String(uid)] : null;
    return cached?.fullName || cached?.email || (uid != null ? `User #${uid}` : '-');
  };

  const getCustomerPhone = (booking) => {
    const raw = getCustomerPhoneRaw(booking);
    if (raw && raw !== '-') return raw;
    const uid = getBookingUserId(booking);
    const cached = uid != null ? userById[String(uid)] : null;
    return cached?.phone || cached?.phoneNumber || '-';
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (bookings || []).filter(b => {
      const s = normalizeStatus(b.status);
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'CANCELLED') {
          if (!s.startsWith('CANCEL')) return false;
        } else if (s !== statusFilter) {
          return false;
        }
      }
      if (!q) return true;
      const code = b?.bookingCode;
      const fallback = code ? detailByCode[String(code)] : null;
      const src = fallback
        ? {
            ...b,
            ...fallback,
            passengers: (Array.isArray(fallback?.passengers) && fallback.passengers.length > 0)
              ? fallback.passengers
              : b?.passengers,
          }
        : b;
      const hay = `${getCustomerName(src)} ${getCustomerPhone(src)} ${getTourTitle(src)} ${src.bookingCode || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [bookings, query, statusFilter, userById, detailByCode]);

  const stats = useMemo(() => {
    const all = bookings || [];
    const total = all.length;
    const confirmed = all.filter((b) => normalizeStatus(b.status) === 'CONFIRMED').length;
    const pending = all.filter((b) => normalizeStatus(b.status) === 'PENDING').length;
    const cancelled = all.filter((b) => normalizeStatus(b.status).startsWith('CANCEL')).length;
    return { total, confirmed, pending, cancelled };
  }, [bookings]);

  // Fallback: if list doesn't contain customer info or userId, fetch detail by bookingCode.
  useEffect(() => {
    const candidates = (bookings || [])
      .filter((b) => {
        const hasName = getCustomerNameRaw(b) && getCustomerNameRaw(b) !== '-';
        const uid = getBookingUserId(b);
        const code = b?.bookingCode;
        return !hasName && (uid == null) && !!code && !detailByCode[String(code)];
      })
      .slice(0, 25);

    if (candidates.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.all(
          candidates.map(async (b) => {
            const code = String(b.bookingCode);
            const res = await bookingApi.getBookingByCode(code);
            if (res && res.status === 200) return { code, detail: res.data || res };
            return { code, detail: null };
          })
        );
        if (cancelled) return;
        setDetailByCode((prev) => {
          const next = { ...prev };
          for (const r of results) {
            if (r.detail) next[String(r.code)] = r.detail;
          }
          return next;
        });
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bookings, detailByCode]);

  useEffect(() => {
    const pool = [
      ...(bookings || []),
      ...Object.values(detailByCode || {}),
      ...(detail ? [detail] : []),
    ];

    const missingIds = Array.from(
      new Set(
        pool
          .map(getBookingUserId)
          .filter((id) => id !== null && id !== undefined)
          .map((id) => String(id))
          .filter((id) => {
            const b = pool.find((x) => String(getBookingUserId(x)) === id);
            if (!b) return false;
            const hasName = getCustomerNameRaw(b) && getCustomerNameRaw(b) !== '-';
            return !hasName && !userById[id];
          })
      )
    );

    if (missingIds.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.all(
          missingIds.map(async (id) => {
            const res = await authApi.getUserById(id);
            if (res && res.status === 200) return { id, user: res.data || res };
            return { id, user: null };
          })
        );
        if (cancelled) return;
        setUserById((prev) => {
          const next = { ...prev };
          for (const r of results) {
            if (r.user) next[String(r.id)] = r.user;
          }
          return next;
        });
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bookings, userById, detailByCode, detail]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let res;
      if (user && user.id) {
        res = await bookingApi.getBookingsByUser(user.id);
      } else {
        res = await bookingApi.getAllBookings();
      }
      setLoading(false);
      if (res && res.status === 200) {
        setBookings(Array.isArray(res.data) ? res.data : (res.data || []));
      } else {
        console.error('fetchBookings failed', res);
        setToast({ type: 'error', message: res?.message || 'Không tải được bookings' });
        setTimeout(() => setToast(null), 4000);
        setBookings(recentBookings);
      }
    } catch (err) {
      setLoading(false);
      console.error('fetchBookings error', err);
      setToast({ type: 'error', message: err?.message || 'Lỗi khi gọi API' });
      setTimeout(() => setToast(null), 4000);
      setBookings(recentBookings);
    }
  };

  useEffect(() => { fetchBookings(); }, [user]);

  const fetchBookingDetail = async (code) => {
    if (!code) return;
    setDetailLoading(true);
    try {
      const res = await bookingApi.getBookingByCode(code);
      setDetailLoading(false);
      if (res && res.status === 200) {
        const data = res.data || res;
        setDetail((prev) => {
          const prevPassengers = Array.isArray(prev?.passengers) && prev.passengers.length > 0 ? prev.passengers : null;
          const nextPassengers = Array.isArray(data?.passengers) && data.passengers.length > 0 ? data.passengers : null;
          return {
            ...(prev || {}),
            ...(data || {}),
            ...(prevPassengers && !nextPassengers ? { passengers: prevPassengers } : null),
          };
        });
        setDetailByCode((prev) => {
          const existing = prev?.[String(code)] || null;
          const existingPassengers = Array.isArray(existing?.passengers) && existing.passengers.length > 0 ? existing.passengers : null;
          const nextPassengers = Array.isArray(data?.passengers) && data.passengers.length > 0 ? data.passengers : null;
          return {
            ...prev,
            [String(code)]: {
              ...(existing || {}),
              ...(data || {}),
              ...(existingPassengers && !nextPassengers ? { passengers: existingPassengers } : null),
            },
          };
        });
      } else {
        setDetail({ error: res?.message || 'Không lấy được chi tiết', bookingCode: code });
      }
    } catch (err) {
      setDetailLoading(false);
      console.error('fetchBookingDetail err', err);
      setDetail({ error: err?.message || 'Lỗi khi lấy chi tiết', bookingCode: code });
    }
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => filtered.slice((page-1)*pageSize, page*pageSize), [filtered, page]);

  const pageButtons = useMemo(() => {
    if (totalPages <= 2) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 1) return [1, 2];
    if (page >= totalPages) return [totalPages - 1, totalPages];
    return [page, Math.min(totalPages, page + 1)];
  }, [page, totalPages]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* KPI row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPI title="Tổng booking" value={String(stats.total)} note="" gradient="from-sky-500 to-indigo-600" />
          <KPI title="Xác nhận" value={String(stats.confirmed)} note="" gradient="from-emerald-500 to-teal-600" />
          <KPI title="Chờ xử lý" value={String(stats.pending)} note="" gradient="from-amber-400 to-amber-500" />
          <KPI title="Đã huỷ" value={String(stats.cancelled)} note="" gradient="from-rose-400 to-rose-600" />
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
          <div className="mb-3 text-sm text-slate-500">{loading ? 'Đang tải bookings...' : ''}</div>
          <div className="flex items-center justify-between mb-3 gap-3">
            <div className="flex items-center gap-3 w-full">
              <div className="relative flex-1">
                <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(e)=>{ setQuery(e.target.value); setPage(1); }} placeholder="Tìm kiếm tên khách hàng, số điện thoại..." className="rounded-lg border bg-slate-50 pl-9 pr-3 py-2 text-sm w-full focus:outline-none" />
              </div>
              <select value={statusFilter} onChange={(e)=>{ setStatusFilter(e.target.value); setPage(1); }} className="rounded-lg border bg-slate-50 px-3 py-2 text-sm">
                <option value="ALL">Tất cả trạng thái</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PENDING">PENDING</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
              <button onClick={fetchBookings} disabled={loading} className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60">Filter</button>
            </div>
            <div className="text-sm text-slate-500">Hiển thị {filtered.length} kết quả</div>
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
                  <th className="p-3 text-left">Khách hàng</th>
                  <th className="p-3 text-left">Tour</th>
                  <th className="p-3 text-left">Ngày đi</th>
                  <th className="p-3 text-left">Số người</th>
                  <th className="p-3 text-left">Tổng tiền</th>
                  <th className="p-3 text-left">Trạng thái</th>
                  <th className="p-3 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr><td colSpan={7} className="p-6 text-center">Không có kết quả</td></tr>
                ) : paged.map(b => (
                  <tr key={b.id} className="border-b last:border-0 odd:bg-white even:bg-slate-50/50 hover:bg-sky-50/40 transition">
                    <td className="p-3">
                      {(() => {
                        const code = b?.bookingCode;
                        const fallback = code ? detailByCode[String(code)] : null;
                        const src = fallback
                          ? {
                              ...b,
                              ...fallback,
                              passengers: (Array.isArray(fallback?.passengers) && fallback.passengers.length > 0)
                                ? fallback.passengers
                                : b?.passengers,
                            }
                          : b;
                        return (
                          <>
                            <div className="font-semibold">{getCustomerName(src)}</div>
                            <div className="text-xs text-slate-500">{getCustomerPhone(src)}</div>
                          </>
                        );
                      })()}
                    </td>
                    <td className="p-3 text-slate-600">{getTourTitle(b)}</td>
                    <td className="p-3 text-slate-500">{b.startDate ? new Date(b.startDate).toLocaleDateString() : (b.date || '-')}</td>
                    <td className="p-3">{(b.passengers && b.passengers.length) || b.passengerCount || b.people || '-'}</td>
                    <td className="p-3 font-semibold text-sky-600">{(b.totalAmount || b.amount) ? (b.totalAmount || b.amount).toString() : '-'}</td>
                    <td className="p-3"><StatusPill status={b.status} /></td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button onClick={async ()=>{
                          const code = b?.bookingCode ? String(b.bookingCode) : '';
                          setShowDetailModal(true);
                          setDetail(b);
                          if (code) {
                            setDetailByCode((prev) => {
                              const existing = prev?.[code] || null;
                              const existingPassengers = Array.isArray(existing?.passengers) && existing.passengers.length > 0 ? existing.passengers : null;
                              const rowPassengers = Array.isArray(b?.passengers) && b.passengers.length > 0 ? b.passengers : null;
                              const mergedPassengers = existingPassengers || rowPassengers;
                              return {
                                ...prev,
                                [code]: {
                                  ...(b || {}),
                                  ...(existing || {}),
                                  ...(mergedPassengers ? { passengers: mergedPassengers } : null),
                                },
                              };
                            });
                          }
                          setLastDetailCode(code);
                          fetchBookingDetail(code);
                        }} className="rounded-full border px-2 py-1 text-xs bg-white hover:bg-slate-50"><Icon name="eye" className="h-4 w-4"/></button>
                        <button className="rounded-full border px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"><Icon name="trash" className="h-4 w-4"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-slate-500">Hiển thị {paged.length} trên {filtered.length} bookings</div>
            <div className="flex items-center gap-1">
              <button onClick={()=>setPage(1)} disabled={page===1} className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-sm hover:bg-slate-50 transition disabled:opacity-50"><Icon name="chev-left" className="h-4 w-4"/><Icon name="chev-left" className="h-4 w-4 -ml-1"/></button>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-sm hover:bg-slate-50 transition disabled:opacity-50"><Icon name="chev-left" className="h-4 w-4"/></button>
              {pageButtons.map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`rounded-md border px-3 py-1 text-sm transition ${p===page ? 'bg-sky-600 text-white' : 'hover:bg-slate-50'}`}>{p}</button>
              ))}
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-sm hover:bg-slate-50 transition disabled:opacity-50"><Icon name="chev-right" className="h-4 w-4"/></button>
              <button onClick={()=>setPage(totalPages)} disabled={page===totalPages} className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-sm hover:bg-slate-50 transition disabled:opacity-50"><Icon name="chev-right" className="h-4 w-4"/><Icon name="chev-right" className="h-4 w-4 -ml-1"/></button>
            </div>
          </div>
        </div>

        {/* Detail modal */}
        {showDetailModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-6 overflow-y-auto">
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl max-h-[calc(100vh-3rem)] flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 rounded-t-2xl bg-linear-to-r from-sky-600 to-indigo-600 text-white">
                <div>
                  <div className="text-xs uppercase tracking-wide text-white/80">Chi tiết booking</div>
                  <h3 className="text-base font-semibold">{detailLoading ? 'Đang tải...' : detail?.bookingCode || '-'}</h3>
                  <div className="text-xs text-white/80">{getTourTitle(detail) !== '-' ? getTourTitle(detail) : ''}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={()=>setShowDetailModal(false)} className="rounded-md bg-white/20 px-2 py-1 text-white hover:bg-white/30">
                    <Icon name="x" className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-5 overflow-y-auto overscroll-contain">
                {detail?.error ? (
                  <div className="p-4 rounded-md border bg-rose-50 text-rose-700">
                    <div>{detail.error}</div>
                    <div className="mt-2 flex gap-2">
                      <button onClick={()=>fetchBookingDetail(lastDetailCode)} className="rounded-md bg-white px-3 py-1">Retry</button>
                      <button onClick={()=>setShowDetailModal(false)} className="rounded-md border px-3 py-1">Close</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-slate-500">Mã booking</div>
                        <div className="font-semibold">{detail?.bookingCode}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Trạng thái</div>
                        <div className="font-semibold"><StatusPill status={detail?.status} /></div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Tổng tiền</div>
                        <div className="font-semibold">{detail?.totalAmount}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Ngày tạo</div>
                        <div className="font-semibold">{detail?.createdAt ? new Date(detail.createdAt).toLocaleString() : ''}</div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <div className="text-sm font-semibold mb-2">Khách hàng</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-700">
                        <div><span className="text-slate-500 mr-2">Họ tên:</span> <span className="font-medium">{getCustomerName(detail)}</span></div>
                        <div><span className="text-slate-500 mr-2">SĐT:</span> <span className="font-medium">{getCustomerPhone(detail)}</span></div>
                        <div>
                          <span className="text-slate-500 mr-2">Email:</span>
                          <span className="font-medium">
                            {detail?.email || detail?.userEmail || detail?.customer?.email || detail?.booker?.email || detail?.user?.email || detail?.account?.email || detail?.passengers?.[0]?.email || (getBookingUserId(detail) != null ? (userById[String(getBookingUserId(detail))]?.email || '-') : '-')}
                          </span>
                        </div>
                        <div><span className="text-slate-500 mr-2">User ID:</span> <span className="font-medium">{getBookingUserId(detail) ?? '-'}</span></div>
                      </div>
                    </div>

                    {(detail?.images && detail.images.length > 0) && (
                      <div className="mt-4">
                        <div className="text-sm font-semibold mb-2">Hình ảnh</div>
                        <div className="grid grid-cols-3 gap-2">
                          {detail.images.map((src, idx) => (
                            <img key={idx} src={src} alt={`img-${idx}`} className="h-24 w-full object-cover rounded-md" />
                          ))}
                        </div>
                      </div>
                    )}

                    {(detail?.itinerary || detail?.route) && (
                      <div className="mt-4">
                        <div className="text-sm font-semibold mb-2">Hành trình</div>
                        <div className="text-sm text-slate-700">{Array.isArray(detail.itinerary) ? detail.itinerary.join(' → ') : (detail.itinerary || detail.route)}</div>
                      </div>
                    )}

                    {detail?.priceDetail && (
                      <div className="mt-4">
                        <div className="text-sm font-semibold mb-2">Chi tiết giá</div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-700">
                          {Object.entries(detail.priceDetail).map(([k,v]) => (
                            <div key={k}><span className="text-slate-500 mr-2">{PRICE_LABELS[k] || k}:</span> <span className="font-medium">{v}</span></div>
                          ))}
                        </div>
                      </div>
                    )}

                    {Array.isArray(detail?.passengers) && detail.passengers.length > 0 && (
                      <div className="mt-6">
                        <div className="text-sm font-semibold mb-2">Passengers</div>
                        <div className="space-y-2">
                          {detail.passengers.map((p, idx) => (
                            <div key={idx} className="rounded-md border p-3">
                              <div className="font-semibold">{p.fullName}</div>
                              <div className="text-xs text-slate-500">{p.idCardNumber || 'No ID'} • {p.ageGroup} • {p.gender} • {p.dob || '-'}</div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-xs text-slate-500">Chi tiết passenger nằm ở menu Passengers.</div>
                      </div>
                    )}

                    <div className="mt-6 flex justify-end">
                      <button onClick={()=>setShowDetailModal(false)} className="rounded-md border px-3 py-1 text-sm">Đóng</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Toast */}
        {toast && (
          <div className={`fixed right-6 bottom-6 z-60 rounded-md px-4 py-3 shadow-md ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
            <div className="flex items-center gap-3">
              <div className="flex-1">{toast.message}</div>
              {toast.type === 'error' && (
                <button onClick={fetchBookings} className="rounded-md bg-white/20 px-2 py-1 text-white text-xs">Retry</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;
