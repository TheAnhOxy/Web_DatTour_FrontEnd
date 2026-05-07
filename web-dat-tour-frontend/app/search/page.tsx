const toursSearch = [
  {
    id: 1,
    title: "Tour Mien Trung 4N3D",
    destination: "Da Nang",
    time: "4 ngay 3 dem",
    quantity: "16 nguoi",
    rating: 5,
    price: "3.800.000",
    image:
      "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-1.png",
  },
  {
    id: 2,
    title: "Tour Mien Bac 4N3D",
    destination: "Ha Long",
    time: "4 ngay 3 dem",
    quantity: "12 nguoi",
    rating: 4,
    price: "3.200.000",
    image:
      "/clients/assets/images/gallery-tours/tour-mien-bac-4n3d-ha-noi-ninh-binh-ha-long-yen-tu-1.png",
  },
];

export default function SearchPage() {
  const isEmpty = toursSearch.length === 0;

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
              Search
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
                <li className="breadcrumb-item active">Search</li>
              </ol>
            </nav>
          </div>
        </div>
      </section>

      <section className="tour-grid-page py-100 rel z-2">
        <div className="container">
          <div className="row">
            {isEmpty ? (
              <h4 className="alert alert-danger">
                Khong co tour nao lien quan den tim kiem cua ban. Thu tim kiem voi tu khoa khac nhe!
              </h4>
            ) : (
              toursSearch.map((tour) => (
                <div className="col-xl-4 col-md-6" style={{ marginBottom: 30 }} key={tour.id}>
                  <div
                    className="destination-item tour-grid style-three bgc-lighter equal-block-fix"
                    data-aos="fade-up"
                    data-aos-duration="1500"
                    data-aos-offset="50"
                  >
                    <div className="image">
                      <a href="#" className="heart">
                        <i className="fas fa-heart"></i>
                      </a>
                      <img src={tour.image} alt="Tour List" />
                    </div>
                    <div className="content equal-content-fix">
                      <div className="destination-header">
                        <span className="location">
                          <i className="fal fa-map-marker-alt"></i>
                          {tour.destination}
                        </span>
                        <div className="ratting">
                          {[...Array(5)].map((_, index) => (
                            <i
                              className={index < tour.rating ? "fas fa-star" : "far fa-star"}
                              key={`${tour.id}-${index}`}
                            ></i>
                          ))}
                        </div>
                      </div>
                      <h5>
                        <a href={`/tours/${tour.id}`}>{tour.title}</a>
                      </h5>
                      <ul className="blog-meta">
                        <li>
                          <i className="far fa-clock"></i>
                          {tour.time}
                        </li>
                        <li>
                          <i className="far fa-user"></i>
                          {tour.quantity}
                        </li>
                      </ul>
                      <div className="destination-footer">
                        <span className="price">
                          <span>{tour.price}</span> VND / nguoi
                        </span>
                        <a href={`/tours/${tour.id}`} className="theme-btn style-two style-three">
                          <span data-hover="Dat ngay">Dat ngay</span>
                          <i className="fal fa-arrow-right"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
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
