const destinations = [
  {
    id: 1,
    title: "Hạ Long",
    time: "3 ngày 2 đêm",
    domain: "b",
    image: "/clients/assets/images/gallery-tours/tour-mien-bac-4n3d-ha-noi-ninh-binh-ha-long-yen-tu-1.png",
  },
  {
    id: 2,
    title: "Ninh Bình",
    time: "4 ngày 3 đêm",
    domain: "b",
    image: "/clients/assets/images/gallery-tours/tour-mien-bac-4n3d-ha-noi-ninh-binh-ha-long-yen-tu-2.png",
  },
  {
    id: 3,
    title: "Đà Nẵng",
    time: "4 ngày 3 đêm",
    domain: "t",
    image: "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-1.png",
  },
  {
    id: 4,
    title: "Hội An",
    time: "3 ngày 2 đêm",
    domain: "t",
    image: "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-2.png",
  },
  {
    id: 5,
    title: "Phú Quốc",
    time: "3 ngày 2 đêm",
    domain: "n",
    image: "/clients/assets/images/gallery-tours/bien-dao-3n2d-phu-quoc-1.jpg",
  },
  {
    id: 6,
    title: "Côn Đảo",
    time: "3 ngày 2 đêm",
    domain: "n",
    image: "/clients/assets/images/gallery-tours/bien-dao-3n2d-con-dao-1.jpg",
  },
];

export default function DestinationPage() {
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
              Điểm đến
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
                  <a href="/">Trang chủ</a>
                </li>
                <li className="breadcrumb-item active">Điểm đến</li>
              </ol>
            </nav>
          </div>
        </div>
      </section>

      <section className="popular-destinations-area pt-100 pb-90 rel z-1">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-12">
              <div
                className="section-title text-center counter-text-wrap mb-40"
                data-aos="fade-up"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                <h2>Khám phá các điểm đến phổ biến</h2>
                <p>
                  Website{" "}
                  <span className="count-text plus" data-speed="3000" data-stop="34500">
                    0
                  </span>{" "}
                  trải nghiệm phổ biến nhất mà bạn sẽ nhớ
                </p>
                <ul className="destinations-nav mt-30">
                  <li data-filter="*" className="active">Tất cả</li>
                  <li data-filter=".domain-b">Miền Bắc</li>
                  <li data-filter=".domain-t">Miền Trung</li>
                  <li data-filter=".domain-n">Miền Nam</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="container">
            <div className="row gap-10 destinations-active justify-content-center">
              {destinations.map((destination, index) => (
                <div
                  className={`col-xl-3 col-md-6 item domain-${destination.domain}`}
                  key={destination.id}
                >
                  <div className="destination-item style-two" data-aos-duration="1500" data-aos-offset="50">
                    <div className="image" style={{ maxHeight: 250 }}>
                      <a href="#" className="heart">
                        <i className="fas fa-heart"></i>
                      </a>
                      <img src={destination.image} alt="Destination" />
                    </div>
                    <div className="content">
                      <h6 className="tour-title">
                        <a href={`/tours/${destination.id}`}>{destination.title}</a>
                      </h6>
                      <span className="time">{destination.time}</span>
                      <a href={`/tours/${destination.id}`} className="more">
                        <i className="fas fa-chevron-right"></i>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
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
                  <h2>Đăng ký nhận bản tin của chúng tôi để nhận thêm nhiều ưu đãi & mẹo</h2>
                  <p>
                    Website{" "}
                    <span className="count-text plus" data-speed="3000" data-stop="34500">
                      0
                    </span>{" "}
                    trải nghiệm phổ biến nhất mà bạn sẽ nhớ
                  </p>
                </div>
                <form className="newsletter-form mb-15" action="#">
                  <input id="news-email" type="email" placeholder="Địa chỉ email" required />
                  <button type="submit" className="theme-btn bgc-secondary style-two">
                    <span data-hover="Đăng ký">Đăng ký</span>
                    <i className="fal fa-arrow-right"></i>
                  </button>
                </form>
                <p>Không yêu cầu thẻ tín dụng. Không cam kết</p>
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
