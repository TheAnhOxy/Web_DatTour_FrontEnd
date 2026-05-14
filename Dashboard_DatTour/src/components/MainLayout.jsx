import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiGrid,
  FiMap,
  FiMapPin,
  FiTag,
  FiBook,
  FiCreditCard,
  FiMessageCircle,
  FiUsers,
  FiHeart,
} from "react-icons/fi";

import { MdTravelExplore } from "react-icons/md";

export const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
              <div className="rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 p-1 shadow-md shadow-blue-100/60">
                <img
                  src="/images/logo.png"
                  alt="CatTour logo"
                  className="h-12 w-12 rounded-xl border border-white bg-white object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold uppercase tracking-[0.34em] text-blue-600">
                  CatTour
                </p>
                <p className="truncate text-[12px] font-medium text-slate-500">
                  Tour Management
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 p-0.5 shadow-sm">
              <img
                src="/images/logo.png"
                alt="CatTour logo"
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
            {sidebarOpen && <span className="text-sm font-semibold">Thu gọn</span>}
          </button>
        </div>
      </aside>

      <div className={`${sidebarOpen ? "ml-60" : "ml-20"} flex min-w-0 flex-1 flex-col transition-all duration-300`}>
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-3 shadow-[0_12px_34px_rgba(15,23,42,0.08)] backdrop-blur-md">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-blue-600">
              Enterprise tour control center
            </p>
            <h2 className="truncate text-[20px] font-extrabold tracking-tight text-slate-900">
              Chào mừng, {user?.name}!
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden w-[320px] items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 lg:flex">
              <span className="text-slate-500">⌕</span>
              <input
                type="text"
                placeholder="Search tours, bookings, users..."
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
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-lg text-white shadow-md shadow-blue-600/25">
                  {user?.avatar}
                </div>
                <div className="leading-tight text-left">
                  <p className="text-sm font-bold text-slate-950">
                    {user?.name}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    {user?.role}
                  </p>
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] z-20 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
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
        </header>

        <main className="flex-1 overflow-auto bg-[#f3f6fb] p-5">
          {children}
        </main>
      </div>
    </div>
  );
};
