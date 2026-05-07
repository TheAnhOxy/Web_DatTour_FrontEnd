export default function Header() {
  return (
    <header className="main-header header-one">
      <div className="header-upper bg-white py-30 rpy-0">
        <div className="container-fluid clearfix">
          <div className="header-inner rel d-flex align-items-center">
            <div className="logo-outer">
              <div className="logo">
                <a href="/">
                  <img
                    src="/clients/assets/images/logos/logo-two.png"
                    alt="Logo"
                    title="Logo"
                  />
                </a>
              </div>
            </div>

            <div className="nav-outer mx-lg-auto ps-xxl-5 clearfix">
              <nav className="main-menu navbar-expand-lg">
                <div className="navbar-header">
                  <div className="mobile-logo">
                    <a href="/">
                      <img
                        src="/clients/assets/images/logos/logo-two.png"
                        alt="Logo"
                        title="Logo"
                      />
                    </a>
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
                      <a href="/">Trang chu</a>
                    </li>
                    <li>
                      <a href="/about">Gioi thieu</a>
                    </li>
                    <li>
                      <a href="/tours">Tours</a>
                    </li>
                    <li>
                      <a href="/destination">Diem den</a>
                    </li>
                    <li>
                      <a href="/contact">Lien he</a>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>

            <div className="menu-btns py-10">
              <a href="/tours" className="theme-btn style-two bgc-secondary">
                <span data-hover="Dat Ngay">Book Now</span>
                <i className="fal fa-arrow-right"></i>
              </a>
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
                  <ul className="dropdown-menu" id="dropdownMenu">
                    <li>
                      <a href="/login">Dang nhap</a>
                    </li>
                  </ul>
                </li>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
