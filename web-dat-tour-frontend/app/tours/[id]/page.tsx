import ReviewsSection from "../../components/ReviewsSection";

const tourDetail = {
  destination: "Da Nang",
  title: "Kham pha Ba Na - Hoi An",
  rating: 4,
  time: "3 ngay 2 dem",
  startDate: "12-05-2026",
  endDate: "14-05-2026",
  priceAdult: "2.900.000",
  priceChild: "1.800.000",
  description:
    "Hanh trinh kham pha nhung diem den noi bat, pho co Hoi An va Ba Na Hills voi trai nghiem dac sac.",
  images: [
    "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-1.png",
    "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-2.png",
    "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-3.png",
    "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-4.png",
    "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-5.png",
  ],
  timeline: [
    { id: 1, title: "Da Nang - Son Tra", description: "Tham quan Son Tra, chua Linh Ung va bien My Khe." },
    { id: 2, title: "Ba Na Hills", description: "Trai nghiem cap treo, Cau Vang va lang Phap." },
    { id: 3, title: "Hoi An", description: "Pho co Hoi An, den long va am thuc dia phuong." },
  ],
};

const reviews = [
  {
    id: 1,
    name: "Nguyen Minh Dien",
    rating: 5,
    comment: "Tour rat tuyet voi, dich vu tot va lich trinh hop ly.",
    avatar: "/clients/assets/images/user-profile/user-avatar.png",
  },
  {
    id: 2,
    name: "Bao Ngan",
    rating: 4,
    comment: "Canh dep, huong dan vien than thien, gia hop ly.",
    avatar: "/clients/assets/images/user-profile/user-avatar.png",
  },
];

const tourRecommendations = [
  {
    id: 1,
    title: "Mien Trung 4N3D",
    destination: "Hoi An",
    rating: "4.8",
    image:
      "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-1.png",
  },
  {
    id: 2,
    title: "Bien Dao Phu Quoc",
    destination: "Phu Quoc",
    rating: "4.7",
    image: "/clients/assets/images/gallery-tours/bien-dao-3n2d-phu-quoc-1.jpg",
  },
];

