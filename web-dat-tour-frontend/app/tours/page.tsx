/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { searchTours, getCategories, getDestinations } from "@/api/coreApi_new";

type TourItem = {
  id: number;
  title: string;
  destination: string;
  time: string;
  quantity: string;
  rating: number;
  price: string;
  rawPrice: number;
  image: string;
  durationDays?: number;
  isHot?: boolean;
  transportationType?: string;
  departureStartDate?: string;
};

const toRating = (value: unknown) => {
  const rating = Number(value ?? 0);
  if (!Number.isFinite(rating)) return 0;
  return Math.min(5, Math.max(0, rating));
};

const getTransportationDisplay = (type?: string) => {
  switch (type?.toUpperCase()) {
    case "BUS":
      return { label: "Ô tô", icon: "fal fa-bus" };
    case "PLANE":
      return { label: "Máy bay", icon: "fal fa-plane" };
    case "TRAIN":
      return { label: "Tàu hỏa", icon: "fal fa-train" };
    default:
      return { label: type || "Ô tô / Máy bay", icon: "fal fa-car" };
  }
};

const formatDepartureDate = (dateString?: string) => {
  if (!dateString) return "Hàng ngày";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `Ngày ${day}/${month}/${year} - ${hours}:${minutes}`;
  } catch (err) {
    return dateString;
  }
};

