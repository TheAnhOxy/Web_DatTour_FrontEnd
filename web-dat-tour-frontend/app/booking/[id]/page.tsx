/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo, useEffect, useReducer, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getDepartureDetails, getTourDetails, validatePromotionCode } from "../../../api/coreApi_new";
import {
  createBooking, getBookingByCode,
  type BookingRequest, type PassengerDTO, type PassengerGender,
} from "../../../api/bookingApi";
import { useAuthStore } from "../../../store/authStore";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toNum = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const n = typeof val === "object" ? Number(val.toString()) : Number(val);
  return isNaN(n) ? 0 : n;
};

const formatPrice = (p: number) => new Intl.NumberFormat("vi-VN").format(p) + "đ";

const formatFullDate = (dateInput: any) => {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (!d || isNaN(d.getTime())) return "Ngày chưa xác định";
  const days = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${days[d.getDay()]}, ${dd}/${mm}/${d.getFullYear()}`;
};

const isValidIsoDate = (v: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(new Date(v).getTime());

const resolveChildAgeGroup = (dob: string, fallback: PassengerDTO["ageGroup"] = "CHILD_10_14"): PassengerDTO["ageGroup"] => {
  if (!isValidIsoDate(dob)) return fallback;
  const age = new Date().getFullYear() - new Date(dob).getFullYear();
  return age >= 10 ? "CHILD_10_14" : "CHILD_4_9";
};

const makePassenger = (ageGroup: PassengerDTO["ageGroup"]): PassengerDTO => ({
  fullName: "", ageGroup, dob: "", gender: "" as PassengerGender,
  idCardNumber: ageGroup === "BABY" ? undefined : "",
});

const syncList = (cur: PassengerDTO[], len: number, group: PassengerDTO["ageGroup"]) =>
  Array.from({ length: len }, (_, i) => cur[i] ?? makePassenger(group));

// ─── Inner Component (uses useSearchParams) ───────────────────────────────────
function BookingPageInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id as string;

  // ── URL query params (passed from tours/[id] page) ──
  const initAdults       = Math.max(1, Number(searchParams.get("adults")       || 2));
  const initChildren1014 = Math.max(0, Number(searchParams.get("children1014") || 0));
  const initChildren49   = Math.max(0, Number(searchParams.get("children49")   || 0));
  const initBabies       = Math.max(0, Number(searchParams.get("babies")       || 0));
  const initPackage      = searchParams.get("package") || "";

  // ── State ──
  const [departure, setDeparture]           = useState<any>(null);
  const [tourInfo, setTourInfo]             = useState<any>(null);
  const [bookingData, setBookingData]       = useState<any>(null);
  const [loading, setLoading]               = useState(true);
  const [priceConfig, setPriceConfig]       = useState<any>(null);

  const [numAdults,       setNumAdults]       = useState(initAdults);
  const [numChildren1014, setNumChildren1014] = useState(initChildren1014);
  const [numChildren49,   setNumChildren49]   = useState(initChildren49);
  const [numBabies,       setNumBabies]       = useState(initBabies);
  const [adultPassengers, setAdultPassengers] = useState<PassengerDTO[]>(() => syncList([], initAdults, "ADULT"));
  const [child1014Passengers, setChild1014Passengers] = useState<PassengerDTO[]>(() => syncList([], initChildren1014, "CHILD_10_14"));
  const [child49Passengers,   setChild49Passengers]   = useState<PassengerDTO[]>(() => syncList([], initChildren49, "CHILD_4_9"));
  const [babyPassengers,  setBabyPassengers]  = useState<PassengerDTO[]>(() => syncList([], initBabies, "BABY"));

  type ContactForm = { name: string; phone: string; email: string; address: string };
  const [contact, patchContact] = useReducer(
    (p: ContactForm, patch: Partial<ContactForm>) => ({ ...p, ...patch }),
    { name: "", phone: "", email: "", address: "" },
  );

  const [contactNotes, setContactNotes]   = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [paymentRatio, setPaymentRatio]   = useState(100);
  const [voucherCode, setVoucherCode]     = useState("");
  const [appliedVouchers, setAppliedVouchers] = useState<any[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [bookingResult, setBookingResult]         = useState<any>(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [holdRemainingMs, setHoldRemainingMs]     = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const authUser      = useAuthStore((s) => s.user);
  const authHydrated  = useAuthStore((s) => s._hasHydrated);
  const fetchProfile  = useAuthStore((s) => s.fetchProfile);

  const showToast = (msg: string, type: "error" | "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Auto-fill contact from user profile ──
  useEffect(() => {
    if (!authHydrated || !authUser?.userId) return;
    if (authUser.fullName || authUser.phone) {
      patchContact({
        name:    contact.name    || authUser.fullName || "",
        phone:   contact.phone   || authUser.phone    || "",
        email:   contact.email   || authUser.email    || "",
        address: contact.address || authUser.address  || "",
      });
    } else {
      fetchProfile();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHydrated, authUser?.userId]);

  useEffect(() => {
    if (!authUser?.fullName && !authUser?.phone) return;
    patchContact({
      name:    contact.name    || authUser.fullName || "",
      phone:   contact.phone   || authUser.phone    || "",
      email:   contact.email   || authUser.email    || "",
      address: contact.address || authUser.address  || "",
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.fullName, authUser?.phone]);

  // ── Countdown for hold ──
  useEffect(() => {
    if (!bookingResult?.expiresAt) return;
    const update = () => setHoldRemainingMs(Math.max(0, bookingResult.expiresAt - Date.now()));
    update();
    const t = window.setInterval(update, 1000);
    return () => window.clearInterval(t);
  }, [bookingResult?.expiresAt]);

  // ── Fetch data ──
  useEffect(() => {
    if (!id) return;
    const isBookingCode = id.startsWith("BK-") || isNaN(Number(id));

    const fetchData = async () => {
      setLoading(true);
      try {
        if (isBookingCode) {
          const res = await getBookingByCode(id);
          if (res.status === 200 && res.data) setBookingData(res.data);
        } else {
          const depRes = await getDepartureDetails(id);
          if (depRes?.data) {
            const dep = depRes.data;
            const tourRes = await getTourDetails(dep.tourId);
            setDeparture(dep);
            setTourInfo(tourRes?.data || null);

             const pc = dep.priceConfig || {};
             const basePrice = toNum(tourRes?.data?.basePrice) || 0;
             setPriceConfig({
               adultPrice:      toNum(pc.adultPrice)     || toNum(pc.adult_price)       || basePrice,
               child1014Price:  toNum(pc.child1014Price) || toNum(pc.child_10_14_price) || Math.round(basePrice * 0.75),
               child49Price:    toNum(pc.child49Price)   || toNum(pc.child_4_9_price)   || Math.round(basePrice * 0.5),
               babyPrice:       toNum(pc.babyPrice)      || toNum(pc.baby_price)        || 0,
             });
           }
         }
       } catch (err) {
         console.error("Lỗi fetch booking:", err);
       } finally {
         setLoading(false);
       }
     };
     fetchData();
   }, [id]);
 
   // ── Prices ──
   const selectedPackageId = initPackage || "standard";
   const tourPackages = tourInfo?.packages || [
     { id: "standard", name: "Gói Tiêu Chuẩn", extraPrice: 0,
       description: "Bao gồm đầy đủ các dịch vụ cơ bản theo chương trình tour." },
     { id: "vip", name: "Gói Cao Cấp (VIP)", extraPrice: 500000,
       description: "Bao gồm xe đưa đón VIP, khách sạn 5 sao và buffet ẩm thực cao cấp." }
   ];
   const selectedPackage = tourPackages.find((p: any) => p.id === selectedPackageId);
   const packageExtraPrice = selectedPackage ? toNum(selectedPackage.extraPrice) : 0;
 
   const adultPrice = (priceConfig?.adultPrice || 0) + packageExtraPrice;
   const child1014Price = (priceConfig?.child1014Price || 0) + packageExtraPrice;
   const child49Price = (priceConfig?.child49Price || 0) + packageExtraPrice;
   const babyPrice = priceConfig?.babyPrice || 0;
 
   const totalAmount = useMemo(() => {
     let sum = numAdults * adultPrice;
     child1014Passengers.forEach((p) => {
       const resolvedGroup = p.dob ? resolveChildAgeGroup(p.dob, "CHILD_10_14") : "CHILD_10_14";
       sum += resolvedGroup === "CHILD_4_9" ? child49Price : child1014Price;
     });
     child49Passengers.forEach((p) => {
       const resolvedGroup = p.dob ? resolveChildAgeGroup(p.dob, "CHILD_4_9") : "CHILD_4_9";
       sum += resolvedGroup === "CHILD_4_9" ? child49Price : child1014Price;
     });
     sum += numBabies * babyPrice;
     return sum;
   }, [numAdults, adultPrice, child1014Passengers, child49Passengers, child1014Price, child49Price, numBabies, babyPrice]);
 
   const totalDiscount = appliedVouchers.reduce((a, v) => a + v.value, 0);
   const finalTotal = Math.max(0, totalAmount - totalDiscount);
   const depositAmount = paymentRatio === 50 ? finalTotal * 0.5 : finalTotal;
 
   // ── Passenger helpers ──
   const changeCount = (group: "adult" | "child1014" | "child49" | "baby", delta: number) => {
     if (group === "adult") {
       setNumAdults((n) => {
         const next = Math.max(1, n + delta);
         setAdultPassengers((cur) => syncList(cur, next, "ADULT"));
         return next;
       });
     } else if (group === "child1014") {
       setNumChildren1014((n) => {
         const next = Math.max(0, n + delta);
         setChild1014Passengers((cur) => syncList(cur, next, "CHILD_10_14"));
         return next;
       });
     } else if (group === "child49") {
       setNumChildren49((n) => {
         const next = Math.max(0, n + delta);
         setChild49Passengers((cur) => syncList(cur, next, "CHILD_4_9"));
         return next;
       });
     } else {
       setNumBabies((n) => {
         const next = Math.max(0, n + delta);
         setBabyPassengers((cur) => syncList(cur, next, "BABY"));
         return next;
       });
     }
   };
 
   const updatePassenger = (group: "adult" | "child1014" | "child49" | "baby", idx: number, field: keyof PassengerDTO, value: string) => {
      const setter = group === "adult"
        ? setAdultPassengers
        : group === "child1014"
        ? setChild1014Passengers
        : group === "child49"
        ? setChild49Passengers
        : setBabyPassengers;
      setter((cur) => {
        const next = [...cur];
        next[idx] = { ...next[idx], [field]: value } as PassengerDTO;
        return next;
      });

    };

    const hasIncomplete = () => {
      const missingPassenger = (p: PassengerDTO, requireIdCard: boolean) => {
        const baseMissing = !p?.fullName || !p?.dob || !p?.gender;
        const idMissing = requireIdCard && !p?.idCardNumber;
        return baseMissing || idMissing;
      };

      const adultsInc = adultPassengers.some((p) => missingPassenger(p, true));
      const child1014Inc = child1014Passengers.some((p) => missingPassenger(p, true));
      const child49Inc = child49Passengers.some((p) => missingPassenger(p, true));
      const babyInc = babyPassengers.some((p) => missingPassenger(p, false));

      const contactInc = !contact.name || !contact.phone || !contact.email;

      return adultsInc || child1014Inc || child49Inc || babyInc || contactInc;
    };
 
   // ── Apply voucher ──
   const applyVoucher = async () => {
     const rawCode = voucherCode.trim();
     if (!rawCode) return;
     const code = rawCode.toUpperCase();

     if (appliedVouchers.length > 0 && appliedVouchers[0]?.code === code) {
       showToast("Mã này đã được áp dụng!", "error");
       return;
     }

     try {
       const res = await validatePromotionCode(code);
       const data = (res as any)?.data;

       if (!data || data.isValid !== true) {
         showToast(data?.message || "Mã giảm giá không hợp lệ!", "error");
         return;
       }

       const discountPercent = toNum(data.discountPercent);
       if (discountPercent <= 0) {
         showToast("Mã giảm giá không hợp lệ!", "error");
         return;
       }

       const maxDiscount = toNum(data.maxDiscount);
       let discountValue = (totalAmount * discountPercent) / 100;
       if (maxDiscount > 0) discountValue = Math.min(discountValue, maxDiscount);
       if (discountValue <= 0) {
         showToast("Mã giảm giá không hợp lệ!", "error");
         return;
       }

       setAppliedVouchers([{ code, value: Math.round(discountValue) }]);
       setVoucherCode("");
       showToast("Áp dụng mã giảm giá thành công!", "success");
     } catch {
       showToast("Không thể kiểm tra mã giảm giá. Vui lòng thử lại!", "error");
     }
   };
 
   // ── Handle Booking ──
   const handleBooking = async () => {
     if (!contact.name || !contact.phone || !contact.email) {
       showToast("Vui lòng điền đầy đủ thông tin liên hệ (Họ tên, Số điện thoại, Email).", "error");
       return;
     }
     if (hasIncomplete()) { showToast("Chưa đủ thông tin hành khách hoặc liên hệ. Vui lòng kiểm tra lại.", "error"); return; }

     const normalizedAdults = adultPassengers.map((p) => ({
       ...p,
       ageGroup: "ADULT" as const,
     }));
     const normalizedChildren1014 = child1014Passengers.map((p) => ({
       ...p,
       ageGroup: "CHILD_10_14" as const,
     }));
     const normalizedChildren49 = child49Passengers.map((p) => ({
       ...p,
       ageGroup: "CHILD_4_9" as const,
     }));
     const normalizedBabies = babyPassengers.map((p) => ({
       ...p,
       ageGroup: "BABY" as const,
       idCardNumber: p.idCardNumber || undefined,
     }));

     const passengerList: PassengerDTO[] = [
       ...normalizedAdults,
       ...normalizedChildren1014,
       ...normalizedChildren49,
       ...normalizedBabies,
     ];

    const requestData: BookingRequest = {
      userId: authUser?.userId,
      departureId: Number(id),
      passengers: passengerList,
      note: [contactNotes, contact.address ? `Địa chỉ: ${contact.address}` : ""].filter(Boolean).join(" | ") || undefined,
      promotionCode: appliedVouchers[0]?.code,
      contactName: contact.name || undefined,
      contactEmail: contact.email || undefined,
      contactPhone: contact.phone || undefined,
    };

    try {
      setBookingSubmitting(true);
      const res = await createBooking(requestData);
      if (res.status === 201 || res.status === 200) {
        const br = (res as any).data ?? res;
        const createdAt = br.createdAt ? new Date(br.createdAt).getTime() : 0;
        setBookingResult({
          bookingId: br.bookingId,
          bookingCode: br.bookingCode,
          status: br.status,
          message: br.message,
          destination: br.destination,
          createdAt: br.createdAt,
          expiresAt: createdAt + 10 * 60 * 1000,
          tourTitle: departure?.tourTitle || tourInfo?.title,
          startDate: departure?.startDate,
          subtotalAmount: totalAmount,
          totalDiscount,
          totalAmount: finalTotal,
          depositAmount,
          paymentMethod,
          paymentRatio,
          numAdults, numChildren1014, numChildren49, numBabies,
          contactName: contact.name,
          contactPhone: contact.phone,
          contactEmail: contact.email,
          contactAddress: contact.address,
          cityName: br.cityName,
          pickupName: br.pickupName,
          pickupAddress: br.pickupAddress,
          appliedVouchers,
          passengers: br.passengers || passengerList,
        });
        setHoldRemainingMs(10 * 60 * 1000);
      } else {
        showToast("Lỗi: " + (res.message || "Không thể đặt tour, vui lòng thử lại!"), "error");
      }
    } catch {
      showToast("Đã xảy ra lỗi kết nối. Vui lòng thử lại!", "error");
    } finally {
      setBookingSubmitting(false);
    }
  };

  const continueToCheckout = () => {
    if (bookingResult?.expiresAt && bookingResult.expiresAt <= Date.now()) {
      showToast("Phiên giữ chỗ 10 phút đã hết. Vui lòng đặt lại.", "error"); return;
    }
    try { window.sessionStorage.setItem("htour.checkout", JSON.stringify(bookingResult)); } catch {}
    const code = bookingResult?.bookingCode ?? "";
    router.push(`/booking/checkout${code ? `?code=${encodeURIComponent(code)}` : ""}`);
  };

  // ─── LOADING ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", background: "#FAFAFA" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", border: "5px solid #F0E0D0", borderTopColor: "#FF6B00", animation: "spin 0.9s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ marginTop: 20, color: "#888", fontSize: 16 }}>Đang tải thông tin...</p>
      </div>
    );
  }

  // ─── RECEIPT VIEW (BK-XXXX) ─────────────────────────────────────────────────
  if (bookingData) {
    const { priceSnapshot, promotionSnapshot, passengers, status, totalAmount: bTotal, paidAmount, bookingCode, createdAt } = bookingData;
    return (
      <div style={{ fontFamily: "system-ui", minHeight: "100vh", background: "#F7F8FA", paddingTop: 80, paddingBottom: 60 }}>
        <style>{`
          .bk-receipt { background: white; border-radius: 20px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); padding: 40px; max-width: 900px; margin: 0 auto; }
          .bk-status-confirmed { background: #E8F5E9; color: #2E7D32; }
          .bk-status-pending   { background: #FFF3E0; color: #E65100; }
          .bk-status-cancelled { background: #FFEBEE; color: #D32F2F; }
        `}</style>
        <div className="container">
          <div className="bk-receipt">
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#56ab2f,#a8e063)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <i className="fas fa-check" style={{ color: "white", fontSize: 32 }} />
              </div>
              <h2 style={{ fontWeight: 800, color: "#1A1A1A", marginBottom: 6 }}>Chi tiết đơn hàng</h2>
              <p style={{ color: "#888" }}>Mã đặt chỗ: <strong style={{ color: "#FF6B00", fontSize: 18 }}>{bookingCode}</strong></p>
              <span className={`bk-status-${status?.toLowerCase()}`} style={{ display: "inline-block", padding: "6px 16px", borderRadius: 20, fontWeight: 700, fontSize: 13 }}>
                {status}
              </span>
            </div>

            <div className="row">
              <div className="col-md-7">
                <h5 style={{ fontWeight: 700, borderBottom: "1px solid #EEE", paddingBottom: 10, marginBottom: 16 }}>Thông tin chuyến đi</h5>
                <h4 style={{ color: "#FF6B00", fontWeight: 700, marginBottom: 8 }}>{priceSnapshot?.tourTitle}</h4>
                <p style={{ marginBottom: 4 }}><strong>Ngày khởi hành:</strong> {formatFullDate(priceSnapshot?.startDate)}</p>
                <p style={{ marginBottom: 16 }}><strong>Điểm đón:</strong> {priceSnapshot?.pickupAddress || "Tại văn phòng công ty"}</p>

                <h5 style={{ fontWeight: 700, borderBottom: "1px solid #EEE", paddingBottom: 10, marginBottom: 16 }}>Danh sách hành khách</h5>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#F7F8FA" }}>
                      <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 13, color: "#666" }}>Họ tên</th>
                      <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 13, color: "#666" }}>Đối tượng</th>
                      <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 13, color: "#666" }}>Giới tính</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passengers?.map((p: any, i: number) => (
                      <tr key={i} style={{ borderBottom: "1px solid #F0F0F0" }}>
                        <td style={{ padding: "10px 12px", fontWeight: 600 }}>{p.fullName}</td>
                        <td style={{ padding: "10px 12px", fontSize: 13, color: "#555" }}>{p.ageGroup === "ADULT" ? "Người lớn" : p.ageGroup === "BABY" ? "Em bé" : "Trẻ em"}</td>
                        <td style={{ padding: "10px 12px", fontSize: 13, color: "#555" }}>{p.gender === "MALE" ? "Nam" : "Nữ"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="col-md-5 mt-4 mt-md-0">
                <div style={{ background: "#F7F8FA", borderRadius: 16, padding: "24px" }}>
                  <h5 style={{ fontWeight: 700, marginBottom: 20 }}>Chi tiết thanh toán</h5>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ color: "#666" }}>Tổng tiền:</span>
                    <span style={{ fontWeight: 700 }}>{formatPrice(bTotal)}</span>
                  </div>
                  {promotionSnapshot && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, color: "#2E7D32" }}>
                      <span>Giảm giá ({promotionSnapshot.code}):</span>
                      <span>-{formatPrice(promotionSnapshot.discountValue || 0)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, borderTop: "1px solid #E0E0E0", paddingTop: 12 }}>
                    <span style={{ color: "#666" }}>Đã thanh toán:</span>
                    <span style={{ color: "#FF6B00", fontWeight: 700 }}>{formatPrice(paidAmount || 0)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #E0E0E0", paddingTop: 12, fontSize: "1.1rem" }}>
                    <span style={{ fontWeight: 700 }}>Còn lại:</span>
                    <span style={{ color: "#D32F2F", fontWeight: 900 }}>{formatPrice(Math.max(0, bTotal - (paidAmount || 0)))}</span>
                  </div>
                  <div style={{ marginTop: 16, fontSize: 12, color: "#888" }}>
                    Ngày đặt: {new Date(createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>

                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                  <button onClick={() => window.print()} style={{ padding: "12px", border: "1.5px solid #E0E0E0", borderRadius: 12, background: "white", cursor: "pointer", fontWeight: 600, color: "#555" }}>
                    <i className="fas fa-print mr-2" /> In hóa đơn
                  </button>
                  <button onClick={() => router.push("/")} style={{ padding: "12px", border: "none", borderRadius: 12, background: "linear-gradient(135deg,#FF6B00,#FF9A00)", color: "white", fontWeight: 700, cursor: "pointer" }}>
                    Về trang chủ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── NO DEPARTURE FOUND ─────────────────────────────────────────────────────
  if (!departure && !loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <i className="fal fa-exclamation-circle" style={{ fontSize: 48, color: "#ccc", marginBottom: 16 }} />
        <h3>Không tìm thấy thông tin chuyến đi</h3>
        <a href="/tours" style={{ color: "#FF6B00", marginTop: 12 }}>← Quay lại danh sách tour</a>
      </div>
    );
  }

  // ─── MAIN CHECKOUT VIEW ──────────────────────────────────────────────────────
  const tourTitle = departure?.tourTitle || tourInfo?.title || "Tour du lịch";
  const coverImage = tourInfo?.images?.find((img: any) => img.isCover)?.imageUrl
    || tourInfo?.images?.[0]?.imageUrl
    || tourInfo?.coverImageUrl
    || "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800&auto=format&fit=crop";



  return (
    <>
      <style>{`
        .bk-container {
          font-family: system-ui, -apple-system, sans-serif;
          background: #F7F8FA; min-height: 100vh;
          padding: 40px 0 80px;
        }
        .bk-section-title {
          font-size: 1.1rem; font-weight: 700; color: #1A1A1A;
          border-left: 4px solid #FF6B00; padding-left: 12px; margin-bottom: 20px;
        }
        .bk-card {
          background: white; border-radius: 16px;
          box-shadow: 0 2px 14px rgba(0,0,0,0.07); padding: 24px; margin-bottom: 20px;
        }
        .bk-label { font-weight: 600; font-size: 13px; color: #555; display: block; margin-bottom: 6px; }
        .bk-input {
          width: 100%; border: 1.5px solid #E0E0E0; border-radius: 10px;
          padding: 11px 14px; font-size: 14px; color: #333; background: white;
          transition: border-color 0.2s; outline: none;
        }
        .bk-input:focus { border-color: #FF6B00; box-shadow: 0 0 0 3px rgba(255,107,0,0.12); }
        .bk-counter { display: flex; align-items: center; gap: 10px; }
        .bk-counter-btn {
          width: 34px; height: 34px; border-radius: 50%; border: 1.5px solid #DDD;
          background: white; cursor: pointer; font-size: 18px; font-weight: 600; color: #333;
          display: flex; align-items: center; justify-content: center; transition: all 0.2s; padding: 0;
        }
        .bk-counter-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .bk-counter-btn:not(:disabled):hover { border-color: #FF6B00; color: #FF6B00; }
        .bk-counter-val { width: 28px; text-align: center; font-weight: 700; }
        .bk-payment-card {
          border: 1.5px solid #E0E0E0; border-radius: 12px; padding: 16px;
          cursor: pointer; transition: all 0.2s; margin-bottom: 12px;
        }
        .bk-payment-card.active { border-color: #FF6B00; background: #FFF8F0; }
        .bk-cta {
          width: 100%; padding: 15px; border: none; border-radius: 14px;
          background: linear-gradient(135deg, #FF6B00 0%, #E55A00 100%);
          color: white; font-weight: 700; font-size: 16px; cursor: pointer;
          transition: all 0.2s; box-shadow: 0 4px 14px rgba(229,90,0,0.3);
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .bk-cta:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(229,90,0,0.4); }
        .bk-cta:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .bk-sidebar { position: sticky; top: 100px; }
        .bk-summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .bk-summary-total { display: flex; justify-content: space-between; padding-top: 12px; margin-top: 8px; border-top: 1px solid #EEE; font-weight: 800; font-size: 1.2rem; color: #D32F2F; }
        .bk-voucher-row { display: flex; gap: 10px; }
        @keyframes popIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          background: toast.type === "error" ? "#D32F2F" : "#2E7D32",
          color: "white", padding: "14px 22px", borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.22)", maxWidth: 380,
          display: "flex", alignItems: "center", gap: 12, animation: "slideInRight 0.3s ease",
        }}>
          <i className={`fas ${toast.type === "error" ? "fa-exclamation-circle" : "fa-check-circle"}`} style={{ fontSize: 20 }} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>{toast.msg}</span>
        </div>
      )}

      {/* ── BOOKING SUCCESS MODAL ── */}
      {bookingResult && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "white", borderRadius: 24, padding: "32px 28px", maxWidth: 580, width: "100%", textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.3)", animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)", maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#56ab2f,#a8e063)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(86,171,47,0.35)" }}>
              <i className="fas fa-check" style={{ color: "white", fontSize: 36 }} />
            </div>
            <h3 style={{ fontWeight: 800, color: "#1a1a1a", marginBottom: 6, fontSize: "1.5rem" }}>Đặt tour thành công! 🎉</h3>
            <p style={{ color: "#888", marginBottom: 20, fontSize: 14 }}>Cảm ơn bạn đã tin tưởng lựa chọn HTravel</p>

            {holdRemainingMs !== null && holdRemainingMs > 0 && (
              <div style={{ background: "#E8F5E9", borderRadius: 12, padding: "10px 16px", marginBottom: 16, color: "#1B5E20", fontWeight: 700 }}>
                Giữ chỗ còn: {Math.floor(holdRemainingMs / 60000)} phút {Math.floor((holdRemainingMs % 60000) / 1000)} giây
              </div>
            )}

            <div style={{ background: "#FFF3E0", border: "2px dashed #FF6B00", borderRadius: 12, padding: "14px 20px", marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Mã đặt chỗ của bạn</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#FF6B00", letterSpacing: 3 }}>{bookingResult.bookingCode}</div>
            </div>

            <div style={{ background: "#F8F9FA", borderRadius: 12, padding: "16px 20px", marginBottom: 20, textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ color: "#666", fontSize: 13 }}>🗺️ Tour</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#333", maxWidth: 220, textAlign: "right" }}>{bookingResult.tourTitle}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ color: "#666", fontSize: 13 }}>📅 Ngày khởi hành</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#333" }}>{formatFullDate(bookingResult.startDate)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ color: "#666", fontSize: 13 }}>👥 Hành khách</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#333" }}>
                  {bookingResult.numAdults} NL{bookingResult.numChildren1014 > 0 ? ` · ${bookingResult.numChildren1014} TE (10-14)` : ""}{bookingResult.numChildren49 > 0 ? ` · ${bookingResult.numChildren49} TE (4-9)` : ""}{bookingResult.numBabies > 0 ? ` · ${bookingResult.numBabies} EB` : ""}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #eee", paddingTop: 10 }}>
                <span style={{ color: "#666", fontSize: 13 }}>💰 {bookingResult.paymentRatio === 50 ? "Tiền cọc (50%)" : "Tổng thanh toán"}</span>
                <span style={{ fontWeight: 900, fontSize: 16, color: "#D32F2F" }}>{formatPrice(bookingResult.depositAmount)}</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={continueToCheckout} disabled={holdRemainingMs !== null && holdRemainingMs <= 0} style={{ padding: "13px", borderRadius: 12, background: holdRemainingMs !== null && holdRemainingMs <= 0 ? "#f5f5f5" : "linear-gradient(135deg,#FF6B00,#FF9A00)", color: holdRemainingMs !== null && holdRemainingMs <= 0 ? "#999" : "white", fontWeight: 700, border: "none", cursor: holdRemainingMs !== null && holdRemainingMs <= 0 ? "not-allowed" : "pointer", fontSize: 14 }}>
                <i className="fas fa-credit-card mr-2" />
                {holdRemainingMs !== null && holdRemainingMs <= 0 ? "Đã hết thời gian giữ chỗ" : "Tiếp tục thanh toán"}
              </button>
              <button onClick={() => router.push(`/booking/${bookingResult.bookingCode}`)} style={{ padding: "13px", borderRadius: 12, background: "white", color: "#FF6B00", fontWeight: 600, border: "1.5px solid #FFB57A", cursor: "pointer", fontSize: 14 }}>
                <i className="fas fa-receipt mr-2" />Xem chi tiết đơn
              </button>
              <button onClick={() => router.push("/")} style={{ padding: "13px", borderRadius: 12, background: "white", color: "#555", fontWeight: 600, border: "1.5px solid #E0E0E0", cursor: "pointer", fontSize: 14 }}>
                <i className="fas fa-home mr-2" />Về trang chủ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN ── */}
      <div className="bk-container">
        <div className="container">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" style={{ marginBottom: 24 }}>
            <ol className="breadcrumb" style={{ background: "transparent", padding: 0, marginBottom: 0 }}>
              <li className="breadcrumb-item"><a href="/" style={{ color: "#888" }}>Trang chủ</a></li>
              <li className="breadcrumb-item"><a href="/tours" style={{ color: "#888" }}>Tours</a></li>
              {departure && (
                <li className="breadcrumb-item">
                  <a href={`/tours/${departure.tourId}`} style={{ color: "#888" }}>Chi tiết tour</a>
                </li>
              )}
              <li className="breadcrumb-item active">Đặt chỗ</li>
            </ol>
          </nav>

          <div className="row">
            {/* ── LEFT: FORMS ── */}
            <div className="col-lg-8">

              {/* Passenger count selection */}
              <div className="bk-card">
                <div className="bk-section-title">1. Số lượng hành khách</div>
                <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>Sau khi chọn số lượng, vui lòng điền thông tin từng người bên dưới.</p>
                {[
                  { label: "Người lớn (NL)", sub: "Từ 15 tuổi · " + formatPrice(adultPrice), value: numAdults, min: 1, group: "adult" as const },
                  { label: "Trẻ em lớn (TE)", sub: "10–14 tuổi · " + formatPrice(child1014Price), value: numChildren1014, min: 0, group: "child1014" as const },
                  { label: "Trẻ em nhỏ (TE)", sub: "4–9 tuổi · " + formatPrice(child49Price), value: numChildren49, min: 0, group: "child49" as const },
                  { label: "Em bé (EB)", sub: "Dưới 4 tuổi · " + (babyPrice > 0 ? formatPrice(babyPrice) : "Miễn phí"), value: numBabies, min: 0, group: "baby" as const },
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{row.label}</div>
                      <div style={{ color: "#888", fontSize: 12 }}>{row.sub}</div>
                    </div>
                    <div className="bk-counter">
                      <button className="bk-counter-btn" disabled={row.value <= row.min} onClick={() => changeCount(row.group, -1)}>−</button>
                      <div className="bk-counter-val">{row.value}</div>
                      <button className="bk-counter-btn" onClick={() => changeCount(row.group, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 2. Thông tin hành khách */}
              <div className="bk-card">
                <div className="bk-section-title">2. Thông tin hành khách</div>
                <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>Vui lòng nhập đầy đủ thông tin cho từng hành khách.</p>

                {[
                  { title: "Người lớn", group: "adult" as const, list: adultPassengers, requireId: true },
                  { title: "Trẻ em lớn (10-14)", group: "child1014" as const, list: child1014Passengers, requireId: true },
                  { title: "Trẻ em nhỏ (4-9)", group: "child49" as const, list: child49Passengers, requireId: true },
                  { title: "Em bé", group: "baby" as const, list: babyPassengers, requireId: false },
                ].map((section) => (
                  section.list.length > 0 ? (
                    <div key={section.title} style={{ marginBottom: 20 }}>
                      <div style={{ fontWeight: 700, marginBottom: 12 }}>{section.title}</div>
                      {section.list.map((p, idx) => (
                        <div key={`${section.group}-${idx}`} style={{ border: "1px solid #EFEFEF", borderRadius: 12, padding: 16, marginBottom: 12 }}>
                          <div style={{ fontWeight: 600, marginBottom: 12 }}>{section.title} #{idx + 1}</div>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="bk-label">Họ và tên *</label>
                              <input
                                className="bk-input"
                                type="text"
                                placeholder="Họ và tên"
                                value={p.fullName || ""}
                                onChange={(e) => updatePassenger(section.group, idx, "fullName", e.target.value)}
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="bk-label">Ngày sinh *</label>
                              <input
                                className="bk-input"
                                type="date"
                                value={p.dob || ""}
                                onChange={(e) => updatePassenger(section.group, idx, "dob", e.target.value)}
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="bk-label">Giới tính *</label>
                              <select
                                className="bk-input"
                                value={p.gender || ""}
                                onChange={(e) => updatePassenger(section.group, idx, "gender", e.target.value)}
                              >
                                <option value="">Chọn giới tính</option>
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                              </select>
                            </div>
                            {section.requireId && (
                              <div className="col-md-6 mb-3">
                                <label className="bk-label">Số CCCD / CMND *</label>
                                <input
                                  className="bk-input"
                                  type="text"
                                  placeholder="123456789012"
                                  value={p.idCardNumber || ""}
                                  onChange={(e) => updatePassenger(section.group, idx, "idCardNumber", e.target.value)}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null
                ))}
              </div>

              {/* 3. Thông tin khách hàng */}
              <div className="bk-card">
                <div className="bk-section-title">3. Thông tin khách hàng</div>
                <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>Thông tin liên hệ để xác nhận đặt chỗ.</p>
                <div style={{ border: "1.5px solid #D65A0030", borderRadius: 16, padding: 20, background: "#FFFDF9" }}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="bk-label">Họ và tên *</label>
                      <input
                        className="bk-input"
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={contact.name}
                        onChange={(e) => patchContact({ name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="bk-label">Số điện thoại *</label>
                      <input className="bk-input" type="tel" placeholder="090xxxxxxx" value={contact.phone} onChange={(e) => patchContact({ phone: e.target.value })} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="bk-label">Email *</label>
                      <input className="bk-input" type="email" placeholder="email@example.com" value={contact.email || ""} onChange={(e) => patchContact({ email: e.target.value })} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="bk-label">Địa chỉ</label>
                      <input className="bk-input" type="text" placeholder="Địa chỉ liên hệ / nhận vé" value={contact.address} onChange={(e) => patchContact({ address: e.target.value })} />
                    </div>
                    <div className="col-md-6 mb-3" />
                    <div className="col-12">
                      <label className="bk-label">Ghi chú (không bắt buộc)</label>
                      <textarea className="bk-input" rows={3} placeholder="Yêu cầu đặc biệt, dị ứng thực phẩm, hỗ trợ xe lăn..." value={contactNotes} onChange={(e) => setContactNotes(e.target.value)} style={{ resize: "vertical" }} />
                    </div>
                  </div>
                </div>
              </div>



              {/* Voucher */}
              <div className="bk-card">
                <div className="bk-section-title">Mã giảm giá</div>
                <div className="bk-voucher-row mb-3">
                  <input className="bk-input" type="text" placeholder="Nhập mã" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && applyVoucher()} style={{ flex: 1 }} />
                  <button onClick={applyVoucher} style={{ padding: "11px 20px", background: "#FF6B00", color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                    Áp dụng
                  </button>
                </div>
                {appliedVouchers.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {appliedVouchers.map((v, i) => (
                      <div key={i} style={{ background: "#E8F5E9", color: "#2E7D32", borderRadius: 8, padding: "5px 12px", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                        {v.code} (−{formatPrice(v.value)})
                        <i className="fas fa-times" style={{ cursor: "pointer" }} onClick={() => setAppliedVouchers(appliedVouchers.filter((_, idx) => idx !== i))} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Terms checkbox */}
              <div className="bk-card">
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", background: "#F7F8FA", borderRadius: 10 }}>
                  <input
                    type="checkbox" id="terms-check" checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    style={{ marginTop: 2, width: 16, height: 16, accentColor: "#FF6B00" }}
                  />
                  <label htmlFor="terms-check" style={{ fontSize: 13, color: "#555", lineHeight: 1.6, cursor: "pointer" }}>
                    Tôi đã đọc và đồng ý với <a href="/terms" style={{ color: "#FF6B00", fontWeight: 600 }}>Điều khoản dịch vụ</a> và <a href="/policy" style={{ color: "#FF6B00", fontWeight: 600 }}>Chính sách hoàn hủy</a> của HTravel.
                  </label>
                </div>
              </div>
            </div>

            {/* ── RIGHT: SUMMARY SIDEBAR ── */}
            <div className="col-lg-4">
              <div className="bk-sidebar">
                <div className="bk-card">
                  {/* Tour thumbnail */}
                  <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 16, height: 160 }}>
                    <img src={coverImage} alt={tourTitle} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <h5 style={{ fontWeight: 800, fontSize: 15, marginBottom: 12, color: "#1A1A1A" }}>{tourTitle}</h5>

                  <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>
                    <i className="far fa-calendar-check mr-1" style={{ color: "#FF6B00" }} />
                    <strong style={{ color: "#333" }}>{departure?.startDate ? formatFullDate(departure.startDate) : "Chưa xác định"}</strong>
                  </div>
                  {departure?.endDate && (
                    <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>
                      <i className="far fa-flag-checkered mr-1" style={{ color: "#FF6B00" }} />
                      <strong style={{ color: "#333" }}>Kết thúc: {formatFullDate(departure.endDate)}</strong>
                    </div>
                  )}

                  <div style={{ borderTop: "1px solid #EEE", paddingTop: 16, marginTop: 8 }}>
                    <div className="bk-section-title" style={{ marginBottom: 12 }}>Tóm tắt giá</div>
                    {numAdults > 0 && (
                      <div className="bk-summary-row">
                        <span style={{ color: "#666" }}>{numAdults} Người lớn × {formatPrice(adultPrice)}</span>
                        <span style={{ fontWeight: 600 }}>{formatPrice(numAdults * adultPrice)}</span>
                      </div>
                    )}
                    {numChildren1014 > 0 && (
                      <div className="bk-summary-row">
                        <span style={{ color: "#666" }}>{numChildren1014} Trẻ em (10-14T) × {formatPrice(child1014Price)}</span>
                        <span style={{ fontWeight: 600 }}>{formatPrice(numChildren1014 * child1014Price)}</span>
                      </div>
                    )}
                    {numChildren49 > 0 && (
                      <div className="bk-summary-row">
                        <span style={{ color: "#666" }}>{numChildren49} Trẻ em (4-9T) × {formatPrice(child49Price)}</span>
                        <span style={{ fontWeight: 600 }}>{formatPrice(numChildren49 * child49Price)}</span>
                      </div>
                    )}
                    {numBabies > 0 && (
                      <div className="bk-summary-row">
                        <span style={{ color: "#666" }}>{numBabies} Em bé × {formatPrice(babyPrice)}</span>
                        <span style={{ fontWeight: 600 }}>{babyPrice > 0 ? formatPrice(numBabies * babyPrice) : "Miễn phí"}</span>
                      </div>
                    )}
                    {appliedVouchers.map((v, i) => (
                      <div key={i} className="bk-summary-row" style={{ color: "#2E7D32" }}>
                        <span>Voucher {v.code}</span>
                        <span>−{formatPrice(v.value)}</span>
                      </div>
                    ))}
                    <div className="bk-summary-total">
                      <span>{paymentRatio === 50 ? "Tiền cọc (50%)" : "Tổng thanh toán"}</span>
                      <span>{formatPrice(depositAmount)}</span>
                    </div>
                    {paymentRatio === 50 && (
                      <div style={{ textAlign: "right", fontSize: 12, color: "#888", marginTop: 4 }}>
                        Còn lại: {formatPrice(finalTotal - depositAmount)}
                      </div>
                    )}
                  </div>

                  <button
                    className="bk-cta"
                    onClick={handleBooking}
                    disabled={bookingSubmitting || !agreedToTerms}
                    style={{ marginTop: 20 }}
                  >
                    {bookingSubmitting ? (
                      <><div style={{ width: 18, height: 18, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.4)", borderTopColor: "white", animation: "spin 0.8s linear infinite" }} /> Đang xử lý...</>
                    ) : (
                      <><i className="fas fa-bolt" /> XÁC NHẬN ĐẶT TOUR</>
                    )}
                  </button>

                  {!agreedToTerms && (
                    <p style={{ textAlign: "center", fontSize: 12, color: "#E65100", marginTop: 8 }}>
                      Vui lòng đồng ý với điều khoản dịch vụ
                    </p>
                  )}

                  <div style={{ textAlign: "center", marginTop: 12 }}>
                    <a href={departure ? `/tours/${departure.tourId}` : "/tours"} style={{ color: "#888", fontSize: 13 }}>
                      <i className="fas fa-chevron-left mr-1" /> Quay lại chi tiết tour
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Page Wrapper (needed because useSearchParams needs Suspense) ───────────
export default function BookingDetailPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", background: "#FAFAFA" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", border: "5px solid #F0E0D0", borderTopColor: "#FF6B00", animation: "spin 0.9s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <BookingPageInner />
    </Suspense>
  );
}