export default function TourDetailPage() {
  return (
    <>

      <section className="page-banner-two rel z-1">
        <div className="container-fluid">
          <hr className="mt-0" />
          <div className="container">
            <div className="banner-inner pt-15 pb-25">
              <h2
                className="page-title mb-10"
                data-aos="fade-left"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                {tourDetail.destination}
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
                  <li className="breadcrumb-item active">Tour detail</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </section>

      <div className="tour-gallery">
        <div className="container-fluid">
          <div className="row gap-10 justify-content-center rel">
            <div className="col-lg-4 col-md-6">
              <div className="gallery-item">
                <img src={tourDetail.images[0]} alt="Destination" />
              </div>
              <div className="gallery-item">
                <img src={tourDetail.images[1]} alt="Destination" />
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="gallery-item gallery-between">
                <img src={tourDetail.images[2]} alt="Destination" />
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="gallery-item">
                <img src={tourDetail.images[3]} alt="Destination" />
              </div>
              <div className="gallery-item">
                <img src={tourDetail.images[4]} alt="Destination" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="tour-header-area pt-70 rel z-1">
        <div className="container">
          <div className="row justify-content-between">
            <div className="col-xl-6 col-lg-7">
              <div className="tour-header-content mb-15" data-aos="fade-left" data-aos-duration="1500" data-aos-offset="50">
                <span className="location d-inline-block mb-10">
                  <i className="fal fa-map-marker-alt"></i>
                  {tourDetail.destination}
                </span>
                <div className="section-title pb-5">
                  <h2>{tourDetail.title}</h2>
                </div>
                <div className="ratting">
                  {[...Array(5)].map((_, index) => (
                    <i
                      className={index < tourDetail.rating ? "fas fa-star" : "far fa-star"}
                      key={`rating-${index}`}
                    ></i>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-5 text-lg-end" data-aos="fade-right" data-aos-duration="1500" data-aos-offset="50">
              <div className="tour-header-social mb-10">
                <a href="#">
                  <i className="far fa-share-alt"></i>Share tours
                </a>
                <a href="#">
                  <i className="fas fa-heart bgc-secondary"></i>Wish list
                </a>
              </div>
            </div>
          </div>
          <hr className="mt-50 mb-70" />
        </div>
      </section>

      <section className="tour-details-page pb-100">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="tour-details-content">
                <h3>Kham pha Tours</h3>
                <p>{tourDetail.description}</p>
                <div className="row pb-55">
                  <div className="col-md-6">
                    <div className="tour-include-exclude mt-30">
                      <h5>Bao gom va khong bao gom</h5>
                      <ul className="list-style-one check mt-25">
                        <li>
                          <i className="far fa-check"></i> Dich vu don va tra khach
                        </li>
                        <li>
                          <i className="far fa-check"></i> 1 bua an moi ngay
                        </li>
                        <li>
                          <i className="far fa-check"></i> Bua toi tren du thuyen va su kien am nhac
                        </li>
                        <li>
                          <i className="far fa-check"></i> Tham quan 7 dia diem tuyet voi nhat trong thanh pho
                        </li>
                        <li>
                          <i className="far fa-check"></i> Nuoc dong chai tren xe buyt
                        </li>
                        <li>
                          <i className="far fa-check"></i> Phuong tien di chuyen xe buyt du lich hang sang
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="tour-include-exclude mt-30">
                      <h5>Khong bao gom</h5>
                      <ul className="list-style-one mt-25">
                        <li>
                          <i className="far fa-times"></i> Tien boa
                        </li>
                        <li>
                          <i className="far fa-times"></i> Don va tra khach tai khach san
                        </li>
                        <li>
                          <i className="far fa-times"></i> Bua trua, do an va do uong
                        </li>
                        <li>
                          <i className="far fa-times"></i> Nang cap tuy chon len mot ly
                        </li>
                        <li>
                          <i className="far fa-times"></i> Dich vu bo sung
                        </li>
                        <li>
                          <i className="far fa-times"></i> Bao hiem
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <h3>Lich trinh</h3>
              <div className="accordion-two mt-25 mb-60" id="faq-accordion-two">
                {tourDetail.timeline.map((item, index) => (
                  <div className="accordion-item" key={item.id}>
                    <h5 className="accordion-header">
                      <button
                        className="accordion-button collapsed"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapseTwo${item.id}`}
                      >
                        Ngay {index + 1} - {item.title}
                      </button>
                    </h5>
                    <div
                      id={`collapseTwo${item.id}`}
                      className="accordion-collapse collapse"
                      data-bs-parent="#faq-accordion-two"
                    >
                      <div className="accordion-body">
                        <p>{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <ReviewsSection
                averageRating={tourDetail.rating}
                reviewCount={reviews.length}
                reviews={reviews}
                timeLabel={tourDetail.time}
              />

              <h3>Them danh gia</h3>
              <form className="comment-form bgc-lighter z-1 rel mt-30" name="review-form" action="#" method="post">
                <div className="comment-review-wrap">
                  <div className="comment-ratting-item">
                    <span className="title">Danh gia</span>
                    <div className="ratting" id="rating-stars">
                      <i className="far fa-star" data-value="1"></i>
                      <i className="far fa-star" data-value="2"></i>
                      <i className="far fa-star" data-value="3"></i>
                      <i className="far fa-star" data-value="4"></i>
                      <i className="far fa-star" data-value="5"></i>
                    </div>
                  </div>
                </div>
                <hr className="mt-30 mb-40" />
                <h5>De lai phan hoi</h5>
                <div className="row gap-20 mt-20">
                  <div className="col-md-12">
                    <div className="form-group">
                      <label htmlFor="message">Noi dung</label>
                      <textarea name="message" id="message" className="form-control" rows={5} required></textarea>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-group mb-0">
                      <button type="submit" className="theme-btn bgc-secondary style-two" id="submit-reviews">
                        <span data-hover="Gui danh gia">Gui danh gia</span>
                        <i className="fal fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="col-lg-4 col-md-8 col-sm-10 rmt-75">
              <div className="blog-sidebar tour-sidebar">
                <div className="widget widget-booking" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                  <h5 className="widget-title">Tour Booking</h5>
                  <form action="#" method="POST">
                    <div className="date mb-25">
                      <b>Ngay bat dau</b>
                      <input type="text" value={tourDetail.startDate} name="startdate" disabled />
                    </div>
                    <hr />
                    <div className="date mb-25">
                      <b>Ngay ket thuc</b>
                      <input type="text" value={tourDetail.endDate} name="enddate" disabled />
                    </div>
                    <hr />
                    <div className="time py-5">
                      <b>Thoi gian :</b>
                      <p>{tourDetail.time}</p>
                      <input type="hidden" name="time" />
                    </div>
                    <hr className="mb-25" />
                    <h6>Ve:</h6>
                    <ul className="tickets clearfix">
                      <li>
                        Nguoi lon <span className="price">{tourDetail.priceAdult} VND</span>
                      </li>
                      <li>
                        Tre em <span className="price">{tourDetail.priceChild} VND</span>
                      </li>
                    </ul>
                    <button type="submit" className="theme-btn style-two w-100 mt-15 mb-5">
                      <span data-hover="Dat ngay">Dat ngay</span>
                      <i className="fal fa-arrow-right"></i>
                    </button>
                    <div className="text-center">
                      <a href="/contact">Ban can tro giup khong?</a>
                    </div>
                  </form>
                </div>

                <div className="widget widget-contact" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                  <h5 className="widget-title">Can tro giup?</h5>
                  <ul className="list-style-one">
                    <li>
                      <i className="far fa-envelope"></i> <a href="mailto:duchaunguyen131@gmail.com">duchaunguyen131@gmail.com</a>
                    </li>
                    <li>
                      <i className="far fa-phone-volume"></i> <a href="callto:+000(123)45688">+000 (123) 456 88</a>
                    </li>
                  </ul>
                </div>

                <div className="widget widget-tour" data-aos="fade-up" data-aos-duration="1500" data-aos-offset="50">
                  <h6 className="widget-title">Tours tuong tu</h6>
                  {tourRecommendations.map((tour) => (
                    <div className="destination-item tour-grid style-three bgc-lighter" key={tour.id}>
                      <div className="image">
                        <img src={tour.image} alt="Tour" style={{ maxHeight: 137 }} />
                      </div>
                      <div className="content">
                        <div className="destination-header">
                          <span className="location">
                            <i className="fal fa-map-marker-alt"></i>
                            {tour.destination}
                          </span>
                          <div className="ratting">
                            <i className="fas fa-star"></i>
                            <span>({tour.rating})</span>
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
