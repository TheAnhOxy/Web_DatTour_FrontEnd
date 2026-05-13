"use client";

import { useEffect, useState } from "react";
import { getDestinations } from "@/api/coreApi_new";

interface Destination {
  id: number;
  cityName: string;
  region: string;
  country: string;
  imageUrl: string;
}

export default function DestinationPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("*");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getDestinations(0, 20);
        if (res.status === 200 && res.data && res.data.content) {
          setDestinations(res.data.content);
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách địa danh:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Hàm helper để phân loại miền (Bắc, Trung, Nam)
  const getDomain = (dest: Destination) => {
    const r = dest.region?.toLowerCase() || "";
    if (r.includes("hà nội") || r.includes("quảng ninh") || r.includes("ninh bình") || r.includes("lào cai") || r.includes("hải phòng")) return "b";
    if (r.includes("đà nẵng") || r.includes("huế") || r.includes("hội an") || r.includes("nha trang") || r.includes("lâm đồng") || r.includes("quảng bình")) return "t";
    if (r.includes("hồ chí minh") || r.includes("vũng tàu") || r.includes("phú quốc") || r.includes("kiên giang") || r.includes("cần thơ")) return "n";
    return "other";
  };

  const filteredDestinations = destinations.filter(d => {
    if (filter === "*") return true;
    if (filter === ".domain-b") return getDomain(d) === "b";
    if (filter === ".domain-t") return getDomain(d) === "t";
    if (filter === ".domain-n") return getDomain(d) === "n";
    return true;
  });

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
                  Hiện có{" "}
                  <span className="count-text plus">
                    {destinations.length}
                  </span>{" "}
                  địa danh tuyệt vời đang chờ đón bạn
                </p>
                <ul className="destinations-nav mt-30">
                  <li onClick={() => setFilter("*")} className={filter === "*" ? "active" : ""}>Tất cả</li>
                  <li onClick={() => setFilter(".domain-b")} className={filter === ".domain-b" ? "active" : ""}>Miền Bắc</li>
                  <li onClick={() => setFilter(".domain-t")} className={filter === ".domain-t" ? "active" : ""}>Miền Trung</li>
                  <li onClick={() => setFilter(".domain-n")} className={filter === ".domain-n" ? "active" : ""}>Miền Nam</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="container">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Đang tải...</span>
                </div>
              </div>
            ) : (
              <div className="row gap-10 destinations-active justify-content-center">
                {filteredDestinations.map((dest) => (
                  <div
                    className={`col-xl-3 col-md-6 item domain-${getDomain(dest)}`}
                    key={dest.id}
                  >
                    <div className="destination-item style-two" data-aos-duration="1500" data-aos-offset="50">
                      <div className="image" style={{ height: 250, overflow: 'hidden' }}>
                        <a href="#" className="heart">
                          <i className="fas fa-heart"></i>
                        </a>
                        <img 
                          src={dest.imageUrl || "/clients/assets/images/destinations/destination-default.jpg"} 
                          alt={dest.cityName} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="content">
                        <h6 className="tour-title">
                          <a href={`/destination/${dest.id}`}>{dest.cityName}</a>
                        </h6>
                        <span className="time">{dest.region}, {dest.country}</span>
                        <a href={`/destination/${dest.id}`} className="more">
                          <i className="fas fa-chevron-right"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredDestinations.length === 0 && (
                  <div className="col-12 text-center py-5">
                    <p className="text-muted">Không tìm thấy địa danh nào cho khu vực này.</p>
                  </div>
                )}
              </div>
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
