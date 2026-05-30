"use client";

import { useEffect, useState, use } from "react";
import { getDestinationById, getTours } from "@/api/coreApi_new";
import Link from "next/link";

interface Tour {
  id: number;
  title: string;
  coverImageUrl: string;
  durationDays: number;
  departureId: number;
  basePrice: number;
  categoryName: string;
  departureStartDate: string;
  isHot?: boolean;
  is_hot?: boolean;
}

interface Destination {
  id: number;
  cityName: string;
  region: string;
  country: string;
  imageUrl: string;
}

export default function DestinationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [hotTours, setHotTours] = useState<Tour[]>([]);
  const [isSpecificHot, setIsSpecificHot] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [destRes, toursRes, hotToursRes] = await Promise.all([
          getDestinationById(Number(id)),
          getTours(undefined, undefined, Number(id), 0, 20),
          getTours(undefined, true, Number(id), 0, 6)
        ]);

        if (destRes.status === 200) {
          setDestination(destRes.data);
        }
        if (toursRes.status === 200 && toursRes.data) {
          setTours(toursRes.data.content);
        }

        let specificHot = [];
        if (hotToursRes.status === 200 && hotToursRes.data && hotToursRes.data.content) {
          specificHot = hotToursRes.data.content;
        }

        if (specificHot.length > 0) {
          setHotTours(specificHot);
          setIsSpecificHot(true);
        } else {
          // Fallback to national hot tours
          const globalHotRes = await getTours(undefined, true, undefined, 0, 6);
          if (globalHotRes.status === 200 && globalHotRes.data && globalHotRes.data.content) {
            setHotTours(globalHotRes.data.content);
          }
          setIsSpecificHot(false);
        }
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5" style={{ minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!destination) {
    return <div className="text-center py-5">Không tìm thấy địa danh.</div>;
  }

  return (
    <>
      <style>{`
        @keyframes flicker-hot {
          0% { opacity: 0.6; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1.15); }
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
      `}</style>
      <section
        className="page-banner-area pt-50 pb-35 rel z-1 bgs-cover"
        style={{ backgroundImage: `url(${destination.imageUrl || '/clients/assets/images/banner/banner.jpg'})` }}
      >
        <div className="container">
          <div className="banner-inner text-white">
            <h2 className="page-title mb-10">{destination.cityName}</h2>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb justify-content-center mb-20">
                <li className="breadcrumb-item"><Link href="/">Trang chủ</Link></li>
                <li className="breadcrumb-item"><Link href="/destination">Điểm đến</Link></li>
                <li className="breadcrumb-item active">{destination.cityName}</li>
              </ol>
            </nav>
          </div>
        </div>
      </section>

      {/* DEDICATED NEON-BACKED HOT TOURS SECTION */}
      {hotTours.length > 0 && (
        <section className="hot-tours-section pt-100 pb-50 rel z-1" style={{
          background: 'linear-gradient(180deg, #FFF6F6 0%, #FFFFFF 100%)',
          position: 'relative'
        }}>
          <div className="container">
            <div className="section-title text-center mb-50">
              <span className="sub-title" style={{
                color: '#fd4c5c',
                textTransform: 'uppercase',
                fontWeight: 800,
                letterSpacing: '2px',
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: '#FFF0F0',
                padding: '6px 16px',
                borderRadius: '30px',
                marginBottom: '12px',
                boxShadow: '0 2px 10px rgba(253,76,92,0.1)'
              }}>
                <i className="fas fa-fire" style={{ animation: 'flicker-hot 0.8s infinite alternate' }}></i>
                Xu Hướng & Đang Hot
              </span>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111' }}>
                {isSpecificHot ? `Tour HOT Đang Diễn Ra Tại ${destination.cityName}` : `Tour HOT Thịnh Hành Khuyên Dùng`}
              </h2>
              <p style={{ color: '#666', fontSize: '15px' }}>
                {isSpecificHot 
                  ? `Khám phá các tour du lịch cực HOT tại ${destination.cityName} đang được săn đón nhiều nhất từ Neon DB!`
                  : `Đừng bỏ lỡ các tour du lịch được yêu thích và đặt nhiều nhất hệ thống!`
                }
              </p>
            </div>

            <div className="row justify-content-center">
              {hotTours.map((tour) => (
                <div className="col-xl-3 col-lg-3 col-md-6 col-sm-12 mb-30 d-flex flex-column" key={`hot-${tour.id}`}>
                  <div className="tour-card-premium hot-tour-card">
                    {/* Media / Image Area */}
                    <div className="tour-card-media">
                      <div className="tour-badge-hot">
                        <i className="fas fa-fire"></i> HOT
                      </div>
                      <img 
                        src={tour.coverImageUrl || "/clients/assets/images/gallery-tours/tour-default.jpg"} 
                        alt={tour.title}
                        loading="lazy"
                        className="tour-card-img"
                      />
                    </div>
                    
                    {/* Body Content */}
                    <div className="tour-card-body">
                      <div className="tour-card-meta">
                        <span className="tour-card-dest">
                          <i className="fal fa-tag me-1"></i>
                          {tour.categoryName || 'Tour Trọn Gói'}
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
                          <i key={i} className="fas fa-star"></i>
                        ))}
                        <span className="tour-card-rating-text">
                          5.0/5
                        </span>
                      </div>

                      <div className="tour-card-details">
                        <div className="tour-card-detail-item">
                          <i className="fal fa-clock"></i>
                          <span>Thời gian: <strong>{tour.durationDays} Ngày {Math.max(0, tour.durationDays - 1)} Đêm</strong></span>
                        </div>
                        {tour.departureStartDate && (
                          <div className="tour-card-detail-item">
                            <i className="fal fa-calendar-alt"></i>
                            <span>Khởi hành: <strong>{new Date(tour.departureStartDate).toLocaleDateString('vi-VN')}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer / Pricing */}
                    <div className="tour-card-footer">
                      <div>
                        <span className="tour-card-price-label">Giá chỉ từ</span>
                        <span className="tour-card-price">
                          {new Intl.NumberFormat('vi-VN').format(tour.basePrice)} đ
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
          </div>
        </section>
      )}

      {/* ALL TOURS AT DESTINATION SECTION */}
      <section className="tour-list-area pt-100 pb-70 rel z-1">
        <div className="container">
          <div className="section-title text-center mb-50">
            <h2>Các Tour du lịch tại {destination.cityName}</h2>
            <p>Khám phá {tours.length} hành trình hấp dẫn dành cho bạn</p>
          </div>

          <div className="row">
            {tours.map((tour) => (
              <div className="col-xl-3 col-lg-3 col-md-6 col-sm-12 mb-30 d-flex flex-column" key={tour.id}>
                <div className={`tour-card-premium ${(tour.isHot || tour.is_hot) ? 'hot-tour-card' : ''}`}>
                  {/* Media / Image Area */}
                  <div className="tour-card-media">
                    {(tour.isHot || tour.is_hot) && (
                      <div className="tour-badge-hot">
                        <i className="fas fa-fire"></i> HOT
                      </div>
                    )}
                    <img 
                      src={tour.coverImageUrl || "/clients/assets/images/gallery-tours/tour-default.jpg"} 
                      alt={tour.title}
                      loading="lazy"
                      className="tour-card-img"
                    />
                  </div>
                  
                  {/* Body Content */}
                  <div className="tour-card-body">
                    <div className="tour-card-meta">
                      <span className="tour-card-dest">
                        <i className="fal fa-tag me-1"></i>
                        {tour.categoryName || 'Tour Trọn Gói'}
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
                        <i key={i} className="fas fa-star"></i>
                      ))}
                      <span className="tour-card-rating-text">
                        5.0/5
                      </span>
                    </div>

                    <div className="tour-card-details">
                      <div className="tour-card-detail-item">
                        <i className="fal fa-clock"></i>
                        <span>Thời gian: <strong>{tour.durationDays} Ngày {Math.max(0, tour.durationDays - 1)} Đêm</strong></span>
                      </div>
                      {tour.departureStartDate && (
                        <div className="tour-card-detail-item">
                          <i className="fal fa-calendar-alt"></i>
                          <span>Khởi hành: <strong>{new Date(tour.departureStartDate).toLocaleDateString('vi-VN')}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer / Pricing */}
                  <div className="tour-card-footer">
                    <div>
                      <span className="tour-card-price-label">Giá chỉ từ</span>
                      <span className="tour-card-price">
                        {new Intl.NumberFormat('vi-VN').format(tour.basePrice)} đ
                      </span>
                    </div>
                    <Link href={`/tours/${tour.id}`} className="btn tour-card-btn">
                      Đặt Tour <i className="fal fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {tours.length === 0 && (
              <div className="col-12 text-center py-5">
                <div className="no-tour-found">
                  <i className="fal fa-map-marked-alt fa-3x mb-20" style={{ color: '#ccc' }}></i>
                  <h4>Chưa có tour nào tại địa danh này</h4>
                  <p>Chúng tôi sẽ sớm cập nhật các hành trình mới nhất.</p>
                  <Link href="/destination" className="theme-btn mt-20">Khám phá địa danh khác</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <style jsx>{`
        .tour-card-premium:hover {
          transform: translateY(-10px);
        }
        .hot-card-premium:hover {
          box-shadow: 0 20px 45px rgba(253, 76, 92, 0.18) !important;
          transform: translateY(-10px) scale(1.02);
        }
        .tour-image img {
          transition: transform 0.5s ease;
        }
        .tour-card-premium:hover .tour-image img {
          transform: scale(1.1);
        }
        .hot-title-link:hover {
          color: #fd4c5c !important;
        }
      `}</style>
    </>
  );
}
