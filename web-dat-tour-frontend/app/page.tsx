"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTours, getDestinations } from "@/api/coreApi_new";

interface Tour {
  id: number;
  title?: string;
  region?: string;                  // điểm đến dạng chuỗi từ TourListResponse
  durationDays?: number;
  basePrice?: number;               // TourListResponse.basePrice
  coverImageUrl?: string;           // TourListResponse.coverImageUrl
  rating?: number | string;
  reviewCount?: number;
  isHot?: boolean;
  // fallback fields (dùng cho dữ liệu tĩnh)
  name?: string;
  destinationName?: string;
  durationNights?: number;
  priceAdult?: number;
  price?: number;
  imageUrl?: string;
}

interface Destination {
  id: number;
  cityName: string;
  region?: string;
  country?: string;
  imageUrl?: string;
  image_url?: string;
}

// ── Fallback tĩnh khi API chưa khả dụng ──────────────────────────────────────
const FALLBACK_TOURS: Tour[] = [
  { id: 1, name: "Tour Ba Na Hills", destinationName: "Đà Nẵng", durationDays: 3, durationNights: 2, rating: "4.8", priceAdult: 2500000, imageUrl: "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-1.png" },
  { id: 2, name: "Tour Hạ Long", destinationName: "Quảng Ninh", durationDays: 2, durationNights: 1, rating: "4.7", priceAdult: 1800000, imageUrl: "/clients/assets/images/gallery-tours/tour-mien-bac-4n3d-ha-noi-ninh-binh-ha-long-yen-tu-1.png" },
  { id: 3, name: "Tour Phú Quốc", destinationName: "Phú Quốc", durationDays: 4, durationNights: 3, rating: "4.9", priceAdult: 3200000, imageUrl: "/clients/assets/images/gallery-tours/bien-dao-3n2d-phu-quoc-1.jpg" },
  { id: 4, name: "Tour Côn Đảo", destinationName: "Côn Đảo", durationDays: 3, durationNights: 2, rating: "4.6", priceAdult: 2100000, imageUrl: "/clients/assets/images/gallery-tours/bien-dao-3n2d-con-dao-1.jpg" },
];

const FALLBACK_DESTINATIONS: Destination[] = [
  { id: 1, cityName: "Đà Nẵng – Hội An", region: "2 ngày 1 đêm", imageUrl: "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-2.png" },
  { id: 2, cityName: "Hạ Long – Yên Tử", region: "3 ngày 2 đêm", imageUrl: "/clients/assets/images/gallery-tours/tour-mien-bac-4n3d-ha-noi-ninh-binh-ha-long-yen-tu-2.png" },
  { id: 3, cityName: "Phú Quốc", region: "3 ngày 2 đêm", imageUrl: "/clients/assets/images/gallery-tours/bien-dao-3n2d-phu-quoc-2.jpg" },
  { id: 4, cityName: "Côn Đảo", region: "2 ngày 1 đêm", imageUrl: "/clients/assets/images/gallery-tours/bien-dao-3n2d-con-dao-2.jpg" },
];

// ── Helpers (map đúng field từ TourListResponse của BE) ──────────────────────
const getTourName  = (t: Tour) => t.title || t.name || "Tour";
const getDestName  = (t: Tour) => t.region || t.destinationName || "";
const getDuration  = (t: Tour) => {
  if (t.durationDays && t.durationNights) return `${t.durationDays} ngày ${t.durationNights} đêm`;
  if (t.durationDays) return `${t.durationDays} ngày`;
  return "";
};
const getPrice     = (t: Tour) => {
  const p = t.basePrice ?? t.priceAdult ?? t.price ?? 0;
  if (!p || p === 0) return "Liên hệ";
  return Number(p).toLocaleString("vi-VN");
};
const getTourImage = (t: Tour) =>
  t.coverImageUrl || t.imageUrl || "/clients/assets/images/gallery-tours/mien-trung-4n3d-da-nang-hoi-an-ba-na-hue-1.png";
const getRating    = (t: Tour) => {
  const r = Number(t.rating ?? 0);
  return r > 0 ? r.toFixed(1) : null;
};
const getDestImage = (d: Destination) =>
  d.imageUrl || d.image_url || "/clients/assets/images/gallery-tours/bien-dao-3n2d-phu-quoc-2.jpg";