function ToursPageContent() {
  const searchParams = useSearchParams();

  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allTours, setAllTours] = useState<TourItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDestination, setFilterDestination] = useState("all");
  const [categories, setCategories] = useState<any[]>([]);
  const [destinationsList, setDestinationsList] = useState<any[]>([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Các state cho bộ lọc mới
  const [transportationType, setTransportationType] = useState("all");
  const [priceFrom, setPriceFrom] = useState<number | "">("");
  const [priceTo, setPriceTo] = useState<number | "">("");
  const [startDateFrom, setStartDateFrom] = useState("");
  const [startDateTo, setStartDateTo] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // States cho phân trang và sắp xếp
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12); // 4 cột trên 1 dòng
  const [sortBy, setSortBy] = useState("default");

  // Debounced states cho các input số (giá cả) để tránh gọi API liên tục
  const [debouncedPriceFrom, setDebouncedPriceFrom] = useState<number | "">("");
  const [debouncedPriceTo, setDebouncedPriceTo] = useState<number | "">("");

  // Chặn hydration mismatch: chỉ render nội dung sau khi đã mount trên Client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Đồng bộ searchParams từ URL (nếu có, ví dụ khi tìm kiếm từ trang chủ chuyển qua)
  useEffect(() => {
    const urlDestId = searchParams.get("destinationId");
    if (urlDestId) {
      setFilterDestination(urlDestId);
    }
  }, [searchParams]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debounce giá tiền
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceFrom(priceFrom);
    }, 600);
    return () => clearTimeout(timer);
  }, [priceFrom]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceTo(priceTo);
    }, 600);
    return () => clearTimeout(timer);
  }, [priceTo]);

  // Fetch Categories & Destinations once
  useEffect(() => {
    const fetchSupportData = async () => {
      try {
        const [catRes, destRes] = await Promise.all([getCategories(), getDestinations(0, 100)]);
        
        if (catRes && catRes.status === 200) {
          setCategories(catRes.data || []);
        }
        
        if (destRes && destRes.status === 200 && destRes.data) {
          setDestinationsList(destRes.data.content || destRes.data || []);
        }
      } catch (err) {
        console.error("Lỗi khi fetch dữ liệu hỗ trợ:", err);
      }
    };
    fetchSupportData();
  }, []);

  // Fetch Tours based on Elasticsearch filters
  useEffect(() => {
    const fetchAllTours = async () => {
      setLoading(true);
      try {
        const categoryObj = filterCategory === "all" ? null : categories.find((cat: any) => String(cat.id) === String(filterCategory));
        const destObj = filterDestination === "all" ? null : destinationsList.find((dest: any) => String(dest.id) === String(filterDestination));
        
        // Xử lý keyword kết hợp từ ô nhập liệu và địa danh chọn từ dropdown
        const keywordParts = [];
        if (debouncedSearchTerm.trim()) {
          keywordParts.push(debouncedSearchTerm.trim());
        }
        if (destObj) {
          keywordParts.push(destObj.cityName || destObj.city_name || destObj.name);
        }
        const finalKeyword = keywordParts.length > 0 ? keywordParts.join(" ") : null;

        // Tạo payload gửi lên API Elasticsearch
        const payload = {
          keyword: finalKeyword,
          priceFrom: debouncedPriceFrom !== "" ? Number(debouncedPriceFrom) : null,
          priceTo: debouncedPriceTo !== "" ? Number(debouncedPriceTo) : null,
          startDateFrom: startDateFrom || null,
          startDateTo: startDateTo || null,
          categoryName: categoryObj ? categoryObj.name.toLowerCase() : null,
          transportationType: transportationType === "all" ? null : transportationType.toLowerCase(),
          region: destObj && destObj.region ? destObj.region.toLowerCase() : null,
        };

        // Lấy lên tối đa 100 phần tử để hiển thị đầy đủ danh sách tour du lịch trên client-side pagination
        const res = await searchTours(payload, 0, 100);
        if (res.status === 200 && res.data) {
          const fetchedTours = Array.isArray(res.data) ? res.data : (res.data.content || []);
          
          const mappedTours: TourItem[] = fetchedTours.map((t: any) => ({
            id: t.id,
            title: t.title,
            destination: t.region || t.categoryName || "Khác",
            time: t.durationDays === 1 ? "1 ngày" : `${t.durationDays || 1} ngày ${Math.max(1, (t.durationDays || 1) - 1)} đêm`,
            quantity: "Khởi hành hàng tuần",
            rating: toRating(t.rating),
            price: new Intl.NumberFormat('vi-VN').format(t.basePrice || 0),
            rawPrice: t.basePrice || 0,
            image: t.coverImageUrl || t.cover_image_url || "/clients/assets/images/gallery-tours/destination-default.jpg",
            durationDays: t.durationDays || 1,
            isHot: t.isHot ?? false,
            transportationType: t.transportationType,
            departureStartDate: t.departureStartDate
          }));

          setAllTours(mappedTours);
        } else {
          setAllTours([]);
        }
      } catch (err) {
        console.error("Lỗi khi fetch tours:", err);
        setAllTours([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllTours();
  }, [filterCategory, filterDestination, debouncedSearchTerm, transportationType, debouncedPriceFrom, debouncedPriceTo, startDateFrom, startDateTo, categories, destinationsList]);

  // Reset trang về 1 khi thay đổi bất kỳ bộ lọc nào
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, filterDestination, searchTerm, transportationType, priceFrom, priceTo, startDateFrom, startDateTo]);

  const getSortedTours = () => {
    const list = [...allTours];
    if (sortBy === "hight-to-low") {
      return list.sort((a, b) => b.rawPrice - a.rawPrice);
    }
    if (sortBy === "low-to-high") {
      return list.sort((a, b) => a.rawPrice - b.rawPrice);
    }
    if (sortBy === "new") {
      return list.sort((a, b) => b.id - a.id);
    }
    if (sortBy === "old") {
      return list.sort((a, b) => a.id - b.id);
    }
    return list;
  };

  const sortedTours = getSortedTours();
  const totalTours = sortedTours.length;
  const totalPages = Math.ceil(totalTours / pageSize) || 1;
  const paginatedTours = sortedTours.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Trả về null (không render gì) cho đến khi component đã mount trên Client
  // Đây là cách chuẩn để tránh lỗi Hydration Mismatch trong Next.js
  if (!isMounted) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes flicker-hot {
          0% { opacity: 0.6; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1.15); }
        }
        
        /* Hiệu ứng viền phát sáng đa sắc chậm mang tông màu đỏ hoàng hôn, cam cát biển và xanh đại dương */
        @keyframes aurora-glow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Phỏng sinh học cất cánh - bay lên chéo rồi đáp nhẹ */
        @keyframes plane-fly-bio {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          30% { transform: translate(10px, -10px) scale(1.25) rotate(15deg); }
          75% { transform: translate(12px, -12px) scale(1.15) rotate(10deg); }
          100% { transform: translate(0, 0) scale(1) rotate(0deg); }
        }

        /* Phỏng sinh học lăn bánh - nhún nhảy bập bênh liên tục */
        @keyframes bus-wobble-bio {
          0% { transform: translateY(0) rotate(0deg); }
          20% { transform: translateY(-3px) rotate(-4deg); }
          40% { transform: translateY(1px) rotate(3deg); }
          60% { transform: translateY(-2px) rotate(-2deg); }
          80% { transform: translateY(1px) rotate(1deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }

        /* Tàu hỏa chạy trượt ngang liên tục trên đường ray */
        @keyframes train-slide-bio {
          0% { transform: translateX(0); }
          25% { transform: translateX(4px); }
          75% { transform: translateX(-4px); }
          100% { transform: translateX(0); }
        }

        /* Xoay icon đồng bộ tròn 360 độ khi hover */
        @keyframes sync-rotate-bio {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Đảm bảo icon có thể transform và chuyển động mượt mà */
        .btn-sync-hover i,
        .transport-pill-btn i {
          display: inline-block !important;
          transition: all 0.3s ease;
        }

        .btn-sync-hover:hover i {
          animation: sync-rotate-bio 1s linear infinite;
        }

        /* Lớp nền phát sáng Aurora */
        .aurora-filter-container {
          position: relative;
          z-index: 1;
        }

        .aurora-filter-container::before {
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

        .aurora-filter-container:hover::before {
          opacity: 0.22;
        }

        /* Hiệu ứng hover các thẻ phương tiện */
        .transport-pill-btn:hover i.fa-plane {
          animation: plane-fly-bio 1.2s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }
        .transport-pill-btn:hover i.fa-bus {
          animation: bus-wobble-bio 0.6s ease-in-out infinite alternate;
        }
        .transport-pill-btn:hover i.fa-train {
          animation: train-slide-bio 0.6s ease-in-out infinite;
        }

        /* Hiệu ứng focus các input */
        .travel-input-group {
          transition: all 0.25s ease-in-out !important;
        }
        .travel-input-group:focus-within {
          border-color: #fd4c5c !important;
          box-shadow: 0 0 0 3px rgba(253, 76, 92, 0.12) !important;
          background: #ffffff !important;
        }

        @keyframes slideDown {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .tour-card-premium {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          overflow: hidden;
          box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.02);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          position: relative;
          flex-grow: 1;
          width: 100%;
        }

        .tour-card-premium:hover {
          transform: translateY(-8px) scale(1.015);
          box-shadow: 0 25px 50px -12px rgba(253, 76, 92, 0.15), 0 0 20px rgba(253, 76, 92, 0.05);
          border-color: rgba(253, 76, 92, 0.25);
        }

        /* Nổi bật tour HOT */
        .tour-card-premium.hot-tour-card {
          border: 1.5px solid rgba(253, 76, 92, 0.25);
          box-shadow: 0 10px 30px -10px rgba(253, 76, 92, 0.1), 0 1px 3px rgba(253, 76, 92, 0.05);
        }

        .tour-card-premium.hot-tour-card::after {
          content: '';
          position: absolute;
          top: -2px; left: -2px; right: -2px; bottom: -2px;
          border-radius: 22px;
          background: linear-gradient(135deg, #fd4c5c, #f97316);
          z-index: -1;
          opacity: 0.15;
          pointer-events: none;
        }

        .tour-card-premium.hot-tour-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(253, 76, 92, 0.25), 0 0 30px rgba(253, 76, 92, 0.15);
          border-color: rgba(253, 76, 92, 0.6);
        }

        /* Hình ảnh Card */
        .tour-card-media {
          position: relative;
          height: 200px;
          overflow: hidden;
          background: #f8fafc;
        }

        .tour-card-media::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 40%;
          background: linear-gradient(to top, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0) 100%);
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

        .tour-badge-trans {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #0f172a;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          z-index: 10;
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.4);
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .tour-card-premium:hover .tour-badge-trans {
          background: linear-gradient(135deg, #fd4c5c 0%, #f97316 100%);
          color: white;
          transform: scale(1.1) rotate(15deg);
          border-color: transparent;
          box-shadow: 0 4px 10px rgba(253, 76, 92, 0.3);
        }

        /* Phần thân Card */
        .tour-card-body {
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .tour-card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .tour-card-dest {
          background: rgba(253, 76, 92, 0.06);
          color: #fd4c5c;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .tour-card-code {
          color: #94a3b8;
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
          color: #0f172a;
          text-decoration: none;
          transition: color 0.25s ease;
        }

        .tour-card-title a:hover {
          color: #fd4c5c;
        }

        .tour-card-rating {
          display: flex;
          align-items: center;
          gap: 3px;
          color: #f59e0b;
          font-size: 11px;
          margin-bottom: 14px;
        }

        .tour-card-rating i {
          text-shadow: 0 0 4px rgba(245, 158, 11, 0.2);
        }

        .tour-card-rating-text {
          color: #475569;
          font-weight: 700;
          margin-left: 4px;
          font-size: 12px;
        }

        .tour-card-details {
          border-top: 1px dashed #e2e8f0;
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
          color: #475569;
        }

        .tour-card-detail-item i {
          color: #fd4c5c;
          width: 16px;
          font-size: 14px;
        }

        /* Footer của Card */
        .tour-card-footer {
          border-top: 1px solid #f1f5f9;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fafbfc;
        }

        .tour-card-price-label {
          font-size: 11px;
          color: #64748b;
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

        /* Phân trang (Pagination) */
        .pagination-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 50px;
        }

        .pagination-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          background: white;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.25s;
        }

        .pagination-btn:hover:not(:disabled) {
          border-color: #fd4c5c;
          color: #fd4c5c;
          background: #fdf2f2;
          transform: scale(1.05);
        }

        .pagination-btn.active {
          background: linear-gradient(135deg, #fd4c5c 0%, #f97316 100%);
          color: white;
          border: none;
          box-shadow: 0 4px 10px rgba(253, 76, 92, 0.25);
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #f1f5f9;
        }  background: linear-gradient(135deg, #fd4c5c 0%, #f97316 100%);
          color: white;
          border: none;
          box-shadow: 0 4px 10px rgba(253, 76, 92, 0.25);
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #f1f5f9;
        }
      `}</style>
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
              Bảng Giá Tours
            </h2>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb justify-content-center mb-20">
                <li className="breadcrumb-item">
                  <Link href="/">Trang chủ</Link>
                </li>
                <li className="breadcrumb-item active">Bảng Giá Tours</li>
              </ol>
            </nav>
          </div>
        </div>
      </section>

      <section className="tour-grid-page py-100 rel z-1">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              {/* BỘ LỌC TÌM KIẾM ĐƯỢC THIẾT KẾ LẠI CAO CẤP VỚI HIỆU ỨNG AURORA */}
              <div className="aurora-filter-container">
                <div 
                  className="search-filter-card bg-white p-4 mb-4" 
                  style={{ 
                    borderRadius: '20px', 
                    border: '1px solid #f0f0f0',
                    boxShadow: '0 10px 45px rgba(0,0,0,0.03)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* Dòng tìm kiếm chính */}
                  <div className="row g-3 align-items-center">
                    <div className="col-lg-4 col-md-12">
                      <div className="input-group travel-input-group" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                        <span className="input-group-text bg-transparent border-0 pe-1" style={{ height: '48px' }}>
                          <i className="fal fa-search text-muted" style={{ fontSize: '15px' }}></i>
                        </span>
                        <input 
                          type="text" 
                          className="form-control bg-transparent border-0 ps-2" 
                          placeholder="Tìm theo tên tour, điểm đón, địa danh..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ 
                            boxShadow: 'none', 
                            height: '48px',
                            fontSize: '14px',
                            color: '#334155'
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-5">
                      <div className="position-relative">
                        <select 
                          className="form-select border-0 travel-input-group"
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          style={{ 
                            cursor: 'pointer', 
                            height: '48px', 
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            fontSize: '14px',
                            color: '#334155',
                            paddingLeft: '16px'
                          }}
                        >
                          <option value="all">Tất cả danh mục</option>
                          {categories.map((cat: any) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-5">
                      <div className="position-relative">
                        <select 
                          className="form-select border-0 travel-input-group"
                          value={filterDestination}
                          onChange={(e) => setFilterDestination(e.target.value)}
                          style={{ 
                            cursor: 'pointer', 
                            height: '48px', 
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            fontSize: '14px',
                            color: '#334155',
                            paddingLeft: '16px'
                          }}
                        >
                          <option value="all">Tất cả địa danh</option>
                          {destinationsList.map((dest: any) => (
                            <option key={dest.id} value={dest.id}>{dest.cityName || dest.city_name || dest.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-lg-2 col-md-2 d-flex gap-2 justify-content-end">
                      <button 
                        className="btn btn-sync-hover d-flex align-items-center justify-content-center"
                        onClick={() => {
                          setSearchTerm("");
                          setFilterCategory("all");
                          setFilterDestination("all");
                          setTransportationType("all");
                          setPriceFrom("");
                          setPriceTo("");
                          setStartDateFrom("");
                          setStartDateTo("");
                        }}
                        style={{ 
                          height: '48px', 
                          width: '48px', 
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          background: '#ffffff',
                          color: '#64748b',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#f1f5f9';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = '#ffffff';
                        }}
                        title="Làm mới bộ lọc"
                      >
                        <i className="fal fa-sync"></i>
                      </button>
                      <button 
                        className="btn btn-filter-toggle d-flex align-items-center justify-content-center gap-2"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        style={{ 
                          height: '48px', 
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          background: showAdvanced ? '#fd4c5c' : '#ffffff',
                          color: showAdvanced ? '#ffffff' : '#64748b',
                          padding: '0-16px',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'all 0.2s',
                          paddingLeft: '16px',
                          paddingRight: '16px'
                        }}
                        onMouseOver={(e) => {
                          if (!showAdvanced) e.currentTarget.style.background = '#f1f5f9';
                        }}
                        onMouseOut={(e) => {
                          if (!showAdvanced) e.currentTarget.style.background = '#ffffff';
                        }}
                      >
                        <i className="fal fa-sliders-h" style={{ transition: 'transform 0.3s', transform: showAdvanced ? 'rotate(90deg)' : 'none' }}></i>
                        <span>Lọc</span>
                      </button>
                    </div>
                  </div>

                  {/* Phần bộ lọc nâng cao */}
                  {showAdvanced && (
                    <div 
                      className="advanced-filters-panel mt-4 pt-4 border-top"
                      style={{
                        animation: 'slideDown 0.3s ease-out forwards',
                        opacity: 0,
                        transform: 'translateY(-10px)'
                      }}
                    >
                      <div className="row g-4">
                        {/* Phương Tiện */}
                        <div className="col-lg-4 col-md-12">
                          <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#334155', fontSize: '14px' }}>
                            <i className="fal fa-bus-alt text-danger"></i> Phương tiện di chuyển
                          </h6>
                          <div className="d-flex flex-wrap gap-2">
                            {[
                              { value: "all", label: "Tất cả", icon: "fal fa-globe" },
                              { value: "plane", label: "Máy bay", icon: "fal fa-plane" },
                              { value: "bus", label: "Xe khách", icon: "fal fa-bus" },
                              { value: "train", label: "Tàu hỏa", icon: "fal fa-train" }
                            ].map((item) => (
                              <button
                                key={item.value}
                                type="button"
                                className="transport-pill-btn px-3 py-2 d-flex align-items-center gap-2"
                                onClick={() => setTransportationType(item.value)}
                                style={{
                                  borderRadius: '30px',
                                  border: '1px solid',
                                  borderColor: transportationType === item.value ? '#fd4c5c' : '#e2e8f0',
                                  background: transportationType === item.value ? 'linear-gradient(135deg, #fd4c5c 0%, #f97316 100%)' : '#ffffff',
                                  color: transportationType === item.value ? '#ffffff' : '#64748b',
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  boxShadow: transportationType === item.value ? '0 4px 12px rgba(253, 76, 92, 0.2)' : 'none',
                                  transition: 'all 0.2s',
                                  cursor: 'pointer'
                                }}
                              >
                                <i className={item.icon}></i>
                                <span>{item.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Khoảng Giá */}
                        <div className="col-lg-4 col-md-12">
                          <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#334155', fontSize: '14px' }}>
                            <i className="fal fa-money-bill-wave text-danger"></i> Khoảng giá (VNĐ)
                          </h6>
                          <div className="row g-2 align-items-center">
                            <div className="col">
                              <input
                                type="number"
                                className="form-control travel-input-group"
                                placeholder="Từ giá"
                                value={priceFrom}
                                onChange={(e) => setPriceFrom(e.target.value === "" ? "" : Number(e.target.value))}
                                style={{ height: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                              />
                            </div>
                            <div className="col-auto text-muted">-</div>
                            <div className="col">
                              <input
                                type="number"
                                className="form-control travel-input-group"
                                placeholder="Đến giá"
                                value={priceTo}
                                onChange={(e) => setPriceTo(e.target.value === "" ? "" : Number(e.target.value))}
                                style={{ height: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                              />
                            </div>
                          </div>
                          
                          {/* Phím chọn giá nhanh */}
                          <div className="d-flex flex-wrap gap-1 mt-3">
                            {[
                              { label: "Dưới 2Tr", from: "", to: 2000000 },
                              { label: "2Tr - 5Tr", from: 2000000, to: 5000000 },
                              { label: "5Tr - 10Tr", from: 5000000, to: 10000000 },
                              { label: "Trên 10Tr", from: 10000000, to: "" }
                            ].map((p, idx) => (
                              <button
                                key={idx}
                                type="button"
                                className="btn btn-sm px-2 py-1"
                                onClick={() => {
                                  setPriceFrom(p.from as number | "");
                                  setPriceTo(p.to as number | "");
                                }}
                                style={{
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  border: '1px solid #e2e8f0',
                                  background: (priceFrom === p.from && priceTo === p.to) ? '#fd4c5c' : '#ffffff',
                                  color: (priceFrom === p.from && priceTo === p.to) ? '#ffffff' : '#475569',
                                  transition: 'all 0.2s'
                                }}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                          
                          {/* Live Currency Formatting */}
                          {(priceFrom !== "" || priceTo !== "") && (
                            <div className="mt-2 text-danger" style={{ fontSize: '12px' }}>
                              <span>Đang lọc: </span>
                              <strong>
                                {priceFrom !== "" ? new Intl.NumberFormat('vi-VN').format(Number(priceFrom)) + " đ" : "0 đ"}
                              </strong>
                              <span> - </span>
                              <strong>
                                {priceTo !== "" ? new Intl.NumberFormat('vi-VN').format(Number(priceTo)) + " đ" : "Không giới hạn"}
                              </strong>
                            </div>
                          )}
                        </div>

                        {/* Ngày khởi hành */}
                        <div className="col-lg-4 col-md-12">
                          <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#334155', fontSize: '14px' }}>
                            <i className="fal fa-calendar-alt text-danger"></i> Thời gian khởi hành
                          </h6>
                          <div className="row g-2 align-items-center">
                            <div className="col">
                              <input
                                type="date"
                                className="form-control travel-input-group"
                                value={startDateFrom}
                                onChange={(e) => setStartDateFrom(e.target.value)}
                                style={{ height: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#475569' }}
                              />
                            </div>
                            <div className="col-auto text-muted">-</div>
                            <div className="col">
                              <input
                                type="date"
                                className="form-control travel-input-group"
                                value={startDateTo}
                                onChange={(e) => setStartDateTo(e.target.value)}
                                style={{ height: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#475569' }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="shop-shorter rel z-3 mb-20 d-flex flex-wrap justify-content-between align-items-center">
                <div className="sort-text mb-15 me-4 me-xl-auto d-flex align-items-center gap-2">
                  <strong>Khám phá các hành trình thú vị được thiết kế riêng cho bạn</strong>
                  <span className="badge rounded-pill bg-danger fs-6 px-3 py-2">{totalTours} tour</span>
                </div>
                <div className="d-flex align-items-center mb-15">
                  <div className="sort-text me-3 text-nowrap">Sắp xếp theo</div>
                  <select 
                    id="sorting_tours" 
                    className="form-select w-auto"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="default">Mặc định</option>
                    <option value="new">Mới nhất</option>
                    <option value="old">Cũ nhất</option>
                    <option value="hight-to-low">Giá cao đến thấp</option>
                    <option value="low-to-high">Giá thấp đến cao</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Đang tải...</span>
                  </div>
                </div>
              ) : (
                <>
                  {paginatedTours.length === 0 ? (
                    <div className="text-center py-5">
                      <h4 className="text-muted">Không tìm thấy tour nào.</h4>
                    </div>
                  ) : (
                    <>
                      <div className="row g-4">
                        {paginatedTours.map((tour) => {
                          const trans = getTransportationDisplay(tour.transportationType);
                          return (
                            <div className="col-xl-3 col-lg-3 col-md-6 col-sm-12 d-flex flex-column mb-4" key={tour.id}>
                              <div className={`tour-card-premium ${tour.isHot ? 'hot-tour-card' : ''}`}>
                                {/* Media / Image Area */}
                                <div className="tour-card-media">
                                  {tour.isHot && (
                                    <div className="tour-badge-hot">
                                      <i className="fas fa-fire"></i> HOT
                                    </div>
                                  )}
                                  <div className="tour-badge-trans" title={trans.label}>
                                    <i className={trans.icon}></i>
                                  </div>
                                  <img 
                                    src={tour.image} 
                                    alt={tour.title} 
                                    loading="lazy"
                                    className="tour-card-img"
                                  />
                                </div>

                                {/* Body Content */}
                                <div className="tour-card-body">
                                  <div className="tour-card-meta">
                                    <span className="tour-card-dest">
                                      <i className="fal fa-map-marker-alt me-1"></i>
                                      {tour.destination}
                                    </span>
                                    <span className="tour-card-code">
                                      Mã: T-{tour.id}
                                    </span>
                                  </div>

                                  <h5 className="tour-card-title">
                                    <Link href={`/tours/${tour.id}`}>
                                      {tour.title}
                                    </Link>
                                  </h5>

                                  <div className="tour-card-rating">
                                    {[...Array(5)].map((_, i) => (
                                      <i key={i} className={i < Math.round(tour.rating) ? "fas fa-star" : "far fa-star"}></i>
                                    ))}
                                    <span className="tour-card-rating-text">
                                      {tour.rating.toFixed(1)}/5
                                    </span>
                                  </div>

                                  <div className="tour-card-details">
                                    <div className="tour-card-detail-item">
                                      <i className="fal fa-clock"></i>
                                      <span>Thời gian: <strong>{tour.time}</strong></span>
                                    </div>
                                    <div className="tour-card-detail-item">
                                      <i className="fal fa-calendar-alt"></i>
                                      <span>Khởi hành: <strong>{formatDepartureDate(tour.departureStartDate)}</strong></span>
                                    </div>
                                  </div>
                                </div>

                                {/* Footer / Pricing */}
                                <div className="tour-card-footer">
                                  <div>
                                    <span className="tour-card-price-label">Giá chỉ từ</span>
                                    <span className="tour-card-price">{tour.price} đ</span>
                                  </div>
                                  <Link href={`/tours/${tour.id}`} className="btn tour-card-btn">
                                    Đặt Tour <i className="fal fa-arrow-right"></i>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="pagination-container">
                          <button 
                            className="pagination-btn"
                            disabled={currentPage === 1}
                            onClick={() => {
                              setCurrentPage(currentPage - 1);
                              const filterEl = document.querySelector('.aurora-filter-container');
                              if (filterEl) {
                                window.scrollTo({ 
                                  top: filterEl.getBoundingClientRect().top + window.scrollY - 100, 
                                  behavior: 'smooth' 
                                });
                              }
                            }}
                          >
                            <i className="fal fa-chevron-left"></i>
                          </button>

                          {[...Array(totalPages)].map((_, idx) => {
                            const pNum = idx + 1;
                            return (
                              <button
                                key={pNum}
                                className={`pagination-btn ${currentPage === pNum ? 'active' : ''}`}
                                onClick={() => {
                                  setCurrentPage(pNum);
                                  const filterEl = document.querySelector('.aurora-filter-container');
                                  if (filterEl) {
                                    window.scrollTo({ 
                                      top: filterEl.getBoundingClientRect().top + window.scrollY - 100, 
                                      behavior: 'smooth' 
                                    });
                                  }
                                }}
                              >
                                {pNum}
                              </button>
                            );
                          })}

                          <button 
                            className="pagination-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => {
                              setCurrentPage(currentPage + 1);
                              const filterEl = document.querySelector('.aurora-filter-container');
                              if (filterEl) {
                                window.scrollTo({ 
                                  top: filterEl.getBoundingClientRect().top + window.scrollY - 100, 
                                  behavior: 'smooth' 
                                });
                              }
                            }}
                          >
                            <i className="fal fa-chevron-right"></i>
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
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
                  <h2>Đăng ký nhận bản tin của chung tôi để nhận thêm nhiều ưu đãi & meo</h2>
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
                <p>Không yêu cầu thẻ tin dung. Không cam kết</p>
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
                style={{ backgroundImage: "url(/clients/assets/images/newsletter/newsletter-two-right.jpg)" }}
              ></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function ToursPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Đang tải...</span>
        </div>
      </div>
    }>
      <ToursPageContent />
    </Suspense>
  );
}
