const tours = [
  {
    id: 1,
    title: "Tour Ba Na Hills",
    destination: "Da Nang",
    time: "3 ngay 2 dem",
    rating: "4.8",
    price: "2.500.000",
    image:
      "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-1.png",
  },
  {
    id: 2,
    title: "Tour Ha Long",
    destination: "Quang Ninh",
    time: "2 ngay 1 dem",
    rating: "4.7",
    price: "1.800.000",
    image: "/clients/assets/images/gallery-tours/tour-mien-bac-4n3d-ha-noi-ninh-binh-ha-long-yen-tu-1.png",
  },
  {
    id: 3,
    title: "Tour Phu Quoc",
    destination: "Phu Quoc",
    time: "4 ngay 3 dem",
    rating: "4.9",
    price: "3.200.000",
    image: "/clients/assets/images/gallery-tours/bien-dao-3n2d-phu-quoc-1.jpg",
  },
  {
    id: 4,
    title: "Tour Con Dao",
    destination: "Con Dao",
    time: "3 ngay 2 dem",
    rating: "4.6",
    price: "2.100.000",
    image: "/clients/assets/images/gallery-tours/bien-dao-3n2d-con-dao-1.jpg",
  },
];

const toursPopular = [
  {
    id: 1,
    title: "Da Nang - Hoi An",
    time: "2 ngay 1 dem",
    image: "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-2.png",
  },
  {
    id: 2,
    title: "Ha Long - Yen Tu",
    time: "3 ngay 2 dem",
    image: "/clients/assets/images/gallery-tours/tour-mien-bac-4n3d-ha-noi-ninh-binh-ha-long-yen-tu-2.png",
  },
  {
    id: 3,
    title: "Phu Quoc",
    time: "3 ngay 2 dem",
    image: "/clients/assets/images/gallery-tours/bien-dao-3n2d-phu-quoc-2.jpg",
  },
  {
    id: 4,
    title: "Con Dao",
    time: "2 ngay 1 dem",
    image: "/clients/assets/images/gallery-tours/bien-dao-3n2d-con-dao-2.jpg",
  },
];

