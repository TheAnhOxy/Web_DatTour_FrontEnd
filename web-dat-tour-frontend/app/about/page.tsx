export default function AboutPage() {
  return (
    <>

      <section
        className="page-banner-area pt-50 pb-35 rel z-1 bgs-cover"
        style={{ backgroundImage: "url(/clients/assets/images/banner/banner.jpg)" }}
      >
        <div className="container">
          <div className="banner-inner text-white">
            <h2
              className="page-title mb-10"
              data-aos="fade-left"
              data-aos-duration="1500"
              data-aos-offset="50"
            >
              Gioi thieu
            </h2>
            <nav aria-label="breadcrumb">
              <ol
                className="breadcrumb justify-content-center mb-20"
                data-aos="fade-right"
                data-aos-delay="200"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                <li className="breadcrumb-item">
                  <a href="/">Trang chu</a>
                </li>
                <li className="breadcrumb-item active">Gioi thieu</li>
              </ol>
            </nav>
          </div>
        </div>
      </section>

      <section className="about-area-two py-100 rel z-1">
        <div className="container">
          <div className="row justify-content-between">
            <div className="col-xl-3" data-aos="fade-right" data-aos-duration="1500" data-aos-offset="50">
              <span className="subtitle mb-35">Ve chung toi</span>
            </div>
            <div className="col-xl-9">
              <div className="about-page-content" data-aos="fade-left" data-aos-duration="1500" data-aos-offset="50">
                <div className="row">
                  <div className="col-lg-8 pe-lg-5 me-lg-5">
                    <div className="section-title mb-25">
                      <h2>Kinh nghiem va cong ty du lich chuyen nghiep o Viet Nam</h2>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="experience-years rmb-20">
                      <span className="title bgc-secondary">Nam kinh nghiem</span>
                      <span className="text">Chung toi co </span>
                      <span className="years">5+</span>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <p>
                      Chung toi chuyen tao ra nhung trai nghiem thanh pho kho quen cho du khach muon kham pha trai tim va
                      du khach qua nhung con pho soi dong, cac dia danh lich su va nhung vien ngoc an giau cua moi thanh
                      pho.
                    </p>
                    <ul className="list-style-two mt-35">
                      <li>Co quan Trai nghiem</li>
                      <li>Doi ngu Chuyen nghiep</li>
                      <li>Du lich Chi phi Thap</li>
                      <li>Ho tro Truc tuyen 24/7</li>
                    </ul>
                    <a href="/tours" className="theme-btn style-three mt-30">
                      <span data-hover="Kham pha Tours">Kham pha Tours</span>
                      <i className="fal fa-arrow-right"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-features-area">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-4 col-md-6">
              <div className="about-feature-image" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                <img src="/clients/assets/images/about/about-feature1.jpg" alt="About" />
              </div>
            </div>
            <div className="col-xl-4 col-md-6">
              <div
                className="about-feature-image"
                data-aos="fade-up"
                data-aos-delay="50"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                <img src="/clients/assets/images/about/about-feature2.jpg" alt="About" />
              </div>
            </div>
            <div className="col-xl-4 col-md-8">
              <div
                className="about-feature-boxes"
                data-aos="fade-up"
                data-aos-delay="100"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                <div className="feature-item style-three bgc-secondary">
                  <div className="icon-title">
                    <div className="icon">
                      <i className="flaticon-award-symbol"></i>
                    </div>
                    <h5>
                      <a href="#">Chung toi la cong ty dat giai thuong</a>
                    </h5>
                  </div>
                  <div className="content">
                    <p>Tai Pinnacle Business Solutions cam ket ve su xuat sac va doi moi da dat duoc</p>
                  </div>
                </div>
                <div className="feature-item style-three bgc-primary">
                  <div className="icon-title">
                    <div className="icon">
                      <i className="flaticon-tourism"></i>
                    </div>
                    <h5>
                      <a href="#">5000+ Diem den du lich pho bien</a>
                    </h5>
                  </div>
                  <div className="content">
                    <p>Doi ngu chuyen gia cua chung toi tan tam phat trien cac chien luoc tien tien thuc day thanh cong</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-us-area pt-70 pb-100 rel z-1">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-5 col-lg-6">
              <div className="about-us-content rmb-55" data-aos="fade-left" data-aos-duration="1500" data-aos-offset="50">
                <div className="section-title mb-25">
                  <h2>Du lich voi su tu tin Ly do hang dau de chon cong ty cua chung toi</h2>
                </div>
                <p>
                  Chung toi hop tac chat che voi khach hang de hieu ro nhung thach thuc va muc tieu, cung cap cac giai
                  phap tuy chinh de nang cao hieu qua, tang loi nhuan va thuc day tang truong ben vung.
                </p>
                <div className="row pt-25">
                  <div className="col-6">
                    <div className="counter-item counter-text-wrap">
                      <span className="count-text k-plus" data-speed="2000" data-stop="1">
                        0
                      </span>
                      <span className="counter-title">Diem den pho bien</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="counter-item counter-text-wrap">
                      <span className="count-text m-plus" data-speed="3000" data-stop="8">
                        0
                      </span>
                      <span className="counter-title">Khach hang hai long</span>
                    </div>
                  </div>
                </div>
                <a href="/destination" className="theme-btn mt-10 style-two">
                  <span data-hover="Kham pha cac diem den">Kham pha cac diem den</span>
                  <i className="fal fa-arrow-right"></i>
                </a>
              </div>
            </div>
            <div className="col-xl-7 col-lg-6" data-aos="fade-right" data-aos-duration="1500" data-aos-offset="50">
              <div className="about-us-page">
                <img src="/clients/assets/images/about/about-page.jpg" alt="About" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-team-area pb-70 rel z-1">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-12">
              <div
                className="section-title text-center counter-text-wrap mb-50"
                data-aos="fade-up"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                <p>
                  Website{" "}
                  <span className="count-text plus bgc-primary" data-speed="3000" data-stop="34500">
                    0
                  </span>{" "}
                  trai nghiem pho bien nhat ma ban se nho
                </p>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-xl-3 col-lg-4 col-sm-6">
              <div className="team-item hover-content" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                <img src="/clients/assets/images/team/guide-dien.jpg" alt="Guide" />
                <div className="content">
                  <h6>NGUYEN MINH DIEN</h6>
                  <span className="designation">Founder</span>
                  <div className="social-style-one inner-content">
                    <a href="/contact">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href="https://www.facebook.com/dienne.dev">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="/contact">
                      <i className="fab fa-instagram"></i>
                    </a>
                    <a href="https://www.youtube.com/@dienne248">
                      <i className="fab fa-youtube"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-4 col-sm-6">
              <div className="team-item hover-content" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                <img src="/clients/assets/images/team/guide-ngan.jpg" alt="Guide" />
                <div className="content">
                  <h6>BAO NGAN</h6>
                  <span className="designation">Co-founder</span>
                  <div className="social-style-one inner-content">
                    <a href="/contact">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href="https://www.facebook.com/dienne.dev">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="/contact">
                      <i className="fab fa-instagram"></i>
                    </a>
                    <a href="https://www.youtube.com/@dienne248">
                      <i className="fab fa-youtube"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-feature-two bgc-black pt-100 pb-45 rel z-1">
        <div className="container">
          <div
            className="section-title text-center text-white counter-text-wrap mb-50"
            data-aos="fade-up"
            data-aos-duration="1500"
            data-aos-offset="50"
          >
            <h2>Lam the nao de huong loi tu cac chuyen du lich cua chung toi</h2>
            <p>
              Website{" "}
              <span className="count-text plus" data-speed="3000" data-stop="34500">
                0
              </span>{" "}
              pho bien nhat kinh nghiem ban se nho
            </p>
          </div>
          <div className="row">
            <div className="col-xl-3 col-lg-4 col-md-6" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
              <div className="feature-item style-two">
                <div className="icon">
                  <i className="flaticon-save-money"></i>
                </div>
                <div className="content">
                  <h5>
                    <a href="/tours">Dam bao gia tot nhat</a>
                  </h5>
                  <p>Cam ket gia uu dai nhat, giup ban tiet kiem toi da chi phi du lich.</p>
                </div>
              </div>
            </div>
            <div
              className="col-xl-3 col-lg-4 col-md-6"
              data-aos="fade-up"
              data-aos-delay="50"
              data-aos-duration="1500"
              data-aos-offset="50"
            >
              <div className="feature-item style-two">
                <div className="icon">
                  <i className="flaticon-travel-1"></i>
                </div>
                <div className="content">
                  <h5>
                    <a href="/tours">Diem den da dang</a>
                  </h5>
                  <p>Hang nghin diem den hap dan, phu hop moi so thich va phong cach du lich.</p>
                </div>
              </div>
            </div>
            <div
              className="col-xl-3 col-lg-4 col-md-6"
              data-aos="fade-up"
              data-aos-delay="100"
              data-aos-duration="1500"
              data-aos-offset="50"
            >
              <div className="feature-item style-two">
                <div className="icon">
                  <i className="flaticon-booking"></i>
                </div>
                <div className="content">
                  <h5>
                    <a href="/tours">Dat cho nhanh</a>
                  </h5>
                  <p>Quy trinh dat cho don gian, nhanh chong, dam bao chuyen di suon se.</p>
                </div>
              </div>
            </div>
            <div
              className="col-xl-3 col-lg-4 col-md-6"
              data-aos="fade-up"
              data-aos-delay="150"
              data-aos-duration="1500"
              data-aos-offset="50"
            >
              <div className="feature-item style-two">
                <div className="icon">
                  <i className="flaticon-guidepost"></i>
                </div>
                <div className="content">
                  <h5>
                    <a href="/tours">Huong dan du lich tot</a>
                  </h5>
                  <p>Doi ngu huong dan tan tam, giau kinh nghiem, dong hanh cung ban moi hanh trinh.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="shape">
          <img src="/clients/assets/images/video/shape1.png" alt="shape" />
        </div>
      </section>

      <div className="client-logo-area mb-100">
        <div className="container">
          <div className="client-logo-wrap pt-60 pb-55">
            <div className="text-center mb-40" data-aos="zoom-in" data-aos-duration="1500" data-aos-offset="50">
              <h6>Chung toi duoc gioi thieu boi:</h6>
            </div>
            <div className="client-logo-active">
              <div className="client-logo-item" data-aos="flip-up" data-aos-duration="1500" data-aos-offset="50">
                <a href="#">
                  <img src="/clients/assets/images/client-logos/client-logo1.png" alt="Client Logo" />
                </a>
              </div>
              <div
                className="client-logo-item"
                data-aos="flip-up"
                data-aos-delay="50"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                <a href="#">
                  <img src="/clients/assets/images/client-logos/client-logo2.png" alt="Client Logo" />
                </a>
              </div>
              <div
                className="client-logo-item"
                data-aos="flip-up"
                data-aos-delay="100"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                <a href="#">
                  <img src="/clients/assets/images/client-logos/client-logo3.png" alt="Client Logo" />
                </a>
              </div>
              <div
                className="client-logo-item"
                data-aos="flip-up"
                data-aos-delay="150"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                <a href="#">
                  <img src="/clients/assets/images/client-logos/client-logo4.png" alt="Client Logo" />
                </a>
              </div>
              <div
                className="client-logo-item"
                data-aos="flip-up"
                data-aos-delay="200"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                <a href="#">
                  <img src="/clients/assets/images/client-logos/client-logo5.png" alt="Client Logo" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
