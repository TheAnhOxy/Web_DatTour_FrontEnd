import TourGrid from "../components/TourGrid";

const tours = [
  {
    id: 1,
    title: "Tour Mien Bac 4N3D",
    destination: "Mien Bac",
    time: "4 ngay 3 dem",
    quantity: "12 nguoi",
    rating: 5,
    price: "3.200.000",
    image:
      "/clients/assets/images/gallery-tours/tour-mien-bac-4n3d-ha-noi-ninh-binh-ha-long-yen-tu-1.png",
  },
  {
    id: 2,
    title: "Tour Mien Trung 4N3D",
    destination: "Mien Trung",
    time: "4 ngay 3 dem",
    quantity: "18 nguoi",
    rating: 4,
    price: "3.800.000",
    image:
      "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-1.png",
  },
  {
    id: 3,
    title: "Bien Dao Phu Quoc 3N2D",
    destination: "Phu Quoc",
    time: "3 ngay 2 dem",
    quantity: "10 nguoi",
    rating: 5,
    price: "2.900.000",
    image: "/clients/assets/images/gallery-tours/bien-dao-3n2d-phu-quoc-1.jpg",
  },
  {
    id: 4,
    title: "Bien Dao Con Dao 3N2D",
    destination: "Con Dao",
    time: "3 ngay 2 dem",
    quantity: "8 nguoi",
    rating: 4,
    price: "3.100.000",
    image: "/clients/assets/images/gallery-tours/bien-dao-3n2d-con-dao-1.jpg",
  },
  {
    id: 5,
    title: "Mien Bac 4N3D - Yen Tu",
    destination: "Ha Long",
    time: "4 ngay 3 dem",
    quantity: "16 nguoi",
    rating: 5,
    price: "3.500.000",
    image:
      "/clients/assets/images/gallery-tours/tour-mien-bac-4n3d-ha-noi-ninh-binh-ha-long-yen-tu-2.png",
  },
  {
    id: 6,
    title: "Mien Trung 4N3D - Ba Na",
    destination: "Da Nang",
    time: "4 ngay 3 dem",
    quantity: "14 nguoi",
    rating: 4,
    price: "3.900.000",
    image:
      "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-2.png",
  },
];

const toursPopular = [
  {
    id: 1,
    title: "Mien Bac 4N3D",
    destination: "Ha Long",
    rating: "4.9",
    image:
      "/clients/assets/images/gallery-tours/tour-mien-bac-4n3d-ha-noi-ninh-binh-ha-long-yen-tu-3.png",
  },
  {
    id: 2,
    title: "Mien Trung 4N3D",
    destination: "Hoi An",
    rating: "4.8",
    image:
      "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-3.png",
  },
  {
    id: 3,
    title: "Bien Dao Phu Quoc",
    destination: "Phu Quoc",
    rating: "4.7",
    image: "/clients/assets/images/gallery-tours/bien-dao-3n2d-phu-quoc-2.jpg",
  },
];

