"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDepartureDetails, getTourSchedules, getTourDetails } from "../../../api/coreApi_new";
import { createBooking, getBookingByCode, type BookingRequest, type PassengerDTO } from "../../../api/bookingApi";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [tourDetail, setTourDetail] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [selectedDepId, setSelectedDepId] = useState<string | number>(id);
  // priceConfig của departure đang chọn (cập nhật khi chọn ngày khởi hành khác)
  const [selectedPriceConfig, setSelectedPriceConfig] = useState<any>(null);

  // --- STATES ---
  // activeTab giờ dùng departure ID (string) để đồng bộ với bảng lịch
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [numAdults, setNumAdults] = useState(2);
  const [numChildren, setNumChildren] = useState(0);
  const [numBabies, setNumBabies] = useState(0);
  const [visibleRows, setVisibleRows] = useState(10);
  const [activePolicyTab, setActivePolicyTab] = useState("inclusions");
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  // Booking result modal
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // --- CHECKOUT FORM STATES ---
  const [pickupPoint, setPickupPoint] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactNotes, setContactNotes] = useState("");
  const [paymentRatio, setPaymentRatio] = useState(100); // 100 or 50
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVouchers, setAppliedVouchers] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("bank"); // bank or cash
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // --- FETCH DATA ---
    // --- FETCH DATA THẬT TỪ BACKEND ---
  useEffect(() => {
    if (!id) return;
    
    const isBookingCode = id.startsWith("BK-") || isNaN(Number(id));

    const fetchData = async () => {
      setLoading(true);
      try {
        if (isBookingCode) {
          // TRƯỜNG HỢP 1: XEM CHI TIẾT ĐƠN HÀNG ĐÃ ĐẶT
          const res = await getBookingByCode(id);
          if (res.status === 200 && res.data) {
            setBookingData(res.data);
          } else {
            console.error("Không tìm thấy đơn hàng:", res.message);
          }
        } else {
          // TRƯỜNG HỢP 2: TRANG CHECKOUT (ĐẶT MỚI)
          // Bước 1: Lấy thông tin Lịch khởi hành (Giá, Ngày, TourId)
          const detailRes = await getDepartureDetails(id);
          
          console.log("[DEBUG] getDepartureDetails raw response:", detailRes);
          
          if (detailRes && detailRes.data) {
            const depData = detailRes.data;
            console.log("[DEBUG] depData:", depData);
            console.log("[DEBUG] depData.priceConfig:", depData.priceConfig);
            
            // Bước 2: Lấy thông tin Lịch trình chung của cả tour
            const schedulesRes = await getTourSchedules(depData.tourId);
            
            // Bước 3: Lấy thông tin Chi tiết Tour (Ảnh, Overview, Lịch trình, Chính sách)
            const tourDetailRes = await getTourDetails(depData.tourId);
            console.log("[DEBUG] getTourDetails raw response:", tourDetailRes);
            
            // Bước 4: GHÉP DỮ LIỆU (Mapping BE fields sang FE fields)
            const tourData = tourDetailRes.data;
            console.log("[DEBUG] tourData.basePrice:", tourData?.basePrice);
            
            // Helper to safely parse JSON strings or objects
            const safeParse = (data: any) => {
              if (typeof data === 'string') {
                try { return JSON.parse(data); } catch (e) { return data; }
              }
              return data;
            };

            // Helper: Ép kiểu an toàn từ BigDecimal Java (có thể là string, number, hoặc object)
            const toNum = (val: any): number => {
              if (val === null || val === undefined) return 0;
              const n = typeof val === 'object' ? Number(val.toString()) : Number(val);
              return isNaN(n) ? 0 : n;
            };

            // Fallback giá: priceConfig > basePrice tour > 0
            const fallbackBasePrice = toNum(tourData?.basePrice) || 0;
            const pc = depData.priceConfig;
            const resolvedAdultPrice = pc ? toNum(pc.adultPrice) : fallbackBasePrice;
            const resolvedChild1014 = pc ? toNum(pc.child1014Price) : Math.round(fallbackBasePrice * 0.75);
            const resolvedChild49 = pc ? toNum(pc.child49Price) : Math.round(fallbackBasePrice * 0.5);
            const resolvedBaby = pc ? toNum(pc.babyPrice) : 0;

            console.log("[DEBUG] Resolved prices:", { resolvedAdultPrice, resolvedChild1014, resolvedChild49, resolvedBaby });

            const mergedData = {
              ...tourData,
              ...depData,
              id: depData.id,
              tourId: depData.tourId,
              title: depData.tourTitle || tourData?.title,
              image: tourData?.images?.find((img: any) => img.isCover)?.imageUrl || tourData?.images?.[0]?.imageUrl || tourData?.coverImageUrl,
              images: tourData?.images?.map((img: any) => img.imageUrl),
              
              // Map structured fields
              overview: tourData?.overview || tourData?.description,
              itinerary: safeParse(tourData?.itinerary),
              inclusions: safeParse(tourData?.inclusions),
              exclusions: safeParse(tourData?.exclusions),
              policies: safeParse(tourData?.policies),
              
              // Tạo Gói tour từ PriceConfig nếu BE không trả về packages
              packages: tourData?.packages || [
                {
                  id: "standard",
                  name: "Gói Tiêu Chuẩn",
                  extraPrice: 0,
                  description: "Bao gồm đầy đủ các dịch vụ cơ bản theo chương trình tour."
                }
              ],

              // Map price config - luôn đảm bảo là số hợp lệ
              priceConfig: {
                  adultPrice: resolvedAdultPrice,
                  child1014Price: resolvedChild1014,
                  child49Price: resolvedChild49,
                  babyPrice: resolvedBaby,
              }
            };

            setTourDetail(mergedData);
            setSelectedDate(mergedData.startDate);
            setSelectedDepId(depData.id);
            // Cài priceConfig ban đầu cho departure được chọn
            setSelectedPriceConfig(mergedData.priceConfig);
            // Tab mặc định = departure ID hiện tại
            setActiveTab(String(depData.id));
            
            // Cài đặt gói mặc định
            setSelectedPackage(mergedData.packages[0].id);

            // Cập nhật danh sách các ngày khởi hành khác (Schedules)
            if (schedulesRes && schedulesRes.data) {
              setSchedules(schedulesRes.data.map((s: any) => {
                const dateStr = s.startDate || s.date || s.departureDate;
                const schedulePrice = s.priceConfig?.adultPrice 
                  ? (typeof s.priceConfig.adultPrice === 'object' ? Number(s.priceConfig.adultPrice.toString()) : Number(s.priceConfig.adultPrice))
                  : resolvedAdultPrice;
                return {
                  ...s,
                  date: dateStr ? new Date(dateStr) : null,
                  price: isNaN(schedulePrice) ? resolvedAdultPrice : schedulePrice,
                  status: (s.status === 'ACTIVE' || s.status === 'AVAILABLE' || s.status === 'OPEN') ? 'Còn chỗ' : 'Hết chỗ'
                };
              }).filter((s: any) => s.date !== null));
            }
          }
        }
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu từ Backend:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);


  // --- MOCK DATA BASED ON API ---
    // --- MOCK DATA BASED ON API ---
    // --- MOCK DATA BASED ON API ---
  // Hàm chọn một departure: cập nhật selectedDepId, selectedDate, priceConfig, và activeTab
  const selectDeparture = (dep: any) => {
    setSelectedDepId(dep.id);
    setSelectedDate(dep.date);
    setActiveTab(String(dep.id));
    // Cập nhật priceConfig theo departure được chọn
    if (dep.priceConfig) {
      const toNum = (v: any) => { const n = Number(v); return isNaN(n) ? 0 : n; };
      setSelectedPriceConfig({
        adultPrice: toNum(dep.priceConfig.adultPrice),
        child1014Price: toNum(dep.priceConfig.child1014Price),
        child49Price: toNum(dep.priceConfig.child49Price),
        babyPrice: toNum(dep.priceConfig.babyPrice),
      });
    } else {
      // Nếu departure không có priceConfig riêng, giữ giá ban đầu
      setSelectedPriceConfig(tourDetail?.priceConfig || null);
    }
  };

  // dateTabs: mỗi tab = 1 departure thực (dùng depId làm value để unique)
  const dateTabs = useMemo(() => {
    if (!schedules || schedules.length === 0) {
      return [];
    }
    return schedules
      .filter((s: any) => s.date instanceof Date && !isNaN(s.date.getTime()))
      .map((s: any) => {
        const dd = String(s.date.getDate()).padStart(2, '0');
        const mm = String(s.date.getMonth() + 1).padStart(2, '0');
        return {
          label: `${dd}/${mm}`,
          value: String(s.id), // Dùng ID làm key - unique
          depId: s.id,
          dep: s,
        };
      });
  }, [schedules]);



  // --- HELPERS ---
  const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN").format(price) + "đ";

  const formatFullDate = (dateInput: any) => {
    const d = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
    if (!d || isNaN(d.getTime())) return "Ngày chưa xác định";
    const days = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const dayName = days[d.getDay()];
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dayName}, ${dd}/${mm}/${yyyy}`;
  };

  const formatDateShort = (dateInput: any) => {
    const d = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
    if (!d || isNaN(d.getTime())) return "--/--";
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}`;
  };

  const getPackageExtraPrice = () => {
      if (!tourDetail || !tourDetail.packages) return 0;
      const pkg = tourDetail.packages.find((p: any) => p.id === selectedPackage);
      return pkg ? pkg.extraPrice : 0;
  };

  // Giá dùng selectedPriceConfig (departure đang chọn) > priceConfig gốc của tour
  const activePriceConfig = selectedPriceConfig || tourDetail?.priceConfig;
  const adultPrice = activePriceConfig ? (activePriceConfig.adultPrice || 0) + getPackageExtraPrice() : 0;
  const childPrice = activePriceConfig ? (activePriceConfig.child1014Price || 0) + getPackageExtraPrice() : 0;

  // --- FILTER & CALCULATE ---
  // Bảng lịch luôn hiện tất cả (filter đã bị bỏ để không ẩn lịch)
  const filteredSchedules = schedules;

  const displayedSchedules = filteredSchedules.slice(0, visibleRows);

  const totalAmount = numAdults * adultPrice + numChildren * childPrice;

  const totalDiscount = appliedVouchers.reduce((acc, v) => acc + v.value, 0);
  const finalTotal = Math.max(0, totalAmount - totalDiscount);
  const depositAmount = paymentRatio === 50 ? finalTotal * 0.5 : finalTotal;

  const applyVoucher = () => {
    if (!voucherCode) return;
    const code = voucherCode.toUpperCase();
    if (code === "GIAM50K") {
      if (appliedVouchers.some(v => v.code === "GIAM50K")) {
        alert("Mã này đã được áp dụng!");
        return;
      }
      setAppliedVouchers([...appliedVouchers, { code: "GIAM50K", value: 50000 }]);
      setVoucherCode("");
    } else if (code === "GIAM100K") {
      if (appliedVouchers.some(v => v.code === "GIAM100K")) {
        alert("Mã này đã được áp dụng!");
        return;
      }
      setAppliedVouchers([...appliedVouchers, { code: "GIAM100K", value: 100000 }]);
      setVoucherCode("");
    } else {
      alert("Mã giảm giá không hợp lệ!");
    }
  };

  const handleBooking = async () => {
    if (!tourDetail) return;
    
    if (!isCheckoutMode) {
      setIsCheckoutMode(true);
      window.scrollTo(0, 0);
      return;
    }

    if (!contactName || !contactPhone || !contactEmail) {
      showToast("Vui lòng điền đầy đủ thông tin liên hệ bắt buộc!", "error");
      return;
    }
    if (!/^[0-9]{9,11}$/.test(contactPhone.replace(/\s/g, ""))) {
      showToast("Số điện thoại không hợp lệ (9-11 chữ số)!", "error");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contactEmail)) {
      showToast("Email không đúng định dạng!", "error");
      return;
    }
    if (!agreedToTerms) {
      showToast("Vui lòng đồng ý điều khoản và chính sách bảo mật!", "error");
      return;
    }

    // --- BUILD PassengerDTO list (khớp BookingRequest.java) ---
    const passengerList: PassengerDTO[] = [];
    for (let i = 0; i < numAdults; i++) {
      passengerList.push({
        fullName: i === 0 ? contactName : `Người lớn ${i + 1}`,
        ageGroup: "ADULT",
        gender: i === 0 ? "MALE" : "MALE",
        dob: "1990-01-01",
      });
    }
    for (let i = 0; i < numChildren; i++) {
      passengerList.push({
        fullName: `Trẻ em ${i + 1}`,
        ageGroup: "CHILD",
        gender: "FEMALE",
        dob: "2015-06-01",
      });
    }
    for (let i = 0; i < numBabies; i++) {
      passengerList.push({
        fullName: `Em bé ${i + 1}`,
        ageGroup: "BABY",
        gender: "MALE",
        dob: "2024-01-01",
      });
    }

    const requestData: BookingRequest = {
      userId: 1, // TODO: lấy từ auth store khi có login
      departureId: Number(selectedDepId || id),
      note: `${paymentMethod === 'bank' ? '[Chuyển khoản]' : '[Tiền mặt]'} ${paymentRatio === 50 ? '[Đặt cọc 50%]' : '[Thanh toán 100%]'}${contactNotes ? ' - ' + contactNotes : ''}`,
      passengers: passengerList,
    };

    try {
      setBookingSubmitting(true);
      const res = await createBooking(requestData);

      if (res.status === 201 || res.status === 200) {
        // Lưu kết quả để hiện Modal thành công
        setBookingResult({
          bookingCode: res.data?.bookingCode,
          tourTitle: tourDetail?.title,
          startDate: selectedDate,
          totalAmount: finalTotal,
          depositAmount,
          paymentMethod,
          paymentRatio,
          numAdults,
          numChildren,
          numBabies,
          contactName,
          contactPhone,
          contactEmail,
        });
      } else {
        showToast("Lỗi: " + (res.message || "Không thể đặt tour, vui lòng thử lại!"), "error");
      }
    } catch (error) {
      console.error("Booking Error:", error);
      showToast("Đã xảy ra lỗi kết nối. Vui lòng thử lại!", "error");
    } finally {
      setBookingSubmitting(false);
    }
  };

  // --- TOAST NOTIFICATION ---
  const [toast, setToast] = useState<{msg: string; type: string} | null>(null);
  const showToast = (msg: string, type: "error" | "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getStatusBadge = (status: string) => {
    if (status === "Còn chỗ") return <span className="badge-status success">Còn chỗ</span>;
    if (status === "Chỉ còn chỗ") return <span className="badge-status warning">Chỉ còn chỗ</span>;
    return <span className="badge-status disabled">Hết chỗ</span>;
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "system-ui", background: "#FAFAFA"
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          border: "5px solid #F0E0D0", borderTopColor: "#FF6B00",
          animation: "spin 0.9s linear infinite"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ marginTop: 20, color: "#888", fontSize: 16 }}>Đang tải thông tin tour...</p>
      </div>
    );
  }

  // --- TRƯỜNG HỢP HIỂN THỊ CHI TIẾT ĐƠN HÀNG ĐÃ ĐẶT ---
  if (bookingData) {
    const { priceSnapshot, promotionSnapshot, passengers, status, totalAmount, paidAmount, bookingCode, createdAt } = bookingData;
    
    return (
      <div className="booking-container" style={{minHeight: "100vh"}}>
        <style>{`
            .status-confirmed { background: #E8F5E9; color: #2E7D32; }
            .status-pending { background: #FFF3E0; color: #E65100; }
            .status-cancelled { background: #FFEBEE; color: #D32F2F; }
        `}</style>
        <div className="container" style={{marginTop: "80px"}}>
          <div className="booking-card p-5">
            <div className="text-center mb-5">
              <div className="display-4 text-success mb-3">
                <i className="fas fa-check-circle"></i>
              </div>
              <h2 className="font-weight-bold">Chi tiết đơn hàng</h2>
              <p className="text-muted">Mã đặt chỗ: <span className="text-primary font-weight-bold">{bookingCode}</span></p>
              <div className={`badge p-2 px-3 mt-2 status-${status.toLowerCase()}`}>
                Trạng thái: {status}
              </div>
            </div>

            <div className="row">
              <div className="col-md-7">
                <h5 className="font-weight-bold border-bottom pb-2 mb-3">Thông tin chuyến đi</h5>
                <div className="mb-4">
                  <h4 className="text-primary mb-1">{priceSnapshot?.tourTitle}</h4>
                  <p className="mb-1"><strong>Khởi hành:</strong> {formatFullDate(priceSnapshot?.startDate)}</p>
                  <p className="mb-1"><strong>Điểm đón:</strong> {priceSnapshot?.pickupAddress || "Tại văn phòng"}</p>
                </div>

                <h5 className="font-weight-bold border-bottom pb-2 mb-3">Danh sách hành khách</h5>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Họ tên</th>
                      <th>Đối tượng</th>
                      <th>Giới tính</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passengers?.map((p: any, i: number) => (
                      <tr key={i}>
                        <td>{p.fullName}</td>
                        <td>{p.ageGroup === 'ADULT' ? 'Người lớn' : p.ageGroup === 'CHILD' ? 'Trẻ em' : 'Em bé'}</td>
                        <td>{p.gender === 'MALE' ? 'Nam' : 'Nữ'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="col-md-5">
                <div className="bg-light p-4 rounded">
                  <h5 className="font-weight-bold mb-4">Chi tiết thanh toán</h5>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tổng tiền:</span>
                    <span className="font-weight-bold">{formatPrice(totalAmount)}</span>
                  </div>
                  {promotionSnapshot && (
                    <div className="d-flex justify-content-between mb-2 text-success">
                      <span>Giảm giá ({promotionSnapshot.code}):</span>
                      <span>-{formatPrice(promotionSnapshot.discountValue || 0)}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between mb-2 pt-2 border-top">
                    <span>Đã thanh toán:</span>
                    <span className="text-primary font-weight-bold">{formatPrice(paidAmount || 0)}</span>
                  </div>
                  <div className="d-flex justify-content-between pt-2 border-top" style={{fontSize: "1.2rem"}}>
                    <span className="font-weight-bold">Còn lại:</span>
                    <span className="text-danger font-weight-bold">{formatPrice(Math.max(0, totalAmount - (paidAmount || 0)))}</span>
                  </div>
                  
                  <div className="mt-4 small text-muted">
                    Ngày đặt: {new Date(createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
                
                <div className="mt-4">
                    <button className="btn btn-outline-primary w-100" onClick={() => window.print()}>
                        <i className="fas fa-print mr-2"></i> In hóa đơn
                    </button>
                    <button className="btn btn-primary w-100 mt-2" style={{background: "#FF6B00", border: "none"}} onClick={() => router.push('/')}>
                        Quay lại trang chủ
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tourDetail) {
    return <div className="text-center py-5" style={{marginTop: "100px", fontFamily: "system-ui"}}>Không tìm thấy thông tin.</div>;
  }

  return (
    <>
      {/* ───── TOAST NOTIFICATION ───── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          background: toast.type === "error" ? "#D32F2F" : "#2E7D32",
          color: "white", padding: "14px 22px", borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.22)", maxWidth: 380,
          display: "flex", alignItems: "center", gap: 12,
          animation: "slideInRight 0.3s ease"
        }}>
          <i className={`fas ${toast.type === "error" ? "fa-exclamation-circle" : "fa-check-circle"}`} style={{fontSize: 20}} />
          <span style={{fontSize: 14, fontWeight: 500}}>{toast.msg}</span>
        </div>
      )}

      {/* ───── BOOKING SUCCESS MODAL ───── */}
      {bookingResult && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10000,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "white", borderRadius: 24, padding: "40px 36px",
            maxWidth: 520, width: "100%", textAlign: "center",
            boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
            animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)"
          }}>
            {/* Icon thành công */}
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg, #56ab2f, #a8e063)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(86,171,47,0.35)"
            }}>
              <i className="fas fa-check" style={{color: "white", fontSize: 36}} />
            </div>

            <h3 style={{fontWeight: 800, color: "#1a1a1a", marginBottom: 6, fontSize: "1.5rem"}}>
              Đặt tour thành công! 🎉
            </h3>
            <p style={{color: "#888", marginBottom: 24, fontSize: 14}}>
              Cảm ơn bạn đã tin tưởng lựa chọn HTravel
            </p>

            {/* Booking Code badge */}
            <div style={{
              background: "#FFF3E0", border: "2px dashed #FF6B00",
              borderRadius: 12, padding: "14px 20px", marginBottom: 24
            }}>
              <div style={{fontSize: 12, color: "#888", marginBottom: 4}}>Mã đặt chỗ của bạn</div>
              <div style={{fontSize: 28, fontWeight: 900, color: "#FF6B00", letterSpacing: 3}}>
                {bookingResult.bookingCode}
              </div>
            </div>

            {/* Tour info */}
            <div style={{
              background: "#F8F9FA", borderRadius: 12, padding: "16px 20px",
              marginBottom: 20, textAlign: "left"
            }}>
              <div style={{display: "flex", justifyContent: "space-between", marginBottom: 10}}>
                <span style={{color: "#666", fontSize: 13}}>🗺️ Tour</span>
                <span style={{fontWeight: 700, fontSize: 13, color: "#333", maxWidth: 240, textAlign: "right"}}>{bookingResult.tourTitle}</span>
              </div>
              <div style={{display: "flex", justifyContent: "space-between", marginBottom: 10}}>
                <span style={{color: "#666", fontSize: 13}}>📅 Ngày khởi hành</span>
                <span style={{fontWeight: 700, fontSize: 13, color: "#333"}}>{formatFullDate(bookingResult.startDate)}</span>
              </div>
              <div style={{display: "flex", justifyContent: "space-between", marginBottom: 10}}>
                <span style={{color: "#666", fontSize: 13}}>👥 Hành khách</span>
                <span style={{fontWeight: 700, fontSize: 13, color: "#333"}}>
                  {bookingResult.numAdults} NL{bookingResult.numChildren > 0 ? ` · ${bookingResult.numChildren} TE` : ""}{bookingResult.numBabies > 0 ? ` · ${bookingResult.numBabies} EB` : ""}
                </span>
              </div>
              <div style={{display: "flex", justifyContent: "space-between", marginBottom: 10}}>
                <span style={{color: "#666", fontSize: 13}}>📞 Liên hệ</span>
                <span style={{fontWeight: 700, fontSize: 13, color: "#333"}}>{bookingResult.contactName} · {bookingResult.contactPhone}</span>
              </div>
              <div style={{display: "flex", justifyContent: "space-between", borderTop: "1px solid #eee", paddingTop: 10}}>
                <span style={{color: "#666", fontSize: 13}}>💰 {bookingResult.paymentRatio === 50 ? "Tiền cọc (50%)" : "Tổng thanh toán"}</span>
                <span style={{fontWeight: 900, fontSize: 16, color: "#D32F2F"}}>{formatPrice(bookingResult.depositAmount)}</span>
              </div>
            </div>

            {/* Payment info */}
            <div style={{
              background: bookingResult.paymentMethod === "bank" ? "#E3F2FD" : "#E8F5E9",
              borderRadius: 10, padding: "10px 16px", marginBottom: 24,
              fontSize: 13, color: bookingResult.paymentMethod === "bank" ? "#1565C0" : "#2E7D32",
              fontWeight: 500
            }}>
              <i className={`fas ${bookingResult.paymentMethod === "bank" ? "fa-university" : "fa-money-bill-wave"} mr-2`} />
              {bookingResult.paymentMethod === "bank"
                ? "Vui lòng chuyển khoản trong vòng 10 phút để giữ chỗ"
                : "Thanh toán tiền mặt tại văn phòng HTravel"}
            </div>

            {/* Action buttons */}
            <div style={{display: "flex", gap: 12}}>
              <button
                onClick={() => router.push(`/booking/${bookingResult.bookingCode}`)}
                style={{
                  flex: 1, padding: "13px 20px", borderRadius: 12,
                  background: "linear-gradient(135deg, #FF6B00, #FF9A00)",
                  color: "white", fontWeight: 700, border: "none",
                  cursor: "pointer", fontSize: 14,
                  boxShadow: "0 4px 16px rgba(255,107,0,0.35)"
                }}
              >
                <i className="fas fa-receipt mr-2" />
                Xem chi tiết đơn
              </button>
              <button
                onClick={() => router.push("/")}
                style={{
                  flex: 1, padding: "13px 20px", borderRadius: 12,
                  background: "white", color: "#555", fontWeight: 600,
                  border: "1.5px solid #E0E0E0", cursor: "pointer", fontSize: 14
                }}
              >
                <i className="fas fa-home mr-2" />
                Về trang chủ
              </button>
            </div>
          </div>

          <style>{`
            @keyframes popIn {
              from { transform: scale(0.7); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
            @keyframes slideInRight {
              from { transform: translateX(120%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
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
          display: flex; gap: 8px; flex-wrap: wrap; padding-bottom: 8px;
        }
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

        /* Checkout Styles */
        .checkout-section-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 20px;
          color: #333;
          border-left: 4px solid #FF6B00;
          padding-left: 12px;
        }
        .form-group label {
          font-weight: 600;
          font-size: 0.9rem;
          color: #555;
          margin-bottom: 8px;
        }
        .form-control {
          border-radius: 8px;
          border: 1px solid #DDD;
          padding: 12px;
        }
        .form-control:focus {
          border-color: #FF6B00;
          box-shadow: 0 0 0 0.2rem rgba(255, 107, 0, 0.25);
        }
        .payment-option {
          border: 1px solid #DDD;
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .payment-option.active {
          border-color: #FF6B00;
          background-color: #FFF9F5;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 0.95rem;
        }
        .summary-total {
          border-top: 1px solid #EEE;
          padding-top: 12px;
          margin-top: 12px;
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          font-size: 1.2rem;
          color: #D32F2F;
        }
        .voucher-input-group {
          display: flex;
          gap: 10px;
        }
        .bank-info {
          background: #F8F9FA;
          padding: 15px;
          border-radius: 8px;
          margin-top: 10px;
          font-size: 0.9rem;
        }
        .checkout-sidebar {
          position: sticky;
          top: 100px;
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

          {isCheckoutMode ?
            <div className="row">
              <div className="col-lg-8">
                <div className="booking-card p-4 mb-4">
                  <h3 className="checkout-section-title">1. Thông tin tour</h3>
                  <div className="d-flex align-items-center mb-4">
                    <img src={tourDetail.image} alt="" style={{width: 120, height: 85, objectFit: "cover", borderRadius: 8, marginRight: 20}} />
                    <div>
                      <h5 className="font-weight-bold mb-1">{tourDetail.title}</h5>
                      <div className="text-muted small mb-1">
                        <i className="far fa-calendar-alt mr-2"></i>
                        Ngày đi: {formatFullDate(selectedDate || tourDetail.startDate)}
                      </div>
                      <div className="text-muted small">
                        <i className="fas fa-box mr-2"></i>
                        Gói: {tourDetail.packages?.find((p: any) => p.id === selectedPackage)?.name}
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Điểm đón khách *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Nhập điểm đón (vd: Sân bay Tân Sơn Nhất, Văn phòng công ty...)" 
                      value={pickupPoint} 
                      onChange={(e) => setPickupPoint(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="booking-card p-4 mb-4">
                  <h3 className="checkout-section-title">2. Thông tin liên hệ</h3>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="form-group">
                        <label>Họ và tên *</label>
                        <input type="text" className="form-control" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Nguyễn Văn A" />
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="form-group">
                        <label>Số điện thoại *</label>
                        <input type="text" className="form-control" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="090xxxxxxx" />
                      </div>
                    </div>
                    <div className="col-md-12 mb-3">
                      <div className="form-group">
                        <label>Email *</label>
                        <input type="email" className="form-control" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="email@example.com" />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="form-group">
                        <label>Ghi chú</label>
                        <textarea 
                          className="form-control" 
                          rows={3} 
                          value={contactNotes} 
                          onChange={(e) => setContactNotes(e.target.value)}
                          placeholder="Yêu cầu đặc biệt về ăn uống, chỗ ngồi..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="booking-card p-4 mb-4">
                  <h3 className="checkout-section-title">3. Tỷ lệ thanh toán</h3>
                  <div className="row">
                    <div className="col-md-6 mb-3 mb-md-0">
                      <div className={`payment-option h-100 ${paymentRatio === 100 ? 'active' : ''}`} onClick={() => setPaymentRatio(100)}>
                        <div className="font-weight-bold mb-1">Thanh toán 100%</div>
                        <div className="small text-muted">Thanh toán toàn bộ số tiền tour để nhận xác nhận tức thì.</div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className={`payment-option h-100 ${paymentRatio === 50 ? 'active' : ''}`} onClick={() => setPaymentRatio(50)}>
                        <div className="font-weight-bold mb-1">Thanh toán 50%</div>
                        <div className="small text-muted">Đặt cọc trước 50%, số tiền còn lại sẽ thanh toán sau.</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="booking-card p-4 mb-4">
                  <h3 className="checkout-section-title">4. Mã giảm giá / Voucher</h3>
                  <div className="voucher-input-group mb-3">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Nhập mã giảm giá (GIAM50K, GIAM100K...)" 
                      value={voucherCode} 
                      onChange={(e) => setVoucherCode(e.target.value)} 
                    />
                    <button className="btn btn-primary" style={{borderRadius: 8, padding: "0 24px", background: "#FF6B00", border: "none"}} onClick={applyVoucher}>Áp dụng</button>
                  </div>
                  {appliedVouchers.length > 0 && (
                    <div className="applied-vouchers d-flex flex-wrap" style={{gap: "8px"}}>
                      {appliedVouchers.map((v, i) => (
                        <div key={i} className="badge badge-success p-2 d-flex align-items-center" style={{fontSize: "0.9rem", background: "#E8F5E9", color: "#2E7D32", borderRadius: "6px"}}>
                          {v.code} (-{formatPrice(v.value)})
                          <i className="fas fa-times ml-2 cursor-pointer" onClick={() => setAppliedVouchers(appliedVouchers.filter((_, idx) => idx !== i))}></i>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-muted small mt-2">
                    * Voucher có thể cộng dồn (nếu còn hiệu lực). Không vượt quá tổng tiền tạm tính.
                  </div>
                </div>

                <div className="booking-card p-4 mb-4">
                  <h3 className="checkout-section-title">5. Phương thức thanh toán</h3>
                  <div 
                    className={`payment-option ${paymentMethod === 'bank' ? 'active' : ''}`} 
                    onClick={() => setPaymentMethod('bank')}
                  >
                    <div className="d-flex align-items-center">
                      <i className="fas fa-university mr-3 text-primary" style={{fontSize: "1.2rem"}}></i>
                      <div className="font-weight-bold">Chuyển khoản ngân hàng</div>
                    </div>
                    {paymentMethod === 'bank' && (
                      <div className="bank-info mt-3" style={{border: "1px dashed #FF6B00"}}>
                        <div className="mb-1">Ngân hàng: <strong>Vietcombank</strong></div>
                        <div className="mb-1">Chủ tài khoản: <strong>CÔNG TY TNHH TOURISM</strong></div>
                        <div className="mb-1">Số tài khoản: <strong>012345678910</strong></div>
                        <div>Chi nhánh: <strong>Bến Thành</strong></div>
                        <div className="mt-2 text-warning font-weight-bold small">Giữ chỗ tức thì, xác nhận sau khi nhận được chuyển khoản.</div>
                      </div>
                    )}
                  </div>
                  <div 
                    className={`payment-option ${paymentMethod === 'cash' ? 'active' : ''}`} 
                    onClick={() => setPaymentMethod('cash')}
                  >
                    <div className="d-flex align-items-center">
                      <i className="fas fa-money-bill-wave mr-3 text-success" style={{fontSize: "1.2rem"}}></i>
                      <div className="font-weight-bold">Thanh toán tiền mặt tại văn phòng</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="booking-card p-4 checkout-sidebar">
                  <h5 className="font-weight-bold mb-4">Chi tiết thanh toán</h5>
                  <div className="summary-item">
                    <span className="text-muted">Người lớn ({numAdults})</span>
                    <span className="font-weight-bold">{formatPrice(numAdults * adultPrice)}</span>
                  </div>
                  {numChildren > 0 && (
                    <div className="summary-item">
                      <span className="text-muted">Trẻ em ({numChildren})</span>
                      <span className="font-weight-bold">{formatPrice(numChildren * childPrice)}</span>
                    </div>
                  )}
                  {numBabies > 0 && (
                    <div className="summary-item">
                      <span className="text-muted">Em bé ({numBabies})</span>
                      <span className="font-weight-bold">0đ</span>
                    </div>
                  )}
                  <div className="summary-item pt-2">
                    <span>Tạm tính</span>
                    <span className="font-weight-bold">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="summary-item text-success">
                    <span>Giảm giá</span>
                    <span>-{formatPrice(totalDiscount)}</span>
                  </div>
                  <div className="summary-total">
                    <span>Tổng cộng</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                  
                  <div className="mt-4 pt-3 border-top">
                    <div className="summary-item">
                      <span className="font-weight-bold">Hình thức</span>
                      <span className="badge badge-info" style={{background: "#E1F5FE", color: "#01579B"}}>
                        {paymentRatio === 100 ? "Thanh toán 100%" : "Thanh toán 50%"}
                      </span>
                    </div>
                    {paymentRatio === 50 && (
                      <div className="summary-item">
                        <span className="font-weight-bold">Số tiền cọc</span>
                        <span className="text-primary font-weight-bold">{formatPrice(depositAmount)}</span>
                      </div>
                    )}
                    <div className="summary-total" style={{fontSize: "1.5rem", borderTop: "none", marginTop: 0}}>
                      <span>Thanh toán</span>
                      <span>{formatPrice(depositAmount)}</span>
                    </div>
                  </div>

                  <div className="mt-4 mb-4">
                    <label className="d-flex align-items-start cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="mt-1 mr-2" 
                        checked={agreedToTerms} 
                        onChange={(e) => setAgreedToTerms(e.target.checked)} 
                      />
                      <span className="small text-muted">Tôi đồng ý với <strong>Điều khoản và Chính sách bảo mật</strong> của công ty.</span>
                    </label>
                  </div>

                  <button
                    className="cta-btn"
                    onClick={handleBooking}
                    disabled={bookingSubmitting}
                    style={{
                      opacity: bookingSubmitting ? 0.82 : 1,
                      cursor: bookingSubmitting ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10
                    }}
                  >
                    {bookingSubmitting ? (
                      <>
                        <span style={{
                          width: 18, height: 18, borderRadius: "50%",
                          border: "2.5px solid rgba(255,255,255,0.4)",
                          borderTopColor: "white",
                          animation: "spin 0.8s linear infinite",
                          display: "inline-block", flexShrink: 0
                        }} />
                        Đang xử lý...
                      </>
                    ) : (
                      <>Xác nhận thanh toán {formatPrice(depositAmount)}</>
                    )}
                  </button>
                  
                  <div className="text-center mt-3">
                    <button className="btn btn-link text-muted small" onClick={() => setIsCheckoutMode(false)}>
                      <i className="fas fa-chevron-left mr-2"></i> Quay lại chỉnh sửa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          :
            <div className="row">
              
              {/* LỊCH KHỞI HÀNH & HÌNH ẢNH - MAIN CONTENT */}
              <div className="col-lg-7 mb-4">
              
              {/* THƯ VIỆN HÌNH ẢNH */}
              <div className="mb-4">
                <div className="gallery-grid">
                  <div className="gallery-main">
                    <img src={tourDetail.images?.[0]?.imageUrl || tourDetail.image || "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop"} alt={tourDetail.images?.[0]?.altText || tourDetail.title} className="gallery-img" />
                  </div>
                  <div className="gallery-sub">
                    <img src={tourDetail.images?.[1]?.imageUrl || "https://images.unsplash.com/photo-1555502575-5cb391e63a32?q=80&w=800&auto=format&fit=crop"} alt={tourDetail.images?.[1]?.altText || "Cảnh quan 1"} className="gallery-img" />
                  </div>
                  <div className="gallery-sub">
                    <img src={tourDetail.images?.[2]?.imageUrl || "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800&auto=format&fit=crop"} alt={tourDetail.images?.[2]?.altText || "Cảnh quan 2"} className="gallery-img" />
                  </div>
                  <div className="gallery-sub">
                    <img src={tourDetail.images?.[3]?.imageUrl || "https://images.unsplash.com/photo-1506527632616-65e3170757af?q=80&w=800&auto=format&fit=crop"} alt={tourDetail.images?.[3]?.altText || "Cảnh quan 3"} className="gallery-img" />
                  </div>
                  <div className="gallery-sub">
                    <img src={tourDetail.images?.[4]?.imageUrl || "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=800&auto=format&fit=crop"} alt={tourDetail.images?.[4]?.altText || "Ẩm thực/Hoạt động"} className="gallery-img" />
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
                      {Array.isArray(tourDetail.inclusions) ? tourDetail.inclusions.map((inc: string, idx: number) => (
                        <li key={idx}>{inc}</li>
                      )) : <li>{tourDetail.inclusions || "Đang cập nhật..."}</li>}
                    </ul>
                  )}
                  {activePolicyTab === "exclusions" && (
                    <ul className="list-unstyled list-cross">
                      {Array.isArray(tourDetail.exclusions) ? tourDetail.exclusions.map((exc: string, idx: number) => (
                        <li key={idx}>{exc}</li>
                      )) : <li>{tourDetail.exclusions || "Đang cập nhật..."}</li>}
                    </ul>
                  )}
                  {activePolicyTab === "children" && (
                    <div className="text-muted">
                      {tourDetail.policies?.childPolicy || tourDetail.childPolicy || "Theo quy định của khách sạn và hãng hàng không."}
                    </div>
                  )}
                  {activePolicyTab === "cancel" && (
                    <div className="text-muted">
                      {tourDetail.policies?.cancellationPolicy || tourDetail.cancellationPolicy || "Hủy trước 7 ngày không mất phí."}
                    </div>
                  )}
                  {activePolicyTab === "notes" && (
                    <div className="text-muted">
                      {tourDetail.policies?.notes || tourDetail.notes || "Vui lòng mang theo giấy tờ tùy thân."}
                    </div>
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
                        {displayedSchedules.map((item) => {
                          const isSelected = String(item.id) === String(selectedDepId);
                          return (
                            <tr key={item.id} className="schedule-row" style={isSelected ? {background: "#FFF8F0", borderLeft: "3px solid #FF6B00"} : {}}>
                              <td className="font-weight-bold">
                                {formatFullDate(item.date)}
                                {isSelected && <span style={{marginLeft: 8, color: "#FF6B00", fontSize: 12, fontWeight: 700}}>● Đang chọn</span>}
                              </td>
                              <td>
                                {getStatusBadge(item.status)}
                                {item.maxSlots != null && item.bookedSlots != null && (
                                  <div style={{fontSize: '0.8rem', color: '#666', marginTop: '4px'}}>
                                    Còn {Math.max(0, item.maxSlots - item.bookedSlots)} chỗ
                                  </div>
                                )}
                              </td>
                              <td className="font-weight-bold" style={{color: "#FF6B00"}}>{formatPrice(item.price || adultPrice)}</td>
                              <td className="text-right">
                                <button 
                                  className="select-btn" 
                                  disabled={item.status === "Hết chỗ"}
                                  style={isSelected ? {background: "#FF6B00", color: "white", borderColor: "#FF6B00"} : {}}
                                  onClick={() => {
                                    selectDeparture(item);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                >
                                  {isSelected ? "✓ Đã chọn" : "Chọn"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
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
                          NL: {formatPrice((activePriceConfig?.adultPrice || 0) + pkg.extraPrice)} - TE: {formatPrice((activePriceConfig?.child1014Price || 0) + pkg.extraPrice)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Ngày khởi hành */}
                <div className="mb-4">
                  <h5 className="font-weight-bold mb-3" style={{fontSize: "1rem"}}>2. Ngày khởi hành</h5>
                  {/* Hiện ngày đang chọn */}
                  {selectedDate && (
                    <div style={{fontSize: "0.85rem", color: "#FF6B00", fontWeight: 600, marginBottom: 10}}>
                      <i className="far fa-calendar-check mr-1"></i>
                      {formatFullDate(selectedDate)}
                    </div>
                  )}
                  {dateTabs.length > 0 ? (
                    <div className="date-tabs-scroll">
                      {dateTabs.map(tab => (
                        <div 
                          key={tab.value}
                          className={`date-tab ${activeTab === tab.value ? 'active' : ''}`}
                          onClick={() => {
                            selectDeparture(tab.dep);
                          }}
                        >
                          {tab.label}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted small">Đang tải lịch khởi hành...</div>
                  )}
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
                  <button
                    className="cta-btn"
                    onClick={handleBooking}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
                  >
                    <i className="fas fa-bolt" />
                    ĐẶT TOUR NGAY
                  </button>
                </div>

              </div>
            </div>
          </div>
          }
        </div>
      </div>
    </>
  );
}
