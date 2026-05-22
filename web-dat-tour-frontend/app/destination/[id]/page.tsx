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
        @keyframes hot-glow {
          0% { box-shadow: 0 10px 30px rgba(253, 76, 92, 0.05); border-color: rgba(253, 76, 92, 0.15); }
          50% { box-shadow: 0 15px 35px rgba(253, 76, 92, 0.2); border-color: rgba(253, 76, 92, 0.4); }
          100% { box-shadow: 0 10px 30px rgba(253, 76, 92, 0.05); border-color: rgba(253, 76, 92, 0.15); }
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
                <div className="col-xl-4 col-md-6 mb-30" key={`hot-${tour.id}`}>
                  <div className="tour-card-premium hot-card-premium" style={{
                    background: '#fff',
                    borderRadius: '15px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid rgba(253, 76, 92, 0.15)',
                    position: 'relative',
                    animation: 'hot-glow 3s infinite'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      right: '15px',
                      background: 'linear-gradient(135deg, #fd4c5c 0%, #f97316 100%)',
                      color: 'white',
                      padding: '5px 14px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      zIndex: 10,
                      boxShadow: '0 4px 10px rgba(253, 76, 92, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <i className="fas fa-fire" style={{ animation: 'flicker-hot 0.6s infinite alternate' }}></i> BÁN CHẠY
                    </div>

                    <div className="tour-image" style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                      <img 
                        src={tour.coverImageUrl || "/clients/assets/images/gallery-tours/tour-default.jpg"} 
                        alt={tour.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div className="tour-tag" style={{
                        position: 'absolute',
                        top: '15px',
                        left: '15px',
                        background: '#ff6b6b',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {tour.categoryName || 'Tour Trọn Gói'}
                      </div>
                    </div>
                    
                    <div className="tour-content" style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <h5 className="title mb-10" style={{ fontSize: '18px', fontWeight: '700', lineHeight: '1.4', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <Link href={`/tours/${tour.id}`} style={{ color: '#222', transition: 'color 0.2s' }} className="hot-title-link">
                          {tour.title}
                        </Link>
                      </h5>
                      
                      <div className="tour-meta mb-15" style={{ display: 'flex', gap: '15px', fontSize: '13px', color: '#666' }}>
                        <span><i className="far fa-clock mr-5"></i> {tour.durationDays} Ngày {tour.durationDays - 1} Đêm</span>
                        {tour.departureStartDate && (
                          <span><i className="far fa-calendar-alt mr-5"></i> {new Date(tour.departureStartDate).toLocaleDateString('vi-VN')}</span>
                        )}
                      </div>

                      <div className="tour-bottom mt-auto" style={{ borderTop: '1px solid #eee', paddingTop: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="price">
                          <span style={{ fontSize: '12px', color: '#888', display: 'block' }}>Giá siêu tốt</span>
                          <span style={{ fontSize: '18px', color: '#ff6b6b', fontWeight: '800' }}>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tour.basePrice)}
                          </span>
                        </div>
                        <Link 
                          href={`/tours/${tour.id}`} 
                          className="theme-btn"
                          style={{ 
                            padding: '8px 20px', 
                            fontSize: '14px',
                            background: 'linear-gradient(135deg, #fd4c5c 0%, #ff6b6b 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '30px',
                            fontWeight: '600',
                            boxShadow: '0 4px 10px rgba(253, 76, 92, 0.2)'
                          }}
                        >
                          Săn Tour Ngay
                        </Link>
                      </div>
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
              <div className="col-xl-4 col-md-6 mb-30" key={tour.id}>
                <div className="tour-card-premium" style={{
                  background: '#fff',
                  borderRadius: '15px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div className="tour-image" style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                    {((tour as any).isHot || (tour as any).is_hot) && (
                      <div style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'linear-gradient(135deg, #fd4c5c 0%, #f97316 100%)',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        zIndex: 10,
                        boxShadow: '0 3px 8px rgba(253, 76, 92, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <i className="fas fa-fire" style={{ fontSize: '10px' }}></i> HOT
                      </div>
                    )}
                    <img 
                      src={tour.coverImageUrl || "/clients/assets/images/gallery-tours/tour-default.jpg"} 
                      alt={tour.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div className="tour-tag" style={{
                      position: 'absolute',
                      top: '15px',
                      left: '15px',
                      background: '#ff6b6b',
                      color: '#fff',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {tour.categoryName || 'Tour Trọn Gói'}
                    </div>
                  </div>
                  
                  <div className="tour-content" style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <h5 className="title mb-10" style={{ fontSize: '18px', fontWeight: '700', lineHeight: '1.4', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <Link href={`/tours/${tour.id}`} style={{ color: '#222' }}>
                        {tour.title}
                      </Link>
                      {((tour as any).isHot || (tour as any).is_hot) && (
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
                          gap: '3px'
                        }}>
                          <i className="fas fa-fire" style={{ animation: 'flicker-hot 1s infinite alternate' }}></i>
                          HOT
                        </span>
                      )}
                    </h5>
                    
                    <div className="tour-meta mb-15" style={{ display: 'flex', gap: '15px', fontSize: '13px', color: '#666' }}>
                      <span><i className="far fa-clock mr-5"></i> {tour.durationDays} Ngày {tour.durationDays - 1} Đêm</span>
                      {tour.departureStartDate && (
                        <span><i className="far fa-calendar-alt mr-5"></i> {new Date(tour.departureStartDate).toLocaleDateString('vi-VN')}</span>
                      )}
                    </div>

                    <div className="tour-bottom mt-auto" style={{ borderTop: '1px solid #eee', paddingTop: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div className="price">
                        <span style={{ fontSize: '12px', color: '#888', display: 'block' }}>Giá từ</span>
                        <span style={{ fontSize: '18px', color: '#ff6b6b', fontWeight: '800' }}>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tour.basePrice)}
                        </span>
                      </div>
                      <Link 
                        href={`/tours/${tour.id}`} 
                        className="theme-btn style-two"
                        style={{ padding: '8px 20px', fontSize: '14px' }}
                      >
                        Xem & Đặt tour
                      </Link>
                    </div>
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
