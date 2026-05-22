"use client";

import { useEffect, useState } from "react";
import { getTours, getCategories, getDestinations } from "@/api/coreApi_new";

type TourItem = {
  id: number;
  title: string;
  destination: string;
  time: string;
  quantity: string;
  rating: number;
  price: string;
  image: string;
  durationDays?: number;
  isHot?: boolean;
};

export default function ToursPage() {
  const [loading, setLoading] = useState(true);
  const [toursPopular, setToursPopular] = useState<TourItem[]>([]);
  const [allTours, setAllTours] = useState<TourItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDestination, setFilterDestination] = useState("all");
  const [categories, setCategories] = useState<any[]>([]);
  const [destinationsList, setDestinationsList] = useState<any[]>([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Categories & Destinations once
  useEffect(() => {
    const fetchSupportData = async () => {
      try {
        const [catRes, destRes] = await Promise.all([getCategories(), getDestinations(0, 100)]);
        
        // Cấu trúc ApiResponse: { status: number, data: any, message: string }
        if (catRes && catRes.status === 200) {
          setCategories(catRes.data || []);
        }
        
        if (destRes && destRes.status === 200 && destRes.data) {
          // Page object có content
          setDestinationsList(destRes.data.content || destRes.data || []);
        }
      } catch (err) {
        console.error("Lỗi khi fetch dữ liệu hỗ trợ:", err);
      }
    };
    fetchSupportData();
  }, []);

  // Fetch Tours based on filters
  useEffect(() => {
    const fetchAllTours = async () => {
      setLoading(true);
      try {
        const categoryId = filterCategory === "all" ? undefined : Number(filterCategory);
        const destinationId = filterDestination === "all" ? undefined : Number(filterDestination);
        
        // Lấy 100 tour để bao quát hết bảng tours trong DB
        const res = await getTours(categoryId, undefined, destinationId, 0, 100, debouncedSearchTerm);
        if (res.status === 200 && res.data && res.data.content) {
          const fetchedTours = res.data.content;
          
          // Map từ dữ liệu API sang kiểu TourItem
          const mappedTours: TourItem[] = fetchedTours.map((t: any) => ({
            id: t.id,
            title: t.title,
            destination: t.region || t.categoryName || "Khác",
            time: t.durationDays === 1 ? "1 ngày" : `${t.durationDays || 1} ngày ${Math.max(1, (t.durationDays || 1) - 1)} đêm`,
            quantity: "Khởi hành hàng tuần",
            rating: t.rating || 5,
            price: new Intl.NumberFormat('vi-VN').format(t.basePrice || 0),
            image: t.coverImageUrl || t.cover_image_url || "/clients/assets/images/gallery-tours/destination-default.jpg",
            durationDays: t.durationDays || 1,
            isHot: t.isHot ?? t.is_hot ?? false
          }));

          setAllTours(mappedTours);

          // Cập nhật Popular nếu chưa có
          if (toursPopular.length === 0) {
            setToursPopular(mappedTours.slice(0, 3));
          }
        }
      } catch (err) {
        console.error("Lỗi khi fetch tours:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllTours();
  }, [filterCategory, filterDestination, debouncedSearchTerm]);

  const getDurationLabel = (days: number) => {
    if (days === 1) return "Tour 1 ngày";
    return `Tour ${days} ngày ${days - 1} đêm`;
  };

  // Tours đã được lọc từ Backend API, không cần lọc client-side keyword nữa
  const filteredTours = allTours;

  // Group by durationDays
  const grouped: Record<number, TourItem[]> = {};
  filteredTours.forEach((tour: any) => {
    const days = tour.durationDays;
    if (!grouped[days]) grouped[days] = [];
    grouped[days].push(tour);
  });

  // Sắp xếp các nhóm theo số ngày (1 ngày -> 2 ngày -> 3 ngày...)
  const sortedDurations = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <>
      <style>{`
        @keyframes flicker-hot {
          0% { opacity: 0.6; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1.15); }
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
                  <a href="/">Trang chủ</a>
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
            {/* Main Content Area - Full width */}
            <div className="col-lg-12">
              {/* Search Bar matching tourbonphuong */}
              <div className="search-filter-bar bg-white shadow-sm rounded p-3 mb-4 d-flex flex-wrap gap-3 align-items-center" style={{ border: '1px solid #eee' }}>
                <div className="flex-grow-1" style={{ minWidth: '250px' }}>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0"><i className="fal fa-search text-muted"></i></span>
                    <input 
                      type="text" 
                      className="form-control border-start-0 ps-0" 
                      placeholder="Tìm mã tour / lịch trình / lịch khởi hành…" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ boxShadow: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ minWidth: '150px' }}>
                  <select 
                    className="form-select"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="all">Tất cả danh mục</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ minWidth: '150px' }}>
                  <select 
                    className="form-select"
                    value={filterDestination}
                    onChange={(e) => setFilterDestination(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="all">Tất cả địa danh</option>
                    {destinationsList.map((dest: any) => (
                      <option key={dest.id} value={dest.id}>{dest.cityName || dest.city_name || dest.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterCategory("all");
                      setFilterDestination("all");
                    }}
                    title="Làm mới bộ lọc"
                  >
                    <i className="fal fa-sync"></i>
                  </button>
                </div>
              </div>

              <div className="shop-shorter rel z-3 mb-20 d-flex flex-wrap justify-content-between align-items-center">
                <div className="sort-text mb-15 me-4 me-xl-auto d-flex align-items-center gap-2">
                  <strong>Khám phá các hành trình thú vị được thiết kế riêng cho bạn</strong>
                  <span className="badge rounded-pill bg-danger fs-6 px-3 py-2">{filteredTours.length} tour</span>
                </div>
                <div className="d-flex align-items-center mb-15">
                  <div className="sort-text me-3 text-nowrap">Sắp xếp theo</div>
                  <select id="sorting_tours" className="form-select w-auto">
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
                  {sortedDurations.length === 0 ? (
                    <div className="text-center py-5">
                      <h4 className="text-muted">Không tìm thấy tour nào.</h4>
                    </div>
                  ) : (
                    sortedDurations.map((days) => (
                      <div key={days} className="mb-50">
                        <h3 className="section-title mb-30" style={{ borderBottom: '2px solid #fd4c5c', paddingBottom: '10px', display: 'inline-block' }}>
                          {getDurationLabel(days)}
                        </h3>
                        
                        <div className="table-responsive bg-white shadow-sm rounded p-3 mb-4">
                          <table className="table table-hover align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                            <thead className="table-light">
                              <tr>
                                <th scope="col" style={{ width: '15%', border: 'none', padding: '15px' }}>Hình ảnh</th>
                                <th scope="col" style={{ width: '45%', border: 'none', padding: '15px' }}>Tên Tour</th>
                                <th scope="col" style={{ width: '20%', border: 'none', padding: '15px' }}>Thời gian</th>
                                <th scope="col" style={{ width: '20%', border: 'none', padding: '15px' }} className="text-end">Giá & Đặt</th>
                              </tr>
                            </thead>
                            <tbody>
                              {grouped[days].map((tour) => (
                                <tr key={tour.id} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                  <td style={{ padding: '15px', border: 'none', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', background: '#fff' }}>
                                    <div className="image-wrapper" style={{ overflow: 'hidden', borderRadius: '8px', position: 'relative' }}>
                                      {tour.isHot && (
                                        <div style={{
                                          position: 'absolute',
                                          top: '6px',
                                          left: '6px',
                                          background: 'linear-gradient(135deg, #fd4c5c 0%, #f97316 100%)',
                                          color: 'white',
                                          padding: '3px 8px',
                                          borderRadius: '20px',
                                          fontSize: '10px',
                                          fontWeight: 'bold',
                                          zIndex: 10,
                                          boxShadow: '0 3px 8px rgba(253, 76, 92, 0.5)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '3px'
                                        }}>
                                          <i className="fas fa-fire" style={{ fontSize: '9px' }}></i> HOT
                                        </div>
                                      )}
                                      <img 
                                        src={tour.image} 
                                        alt={tour.title} 
                                        loading="lazy"
                                        className="img-fluid transition-hover" 
                                        style={{ height: '90px', width: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} 
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                      />
                                    </div>
                                  </td>
                                  <td style={{ padding: '15px', border: 'none', background: '#fff' }}>
                                    <h5 className="mb-1" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                      <a href={`/tours/${tour.id}`} className="text-dark" style={{ textDecoration: 'none' }}
                                         onMouseOver={(e) => e.currentTarget.style.color = '#fd4c5c'}
                                         onMouseOut={(e) => e.currentTarget.style.color = '#1a1a1a'}>
                                        {tour.title}
                                      </a>
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
                                          gap: '3px'
                                        }}>
                                          <i className="fas fa-fire" style={{ animation: 'flicker-hot 1s infinite alternate' }}></i>
                                          HOT
                                        </span>
                                      )}
                                    </h5>
                                    <div className="small text-muted mb-2">
                                      <span className="me-3"><i className="fal fa-barcode text-primary me-1"></i> Mã tour: <strong>T-{tour.id}</strong></span>
                                      <span><i className="fal fa-map-marker-alt text-primary me-1"></i> {tour.destination}</span>
                                    </div>
                                    <div className="small text-warning">
                                      {[...Array(5)].map((_, i) => (
                                        <i key={i} className={i < tour.rating ? "fas fa-star" : "far fa-star"}></i>
                                      ))}
                                    </div>
                                  </td>
                                  <td style={{ padding: '15px', border: 'none', background: '#fff' }}>
                                    <div className="text-muted fw-medium">
                                      <i className="fal fa-clock text-primary me-2"></i> {tour.time}
                                    </div>
                                    <div className="text-muted small mt-1">
                                      <i className="fal fa-car text-primary me-2"></i> Ô tô / Máy bay
                                    </div>
                                    <div className="text-muted small mt-1">
                                      <i className="fal fa-calendar-alt text-primary me-2"></i> 
                                      Khởi hành: <strong>Hàng ngày</strong>
                                    </div>
                                  </td>
                                  <td className="text-end" style={{ padding: '15px', border: 'none', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', background: '#fff' }}>
                                    <div className="text-danger fw-bold fs-4 mb-2">{tour.price} đ</div>
                                    <a href={`/tours/${tour.id}`} className="theme-btn style-two py-2 px-3 w-100 text-center" style={{ fontSize: '14px', borderRadius: '5px' }}>
                                      <span data-hover="Đặt Tour">Đặt Tour</span>
                                    </a>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))
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
                style={{ backgroundImage: "url(/clients/assets/images/newsletter/newsletter-two-right.jpg)" }}
              ></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