export default function ToursPage() {
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
              Tours
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
                <li className="breadcrumb-item active">Tours</li>
              </ol>
            </nav>
          </div>
        </div>
      </section>

      <section className="tour-grid-page py-100 rel z-1">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-md-6 col-sm-10 rmb-75">
              <div className="shop-sidebar">
                <div className="div_filter_clear">
                  <button className="clear_filter" name="btn_clear">
                    <a href="/tours">Clear</a>
                  </button>
                </div>
                <div className="widget widget-filter" data-aos="fade-up" data-aos-delay="50" data-aos-duration="1500" data-aos-offset="50">
                  <h6 className="widget-title">Loc theo gia</h6>
                  <div className="price-filter-wrap">
                    <div className="price-slider-range"></div>
                    <div className="price">
                      <span>Gia </span>
                      <input type="text" id="price" readOnly />
                    </div>
                  </div>
                </div>

                <div className="widget widget-activity" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                  <h6 className="widget-title">Diem den</h6>
                  <ul className="radio-filter">
                    <li>
                      <input className="form-check-input" type="radio" name="domain" id="id_mien_bac" value="b" />
                      <label htmlFor="id_mien_bac">
                        Mien Bac <span>12</span>
                      </label>
                    </li>
                    <li>
                      <input className="form-check-input" type="radio" name="domain" id="id_mien_trung" value="t" />
                      <label htmlFor="id_mien_trung">
                        Mien Trung <span>9</span>
                      </label>
                    </li>
                    <li>
                      <input className="form-check-input" type="radio" name="domain" id="id_mien_nam" value="n" />
                      <label htmlFor="id_mien_nam">
                        Mien Nam <span>8</span>
                      </label>
                    </li>
                  </ul>
                </div>

                <div className="widget widget-reviews" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                  <h6 className="widget-title">Danh gia</h6>
                  <ul className="radio-filter">
                    <li>
                      <input className="form-check-input" type="radio" name="filter_star" id="5star" value="5" />
                      <label htmlFor="5star">
                        <span className="ratting">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                        </span>
                      </label>
                    </li>
                    <li>
                      <input className="form-check-input" type="radio" name="filter_star" id="4star" value="4" />
                      <label htmlFor="4star">
                        <span className="ratting">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star-half-alt white"></i>
                        </span>
                      </label>
                    </li>
                    <li>
                      <input className="form-check-input" type="radio" name="filter_star" id="3star" value="3" />
                      <label htmlFor="3star">
                        <span className="ratting">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star white"></i>
                          <i className="fas fa-star-half-alt white"></i>
                        </span>
                      </label>
                    </li>
                    <li>
                      <input className="form-check-input" type="radio" name="filter_star" id="2star" value="2" />
                      <label htmlFor="2star">
                        <span className="ratting">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star white"></i>
                          <i className="fas fa-star white"></i>
                          <i className="fas fa-star-half-alt white"></i>
                        </span>
                      </label>
                    </li>
                    <li>
                      <input className="form-check-input" type="radio" name="filter_star" id="1star" value="1" />
                      <label htmlFor="1star">
                        <span className="ratting">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star white"></i>
                          <i className="fas fa-star white"></i>
                          <i className="fas fa-star white"></i>
                          <i className="fas fa-star-half-alt white"></i>
                        </span>
                      </label>
                    </li>
                  </ul>
                </div>

                <div className="widget widget-duration" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                  <h6 className="widget-title">Thoi gian</h6>
                  <ul className="radio-filter">
                    <li>
                      <input className="form-check-input" type="radio" name="duration" id="3ngay2dem" value="3n2d" />
                      <label htmlFor="3ngay2dem">3 ngay 2 dem</label>
                    </li>
                    <li>
                      <input className="form-check-input" type="radio" name="duration" id="4ngay3dem" value="4n3d" />
                      <label htmlFor="4ngay3dem">4 ngay 3 dem</label>
                    </li>
                    <li>
                      <input className="form-check-input" type="radio" name="duration" id="5ngay4dem" value="5n4d" />
                      <label htmlFor="5ngay4dem">5 ngay 4 dem</label>
                    </li>
                  </ul>
                </div>

                <div className="widget widget-tour" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                  <h6 className="widget-title">Pho bien Tours</h6>
                  {toursPopular.map((tour) => (
                    <div className="destination-item tour-grid style-three bgc-lighter" key={tour.id}>
                      <div className="image">
                        <span className="badge">10% Off</span>
                        <img src={tour.image} alt="Tour" />
                      </div>
                      <div className="content">
                        <div className="destination-header">
                          <span className="location">
                            <i className="fal fa-map-marker-alt"></i>
                            {tour.destination}
                          </span>
                          <div className="ratting">
                            <i className="fas fa-star"></i>
                            <span>{tour.rating}</span>
                          </div>
                        </div>
                        <h6>
                          <a href={`/tours/${tour.id}`}>{tour.title}</a>
                        </h6>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="widget widget-cta mt-30" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                <div className="content text-white">
                  <span className="h6">Kham Pha Viet Nam</span>
                  <h3>Dia diem du lich tot nhat</h3>
                  <a href="/tours" className="theme-btn style-two bgc-secondary">
                    <span data-hover="Kham pha ngay">Kham pha ngay</span>
                    <i className="fal fa-arrow-right"></i>
                  </a>
                </div>
                <div className="image">
                  <img src="/clients/assets/images/widgets/cta-widget.png" alt="CTA" />
                </div>
                <div className="cta-shape">
                  <img src="/clients/assets/images/widgets/cta-shape2.png" alt="Shape" />
                </div>
              </div>
            </div>

            <div className="col-lg-9">
              <div className="shop-shorter rel z-3 mb-20">
                <div className="sort-text mb-15 me-4 me-xl-auto">Tours tim thay</div>
                <div className="sort-text mb-15 me-4">Sap xep theo</div>
                <select id="sorting_tours">
                  <option value="default">Sap xep theo</option>
                  <option value="new">Moi nhat</option>
                  <option value="old">Cu nhat</option>
                  <option value="hight-to-low">Cao den thap</option>
                  <option value="low-to-high">Thap den cao</option>
                </select>
              </div>

              <TourGrid tours={tours} />
            </div>
          </div>
        </div>
      </section>

      <section
        className="newsletter-three bgc-primary py-100 rel z-1"
        style={{ backgroundImage: "url(/clients/assets/images/newsletter/newsletter-bg-lines.png)" }}
      >
        <div className="container container-1500">
          <div className="row">
            <div className="col-lg-6">
              <div
                className="newsletter-content-part text-white rmb-55"
                data-aos="zoom-in-right"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                <div className="section-title counter-text-wrap mb-45">
                  <h2>Dang ky nhan ban tin cua chung toi de nhan them nhieu uu dai & meo</h2>
                  <p>
                    Website{" "}
                    <span className="count-text plus" data-speed="3000" data-stop="34500">
                      0
                    </span>{" "}
                    trai nghiem pho bien nhat ma ban se nho
                  </p>
                </div>
                <form className="newsletter-form mb-15" action="#">
                  <input id="news-email" type="email" placeholder="Email Address" required />
                  <button type="submit" className="theme-btn bgc-secondary style-two">
                    <span data-hover="Subscribe">Subscribe</span>
                    <i className="fal fa-arrow-right"></i>
                  </button>
                </form>
                <p>Khong yeu cau the tin dung. Khong cam ket</p>
              </div>
              <div
                className="newsletter-bg-image"
                data-aos="zoom-in-up"
                data-aos-delay="100"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                <img src="/clients/assets/images/newsletter/newsletter-bg-image.png" alt="Newsletter" />
              </div>
            </div>
            <div className="col-lg-6">
              <div
                className="newsletter-image-part bgs-cover"
                style={{
                  backgroundImage:
                    "url(/clients/assets/images/newsletter/newsletter-two-right.jpg)",
                }}
                data-aos="fade-left"
                data-aos-duration="1500"
                data-aos-offset="50"
              ></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
