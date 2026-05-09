"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDepartureDetails, getTourSchedules, getTourDetails } from "../../../api/coreApi_new";
import { createBooking } from "../../../api/bookingApi";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [tourDetail, setTourDetail] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- STATES ---
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [numAdults, setNumAdults] = useState(2);
  const [numChildren, setNumChildren] = useState(0);
  const [numBabies, setNumBabies] = useState(0);
  const [visibleRows, setVisibleRows] = useState(10);
  const [activePolicyTab, setActivePolicyTab] = useState("inclusions");

  // --- FETCH DATA ---
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      const [detailRes, schedulesRes] = await Promise.all([
        getDepartureDetails(id),
        getTourSchedules(id)
      ]);
      
      if (detailRes.data) {
        setTourDetail(detailRes.data);
        if (detailRes.data.packages && detailRes.data.packages.length > 0) {
            setSelectedPackage(detailRes.data.packages[0].id);
        }
        
        // --- FETCH TOUR POLICIES DYNAMICALLY ---
        if (detailRes.data.tourId) {
            const tourPoliciesRes = await getTourDetails(detailRes.data.tourId);
            if (tourPoliciesRes.data) {
                setTourDetail(prev => ({
                    ...prev,
                    ...tourPoliciesRes.data
                }));
            }
        }
      }
      
      if (schedulesRes.data) {
        setSchedules(schedulesRes.data.map((s: any) => ({
          ...s,
          date: new Date(s.date)
        })));
      }
      
      setLoading(false);
    };
    fetchData();
  }, [id]);

  // --- MOCK DATA BASED ON API ---
  const dateTabs = useMemo(() => {
    if (schedules.length === 0) return [{ label: "Tất cả", value: "all" }];
    
    // Lấy 3 ngày đầu tiên có lịch
    const tabs = schedules.slice(0, 3).map((s: any) => {
      const dd = String(s.date.getDate()).padStart(2, '0');
      const mm = String(s.date.getMonth() + 1).padStart(2, '0');
      return { label: `${dd}/${mm}`, value: `${dd}/${mm}` };
    });
    
    tabs.push({ label: "Tất cả", value: "all" });
    return tabs;
  }, [schedules]);

  // --- HELPERS ---
  const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN").format(price) + "đ";

  const formatFullDate = (d: Date) => {
    const days = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const dayName = days[d.getDay()];
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dayName}, ${dd}/${mm}/${yyyy}`;
  };

  const formatDateShort = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}`;
  };

  const getPackageExtraPrice = () => {
      if (!tourDetail || !tourDetail.packages) return 0;
      const pkg = tourDetail.packages.find((p: any) => p.id === selectedPackage);
      return pkg ? pkg.extraPrice : 0;
  };

  const adultPrice = tourDetail ? (tourDetail.priceConfig?.adultPrice || 0) + getPackageExtraPrice() : 0;
  const childPrice = tourDetail ? (tourDetail.priceConfig?.child1014Price || 0) + getPackageExtraPrice() : 0;

  // --- FILTER & CALCULATE ---
  const filteredSchedules = schedules.filter(s => {
    if (activeTab === "all") return true;
    return formatDateShort(s.date) === activeTab;
  });

  const displayedSchedules = filteredSchedules.slice(0, visibleRows);

  const totalAmount = numAdults * adultPrice + numChildren * childPrice;

  const handleBooking = async () => {
    if (!tourDetail) return;
    const requestData = {
      userId: 1, 
      departureId: Number(id),
      note: `Gói: ${selectedPackage} | NL: ${numAdults}, TE: ${numChildren}, EB: ${numBabies}`,
      passengers: []
    };

    try {
      const res = await createBooking(requestData);
      if (res.status === 201 || res.status === 200) {
        alert("Giữ chỗ thành công! Mã đơn hàng: " + (res.data?.bookingCode || "N/A"));
      } else {
        alert("Lỗi khi đặt tour: " + res.message);
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi kết nối server!");
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "Còn chỗ") return <span className="badge-status success">Còn chỗ</span>;
    if (status === "Chỉ còn chỗ") return <span className="badge-status warning">Chỉ còn chỗ</span>;
    return <span className="badge-status disabled">Hết chỗ</span>;
  };

  if (loading) {
    return <div className="text-center py-5" style={{marginTop: "100px", fontFamily: "system-ui"}}>Đang tải thông tin chuyến đi...</div>;
  }

  if (!tourDetail) {
    return <div className="text-center py-5" style={{marginTop: "100px", fontFamily: "system-ui"}}>Không tìm thấy thông tin chuyến đi.</div>;
  }

  return (
    <>
      <style>{`
        .booking-container {
          font-family: system-ui, -apple-system, sans-serif;
          color: #333;
          padding: 40px 0;
          background-color: #FAFAFA;
        }
        .booking-card {
          background: white;
          border: 1px solid #E0E0E0;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }
        .sticky-card {
          position: -webkit-sticky;
          position: sticky;
          top: 100px;
          z-index: 10;
          max-width: 480px;
          margin: 0 auto;
        }
        
        /* Radios */
        .radio-card {
          border: 1px solid #E0E0E0;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
        }
        .radio-card.active {
          border-color: #FF6B00;
          background-color: #FFF8F0;
        }
        .radio-circle {
          width: 20px; height: 20px; border-radius: 50%; border: 2px solid #ccc;
          display: flex; align-items: center; justify-content: center;
          margin-right: 12px; flex-shrink: 0;
        }
        .radio-card.active .radio-circle {
          border-color: #FF6B00;
        }
        .radio-inner-circle {
          width: 10px; height: 10px; border-radius: 50%; background: #FF6B00;
          opacity: 0; transform: scale(0); transition: all 0.2s ease;
        }
        .radio-card.active .radio-inner-circle {
          opacity: 1; transform: scale(1);
        }
        .badge-discount {
          background-color: #FFEBEE; color: #D32F2F; padding: 4px 8px; 
          border-radius: 6px; font-size: 12px; font-weight: 600;
        }

        /* Tabs */
        .date-tabs-scroll {
          display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px;
        }
        .date-tabs-scroll::-webkit-scrollbar { height: 4px; }
        .date-tabs-scroll::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
        .date-tab {
          padding: 8px 20px; border-radius: 20px; font-weight: 600; font-size: 14px;
          cursor: pointer; white-space: nowrap; transition: all 0.2s ease;
          background: #F5F5F5; color: #666; border: 1px solid transparent;
        }
        .date-tab.active { background: #FF6B00; color: white; border-color: #FF6B00; }
        .date-tab:not(.active):hover { background: #EEEEEE; }

        /* Counters */
        .counter-btn {
          width: 32px; height: 32px; border-radius: 50%; border: 1px solid #E0E0E0;
          display: flex; align-items: center; justify-content: center;
          background: white; cursor: pointer; color: #333; font-weight: 600; font-size: 18px;
          transition: all 0.2s; padding: 0;
        }
        .counter-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .counter-btn:not(:disabled):hover { border-color: #FF6B00; color: #FF6B00; }
        .counter-value { width: 32px; text-align: center; font-weight: bold; font-size: 16px; }

        /* Table */
        .schedule-table { width: 100%; border-collapse: collapse; }
        .schedule-table th {
          color: #666; font-weight: 600; border-bottom: 2px solid #E0E0E0; 
          padding: 12px 8px; text-align: left; font-size: 15px;
        }
        .schedule-table td { padding: 16px 8px; border-bottom: 1px solid #F0F0F0; vertical-align: middle; }
        .schedule-row:last-child td { border-bottom: none; }
        
        .badge-status { padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block; }
        .badge-status.success { background-color: #E8F5E9; color: #2E7D32; }
        .badge-status.warning { background-color: #FFF3E0; color: #E65100; }
        .badge-status.disabled { background-color: #EEEEEE; color: #9E9E9E; }
        
        .select-btn {
          border: 1px solid #FF6B00; color: #FF6B00; background: white; 
          padding: 6px 20px; border-radius: 20px; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .select-btn:hover:not(:disabled) { background: #FFF8F0; }
        .select-btn:disabled { border-color: #E0E0E0; color: #9E9E9E; background: #F5F5F5; cursor: not-allowed; }

        /* CTA */
        .cta-btn {
          background: linear-gradient(135deg, #FF6B00 0%, #E55A00 100%);
          color: white; font-weight: bold; font-size: 16px; border: none; 
          border-radius: 24px; padding: 16px; width: 100%; transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(229, 90, 0, 0.25);
        }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(229, 90, 0, 0.4); }

        /* Gallery */
        .gallery-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          grid-template-rows: 180px 180px;
          gap: 10px;
          border-radius: 12px;
          overflow: hidden;
        }
        .gallery-main { grid-column: 1 / 2; grid-row: 1 / 3; }
        .gallery-sub { position: relative; width: 100%; height: 100%; }
        .gallery-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.3s ease; cursor: pointer;
        }
        .gallery-grid > div { overflow: hidden; }
        .gallery-main:hover .gallery-img, .gallery-sub:hover .gallery-img { transform: scale(1.05); }
        .overlay-more {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;
          color: white; font-weight: bold; font-size: 1.1rem; cursor: pointer; transition: background 0.3s;
        }
        .overlay-more:hover { background: rgba(0,0,0,0.6); }
        @media (max-width: 768px) {
          .gallery-grid { grid-template-columns: 1fr 1fr; grid-template-rows: 250px 120px; }
          .gallery-main { grid-column: 1 / 3; grid-row: 1 / 2; }
          .gallery-sub:nth-child(n+4) { display: none; }
        }

        /* Overview & Timeline */
        .timeline-container { position: relative; padding-left: 24px; margin-top: 16px; }
        .timeline-container::before {
          content: ''; position: absolute; left: 0; top: 8px; bottom: 0;
          width: 2px; background: #FFD1B3;
        }
        .timeline-item { position: relative; margin-bottom: 24px; }
        .timeline-item::before {
          content: ''; position: absolute; left: -29px; top: 4px;
          width: 12px; height: 12px; border-radius: 50%;
          background: #FF6B00; border: 2px solid white; box-shadow: 0 0 0 2px #FF6B00;
        }
        .timeline-time { color: #FF6B00; font-weight: 600; margin-bottom: 4px; font-size: 0.9rem; }
        .timeline-title { font-weight: bold; font-size: 1.1rem; margin-bottom: 8px; }
        .timeline-desc { color: #555; line-height: 1.6; }
        
        .list-check li { position: relative; padding-left: 28px; margin-bottom: 12px; color: #444; }
        .list-check li::before {
          content: '✓'; position: absolute; left: 0; top: 0;
          color: #2E7D32; font-weight: bold; font-size: 18px; line-height: 1.2;
        }
        .list-cross li { position: relative; padding-left: 28px; margin-bottom: 12px; color: #444; }
        .list-cross li::before {
          content: '✕'; position: absolute; left: 0; top: 0;
          color: #D32F2F; font-weight: bold; font-size: 18px; line-height: 1.2;
        }

        /* Policy Tabs */
        .policy-tabs {
          display: flex;
          border-bottom: 2px solid #EEE;
          margin-bottom: 24px;
          overflow-x: auto;
          white-space: nowrap;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
        }
        .policy-tabs::-webkit-scrollbar { height: 4px; }
        .policy-tabs::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
        
        .policy-tab {
          padding: 12px 20px;
          cursor: pointer;
          font-weight: 600;
          color: #666;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          flex-shrink: 0;
          font-size: 14px;
        }
        .policy-tab.active {
          color: #FF6B00;
          border-bottom-color: #FF6B00;
        }
        .policy-content {
          animation: fadeIn 0.3s ease;
          max-height: 500px;
          overflow-y: auto;
          padding-right: 8px;
        }
        .policy-content::-webkit-scrollbar { width: 4px; }
        .policy-content::-webkit-scrollbar-thumb { background: #eee; border-radius: 4px; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="booking-container">
        <div className="container">
          
          {/* TOUR HEADER INFO */}
          <div className="mb-4">
            <h1 className="font-weight-bold mb-2" style={{fontSize: "2rem", color: "#1A1A1A"}}>
              {tourDetail.title}
            </h1>
            <div className="d-flex align-items-center" style={{gap: "12px"}}>
              <div className="d-flex" style={{color: "#FFB800", gap: "2px"}}>
                {[...Array(5)].map((_, i) => (
                  <i key={i} className={i < Math.floor(tourDetail.rating || 5) ? "fas fa-star" : "far fa-star"}></i>
                ))}
              </div>
              <span className="font-weight-bold" style={{fontSize: "1.1rem"}}>{tourDetail.rating || 4.8}</span>
              <span className="text-muted">({tourDetail.reviewCount || 120} đánh giá)</span>
            </div>
          </div>

          <div className="row">
            
            {/* LỊCH KHỞI HÀNH & HÌNH ẢNH - MAIN CONTENT */}
            <div className="col-lg-7 mb-4">
              
              {/* THƯ VIỆN HÌNH ẢNH */}
              <div className="mb-4">
                <div className="gallery-grid">
                  <div className="gallery-main">
                    <img src={tourDetail.images?.[0] || tourDetail.image || "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop"} alt={tourDetail.title} className="gallery-img" />
                  </div>
                  <div className="gallery-sub">
                    <img src={tourDetail.images?.[1] || "https://images.unsplash.com/photo-1555502575-5cb391e63a32?q=80&w=800&auto=format&fit=crop"} alt="Cảnh quan 1" className="gallery-img" />
                  </div>
                  <div className="gallery-sub">
                    <img src={tourDetail.images?.[2] || "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800&auto=format&fit=crop"} alt="Cảnh quan 2" className="gallery-img" />
                  </div>
                  <div className="gallery-sub">
                    <img src={tourDetail.images?.[3] || "https://images.unsplash.com/photo-1506527632616-65e3170757af?q=80&w=800&auto=format&fit=crop"} alt="Cảnh quan 3" className="gallery-img" />
                  </div>
                  <div className="gallery-sub">
                    <img src={tourDetail.images?.[4] || "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=800&auto=format&fit=crop"} alt="Ẩm thực/Hoạt động" className="gallery-img" />
                    {tourDetail.images?.length > 5 && (
                      <div className="overlay-more">
                        <span>+{tourDetail.images.length - 5} hình ảnh</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* TỔNG QUAN & LỊCH TRÌNH */}
              {tourDetail.overview && (
                <div className="booking-card p-4 mb-4">
                  <h4 className="font-weight-bold mb-3" style={{fontSize: "1.25rem"}}>Tổng quan về tour</h4>
                  <p className="text-muted" style={{lineHeight: 1.6}}>{tourDetail.overview}</p>
                </div>
              )}

              {tourDetail.itinerary && tourDetail.itinerary.length > 0 && (
                <div className="booking-card p-4 mb-4">
                  <h4 className="font-weight-bold mb-4" style={{fontSize: "1.25rem"}}>Lịch trình chi tiết</h4>
                  <div className="timeline-container">
                    {tourDetail.itinerary.map((item: any, idx: number) => (
                      <div key={idx} className="timeline-item">
                        <div className="timeline-time">{item.time}</div>
                        <div className="timeline-title">{item.title}</div>
                        <div className="timeline-desc">{item.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ĐIỀU KIỆN & CHÍNH SÁCH */}
              <div className="booking-card p-4 mb-4">
                <h4 className="font-weight-bold mb-4" style={{fontSize: "1.25rem"}}>Điều kiện áp dụng & Chính sách</h4>
                
                <div className="policy-tabs">
                  <div className={`policy-tab ${activePolicyTab === "inclusions" ? "active" : ""}`} onClick={() => setActivePolicyTab("inclusions")}>Tour bao gồm</div>
                  <div className={`policy-tab ${activePolicyTab === "exclusions" ? "active" : ""}`} onClick={() => setActivePolicyTab("exclusions")}>Không bao gồm</div>
                  <div className={`policy-tab ${activePolicyTab === "children" ? "active" : ""}`} onClick={() => setActivePolicyTab("children")}>Điều kiện trẻ em</div>
                  <div className={`policy-tab ${activePolicyTab === "cancel" ? "active" : ""}`} onClick={() => setActivePolicyTab("cancel")}>Quy định hủy tour</div>
                  <div className={`policy-tab ${activePolicyTab === "notes" ? "active" : ""}`} onClick={() => setActivePolicyTab("notes")}>Lưu ý</div>
                </div>

                <div className="policy-content">
                  {activePolicyTab === "inclusions" && (
                    <ul className="list-unstyled list-check">
                      {tourDetail.inclusions?.map((inc: string, idx: number) => (
                        <li key={idx}>{inc}</li>
                      ))}
                    </ul>
                  )}
                  {activePolicyTab === "exclusions" && (
                    <ul className="list-unstyled list-cross">
                      {tourDetail.exclusions?.map((exc: string, idx: number) => (
                        <li key={idx}>{exc}</li>
                      ))}
                    </ul>
                  )}
                  {activePolicyTab === "children" && (
                    <ul className="list-unstyled list-check">
                      {tourDetail.childPolicy?.map((p: string, idx: number) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  )}
                  {activePolicyTab === "cancel" && (
                    <ul className="list-unstyled list-cross">
                      {tourDetail.cancellationPolicy?.map((p: string, idx: number) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  )}
                  {activePolicyTab === "notes" && (
                    <ul className="list-unstyled">
                      {tourDetail.notes?.map((n: string, idx: number) => (
                        <li key={idx} className="mb-2">
                          <i className="fas fa-info-circle mr-2 text-primary"></i> {n}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="booking-card p-4">
                <h4 className="font-weight-bold mb-2" style={{fontSize: "1.25rem"}}>Lịch khởi hành & giá tour</h4>
                <p className="text-muted small mb-4">{filteredSchedules.length} lịch hiển thị</p>

                {filteredSchedules.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    Chưa có lịch trong khoảng này.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="schedule-table">
                      <thead>
                        <tr>
                          <th>Ngày khởi hành</th>
                          <th>Tình trạng</th>
                          <th>Giá</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedSchedules.map((item) => (
                          <tr key={item.id} className="schedule-row">
                            <td className="font-weight-bold">{formatFullDate(item.date)}</td>
                            <td>{getStatusBadge(item.status)}</td>
                            <td className="font-weight-bold" style={{color: "#FF6B00"}}>{formatPrice(item.price || adultPrice)}</td>
                            <td className="text-right">
                              <button className="select-btn" disabled={item.status === "Hết chỗ"}>
                                Chọn
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {filteredSchedules.length > visibleRows && (
                  <div className="text-center mt-4">
                    <button className="btn btn-outline-secondary" style={{borderRadius: 20, padding: "8px 24px"}} onClick={() => setVisibleRows(prev => prev + 10)}>
                      Xem thêm
                    </button>
                  </div>
                )}
                {filteredSchedules.length > 0 && filteredSchedules.length <= visibleRows && (
                  <div className="text-center mt-4 text-muted small">
                    Đã hiển thị hết.
                  </div>
                )}
              </div>
            </div>

            {/* WIDGET BÊN PHẢI - STICKY CARD */}
            <div className="col-lg-5">
              <div className="booking-card p-4 sticky-card">
                
                {/* 1. Chọn gói tour */}
                <div className="mb-4">
                  <h5 className="font-weight-bold mb-3" style={{fontSize: "1rem"}}>1. Chọn gói tour</h5>
                  <div className="d-flex flex-column" style={{gap: "12px"}}>
                    {tourDetail.packages?.map((pkg: any) => (
                      <div 
                        key={pkg.id} 
                        className={`radio-card ${selectedPackage === pkg.id ? 'active' : ''}`}
                        onClick={() => setSelectedPackage(pkg.id)}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <div className="d-flex align-items-center">
                            <div className="radio-circle">
                              <div className="radio-inner-circle"></div>
                            </div>
                            <span className="font-weight-bold">{pkg.name}</span>
                          </div>
                          {pkg.extraPrice === 0 && <span className="badge-discount">Tiêu chuẩn</span>}
                        </div>
                        <div className="text-muted small" style={{marginLeft: "32px"}}>
                          NL: {formatPrice((tourDetail.priceConfig?.adultPrice || 0) + pkg.extraPrice)} - TE: {formatPrice((tourDetail.priceConfig?.child1014Price || 0) + pkg.extraPrice)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Ngày khởi hành */}
                <div className="mb-4">
                  <h5 className="font-weight-bold mb-3" style={{fontSize: "1rem"}}>2. Ngày khởi hành</h5>
                  <div className="date-tabs-scroll">
                    {dateTabs.map(tab => (
                      <div 
                        key={tab.value}
                        className={`date-tab ${activeTab === tab.value ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.value)}
                      >
                        {tab.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Chọn số hành khách */}
                <div className="mb-4">
                  <h5 className="font-weight-bold mb-1" style={{fontSize: "1rem"}}>3. Hành khách</h5>
                  <div className="text-muted small mb-3">(NL: Người lớn, TE: Trẻ em, EB: Em bé)</div>
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <div className="font-weight-bold">Người lớn (NL)</div>
                      <div className="text-muted small">{formatPrice(adultPrice)}</div>
                    </div>
                    <div className="d-flex align-items-center">
                      <button className="counter-btn" disabled={numAdults <= 1} onClick={() => setNumAdults(prev => prev - 1)}>–</button>
                      <div className="counter-value">{numAdults}</div>
                      <button className="counter-btn" onClick={() => setNumAdults(prev => prev + 1)}>+</button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <div className="font-weight-bold">Trẻ em (TE)</div>
                      <div className="text-muted small">{formatPrice(childPrice)}</div>
                    </div>
                    <div className="d-flex align-items-center">
                      <button className="counter-btn" disabled={numChildren <= 0} onClick={() => setNumChildren(prev => prev - 1)}>–</button>
                      <div className="counter-value">{numChildren}</div>
                      <button className="counter-btn" onClick={() => setNumChildren(prev => prev + 1)}>+</button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="font-weight-bold">Em bé (EB)</div>
                      <div className="text-muted small">0đ (miễn phí)</div>
                    </div>
                    <div className="d-flex align-items-center">
                      <button className="counter-btn" disabled={numBabies <= 0} onClick={() => setNumBabies(prev => prev - 1)}>–</button>
                      <div className="counter-value">{numBabies}</div>
                      <button className="counter-btn" onClick={() => setNumBabies(prev => prev + 1)}>+</button>
                    </div>
                  </div>
                </div>

                {/* Tổng tiền & Nút đặt tour */}
                <div className="border-top pt-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <span className="font-weight-bold" style={{fontSize: "1.1rem"}}>Tổng tiền</span>
                    <span className="font-weight-bold" style={{fontSize: "1.5rem", color: "#D32F2F"}}>{formatPrice(totalAmount)}</span>
                  </div>
                  <button className="cta-btn" onClick={handleBooking}>
                    ĐẶT TOUR NGAY
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