// ── Component ─────────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const [tours, setTours]               = useState<Tour[]>(FALLBACK_TOURS);
  const [destinations, setDestinations] = useState<Destination[]>(FALLBACK_DESTINATIONS);
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [selectedDestId, setSelectedDestId]   = useState<string>("");
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [toursRes, destRes] = await Promise.all([
          getTours(undefined, true, undefined, 0, 4),
          getDestinations(0, 4),
        ]);

        if (toursRes?.status === 200 && toursRes.data?.content?.length > 0) {
          setTours(toursRes.data.content);
        }
        if (destRes?.status === 200 && destRes.data?.content?.length > 0) {
          setDestinations(destRes.data.content);
        }
        // Load thêm destinations cho select tìm kiếm (size lớn hơn)
        const allDestRes = await getDestinations(0, 50);
        if (allDestRes?.status === 200 && allDestRes.data?.content?.length > 0) {
          setAllDestinations(allDestRes.data.content);
        }
      } catch {
        // giữ nguyên fallback
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Reinit jQuery plugins mỗi lần component mount (khi navigate client-side)
  useEffect(() => {
    const reinit = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as Record<string, any>;
      const $ = w["$"];
      if (!$) return;

      // 1. Nice-select (thanh tìm kiếm)
      if ($.fn.niceSelect) {
        $("select").niceSelect("destroy");
        $("select").niceSelect();
      }

      // 2. Datepicker
      if ($.fn.datetimepicker) {
        $(".datetimepicker").datetimepicker({
          format: "d/m/Y",
          timepicker: false,
          scrollMonth: false,
          scrollInput: false,
        });
      }

      // 3. Counter - xóa class counted để cho phép chạy lại
      $(".counter-text-wrap").removeClass("counted");
      if ($.fn.appear && $(".counter-text-wrap").length) {
        $(".counter-text-wrap").appear(function (this: Element) {
          const $t = $(this);
          const n = $t.find(".count-text").attr("data-stop");
          const r = parseInt($t.find(".count-text").attr("data-speed"), 10) || 2000;
          if (!$t.hasClass("counted")) {
            $t.addClass("counted");
            $({ countNum: 0 }).animate(
              { countNum: n },
              {
                duration: r,
                easing: "linear",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                step: function (this: Record<string, any>) {
                  $t.find(".count-text").text(Math.floor(this["countNum"]));
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                complete: function (this: Record<string, any>) {
                  $t.find(".count-text").text(this["countNum"]);
                },
              }
            );
          }
        }, { accY: 0 });
      }

      // 4. AOS refresh
      if (w["AOS"]) {
        w["AOS"].refresh();
      }
    };

    // Delay nhỏ để DOM render xong
    const timer = setTimeout(reinit, 150);
    return () => clearTimeout(timer);
  }, []);

  // Khi allDestinations load xong → destroy và reinit nice-select để dropdown hiển thị đúng options
  useEffect(() => {
    if (allDestinations.length === 0) return;
    const timer = setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as Record<string, any>;
      const $ = w["$"];
      if (!$ || !$.fn.niceSelect) return;
      $("#destination").niceSelect("destroy");
      $("#destination").niceSelect();
    }, 50);
    return () => clearTimeout(timer);
  }, [allDestinations]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Đọc trực tiếp từ DOM vì nice-select cập nhật native select bằng jQuery trigger
    // nên React onChange không nhận được event
    const nativeSelect = document.getElementById("destination") as HTMLSelectElement | null;
    const destId = nativeSelect?.value || "";
    const params = new URLSearchParams();
    if (destId) params.set("destinationId", destId);
    router.push(`/tours?${params.toString()}`);
  };

  return (
    <>
      <style>{`
        @keyframes flicker-hot {
          0% { opacity: 0.6; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>
      <section className="hero-area bgc-black pt-200 rpt-120 rel z-2">
        <div className="container-fluid">
          <h1
            className="hero-title"
          >
            Tours Du Lịch
          </h1>
          <div
            className="main-hero-image bgs-cover"
            style={{ backgroundImage: "url(/clients/assets/images/hero/hero.jpg)" }}
          ></div>
        </div>
        <form id="search_form" onSubmit={handleSearch}>
          <div className="container container-1400">
            <div className="search-filter-inner">
              <div className="filter-item clearfix">
                <div className="icon"><i className="fal fa-map-marker-alt"></i></div>
                <span className="title">Điểm đến</span>
                <select
                  name="destination"
                  id="destination"
                  value={selectedDestId}
                  onChange={(e) => setSelectedDestId(e.target.value)}
                >
                  <option value="">Tất cả điểm đến</option>
                  {allDestinations.map((d) => (
                    <option key={d.id} value={String(d.id)}>{d.cityName}</option>
                  ))}
                </select>
              </div>
              <div className="filter-item clearfix">
                <div className="icon"><i className="fal fa-calendar-alt"></i></div>
                <span className="title">Ngày khởi hành</span>
                <input type="text" id="start_date" name="start_date" className="datetimepicker datetimepicker-custom" placeholder="Chọn ngày đi" readOnly />
              </div>
              <div className="filter-item clearfix">
                <div className="icon"><i className="fal fa-calendar-alt"></i></div>
                <span className="title">Ngày kết thúc</span>
                <input type="text" id="end_date" name="end_date" className="datetimepicker datetimepicker-custom" placeholder="Chọn ngày về" readOnly />
              </div>
              <div className="search-button">
                <button className="theme-btn" type="submit">
                  <span data-hover="Tìm kiếm">Tìm kiếm</span>
                  <i className="far fa-search"></i>
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>

      <div className="form-back-drop"></div>

      {/* ── DANH SÁCH TOUR (dữ liệu thật từ BE) ── */}
      <section className="destinations-area bgc-black pt-100 pb-70 rel z-1">
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-lg-12">
              <div
                className="section-title text-white text-center counter-text-wrap mb-70"
              >
                <h2>Khám phá kho báu Việt Nam cùng HTravel</h2>
                <p>
                  Website{" "}
                  <span className="count-text plus" data-speed="3000" data-stop="24080">0</span>{" "}
                  phổ biến nhất mà bạn sẽ nhớ
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-light" role="status">
                <span className="sr-only">Đang tải...</span>
              </div>
            </div>
          ) : (
            <div className="row justify-content-center">
              {tours.map((tour) => (
                <div className="col-xxl-3 col-xl-4 col-md-6" style={{ marginBottom: 30 }} key={tour.id}>
                  <div
                    className="destination-item block_tours"
                  >
                    <div className="image" style={{ position: "relative", overflow: "hidden", height: 220 }}>
                      {getRating(tour) && (
                        <div className="ratting">
                          <i className="fas fa-star"></i> {getRating(tour)}
                        </div>
                      )}
                      <a href="#" className="heart"><i className="fas fa-heart"></i></a>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getTourImage(tour)}
                        alt={getTourName(tour)}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </div>
                    <div className="content">
                      <span className="location">
                        <i className="fal fa-map-marker-alt"></i>
                        {getDestName(tour)}
                      </span>
                      <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <a href={`/tours/${tour.id}`}>{getTourName(tour)}</a>
                        {tour.isHot && (
                          <span style={{
                            background: '#FFF0F0',
                            color: '#fd4c5c',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            border: '1px solid #FFD4D7',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            height: '20px',
                            lineHeight: '16px'
                          }}>
                            <i className="fas fa-fire" style={{ animation: 'flicker-hot 1s infinite alternate' }}></i>
                            HOT
                          </span>
                        )}
                      </h5>
                      <span className="time">{getDuration(tour)}</span>
                    </div>
                    <div className="destination-footer">
                      <span className="price">
                        {(() => {
                          const p = getPrice(tour);
                          return p === "Liên hệ"
                            ? <span style={{ fontSize: "0.95em", color: "#f97316" }}>{p}</span>
                            : <><span>{p}</span> VND / người</>;
                        })()}
                      </span>
                      <Link href={`/tours/${tour.id}`} className="read-more">
                        Đặt ngay <i className="fal fa-angle-right"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="about-us-area py-100 rpb-90 rel z-1">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-5 col-lg-6">
              <div className="about-us-content rmb-55">
                <div className="section-title mb-25">
                  <h2>Du lịch với sự tự tin. Lý do hàng đầu để chọn công ty chúng tôi</h2>
                </div>
                <p>Chúng tôi sẽ nỗ lực hết mình để biến giấc mơ du lịch của bạn thành hiện thực, những viên ngọc ẩn và những điểm tham quan không thể bỏ qua</p>
                <div className="divider counter-text-wrap mt-45 mb-55">
                  <span>Chúng tôi có <span><span className="count-text plus" data-speed="3000" data-stop="5">0</span> Năm</span> kinh nghiệm</span>
                </div>
                <div className="row">
                  <div className="col-6">
                    <div className="counter-item counter-text-wrap">
                      <span className="count-text k-plus" data-speed="2000" data-stop="1">0</span>
                      <span className="counter-title">Điểm đến phổ biến</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="counter-item counter-text-wrap">
                      <span className="count-text m-plus" data-speed="3000" data-stop="8">0</span>
                      <span className="counter-title">Khách hàng hài lòng</span>
                    </div>
                  </div>
                </div>
                <Link href="/destination" className="theme-btn mt-10 style-two">
                  <span data-hover="Khám phá Điểm đến">Khám phá Điểm đến</span>
                  <i className="fal fa-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="col-xl-7 col-lg-6">
              <div className="about-us-image">
                {[1,2,3,4,5,6,7].map(n => (
                  <div className="shape" key={n}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/clients/assets/images/about/shape${n}.png`} alt="Shape" />
                  </div>
                ))}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/clients/assets/images/about/about.png" alt="About" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ĐIỂM ĐẾN PHỔ BIẾN (dữ liệu thật từ BE) ── */}
      <section className="popular-destinations-area rel z-1">
        <div className="container-fluid">
          <div className="popular-destinations-wrap br-20 bgc-lighter pt-100 pb-70">
            <div className="row justify-content-center">
              <div className="col-lg-12">
                <div
                  className="section-title text-center counter-text-wrap mb-70"
                >
                  <h2>Khám phá các điểm đến phổ biến</h2>
                  <p>
                    Website{" "}
                    <span className="count-text plus" data-speed="3000" data-stop="24080">0</span>{" "}
                    trải nghiệm phổ biến nhất
                  </p>
                </div>
              </div>
            </div>
            <div className="container">
              <div className="row justify-content-center">
                {destinations.map((dest) => (
                  <div className="col-xl-3 col-md-6 item" key={dest.id}>
                    <div className="destination-item style-two">
                      <div className="image" style={{ position: "relative", height: 220, overflow: "hidden", borderRadius: 12 }}>
                        <a href="#" className="heart"><i className="fas fa-heart"></i></a>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getDestImage(dest)}
                          alt={dest.cityName}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      </div>
                      <div className="content">
                        <h6 className="tour-title">
                          <a href={`/destination/${dest.id}`}>{dest.cityName}</a>
                        </h6>
                        <span className="time">{dest.region}</span>
                        <a href={`/destination/${dest.id}`} className="more">
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
              <div className="features-content-part mb-55">
                <div className="section-title mb-60">
                  <h2>Trải nghiệm du lịch tuyệt đỉnh mang đến sự khác biệt cho công ty chúng tôi</h2>
                </div>
                <div className="features-customer-box">
                  <div className="image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/clients/assets/images/features/features-box.jpg" alt="Features" />
                  </div>
                  <div className="content">
                    <div className="feature-authors mb-15">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/clients/assets/images/features/feature-author1.jpg" alt="Author" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/clients/assets/images/features/feature-author2.jpg" alt="Author" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/clients/assets/images/features/feature-author3.jpg" alt="Author" />
                      <span>4k+</span>
                    </div>
                    <h6>850K+ Khách hàng hài lòng</h6>
                    <div className="divider style-two counter-text-wrap my-25">
                      <span><span className="count-text plus" data-speed="3000" data-stop="5">0</span> Năm</span>
                    </div>
                    <p>Chúng tôi tự hào cung cấp các hành trình được cá nhân hóa</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-6">
              <div className="row pb-25">
                {[
                  { title: "Chinh Phục Cảnh Quan Việt Nam", desc: "Khám phá những cảnh đẹp hùng vĩ và tuyệt vời của đất nước Việt Nam." },
                  { title: "Trải Nghiệm Đặc Sắc Việt Nam", desc: "Trải nghiệm những hoạt động và lễ hội đặc trưng của văn hóa Việt." },
                  { title: "Khám Phá Di Sản Việt Nam", desc: "Khám phá các di sản thế giới và những kỳ quan thiên nhiên nổi tiếng." },
                  { title: "Vẻ Đẹp Thiên Nhiên Việt", desc: "Chinh phục vẻ đẹp tự nhiên hoang sơ và kỳ vĩ của Việt Nam." },
                ].map((f, i) => (
                  <div className={`col-md-6`} key={i}>
                    <div className={`feature-item${i >= 2 ? "" : ""}`} style={{ marginTop: i === 2 || i === 3 ? 0 : 0 }}>
                      <div className="icon"><i className="flaticon-tent"></i></div>
                      <div className="content">
                        <h5><Link href="/tours">{f.title}</Link></h5>
                        <p>{f.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-area pt-100 rel z-1">
        <div className="container-fluid">
          <div className="row">
            {[
              { bg: "cta1.jpg", cat: "Khám Phá Vẻ Đẹp Văn Hóa Việt", title: "Tìm hiểu những giá trị văn hóa độc đáo của các vùng miền Việt Nam." },
              { bg: "cta2.jpg", cat: "Bãi biển Sea", title: "Bãi trong xanh dạt dào ở Việt Nam" },
              { bg: "cta3.jpg", cat: "Thác nước", title: "Thác nước lớn nhất Việt Nam" },
            ].map((c, i) => (
              <div className="col-xl-4 col-md-6" key={i}>
                <div className="cta-item" style={{ backgroundImage: `url(/clients/assets/images/cta/${c.bg})` }}>
                  <span className="category">{c.cat}</span>
                  <h2>{c.title}</h2>
                  <Link href="/tours" className="theme-btn style-two bgc-secondary">
                    <span data-hover="Khám phá">Khám phá</span>
                    <i className="fal fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
