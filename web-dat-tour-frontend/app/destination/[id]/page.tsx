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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [destRes, toursRes] = await Promise.all([
          getDestinationById(Number(id)),
          getTours(undefined, undefined, Number(id), 0, 20)
        ]);

        if (destRes.status === 200) {
          setDestination(destRes.data);
        }
        if (toursRes.status === 200 && toursRes.data) {
          setTours(toursRes.data.content);
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
                    <h5 className="title mb-10" style={{ fontSize: '18px', fontWeight: '700', lineHeight: '1.4' }}>
                      <Link href={tour.departureId ? `/booking/${tour.departureId}` : '#'} style={{ color: '#222' }}>
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
                        <span style={{ fontSize: '12px', color: '#888', display: 'block' }}>Giá từ</span>
                        <span style={{ fontSize: '18px', color: '#ff6b6b', fontWeight: '800' }}>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tour.basePrice)}
                        </span>
                      </div>
                      <Link 
                        href={tour.departureId ? `/booking/${tour.departureId}` : '#'} 
                        className="theme-btn style-two"
                        style={{ padding: '8px 20px', fontSize: '14px' }}
                      >
                        Đặt ngay
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
        .tour-image img {
          transition: transform 0.5s ease;
        }
        .tour-card-premium:hover .tour-image img {
          transform: scale(1.1);
        }
      `}</style>
    </>
  );
}
