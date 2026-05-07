const toursPopular = [
  {
    id: 1,
    title: "Tour Mien Trung 4N3D",
    destination: "Da Nang",
    rating: "4.8",
    image:
      "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-1.png",
  },
  {
    id: 2,
    title: "Tour Mien Bac 4N3D",
    destination: "Ha Long",
    rating: "4.7",
    image:
      "/clients/assets/images/gallery-tours/tour-mien-bac-4n3d-ha-noi-ninh-binh-ha-long-yen-tu-1.png",
  },
];

const myTours = [
  {
    id: 1,
    bookingStatus: "b",
    destination: "Ha Long",
    rating: 5,
    title: "Tour Mien Bac 4N3D",
    description:
      "Hanh trinh tham quan Ha Long, Ninh Binh va Yen Tu voi nhieu trai nghiem dac sac.",
    time: "4 ngay 3 dem",
    people: 3,
    totalPrice: "6.800.000",
    image:
      "/clients/assets/images/gallery-tours/tour-mien-bac-4n3d-ha-noi-ninh-binh-ha-long-yen-tu-2.png",
  },
  {
    id: 2,
    bookingStatus: "y",
    destination: "Da Nang",
    rating: 4,
    title: "Tour Mien Trung 4N3D",
    description:
      "Kham pha Ba Na, Hoi An va nhung diem den noi bat tai Da Nang.",
    time: "4 ngay 3 dem",
    people: 2,
    totalPrice: "5.200.000",
    image:
      "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-2.png",
  },
  {
    id: 3,
    bookingStatus: "f",
    destination: "Phu Quoc",
    rating: 5,
    title: "Bien Dao Phu Quoc 3N2D",
    description:
      "Tron bo hanh trinh bien dao Phu Quoc voi nhung bai bien tuyet dep.",
    time: "3 ngay 2 dem",
    people: 4,
    totalPrice: "8.400.000",
    image: "/clients/assets/images/gallery-tours/bien-dao-3n2d-phu-quoc-1.jpg",
  },
];

export default function MyToursPage() {
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
              My Tours
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
                <li className="breadcrumb-item active">My Tours</li>
              </ol>
            </nav>
          </div>
        </div>
      </section>

      <section className="tour-list-page py-100 rel z-1">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-md-6 col-sm-10 rmb-75">
              <div className="shop-sidebar mb-30">
                <div className="widget widget-tour" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                  <h6 className="widget-title">Pho bien Tours</h6>
                  {toursPopular.map((tour) => (
                    <div className="destination-item tour-grid style-three bgc-lighter" key={tour.id}>
                      <div className="image">
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
            </div>
            <div className="col-lg-9">
              {myTours.map((tour) => (
                <div
                  className="destination-item style-three bgc-lighter"
                  data-aos="fade-up"
                  data-aos-duration="1500"
                  data-aos-offset="50"
                  key={tour.id}
                >
                  <div className="image">
                    {tour.bookingStatus === "b" && <span className="badge">Doi xac nhan</span>}
                    {tour.bookingStatus === "y" && <span className="badge bgc-pink">Sap khoi hanh</span>}
                    {tour.bookingStatus === "f" && <span className="badge bgc-primary">Hoan thanh</span>}
                    {tour.bookingStatus === "c" && (
                      <span className="badge" style={{ backgroundColor: "red" }}>
                        Da huy
                      </span>
                    )}

                    <img src={tour.image} alt="Tour List" />
                  </div>
                  <div className="content">
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
                      <a href="/tour-booked">{tour.title}</a>
                    </h5>
                    <div className="truncate-3-lines">{tour.description}</div>

                    <ul className="blog-meta">
                      <li>
                        <i className="far fa-clock"></i>
                        {tour.time}
                      </li>
                      <li>
                        <i className="far fa-user"></i> {tour.people} nguoi
                      </li>
                    </ul>
                    <div className="destination-footer">
                      <span className="price">
                        <span>{tour.totalPrice}</span>/vnd
                      </span>
                      {tour.bookingStatus === "f" && (
                        <a href={`/tours/${tour.id}`} className="theme-btn style-two style-three">
                          <span data-hover="Danh gia">Danh gia</span>
                          <i className="fal fa-arrow-right"></i>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