export default function Home() {
  return (
    

    <>
      <section className="hero-area bgc-black pt-200 rpt-120 rel z-2">
        <div className="container-fluid">
          <h1
            className="hero-title"
            data-aos="flip-up"
            data-aos-delay="50"
            data-aos-duration="1500"
            data-aos-offset="50"
          >
            Tours Du Lich
          </h1>
          <div
            className="main-hero-image bgs-cover"
            style={{
              backgroundImage: "url(/clients/assets/images/hero/hero.jpg)",
            }}
          ></div>
        </div>
        <form action="#" method="GET" id="search_form">
          <div className="container container-1400">
            <div
              className="search-filter-inner"
              data-aos="zoom-out-down"
              data-aos-duration="1500"
              data-aos-offset="50"
            >
              <div className="filter-item clearfix">
                <div className="icon">
                  <i className="fal fa-map-marker-alt"></i>
                </div>
                <span className="title">Diem den</span>
                <select name="destination" id="destination">
                  <option value="">Chon diem den</option>
                  <option value="dn">Da Nang</option>
                  <option value="cd">Con Dao</option>
                  <option value="hn">Ha Noi</option>
                  <option value="hcm">TP. Ho Chi Minh</option>
                  <option value="hl">Ha Long</option>
                  <option value="nb">Ninh Binh</option>
                  <option value="pq">Phu Quoc</option>
                  <option value="dl">Da Lat</option>
                  <option value="qt">Quang Tri</option>
                  <option value="kh">Khanh Hoa (Nha Trang)</option>
                  <option value="ct">Can Tho</option>
                  <option value="vt">Vung Tau</option>
                  <option value="qn">Quang Ninh</option>
                  <option value="la">Lao Cai (Sa Pa)</option>
                  <option value="bd">Binh Dinh (Quy Nhon)</option>
                </select>
              </div>
              <div className="filter-item clearfix">
                <div className="icon">
                  <i className="fal fa-calendar-alt"></i>
                </div>
                <span className="title">Ngay khoi hanh</span>
                <input
                  type="text"
                  id="start_date"
                  name="start_date"
                  className="datetimepicker datetimepicker-custom"
                  placeholder="Chon ngay di"
                  readOnly
                />
              </div>
              <div className="filter-item clearfix">
                <div className="icon">
                  <i className="fal fa-calendar-alt"></i>
                </div>
                <span className="title">Ngay ket thuc</span>
                <input
                  type="text"
                  id="end_date"
                  name="end_date"
                  className="datetimepicker datetimepicker-custom"
                  placeholder="Chon ngay ve"
                  readOnly
                />
              </div>
              <div className="search-button">
                <button className="theme-btn" type="submit">
                  <span data-hover="Tim kiem">Tim kiem</span>
                  <i className="far fa-search"></i>
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>

      <div className="form-back-drop"></div>

      <section className="destinations-area bgc-black pt-100 pb-70 rel z-1">
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-lg-12">
              <div
                className="section-title text-white text-center counter-text-wrap mb-70"
                data-aos="fade-up"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                <h2>Kham pha kho bau Viet Nam cung HTravel</h2>
                <p>
                  Website
                  <span
                    className="count-text plus"
                    data-speed="3000"
                    data-stop="24080"
                  >
                    0
                  </span>
                  pho bien nhat ma ban se nho
                </p>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            {tours.map((tour) => (
              <div
                className="col-xxl-3 col-xl-4 col-md-6"
                style={{ marginBottom: 30 }}
                key={tour.id}
              >
                <div
                  className="destination-item block_tours"
                  data-aos="fade-up"
                  data-aos-duration="1500"
                  data-aos-offset="50"
                >
                  <div className="image">
                    <div className="ratting">
                      <i className="fas fa-star"></i> {tour.rating}
                    </div>
                    <a href="#" className="heart">
                      <i className="fas fa-heart"></i>
                    </a>
                    <img src={tour.image} alt="Destination" />
                  </div>
                  <div className="content">
                    <span className="location">
                      <i className="fal fa-map-marker-alt"></i>
                      {tour.destination}
                    </span>
                    <h5>
                      <a href={`/tours/${tour.id}`}>{tour.title}</a>
                    </h5>
                    <span className="time">{tour.time}</span>
                  </div>
                  <div className="destination-footer">
                    <span className="price">
                      <span>{tour.price}</span> VND / nguoi
                    </span>
                    <a href={`/tours/${tour.id}`} className="read-more">
                      Dat ngay <i className="fal fa-angle-right"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-us-area py-100 rpb-90 rel z-1">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-5 col-lg-6">
              <div
                className="about-us-content rmb-55"
                data-aos="fade-left"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                <div className="section-title mb-25">
                  <h2>
                    Du lich voi su tu tin Ly do hang dau de chon cong ty
                    chung toi
                  </h2>
                </div>
                <p>
                  Chung toi se no luc het minh de bien giac mo du lich cua ban
                  thanh hien thuc nhung vien ngoc an va nhung diem tham quan
                  khong the bo qua
                </p>
                <div className="divider counter-text-wrap mt-45 mb-55">
                  <span>
                    Chung toi co{" "}
                    <span>
                      <span
                        className="count-text plus"
                        data-speed="3000"
                        data-stop="5"
                      >
                        0
                      </span>
                      Nam
                    </span>
                    kinh nghiem
                  </span>
                </div>
                <div className="row">
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
                  <span data-hover="Kham pha Diem den">Kham pha Diem den</span>
                  <i className="fal fa-arrow-right"></i>
                </a>
              </div>
            </div>
            <div
              className="col-xl-7 col-lg-6"
              data-aos="fade-right"
              data-aos-duration="1500"
              data-aos-offset="50"
            >
              <div className="about-us-image">
                <div className="shape">
                  <img src="/clients/assets/images/about/shape1.png" alt="Shape" />
                </div>
                <div className="shape">
                  <img src="/clients/assets/images/about/shape2.png" alt="Shape" />
                </div>
                <div className="shape">
                  <img src="/clients/assets/images/about/shape3.png" alt="Shape" />
                </div>
                <div className="shape">
                  <img src="/clients/assets/images/about/shape4.png" alt="Shape" />
                </div>
                <div className="shape">
                  <img src="/clients/assets/images/about/shape5.png" alt="Shape" />
                </div>
                <div className="shape">
                  <img src="/clients/assets/images/about/shape6.png" alt="Shape" />
                </div>
                <div className="shape">
                  <img src="/clients/assets/images/about/shape7.png" alt="Shape" />
                </div>
                <img src="/clients/assets/images/about/about.png" alt="About" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="popular-destinations-area rel z-1">
        <div className="container-fluid">
          <div className="popular-destinations-wrap br-20 bgc-lighter pt-100 pb-70">
            <div className="row justify-content-center">
              <div className="col-lg-12">
                <div
                  className="section-title text-center counter-text-wrap mb-70"
                  data-aos="fade-up"
                  data-aos-duration="1500"
                  data-aos-offset="50"
                >
                  <h2>Kham pha cac diem den pho bien</h2>
                  <p>
                    Website{" "}
                    <span className="count-text plus" data-speed="3000" data-stop="24080">
                      0
                    </span>{" "}
                    trai nghiem pho bien nhat
                  </p>
                </div>
              </div>
            </div>
            <div className="container">
              <div className="row justify-content-center">
                {toursPopular.map((tour, index) => (
                  <div
                    className={index === 2 || index === 3 ? "col-md-6 item" : "col-xl-3 col-md-6 item"}
                    key={tour.id}
                  >
                    <div className="destination-item style-two" data-aos-duration="1500" data-aos-offset="50">
                      <div className="image" style={{ maxHeight: 250 }}>
                        <a href="#" className="heart">
                          <i className="fas fa-heart"></i>
                        </a>
                        <img src={tour.image} alt="Destination" />
                      </div>
                      <div className="content">
                        <h6 className="tour-title">
                          <a href={`/tours/${tour.id}`}>{tour.title}</a>
                        </h6>
                        <span className="time">{tour.time}</span>
                        <a href={`/tours/${tour.id}`} className="more">
                          <i className="fas fa-chevron-right"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-area pt-100 pb-45 rel z-1">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-6">
              <div
                className="features-content-part mb-55"
                data-aos="fade-left"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                <div className="section-title mb-60">
                  <h2>
                    Trai nghiem du lich tuyet dinh mang den su khac biet cho cong ty chung toi
                  </h2>
                </div>
                <div className="features-customer-box">
                  <div className="image">
                    <img
                      src="/clients/assets/images/features/features-box.jpg"
                      alt="Features"
                    />
                  </div>
                  <div className="content">
                    <div className="feature-authors mb-15">
                      <img
                        src="/clients/assets/images/features/feature-author1.jpg"
                        alt="Author"
                      />
                      <img
                        src="/clients/assets/images/features/feature-author2.jpg"
                        alt="Author"
                      />
                      <img
                        src="/clients/assets/images/features/feature-author3.jpg"
                        alt="Author"
                      />
                      <span>4k+</span>
                    </div>
                    <h6>850K+ Khach hang hai long</h6>
                    <div className="divider style-two counter-text-wrap my-25">
                      <span>
                        <span className="count-text plus" data-speed="3000" data-stop="5">
                          0
                        </span>
                        Nam
                      </span>
                    </div>
                    <p>Chung toi tu hao cung cap cac hanh trinh duoc ca nhan hoa</p>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="col-xl-6"
              data-aos="fade-right"
              data-aos-duration="1500"
              data-aos-offset="50"
            >
              <div className="row pb-25">
                <div className="col-md-6">
                  <div className="feature-item">
                    <div className="icon">
                      <i className="flaticon-tent"></i>
                    </div>
                    <div className="content">
                      <h5>
                        <a href="/tours">Chinh Phuc Canh Quan Viet Nam</a>
                      </h5>
                      <p>
                        Kham pha nhung canh dep hung vi va tuyet voi cua dat nuoc Viet Nam.
                      </p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="icon">
                      <i className="flaticon-tent"></i>
                    </div>
                    <div className="content">
                      <h5>
                        <a href="/tours">Trai Nghiem Dac Sac Viet Nam</a>
                      </h5>
                      <p>
                        Trai nghiem nhung hoat dong va le hoi dac trung cua van hoa Viet.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="feature-item mt-20">
                    <div className="icon">
                      <i className="flaticon-tent"></i>
                    </div>
                    <div className="content">
                      <h5>
                        <a href="/tours">Kham Pha Di San Viet Nam</a>
                      </h5>
                      <p>
                        Kham pha cac di san the gioi va nhung ky quan thien nhien noi tieng.
                      </p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="icon">
                      <i className="flaticon-tent"></i>
                    </div>
                    <div className="content">
                      <h5>
                        <a href="/tours">Ve Dep Thien Nhien Viet</a>
                      </h5>
                      <p>
                        Chinh phuc ve dep tu nhien hoang so va ky vi cua Viet Nam.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-area pt-100 rel z-1">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xl-4 col-md-6" data-aos="zoom-in-down" data-aos-duration="1500" data-aos-offset="50">
              <div
                className="cta-item"
                style={{ backgroundImage: "url(/clients/assets/images/cta/cta1.jpg)" }}
              >
                <span className="category">Kham Pha Ve Dep Van Hoa Viet</span>
                <h2>Tim hieu nhung gia tri van hoa doc dao cua cac vung mien Viet Nam.</h2>
                <a href="/tours" className="theme-btn style-two bgc-secondary">
                  <span data-hover="Kham pha">Kham pha</span>
                  <i className="fal fa-arrow-right"></i>
                </a>
              </div>
            </div>
            <div
              className="col-xl-4 col-md-6"
              data-aos="zoom-in-down"
              data-aos-delay="50"
              data-aos-duration="1500"
              data-aos-offset="50"
            >
              <div
                className="cta-item"
                style={{ backgroundImage: "url(/clients/assets/images/cta/cta2.jpg)" }}
              >
                <span className="category">Bai bien Sea</span>
                <h2>Bai trong xanh dat dao o Viet Nam</h2>
                <a href="/tours" className="theme-btn style-two">
                  <span data-hover="Kham pha">Kham pha</span>
                  <i className="fal fa-arrow-right"></i>
                </a>
              </div>
            </div>
            <div
              className="col-xl-4 col-md-6"
              data-aos="zoom-in-down"
              data-aos-delay="100"
              data-aos-duration="1500"
              data-aos-offset="50"
            >
              <div
                className="cta-item"
                style={{ backgroundImage: "url(/clients/assets/images/cta/cta3.jpg)" }}
              >
                <span className="category">Thac nuoc</span>
                <h2>Thac nuoc lon nhat Viet Nam</h2>
                <a href="/tours" className="theme-btn style-two bgc-secondary">
                  <span data-hover="Kham pha">Kham pha</span>
                  <i className="fal fa-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
