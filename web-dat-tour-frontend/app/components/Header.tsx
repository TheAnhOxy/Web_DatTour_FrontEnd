"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";

export default function Header() {
  const { user, isLoggedIn, _hasHydrated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="main-header header-one sticky-header-css">
      <div className="header-upper bg-white py-30 rpy-0">
        <div className="container-fluid clearfix">
          <div className="header-inner rel d-flex align-items-center">
            <div className="logo-outer">
              <div className="logo">
                <Link href="/">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/clients/assets/images/logos/logo.png"
                    alt="Logo"
                    title="Logo"
                    width={155}
                    height={40}
                  />
                </Link>
              </div>
            </div>

            <div className="nav-outer mx-lg-auto ps-xxl-5 clearfix">
              <nav className="main-menu navbar-expand-lg">
                <div className="navbar-header">
                  <div className="mobile-logo">
                    <Link href="/">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/clients/assets/images/logos/logo.png"
                        alt="Logo"
                        title="Logo"
                        width={155}
                        height={40}
                      />
                    </Link>
                  </div>

                  <button
                    type="button"
                    className="navbar-toggle"
                    data-bs-toggle="collapse"
                    data-bs-target=".navbar-collapse"
                  >
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                  </button>
                </div>

                <div className="navbar-collapse collapse clearfix">
                  <ul className="navigation clearfix">
                    <li>
                      <Link href="/">Trang chủ</Link>
                    </li>
                    <li>
                      <a href="/about">Giới thiệu</a>
                    </li>
                    <li>
                      <Link href="/tours">Tours</Link>
                    </li>
                    <li>
                      <Link href="/destination">Điểm đến</Link>
                    </li>
                    <li>
                      <a href="/contact">Liên hệ</a>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>

            <div className="menu-btns py-10">
              <Link href="/tours" className="theme-btn style-two bgc-secondary">
                <span data-hover="Đặt ngay">Đặt ngay</span>
                <i className="fal fa-arrow-right"></i>
              </Link>
              <div className="menu-sidebar">
                <li className="drop-down">
                  <button
                    className="dropdown-toggle bg-transparent"
                    id="userDropdown"
                    style={{ color: "black" }}
                  >
                    <i
                      className="bx bxs-user bx-tada"
                      style={{ fontSize: 36, color: "black" }}
                    ></i>
                  </button>

                  {/* Chờ hydration để tránh SSR mismatch */}
                  {_hasHydrated && (
                    <ul className="dropdown-menu" id="dropdownMenu">
                      {isLoggedIn ? (
                        <>
                          <li
                            style={{
                              padding: "8px 16px",
                              borderBottom: "1px solid #eee",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                color: "#555",
                                fontWeight: 500,
                                display: "block",
                                maxWidth: 180,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {user?.email}
                            </span>
                          </li>
                          <li>
                            <Link href="/user-profile">Trang cá nhân</Link>
                          </li>
                          <li>
                            <Link href="/my-tours">Tour của tôi</Link>
                          </li>
                          <li>
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleLogout();
                              }}
                              style={{ color: "#e74c3c" }}
                            >
                              Đăng xuất
                            </a>
                          </li>
                        </>
                      ) : (
                        <>
                          <li>
                            <Link href="/login">Đăng nhập</Link>
                          </li>
                          <li>
                            <Link href="/login?tab=signup">Đăng ký</Link>
                          </li>
                        </>
                      )}
                    </ul>
                  )}
                </li>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
