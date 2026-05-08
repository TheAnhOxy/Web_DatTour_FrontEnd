import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';
import authApi from '../api/authApi';

const Avatar = ({ url, name }) => {
  if (url) return <img src={url} alt={name} className="h-10 w-10 rounded-full object-cover" />;
  const initials = (name || '').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
  return <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">{initials}</div>;
};

export const UsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [toast, setToast] = useState(null); // {type: 'success'|'error', message}
  const [confirm, setConfirm] = useState(null); // {title, message, onConfirm}
  const [modalTab, setModalTab] = useState('info');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const fetchUsers = async () => {
    setLoading(true);
    const res = await authApi.getAllUsers();
    setLoading(false);
    if (res && res.status === 200 && Array.isArray(res.data)) {
      setUsers(res.data);
    } else {
      setUsers([]);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // lock body scroll when modal open
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = showModal ? 'hidden' : '';
    }
    return () => { if (typeof document !== 'undefined') document.body.style.overflow = ''; };
  }, [showModal]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(u => {
      if (statusFilter !== 'ALL' && (u.status || '').toUpperCase() !== statusFilter) return false;
      if (roleFilter !== 'ALL' && !((u.roles||[]).includes(roleFilter))) return false;
      if (!q) return true;
      return (u.fullName || u.email || '').toLowerCase().includes(q);
    });
  }, [users, query, statusFilter, roleFilter]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages]);
  const paged = useMemo(() => filtered.slice((page-1)*pageSize, page*pageSize), [filtered, page]);
  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    if (totalPages <= maxButtons) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + maxButtons - 1);
    const finalStart = Math.max(1, end - maxButtons + 1);
    return Array.from({ length: end - finalStart + 1 }, (_, i) => finalStart + i);
  }, [page, totalPages]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => (u.status||'').toUpperCase() === 'ACTIVE').length,
    admins: users.filter(u => (u.roles||[]).includes('ADMIN')).length,
  }), [users]);

  const openUser = async (uOrId, onlyView = false) => {
    const id = typeof uOrId === 'number' ? uOrId : (uOrId && uOrId.id);
    if (!id) return;
    setViewOnly(onlyView);
    setShowModal(true);
    setModalLoading(true);
    try {
      const res = await authApi.getUserById(id);
      if (res && res.status === 200 && res.data) {
        const data = { roles: [], ...res.data };
        setSelected(data);
        setModalTab('info');
      } else {
        setSelected(null);
        setToast({ type: 'error', message: res?.message || 'Không thể lấy thông tin người dùng' });
        setTimeout(() => setToast(null), 4000);
      }
    } catch (err) {
      console.error('getUserById error', err);
      setSelected(null);
      setToast({ type: 'error', message: err?.message || 'Lỗi khi lấy dữ liệu' });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setConfirm({
      title: 'Xoá người dùng',
      message: 'Bạn có chắc chắn muốn xoá người dùng này? Hành động không thể hoàn tác.',
      async onConfirm() {
        setConfirm(null);
        setModalLoading(true);
        try {
          const res = await authApi.deleteUser(id);
          setModalLoading(false);
          if (res && res.status === 200) {
            setToast({ type: 'success', message: 'Xoá người dùng thành công' });
            setTimeout(() => setToast(null), 3000);
            fetchUsers();
          } else {
            setToast({ type: 'error', message: res?.message || 'Xoá thất bại' });
            setTimeout(() => setToast(null), 4000);
          }
        } catch (err) {
          setModalLoading(false);
          console.error('deleteUser error', err);
          setToast({ type: 'error', message: err?.message || 'Xoá thất bại' });
          setTimeout(() => setToast(null), 4000);
        }
      }
    });
  };

  const handleSave = async () => {
    if (!selected) return;
    setConfirm({
      title: 'Lưu thay đổi',
      message: 'Xác nhận lưu các thay đổi cho người dùng này?',
      async onConfirm() {
        setConfirm(null);
        const payload = {
          fullName: selected.fullName,
          phone: selected.phone,
          address: selected.address,
          dob: selected.dob,
          gender: selected.gender,
          // status and roles are not sent to updateUserAdmin by default
          avatarUrl: selected.avatarUrl,
        };
        setModalLoading(true);
        try {
          const res = await authApi.updateUserAdmin(selected.id, payload);
          setModalLoading(false);
          if (res && res.status === 200) {
            setToast({ type: 'success', message: 'Cập nhật người dùng thành công' });
            setTimeout(() => setToast(null), 3000);
            setShowModal(false);
            fetchUsers();
          } else {
            setToast({ type: 'error', message: res?.message || 'Cập nhật thất bại' });
            setTimeout(() => setToast(null), 4000);
          }
        } catch (err) {
          setModalLoading(false);
          console.error('updateUserAdmin error', err);
          setToast({ type: 'error', message: err?.message || 'Cập nhật thất bại' });
          setTimeout(() => setToast(null), 4000);
        }
      }
    });
  };

  const handleAssignRoles = async () => {
    if (!selected) return;
    setModalLoading(true);
    const res = await authApi.assignRoles({ userId: selected.id, roleNames: selected.roles || [] });
    setModalLoading(false);
    if (res && res.status === 200) {
      setToast({ type: 'success', message: 'Gán role thành công' });
      setTimeout(() => setToast(null), 3000);
      fetchUsers();
    } else {
      setToast({ type: 'error', message: res?.message || 'Gán role thất bại' });
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Quản lý người dùng</h2>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="rounded-full border bg-white px-3 py-1 text-slate-600">
              Tổng: <span className="font-semibold text-slate-800">{stats.total}</span>
            </div>
            <div className="rounded-full border bg-white px-3 py-1 text-slate-600">
              Active: <span className="font-semibold text-emerald-600">{stats.active}</span>
            </div>
            <div className="rounded-full border bg-white px-3 py-1 text-slate-600">
              Admins: <span className="font-semibold text-indigo-600">{stats.admins}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm theo tên/email..."
                  className="rounded-lg border bg-slate-50 pl-9 pr-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-lg border bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="ALL">All status</option>
                <option value="ACTIVE">Active</option>
                <option value="UNVERIFIED">Unverified</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="rounded-lg border bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="ALL">All roles</option>
                <option value="ADMIN">ADMIN</option>
                <option value="USER">USER</option>
                <option value="CUSTOMER">CUSTOMER</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Hiển thị {filtered.length} kết quả</span>
              <button onClick={fetchUsers} className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700 transition">
                <Icon name="refresh" className="h-4 w-4" />
                Làm mới
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[60vh] overscroll-contain rounded-xl border border-slate-100">
            <table className="w-full table-auto text-sm">
              <thead className="text-xs text-slate-500 bg-slate-50 border-b">
                <tr>
                  <th className="p-3 text-left">Người dùng</th>
                  <th className="p-3 text-left">Điện thoại</th>
                  <th className="p-3 text-left">Ngày sinh</th>
                  <th className="p-3 text-left">Trạng thái</th>
                  <th className="p-3 text-left">Roles</th>
                  <th className="p-3 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-6 text-center">Đang tải...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="p-6 text-center">Không có kết quả</td></tr>
                ) : paged.map(u => (
                  <tr key={u.id} className="border-b last:border-0 odd:bg-white even:bg-slate-50/50 hover:bg-sky-50/40 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar url={u.avatarUrl} name={u.fullName || u.email} />
                        <div>
                          <div className="font-semibold">{u.fullName || '(No name)'}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{u.phone || '-'}</td>
                    <td className="p-3">{u.dob || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {(u.roles || []).map(r => (
                        <span key={r} className="mr-1.5 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 ring-1 ring-slate-200">
                          {r}
                        </span>
                      ))}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openUser(u, true)} className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs bg-white hover:bg-slate-50">
                          <Icon name="eye" className="h-4 w-4" />
                          Xem
                        </button>
                        <button onClick={() => openUser(u, false)} className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs bg-white hover:bg-slate-50">
                          <Icon name="edit" className="h-4 w-4" />
                          Sửa
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs text-rose-600 hover:bg-rose-50">
                          <Icon name="trash" className="h-4 w-4" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-slate-500">Trang {page} / {totalPages}</div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={page===1} className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-sm hover:bg-slate-50 transition disabled:opacity-50">
                <Icon name="chev-left" className="h-4 w-4" />
                <Icon name="chev-left" className="h-4 w-4 -ml-1" />
              </button>
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-sm hover:bg-slate-50 transition disabled:opacity-50">
                <Icon name="chev-left" className="h-4 w-4" />
              </button>
              {pageNumbers.map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`rounded-md border px-3 py-1 text-sm transition ${n === page ? 'bg-sky-600 text-white border-sky-600' : 'hover:bg-slate-50'}`}
                >
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-sm hover:bg-slate-50 transition disabled:opacity-50">
                <Icon name="chev-right" className="h-4 w-4" />
              </button>
              <button onClick={() => setPage(totalPages)} disabled={page===totalPages} className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-sm hover:bg-slate-50 transition disabled:opacity-50">
                <Icon name="chev-right" className="h-4 w-4" />
                <Icon name="chev-right" className="h-4 w-4 -ml-1" />
              </button>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between px-5 py-4 rounded-t-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white">
                <div>
                  <div className="text-xs uppercase tracking-wide text-white/80">Thông tin người dùng</div>
                  <h3 className="text-base font-semibold">{modalLoading ? 'Đang tải...' : `#${selected?.id || ''} • ${selected?.fullName || '(No name)'}`}</h3>
                  <div className="text-xs text-white/80">{selected?.email}</div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                    <button onClick={() => { setModalTab('info'); }} className={`px-3 py-1 rounded-md text-sm ${modalTab === 'info' ? 'bg-white text-sky-700' : 'bg-white/20 text-white'}`}>Thông tin</button>
                    <button onClick={() => { setModalTab('roles'); }} className={`px-3 py-1 rounded-md text-sm ${modalTab === 'roles' ? 'bg-white text-sky-700' : 'bg-white/20 text-white'}`}>Phân quyền</button>
                  </div>
                  <button onClick={() => setShowModal(false)} className="rounded-md bg-white/20 px-2 py-1 text-white hover:bg-white/30">
                    <Icon name="x" className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {modalLoading ? (
                <div className="p-6 text-center">Đang tải thông tin...</div>
              ) : selected ? (
                <>
                      <div className="px-5 py-4 grid gap-4 text-sm">
                        {/* Tab content */}
                        {modalTab === 'info' && (
                          <>
                            {/* header already shows name/email/avatar, content shows fields */}
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              <input readOnly={viewOnly} value={selected.fullName || ''} onChange={(e)=>setSelected({...selected, fullName: e.target.value})} placeholder="Họ và tên" className="rounded-lg border bg-slate-50 px-3 py-2 text-sm" />
                              <input readOnly className="rounded-lg border bg-slate-100 px-3 py-2 text-sm" value={selected.email || ''} />
                              <input readOnly={viewOnly} value={selected.phone || ''} onChange={(e)=>setSelected({...selected, phone: e.target.value})} placeholder="Phone" className="rounded-lg border bg-slate-50 px-3 py-2 text-sm" />
                              <input readOnly={viewOnly} value={selected.address || ''} onChange={(e)=>setSelected({...selected, address: e.target.value})} placeholder="Address" className="rounded-lg border bg-slate-50 px-3 py-2 text-sm" />
                              <input readOnly={viewOnly} value={selected.dob || ''} onChange={(e)=>setSelected({...selected, dob: e.target.value})} type="date" className="rounded-lg border bg-slate-50 px-3 py-2 text-sm" />
                              <select disabled={viewOnly} value={selected.gender || ''} onChange={(e)=>setSelected({...selected, gender: e.target.value})} className="rounded-lg border bg-slate-50 px-3 py-2 text-sm">
                                <option value="">--Giới tính--</option>
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                                <option value="OTHER">Khác</option>
                              </select>
                              <input readOnly={viewOnly} value={selected.currentPoints ?? 0} onChange={(e)=>setSelected({...selected, currentPoints: Number(e.target.value)})} type="number" className="rounded-lg border bg-slate-50 px-3 py-2 text-sm" />
                              <select disabled={viewOnly} value={selected.status || ''} onChange={(e)=>setSelected({...selected, status: e.target.value})} className="rounded-lg border bg-slate-50 px-3 py-2 text-sm">
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="UNVERIFIED">UNVERIFIED</option>
                                <option value="INACTIVE">INACTIVE</option>
                              </select>
                            </div>
                          </>
                        )}

                        {modalTab === 'roles' && (
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Roles</label>
                            <div className="flex gap-3 flex-wrap">
                              {['ADMIN','USER','CUSTOMER'].map(r => (
                                <label key={r} className="inline-flex items-center gap-2">
                                  <input disabled={viewOnly} type="checkbox" checked={(selected.roles||[]).includes(r)} onChange={() => {
                                    const has = (selected.roles||[]).includes(r);
                                    setSelected({...selected, roles: has ? (selected.roles||[]).filter(x=>x!==r) : [...(selected.roles||[]), r]});
                                  }} />
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100">{r}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                    
                  </div>
                  <div className="flex items-center justify-end gap-2 border-t px-5 py-3">
                    {!viewOnly && <button onClick={handleAssignRoles} className="rounded-md border px-3 py-1 text-sm hover:bg-slate-50">Gán role</button>}
                    {!viewOnly && <button onClick={handleSave} className="rounded-md bg-sky-600 px-3 py-1 text-sm text-white hover:bg-sky-700">Lưu</button>}
                    <button onClick={() => setShowModal(false)} className="rounded-md border px-3 py-1 text-sm hover:bg-slate-50">Đóng</button>
                  </div>
                </>
              ) : (
                <div className="p-6 text-center">Không có dữ liệu</div>
              )}
            </div>
          </div>
        )}
        {/* Confirm modal */}
        {confirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg">
              <div className="text-lg font-semibold mb-2">{confirm.title}</div>
              <div className="text-sm text-slate-600 mb-4">{confirm.message}</div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setConfirm(null)} className="rounded-md border px-3 py-1 text-sm hover:bg-slate-50">Huỷ</button>
                <button onClick={async () => { try { if (confirm.onConfirm) await confirm.onConfirm(); } catch (e) { console.error(e); setConfirm(null); } }} className="rounded-md bg-rose-600 px-3 py-1 text-sm text-white hover:bg-rose-700">Xác nhận</button>
              </div>
            </div>
          </div>
        )}
        {/* Toast */}
        {toast && (
          <div className={`fixed right-6 bottom-6 z-60 rounded-md px-4 py-3 shadow-md ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
