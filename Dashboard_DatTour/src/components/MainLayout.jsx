import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "▣", path: "/dashboard" },
    { id: "tour", label: "Tour", icon: "✈", path: "/tour" },
    { id: "promotion", label: "Promotion", icon: "✦", path: "/promotion" },
    {
      id: "booking",
      label: "Booking",
      icon: "⌁",
      submenu: [
        { id: "tour-booking", label: "Tour Booking", path: "/booking/tour" },
        { id: "payment", label: "Payment", path: "/booking/payment" },
      ],
    },
    { id: "messages", label: "Tin nhắn", icon: "✉", path: "/messages" },
    {
      id: "users",
      label: "User",
      icon: "◉",
      submenu: [
        { id: "passengers", label: "Hành khách", path: "/users/passengers" },
      ],
    },
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
    <div className="flex min-h-screen w-full overflow-hidden bg-[#f4f8fe] text-slate-700">
      <aside
        className={`${sidebarOpen ? "w-60" : "w-19"} flex-none border-r border-slate-200/80 bg-white shadow-[8px_0_30px_rgba(37,99,235,0.06)] transition-all duration-300`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
          {sidebarOpen ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
                DatTour
              </p>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                Admin
              </h1>
            </div>
          ) : (
            <div className="rounded-2xl bg-sky-100 px-3 py-2 text-lg font-black text-sky-600">
              DT
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600"
          >
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>

        <nav className="space-y-1 px-3 py-4">
          {menuItems.map((item) => (
            <div key={item.id}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.id)}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${isSubActive(item.submenu.map((sub) => sub.path)) ? "bg-sky-50 text-sky-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-base">
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
                          className={`flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm transition ${isActive(subitem.path) ? "bg-sky-100 font-semibold text-sky-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                        >
                          <span className="text-sky-500">•</span>
                          {sidebarOpen && <span>{subitem.label}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => handleNavigate(item.path)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${isActive(item.path) ? "bg-sky-100 text-sky-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-base">
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
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-5 py-3 shadow-sm backdrop-blur-xl">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-500">
              Enterprise tour control center
            </p>
            <h2 className="truncate text-xl font-black tracking-tight text-slate-900">
              Chào mừng, {user?.name}!
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden w-[320px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 lg:flex">
              <span className="text-slate-400">⌕</span>
              <input
                type="text"
                placeholder="Search tours, bookings, users..."
                className="w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <button className="relative rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-500 shadow-sm transition hover:border-sky-200 hover:text-sky-600">
              🔔
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-sky-500" />
            </button>
            <button className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-500 shadow-sm transition hover:border-sky-200 hover:text-sky-600">
              ⚙️
            </button>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((value) => !value)}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-sky-200"
              >
                <div className="grid h-10 w-10 place-items-center rounded-full bg-sky-100 text-lg">
                  {user?.avatar}
                </div>
                <div className="leading-tight text-left">
                  <p className="text-sm font-bold text-slate-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500">{user?.role}</p>
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

        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
};
