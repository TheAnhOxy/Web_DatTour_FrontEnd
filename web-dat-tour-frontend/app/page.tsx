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

        .tour-card-premium {
          background: #1c1d22;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          position: relative;
          flex-grow: 1;
          width: 100%;
        }

        .tour-card-premium:hover {
          transform: translateY(-8px) scale(1.015);
          box-shadow: 0 25px 50px -12px rgba(253, 76, 92, 0.25), 0 0 20px rgba(253, 76, 92, 0.05);
          border-color: rgba(253, 76, 92, 0.4);
        }

        /* Nổi bật tour HOT */
        .tour-card-premium.hot-tour-card {
          border: 1.5px solid rgba(253, 76, 92, 0.3);
          box-shadow: 0 10px 30px -10px rgba(253, 76, 92, 0.15), 0 1px 3px rgba(253, 76, 92, 0.05);
        }

        .tour-card-premium.hot-tour-card::after {
          content: '';
          position: absolute;
          top: -2px; left: -2px; right: -2px; bottom: -2px;
          border-radius: 22px;
          background: linear-gradient(135deg, #fd4c5c, #f97316);
          z-index: -1;
          opacity: 0.2;
          pointer-events: none;
        }

        .tour-card-premium.hot-tour-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(253, 76, 92, 0.25), 0 0 30px rgba(253, 76, 92, 0.15);
          border-color: rgba(253, 76, 92, 0.7);
        }

        /* Hình ảnh Card */
        .tour-card-media {
          position: relative;
          height: 200px;
          overflow: hidden;
          background: #1c1d22;
        }

        .tour-card-media::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 45%;
          background: linear-gradient(to top, #1c1d22 0%, rgba(28, 29, 34, 0) 100%);
          z-index: 2;
          pointer-events: none;
        }

        .tour-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .tour-card-premium:hover .tour-card-img {
          transform: scale(1.08) rotate(0.5deg);
        }

        /* Badges nổi bật */
        .tour-badge-hot {
          position: absolute;
          top: 12px;
          left: 12px;
          background: linear-gradient(135deg, #fd4c5c 0%, #f97316 100%);
          color: white;
          padding: 5px 12px;
          border-radius: 30px;
          font-size: 11px;
          font-weight: 800;
          z-index: 10;
          box-shadow: 0 4px 12px rgba(253, 76, 92, 0.4);
          display: flex;
          align-items: center;
          gap: 4px;
          animation: badge-pulse 1.5s infinite alternate;
        }

        @keyframes badge-pulse {
          0% { transform: scale(0.95); box-shadow: 0 4px 10px rgba(253, 76, 92, 0.3); }
          100% { transform: scale(1.05); box-shadow: 0 4px 15px rgba(253, 76, 92, 0.5); }
        }

        /* Phần thân Card */
        .tour-card-body {
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          background: #1c1d22;
        }

        .tour-card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .tour-card-dest {
          background: rgba(253, 76, 92, 0.15);
          color: #ff6b7a;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .tour-card-code {
          color: #64748b;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .tour-card-title {
          font-size: 16px;
          font-weight: 750;
          line-height: 1.45;
          margin-top: 6px;
          margin-bottom: 10px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 46px;
        }

        .tour-card-title a {
          color: #ffffff;
          text-decoration: none;
          transition: color 0.25s ease;
        }

        .tour-card-title a:hover {
          color: #ff6b7a;
        }

        .tour-card-rating {
          display: flex;
          align-items: center;
          gap: 3px;
          color: #ffb800;
          font-size: 11px;
          margin-bottom: 14px;
        }

        .tour-card-rating i {
          text-shadow: 0 0 6px rgba(255, 184, 0, 0.3);
        }

        .tour-card-rating-text {
          color: #94a3b8;
          font-weight: 700;
          margin-left: 4px;
          font-size: 12px;
        }

        .tour-card-details {
          border-top: 1px dashed rgba(255, 255, 255, 0.08);
          padding-top: 12px;
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tour-card-detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #cbd5e1;
        }

        .tour-card-detail-item i {
          color: #fd4c5c;
          width: 16px;
          font-size: 14px;
        }

        /* Footer của Card */
        .tour-card-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #16171c;
        }

        .tour-card-price-label {
          font-size: 11px;
          color: #8a99ad;
          display: block;
          margin-bottom: 2px;
          font-weight: 500;
        }

        .tour-card-price {
          color: #fd4c5c;
          background: linear-gradient(135deg, #fd4c5c 0%, #f97316 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-size: 20px;
          font-weight: 850;
          display: inline-block;
        }

        .tour-card-btn {
          background: linear-gradient(135deg, #fd4c5c 0%, #f97316 100%);
          color: white !important;
          border: none;
          padding: 8px 18px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: 0 4px 12px rgba(253, 76, 92, 0.15);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tour-card-btn i {
          font-size: 11px;
          transition: transform 0.2s ease;
          display: inline-block !important;
        }

        .tour-card-premium:hover .tour-card-btn {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(253, 76, 92, 0.3);
          filter: brightness(1.08);
        }

        .tour-card-btn:hover i {
          transform: translateX(3px);
        }
        
        /* Lớp nền phát sáng Aurora cho thanh tìm kiếm trang chủ */
        #search_form {
          position: relative;
          z-index: 10;
        }
        
        .search-filter-inner {
          position: relative;
          border-radius: 20px !important;
          border: 1px solid #f1f5f9;
          box-shadow: 0 15px 45px rgba(0, 0, 0, 0.05) !important;
          padding: 24px 40px 10px !important;
          transition: all 0.3s ease;
          background: #ffffff;
        }

        .search-filter-inner::before {
          content: '';
          position: absolute;
          top: -2px; left: -2px; right: -2px; bottom: -2px;
          /* Sunset red (#ff4b5c), Beach sand orange (#ff9036), Ocean blue (#1e56a0) */
          background: linear-gradient(90deg, #ff4b5c, #ff9036, #1e56a0, #ff4b5c);
          background-size: 300%;
          z-index: -1;
          filter: blur(12px);
          opacity: 0.12;
          border-radius: 22px;
          animation: aurora-glow 10s ease infinite;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .search-filter-inner:hover::before {
          opacity: 0.22;
        }

        @keyframes aurora-glow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Tinh chỉnh các filter-item trên trang chủ */
        .search-filter-inner .filter-item {
          border-right: 1px solid #e2e8f0 !important;
          padding-left: 35px !important;
          transition: all 0.25s ease;
        }

        .search-filter-inner .filter-item:hover {
          transform: translateY(-2px);
        }

        .search-filter-inner .filter-item .icon {
          color: #fd4c5c !important;
          font-size: 18px;
          top: 6px !important;
          transition: transform 0.3s ease;
        }
        
        .search-filter-inner .filter-item .icon i {
          display: inline-block !important;
          transition: all 0.3s ease;
        }
        
        .search-filter-inner .filter-item:hover .icon {
          transform: scale(1.2);
        }

        /* Chuyển động xe bus, plane cho biểu tượng điểm đến/ngày tháng khi hover */
        .search-filter-inner .filter-item:nth-child(1):hover .icon i {
          animation: plane-fly-bio 1.2s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }
        
        .search-filter-inner .filter-item:nth-child(2):hover .icon i,
        .search-filter-inner .filter-item:nth-child(3):hover .icon i {
          animation: calendar-wobble 0.5s ease-in-out infinite alternate;
        }

        @keyframes plane-fly-bio {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          30% { transform: translate(10px, -10px) scale(1.25) rotate(15deg); }
          75% { transform: translate(12px, -12px) scale(1.15) rotate(10deg); }
          100% { transform: translate(0, 0) scale(1) rotate(0deg); }
        }

        @keyframes calendar-wobble {
          0% { transform: rotate(-5deg); }
          100% { transform: rotate(5deg); }
        }

        .search-filter-inner .filter-item .nice-select {
          font-size: 15px !important;
          color: #334155 !important;
          font-weight: 500 !important;
          height: 38px;
          line-height: 38px;
          border-radius: 8px;
          padding-left: 8px;
          border: 1px solid transparent !important;
          transition: all 0.2s ease;
          display: flex !important;
          align-items: center !important;
        }

        /* Căn giữa dọc mũi tên dropdown của nice-select */
        .search-filter-inner .filter-item .nice-select::after {
          top: 50% !important;
          transform: translateY(-50%) rotate(45deg) !important;
          margin-top: 0 !important;
        }

        .search-filter-inner .filter-item .nice-select.open::after {
          top: 50% !important;
          transform: translateY(-75%) rotate(-135deg) !important;
        }
        
        .search-filter-inner .filter-item .nice-select:hover {
          border-color: #fd4c5c !important;
          background: #fdf2f2 !important;
        }

        .search-filter-inner .filter-item .nice-select .list {
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
          padding: 6px 0;
          margin-top: 8px;
          max-height: 250px;
          overflow-y: auto !important;
        }

        .search-filter-inner .filter-item .nice-select .option {
          padding: 10px 18px !important;
          font-size: 14px;
          color: #475569;
          transition: all 0.2s ease;
        }

        .search-filter-inner .filter-item .nice-select .option:hover,
        .search-filter-inner .filter-item .nice-select .option.focus,
        .search-filter-inner .filter-item .nice-select .option.selected.focus {
          background-color: #fdf2f2 !important;
          color: #fd4c5c !important;
          font-weight: 600;
        }

        /* Thiết kế các input date picker */
        .search-filter-inner .filter-item input.datetimepicker-custom {
          border: 1px solid transparent !important;
          background: transparent !important;
          font-size: 15px !important;
          font-weight: 500 !important;
          color: #334155 !important;
          padding: 6px 8px !important;
          width: 100%;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          height: 38px;
          outline: none;
        }
        
        .search-filter-inner .filter-item input.datetimepicker-custom:hover,
        .search-filter-inner .filter-item input.datetimepicker-custom:focus {
          border-color: #fd4c5c !important;
          background: #fdf2f2 !important;
        }

        /* Nút Tìm kiếm */
        .search-filter-inner .search-button button {
          border-radius: 14px !important;
          padding: 14px 32px !important;
          background: linear-gradient(135deg, #fd4c5c 0%, #f97316 100%) !important;
          color: #ffffff !important;
          border: none !important;
          box-shadow: 0 4px 15px rgba(253, 76, 92, 0.25) !important;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
          font-weight: 600 !important;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .search-filter-inner .search-button button:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 6px 20px rgba(253, 76, 92, 0.4) !important;
        }
        
        .search-filter-inner .search-button button:hover i {
          animation: search-bounce 0.5s ease-in-out infinite alternate;
        }

        @keyframes search-bounce {
          0% { transform: translate(0, 0); }
          100% { transform: translate(2px, -2px); }
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
                <div className="col-xl-3 col-lg-3 col-md-6 col-sm-12 mb-30 d-flex flex-column" key={tour.id}>
                  <div className={`tour-card-premium ${tour.isHot ? 'hot-tour-card' : ''}`}>
                    {/* Media / Image Area */}
                    <div className="tour-card-media">
                      {tour.isHot && (
                        <div className="tour-badge-hot">
                          <i className="fas fa-fire"></i> HOT
                        </div>
                      )}
                      <img 
                        src={getTourImage(tour)} 
                        alt={getTourName(tour)} 
                        loading="lazy"
                        className="tour-card-img"
                      />
                    </div>

                    {/* Body Content */}
                    <div className="tour-card-body">
                      <div className="tour-card-meta">
                        <span className="tour-card-dest">
                          <i className="fal fa-map-marker-alt me-1"></i>
                          {getDestName(tour)}
                        </span>
                        <span className="tour-card-code">
                          Mã: T-{tour.id}
                        </span>
                      </div>

                      <h5 className="tour-card-title">
                        <Link href={`/tours/${tour.id}`}>
                          {getTourName(tour)}
                        </Link>
                      </h5>

                      <div className="tour-card-rating">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className="fas fa-star"></i>
                        ))}
                        <span className="tour-card-rating-text">
                          5.0/5
                        </span>
                      </div>

                      <div className="tour-card-details">
                        <div className="tour-card-detail-item">
                          <i className="fal fa-clock"></i>
                          <span>Thời gian: <strong>{getDuration(tour)}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Footer / Pricing */}
                    <div className="tour-card-footer">
                      <div>
                        <span className="tour-card-price-label">Giá chỉ từ</span>
                        <span className="tour-card-price">
                          {getPrice(tour) === "Liên hệ" ? "Liên hệ" : `${getPrice(tour)} đ`}
                        </span>
                      </div>
                      <Link href={`/tours/${tour.id}`} className="btn tour-card-btn">
                        Đặt Tour <i className="fal fa-arrow-right"></i>
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
                      <div className="content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h6 className="tour-title" style={{ margin: 0 }}>
                            <a href={`/destination/${dest.id}`}>{dest.cityName}</a>
                          </h6>
                          <span className="time">{dest.region}</span>
                        </div>
                        <a
                          href={`/destination/${dest.id}`}
                          className="more"
                          style={{
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center'
                          }}
                        >
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
