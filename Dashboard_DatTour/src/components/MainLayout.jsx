import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiGrid,
  FiMapPin,
  FiTag,
  FiBook,
  FiCreditCard,
  FiUser,
  FiX,
  FiSave,
  FiImage,
  FiMail,
  FiPhone,
  FiHome,
  FiCalendar,
} from "react-icons/fi";

export const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileAvatarName, setProfileAvatarName] = useState("");
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    dob: "",
    gender: "",
    avatarUrl: "",
  });
  const { user, logout, updateProfile, refreshCurrentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const avatarInputRef = useRef(null);

  const displayName = user?.fullName || user?.name || "Người dùng";
  const displayAvatar = user?.avatarUrl || user?.avatar || "/images/logo.png";

  const profilePreview = useMemo(
    () => profileForm.avatarUrl || displayAvatar,
    [profileForm.avatarUrl, displayAvatar],
  );

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "▣", path: "/dashboard" },
    {
      id: "tour",
      label: "Tour",
      icon: "✈",
      submenu: [
        {
          id: "tour-list",
          label: "Danh sách Tour",
          path: "/tour",
          icon: FiGrid,
        },
        {
          id: "tour-categories",
          label: "Danh mục",
          path: "/tour/categories",
          icon: FiTag,
        },
        {
          id: "tour-destinations",
          label: "Điểm đến",
          path: "/tour/destinations",
          icon: FiMapPin,
        },
      ],
    },
    { id: "promotion", label: "Promotion", icon: "✦", path: "/promotion" },
    {
      id: "booking",
      label: "Booking",
      icon: "⌁",
      submenu: [
        {
          id: "tour-booking",
          label: "Tour Booking",
          path: "/booking/tour",
          icon: FiBook,
        },
        {
          id: "payment",
          label: "Payment",
          path: "/booking/payment",
          icon: FiCreditCard,
        },
        {
          id: "bookings-list",
          label: "Bookings",
          path: "/bookings",
          icon: FiGrid,
        },
      ],
    },
    { id: "messages", label: "Tin nhắn", icon: "✉", path: "/messages" },
    { id: "passengers", label: "Passengers", icon: "👥", path: "/passengers" },
    { id: "users", label: "User", icon: "◉", path: "/admin/users" },
  ];

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/login");
  };

  const toggleSubmenu = (menuId) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  const handleNavigate = (path) => {
    setUserMenuOpen(false);
    navigate(path);
  };

  const closeProfile = () => {
    setProfileOpen(false);
    setProfileError("");
    setProfileSuccess("");
    setProfileAvatarName("");
  };

  const openProfile = async () => {
    const refreshed = await refreshCurrentUser();
    const sourceUser = refreshed.ok ? refreshed.user : user;

    setProfileForm({
      fullName: sourceUser?.fullName || sourceUser?.name || "",
      phone: sourceUser?.phone || "",
      address: sourceUser?.address || "",
      dob: sourceUser?.dob ? String(sourceUser.dob).slice(0, 10) : "",
      gender: sourceUser?.gender || "",
      avatarUrl: sourceUser?.avatarUrl || sourceUser?.avatar || "",
    });
    setProfileError("");
    setProfileSuccess("");
    setProfileAvatarName("");
    setProfileOpen(true);
  };

  const handleProfileChange = (field, value) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
    setProfileError("");
    setProfileSuccess("");
  };

  const handleAvatarPick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError("Vui lòng chọn một file ảnh hợp lệ.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setProfileForm((current) => ({ ...current, avatarUrl: result }));
      setProfileAvatarName(file.name);
      setProfileError("");
      setProfileSuccess("");
    };
    reader.onerror = () => {
      setProfileError("Không thể đọc file ảnh này.");
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileSuccess("");
    setProfileAvatarName("");

    const payload = {
      fullName: profileForm.fullName.trim(),
      phone: profileForm.phone.trim(),
      address: profileForm.address.trim(),
      dob: profileForm.dob || null,
      gender: profileForm.gender,
      avatarUrl: profileForm.avatarUrl.trim(),
    };

    const result = await updateProfile(payload);
    setProfileSaving(false);

    if (result.ok) {
      setProfileSuccess("Đã cập nhật hồ sơ cá nhân.");
      setUserMenuOpen(false);
      setTimeout(() => {
        closeProfile();
      }, 900);
      return;
    }

    setProfileError(
      result.res && result.res.message
        ? result.res.message
        : "Cập nhật hồ sơ thất bại.",
    );
  };

  const isActive = (path) => location.pathname === path;
  const isSubActive = (paths) =>
    paths.some((path) => location.pathname === path);

  return (
    <div className="flex min-h-screen w-full bg-[#f3f6fb] text-slate-700">
      <aside
        className={`${sidebarOpen ? "w-60" : "w-20"} fixed inset-y-0 left-0 z-30 flex flex-col border-r border-slate-200 bg-white shadow-[10px_0_40px_rgba(15,23,42,0.05)] transition-all duration-300 overflow-y-auto`}
      >
        <div className="flex items-center border-b border-slate-200 px-4 py-4">
          {sidebarOpen ? (
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-2xl bg-linear-to-br from-blue-100 to-indigo-100 p-1 shadow-md shadow-blue-100/60">
                <img
                  src="/images/logo.png"
                  alt="Go Tour logo"
                  className="h-12 w-12 rounded-xl border border-white bg-white object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold uppercase tracking-[0.34em] text-blue-600">
                  Go Tour
                </p>
                <p className="truncate text-[12px] font-medium text-slate-500">
                  Quản lý tour
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-linear-to-br from-blue-100 to-indigo-100 p-0.5 shadow-sm">
              <img
                src="/images/logo.png"
                alt="Go Tour logo"
                className="h-10 w-10 rounded-lg border border-white bg-white object-cover"
              />
            </div>
          )}
        </div>

        <nav className="space-y-1 px-3 py-4">
          {menuItems.map((item) => (
            <div key={item.id}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.id)}
                    className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition ${isSubActive(item.submenu.map((sub) => sub.path)) ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`grid h-9 w-9 place-items-center rounded-xl text-base ${isSubActive(item.submenu.map((sub) => sub.path)) ? "bg-white/15 text-white" : "bg-blue-50 text-blue-600"}`}
                      >
                        {item.icon}
                      </span>
                      {sidebarOpen && (
                        <span className="font-semibold">{item.label}</span>
                      )}
                    </span>
                    {sidebarOpen && (
                      <span
                        className={`text-xs transition-transform ${expandedMenu === item.id ? "rotate-180" : ""}`}
                      >
                        ▾
                      </span>
                    )}
                  </button>
                  {expandedMenu === item.id && (
                    <div className="mt-1 space-y-1 pl-2">
                      {item.submenu.map((subitem) => (
                        <button
                          key={subitem.id}
                          onClick={() => handleNavigate(subitem.path)}
                          className={`flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm transition ${isActive(subitem.path) ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                        >
                          <span
                            className={
                              isActive(subitem.path)
                                ? "text-blue-600"
                                : "text-slate-400"
                            }
                          >
                            <subitem.icon className="text-sm" />
                          </span>
                          {sidebarOpen && <span>{subitem.label}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => handleNavigate(item.path)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${isActive(item.path) ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                >
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-xl text-base ${isActive(item.path) ? "bg-white/15 text-white" : "bg-blue-50 text-blue-600"}`}
                  >
                    {item.icon}
                  </span>
                  {sidebarOpen && (
                    <span className="font-semibold">{item.label}</span>
                  )}
                </button>
              )}
            </div>
          ))}
        </nav>

        <div className="px-3 pb-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
          >
            <span>{sidebarOpen ? "←" : "→"}</span>
            {sidebarOpen && (
              <span className="text-sm font-semibold">Thu gọn</span>
            )}
          </button>
        </div>
      </aside>

      <div
        className={`${sidebarOpen ? "ml-60" : "ml-20"} flex min-w-0 flex-1 flex-col transition-all duration-300`}
      >
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white shadow-[10px_0_40px_rgba(15,23,42,0.05)]">
          <div className="mx-auto flex w-full max-w-340 items-center justify-between gap-4 px-4 py-4 lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden h-10 w-px bg-slate-200 xl:block" />
              <div className="min-w-0 xl:block hidden">
                <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-blue-600">
                  Go Tour control center
                </p>
                <h2 className="truncate text-[20px] font-extrabold tracking-tight text-slate-900">
                  Chào mừng, {displayName}!
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden w-65 items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 xl:flex">
                <span className="text-slate-500">⌕</span>
                <input
                  type="text"
                  placeholder="Tìm tour, booking, người dùng..."
                  className="w-full border-none bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>

              <button className="relative rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-500 shadow-sm transition hover:border-blue-300 hover:text-blue-600">
                🔔
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500" />
              </button>
              <button className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-500 shadow-sm transition hover:border-blue-300 hover:text-blue-600">
                ⚙️
              </button>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((value) => !value)}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                >
                  <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-linear-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md shadow-blue-600/25">
                    {displayAvatar ? (
                      <img
                        src={displayAvatar}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{displayName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="leading-tight text-left">
                    <p className="text-sm font-bold text-slate-950">
                      {displayName}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      {user?.role}
                    </p>
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-20 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
                    <button
                      onClick={() => {
                        void openProfile();
                        setUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <FiUser />
                      Hồ sơ
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      <span>↗</span>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-[#f3f6fb] p-5">
          {children}
        </main>

        {profileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.24)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-blue-600">
                    Hồ sơ cá nhân
                  </p>
                  <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                    Cập nhật thông tin của bạn
                  </h3>
                </div>
                <button
                  onClick={closeProfile}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-blue-300 hover:text-blue-600"
                >
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleProfileSubmit} className="grid gap-6 px-6 py-6">
                <div className="grid gap-6 lg:grid-cols-[170px_1fr]">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <img
                        src={profilePreview}
                        alt="Profile preview"
                        className="h-32 w-32 rounded-[28px] border-4 border-white object-cover shadow-[0_16px_40px_rgba(15,23,42,0.16)]"
                      />
                      <div className="absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/25">
                        <FiImage />
                      </div>
                    </div>
                    <p className="text-center text-xs font-medium text-slate-500">
                      Chọn ảnh từ máy để đổi avatar
                    </p>
                    <button
                      type="button"
                      onClick={handleAvatarPick}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    >
                      Chọn ảnh
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarFileChange}
                    />
                    {profileAvatarName && (
                      <p className="max-w-42.5 truncate text-center text-[11px] font-medium text-slate-500">
                        {profileAvatarName}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-slate-600">
                        <FiMail /> Email
                      </label>
                      <input
                        value={user?.email || ""}
                        readOnly
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-slate-600">
                        <FiUser /> Họ và tên
                      </label>
                      <input
                        value={profileForm.fullName}
                        onChange={(e) => handleProfileChange("fullName", e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
                        placeholder="Nhập họ và tên"
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-slate-600">
                        <FiPhone /> Số điện thoại
                      </label>
                      <input
                        value={profileForm.phone}
                        onChange={(e) => handleProfileChange("phone", e.target.value.replace(/\D/g, ""))}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
                        placeholder="10 chữ số"
                        inputMode="numeric"
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-slate-600">
                        <FiCalendar /> Ngày sinh
                      </label>
                      <input
                        type="date"
                        value={profileForm.dob}
                        onChange={(e) => handleProfileChange("dob", e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-slate-600">
                        <FiHome /> Địa chỉ
                      </label>
                      <input
                        value={profileForm.address}
                        onChange={(e) => handleProfileChange("address", e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
                        placeholder="Nhập địa chỉ"
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-slate-600">
                        Giới tính
                      </label>
                      <select
                        value={profileForm.gender}
                        onChange={(e) => handleProfileChange("gender", e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-slate-600">
                        <FiImage /> Avatar preview
                      </label>
                      <input
                        value={profileForm.avatarUrl}
                        readOnly
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none"
                        placeholder="Chưa chọn ảnh"
                      />
                    </div>
                  </div>
                </div>

                {profileError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {profileError}
                  </div>
                )}

                {profileSuccess && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {profileSuccess}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeProfile}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-[0_16px_36px_rgba(37,99,235,0.28)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <FiSave />
                    {profileSaving ? "Đang lưu..." : "Lưu hồ sơ"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
