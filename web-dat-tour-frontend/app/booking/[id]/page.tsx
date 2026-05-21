/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

"use client";

import { useState, useMemo, useEffect, useReducer } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDepartureDetails, getTourSchedules, getTourDetails } from "../../../api/coreApi_new";
import { createBooking, getBookingByCode, type BookingRequest, type PassengerDTO, type PassengerGender } from "../../../api/bookingApi";
import { useAuthStore } from "../../../store/authStore";

const createPassengerDefaults = (ageGroup: PassengerDTO["ageGroup"], _index: number): PassengerDTO => ({
  fullName: "",
  ageGroup,
  dob: "",
  gender: "" as PassengerGender,
  idCardNumber: ageGroup === "BABY" ? undefined : "",
});

const syncPassengerList = (current: PassengerDTO[], nextLength: number, ageGroup: PassengerDTO["ageGroup"]) => {
  return Array.from({ length: nextLength }, (_, index) => current[index] ?? createPassengerDefaults(ageGroup, index));
};

const isValidIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());

const resolveChildAgeGroup = (dob: string): PassengerDTO["ageGroup"] => {
  if (!isValidIsoDate(dob)) return "CHILD_10_14";

  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  if (age >= 10) return "CHILD_10_14";
  return "CHILD_4_9";
};

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
  const [adultPassengers, setAdultPassengers] = useState<PassengerDTO[]>(() => syncPassengerList([], 2, "ADULT"));
  const [childPassengers, setChildPassengers] = useState<PassengerDTO[]>(() => syncPassengerList([], 0, "CHILD_10_14"));
  const [babyPassengers, setBabyPassengers] = useState<PassengerDTO[]>(() => syncPassengerList([], 0, "BABY"));
  const [passengerModalOpen, setPassengerModalOpen] = useState(false);
  const [visibleRows, setVisibleRows] = useState(10);
  const [activePolicyTab, setActivePolicyTab] = useState("inclusions");
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  // Booking result modal
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [holdRemainingMs, setHoldRemainingMs] = useState<number | null>(null);

  // --- CHECKOUT FORM STATES ---
  const [pickupPoint, setPickupPoint] = useState("");
  type ContactForm = { name: string; phone: string; email: string; address: string };
  const [contact, patchContact] = useReducer(
    (prev: ContactForm, patch: Partial<ContactForm>) => ({ ...prev, ...patch }),
    { name: "", phone: "", email: "", address: "" },
  );
  const contactName    = contact.name;
  const contactPhone   = contact.phone;
  const contactEmail   = contact.email;
  const contactAddress = contact.address;
  const setContactName    = (v: string) => patchContact({ name: v });
  const setContactPhone   = (v: string) => patchContact({ phone: v });
  const setContactEmail   = (v: string) => patchContact({ email: v });
  const setContactAddress = (v: string) => patchContact({ address: v });
  const [contactNotes, setContactNotes] = useState("");
  const [paymentRatio, setPaymentRatio] = useState(100); // 100 or 50
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVouchers, setAppliedVouchers] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("bank"); // bank or cash
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const authUser = useAuthStore((state) => state.user);
  const authHydrated = useAuthStore((state) => state._hasHydrated);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  const changePassengerCount = (group: "adult" | "child" | "baby", delta: number) => {
    if (group === "adult") {
      setNumAdults((current) => {
        const next = Math.max(1, current + delta);
        setAdultPassengers((passengers) => syncPassengerList(passengers, next, "ADULT"));
        return next;
      });
      return;
    }

    if (group === "child") {
      setNumChildren((current) => {
        const next = Math.max(0, current + delta);
        setChildPassengers((passengers) => syncPassengerList(passengers, next, "CHILD_10_14"));
        return next;
      });
      return;
    }

    setNumBabies((current) => {
      const next = Math.max(0, current + delta);
      setBabyPassengers((passengers) => syncPassengerList(passengers, next, "BABY"));
      return next;
    });
  };

  const updatePassenger = (
    group: "adult" | "child" | "baby",
    index: number,
    field: keyof PassengerDTO,
    value: string,
  ) => {
    const setter = group === "adult" ? setAdultPassengers : group === "child" ? setChildPassengers : setBabyPassengers;
    setter((current) => {
      const next = [...current];
      next[index] = { ...next[index], [field]: value } as PassengerDTO;
      return next;
    });
  };

  const hasIncompletePassengers = () => {
    const hasAdultCount = numAdults > 0;
    const hasChildCount = numChildren > 0;
    const hasBabyCount = numBabies > 0;

    const adultIncomplete = hasAdultCount && adultPassengers.some((passenger) => !passenger.fullName || !passenger.dob || !passenger.gender || !passenger.idCardNumber);
    const childIncomplete = hasChildCount && childPassengers.some((passenger) => !passenger.fullName || !passenger.dob || !passenger.gender || !passenger.idCardNumber);
    const babyIncomplete = hasBabyCount && babyPassengers.some((passenger) => !passenger.fullName || !passenger.dob || !passenger.gender);

    return adultIncomplete || childIncomplete || babyIncomplete || adultPassengers.length !== numAdults || childPassengers.length !== numChildren || babyPassengers.length !== numBabies;
  };

  // --- AUTO-FILL CONTACT TỪ USER PROFILE ---
  useEffect(() => {
    if (!authHydrated || !authUser?.userId) return;
    if (authUser.fullName || authUser.phone) {
      // Đã có profile → điền ngay (1 dispatch duy nhất)
      patchContact({
        name:    contact.name    || authUser.fullName || "",
        phone:   contact.phone   || authUser.phone    || "",
        email:   contact.email   || authUser.email    || "",
        address: contact.address || authUser.address  || "",
      });
    } else {
      // Chưa có profile → fetch, khi store cập nhật effect dưới sẽ chạy
      fetchProfile();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHydrated, authUser?.userId]);

  // Khi fetchProfile() hoàn thành, store update → điền lần cuối (1 dispatch)
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

  useEffect(() => {
    if (!bookingResult?.expiresAt) {
      return;
    }

    const updateRemaining = () => {
      const remaining = Math.max(0, bookingResult.expiresAt - Date.now());
      setHoldRemainingMs(remaining);
    };

    updateRemaining();
    const timer = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(timer);
  }, [bookingResult?.expiresAt]);

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

    if (hasIncompletePassengers()) {
      setPassengerModalOpen(true);
      showToast("Chưa đủ thông tin hành khách. Vui lòng nhập đầy đủ trước khi đặt tour.", "error");
      return;
    }

    if (!authHydrated) {
      showToast("Đang tải thông tin đăng nhập, vui lòng thử lại sau vài giây.", "error");
      return;
    }

    if (!authUser?.userId) {
      showToast("Vui lòng đăng nhập để đặt tour!", "error");
      return;
    }
    const passengerList: PassengerDTO[] = [
      ...adultPassengers.map((passenger) => ({
        ...passenger,
        ageGroup: "ADULT" as const,
      })),
      ...childPassengers.map((passenger) => ({
        ...passenger,
        ageGroup: resolveChildAgeGroup(passenger.dob),
      })),
      ...babyPassengers.map((passenger) => ({
        fullName: passenger.fullName,
        ageGroup: "BABY" as const,
        dob: passenger.dob,
        gender: passenger.gender,
        idCardNumber: passenger.idCardNumber,
      })),
    ];

    if (!passengerList.length) {
      showToast("Chưa đủ thông tin hành khách. Vui lòng nhập đầy đủ trước khi đặt tour.", "error");
      setPassengerModalOpen(true);
      return;
    }

    const hasInvalidPassenger = passengerList.some((passenger) =>
      !passenger.fullName ||
      !passenger.ageGroup ||
      !passenger.gender ||
      !isValidIsoDate(passenger.dob) ||
      (passenger.ageGroup !== "BABY" && !passenger.idCardNumber)
    );

    if (hasInvalidPassenger) {
      showToast("Chưa đủ thông tin hành khách. Vui lòng nhập đầy đủ trước khi đặt tour.", "error");
      setPassengerModalOpen(true);
      return;
    }

    const requestData: BookingRequest = {
      userId: authUser.userId,
      departureId: Number(selectedDepId || id),
      note: [contactNotes, `Địa chỉ: ${contactAddress}`].filter(Boolean).join(" | ") || undefined,
      passengers: passengerList,
      contactName: contactName || undefined,
      contactEmail: contactEmail || undefined,
      contactPhone: contactPhone || undefined,
    };

    try {
      setBookingSubmitting(true);
      const res = await createBooking(requestData);

      if (res.status === 201 || res.status === 200) {
        const bookingResponse = (res as any).data ?? res;
        const createdAtValue = bookingResponse.createdAt ? new Date(bookingResponse.createdAt).getTime() : 0;
        // Lưu kết quả để hiện Modal thành công
        setBookingResult({
          bookingId: bookingResponse.bookingId ?? bookingResponse.id ?? null,
          bookingCode: bookingResponse.bookingCode,
          status: bookingResponse.status,
          bookingStatus: bookingResponse.status,
          message: bookingResponse.message,
          destination: bookingResponse.destination,
          createdAt: bookingResponse.createdAt,
          expiresAt: createdAtValue + 10 * 60 * 1000,
          tourTitle: tourDetail?.title,
          startDate: selectedDate,
          subtotalAmount: totalAmount,
          totalDiscount,
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
          contactAddress,
          cityName: bookingResponse.cityName,
          pickupName: bookingResponse.pickupName,
          pickupAddress: bookingResponse.pickupAddress,
          pickupTime: bookingResponse.pickupTime,
          priceDetail: bookingResponse.priceDetail,
          passengers: bookingResponse.passengers || passengerList,
          voucherCode,
          appliedVouchers,
        });
        setHoldRemainingMs(10 * 60 * 1000);
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

  const continueToCheckout = () => {
    if (bookingResult?.expiresAt && bookingResult.expiresAt <= Date.now()) {
      showToast("Phiên giữ chỗ 10 phút đã hết. Vui lòng đặt tour lại.", "error");
      return;
    }
    if (bookingResult) {
      try {
        window.sessionStorage.setItem("htour.checkout", JSON.stringify(bookingResult));
      } catch (error) {
        console.warn("Không thể lưu thông tin checkout:", error);
      }
    }

    setBookingResult(null);
    setIsCheckoutMode(false);
    // Đưa bookingCode lên URL để fallback khi sessionStorage bị xóa
    const code = bookingResult?.bookingCode ?? "";
    router.push(`/booking/checkout${code ? `?code=${encodeURIComponent(code)}` : ""}`);
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

      {passengerModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10001,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setPassengerModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Nhập thông tin hành khách"
            style={{
              background: "white",
              borderRadius: 24,
              padding: 28,
              width: "min(1080px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 900, fontSize: 24, color: "#1A1A1A" }}>Nhập thông tin hành khách</h3>
                <p style={{ margin: "8px 0 0", color: "#666" }}>
                  {numAdults} NL, {numChildren} TE, {numBabies} EB. Vui lòng nhập đầy đủ thông tin trước khi đặt tour.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPassengerModalOpen(false)}
                style={{ border: "none", background: "transparent", fontSize: 28, lineHeight: 1, cursor: "pointer", color: "#666" }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gap: 18 }}>
              {adultPassengers.map((passenger, index) => (
                <section key={`adult-${index}`} style={{ border: "1px solid #F0D2B8", borderRadius: 18, padding: 18, background: "#FFFDF9" }}>
                  <h4 style={{ margin: "0 0 14px", color: "#D65A00", fontWeight: 800 }}>Hành khách (Người lớn)</h4>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Họ và tên *</label>
                      <input
                        className="form-control"
                        type="text"
                        value={passenger.fullName || ""}
                        onChange={(event) => updatePassenger("adult", index, "fullName", event.target.value)}
                        placeholder="Họ và tên"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Ngày sinh *</label>
                      <input
                        className="form-control"
                        type="date"
                        value={passenger.dob || ""}
                        onChange={(event) => updatePassenger("adult", index, "dob", event.target.value)}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Giới tính *</label>
                      <select
                        className="form-control"
                        value={passenger.gender || ""}
                        onChange={(event) => updatePassenger("adult", index, "gender", event.target.value)}
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Số CCCD / CMND *</label>
                      <input
                        className="form-control"
                        type="text"
                        value={passenger.idCardNumber || ""}
                        onChange={(event) => updatePassenger("adult", index, "idCardNumber", event.target.value)}
                        placeholder="123456789"
                      />
                    </div>
                  </div>
                </section>
              ))}

              {childPassengers.map((passenger, index) => (
                <section key={`child-${index}`} style={{ border: "1px solid #F0D2B8", borderRadius: 18, padding: 18, background: "#FFFDF9" }}>
                  <h4 style={{ margin: "0 0 14px", color: "#D65A00", fontWeight: 800 }}>Hành khách (Trẻ em)</h4>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Họ và tên *</label>
                      <input
                        className="form-control"
                        type="text"
                        value={passenger.fullName || ""}
                        onChange={(event) => updatePassenger("child", index, "fullName", event.target.value)}
                        placeholder="Họ và tên"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Ngày sinh *</label>
                      <input
                        className="form-control"
                        type="date"
                        value={passenger.dob || ""}
                        onChange={(event) => updatePassenger("child", index, "dob", event.target.value)}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Giới tính *</label>
                      <select
                        className="form-control"
                        value={passenger.gender || ""}
                        onChange={(event) => updatePassenger("child", index, "gender", event.target.value)}
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Số CCCD / CMND *</label>
                      <input
                        className="form-control"
                        type="text"
                        value={passenger.idCardNumber || ""}
                        onChange={(event) => updatePassenger("child", index, "idCardNumber", event.target.value)}
                        placeholder="123456789"
                      />
                    </div>
                  </div>
                </section>
              ))}

              {babyPassengers.map((passenger, index) => (
                <section key={`baby-${index}`} style={{ border: "1px solid #D8E8F4", borderRadius: 18, padding: 18, background: "#F8FCFF" }}>
                  <h4 style={{ margin: "0 0 14px", color: "#0F6C8A", fontWeight: 800 }}>Hành khách (Em bé)</h4>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Họ và tên *</label>
                      <input
                        className="form-control"
                        type="text"
                        value={passenger.fullName || ""}
                        onChange={(event) => updatePassenger("baby", index, "fullName", event.target.value)}
                        placeholder="Họ và tên"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Ngày sinh *</label>
                      <input
                        className="form-control"
                        type="date"
                        value={passenger.dob || ""}
                        onChange={(event) => updatePassenger("baby", index, "dob", event.target.value)}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Giới tính *</label>
                      <select
                        className="form-control"
                        value={passenger.gender || ""}
                        onChange={(event) => updatePassenger("baby", index, "gender", event.target.value)}
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="MALE">Nam</option>
                      </select>
                    </div>
                  </div>
                </section>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 22 }}>
              <button
                type="button"
                className="booking-btn"
                style={{ width: 150, background: "#EFEFEF", color: "#333" }}
                onClick={() => setPassengerModalOpen(false)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="booking-btn"
                style={{ width: 220 }}
                onClick={() => {
                  if (hasIncompletePassengers()) {
                    showToast("Chưa đủ thông tin hành khách. Vui lòng nhập đầy đủ trước khi đặt tour.", "error");
                    return;
                  }

                  setPassengerModalOpen(false);
                }}
              >
                Lưu hành khách
              </button>
            </div>
          </div>
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
            background: "white", borderRadius: 24, padding: "28px 24px",
            maxWidth: 620, width: "100%", textAlign: "center",
            boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
            animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            maxHeight: "86vh",
            overflowY: "auto"
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

            <div style={{
              background: "#E8F5E9",
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 18,
              color: "#1B5E20",
              fontWeight: 700,
              lineHeight: 1.5,
            }}>
              {holdRemainingMs !== null && holdRemainingMs > 0
                ? `Giữ chỗ trong ${Math.ceil(holdRemainingMs / 60000)} phút ${Math.floor((holdRemainingMs % 60000) / 1000)} giây.`
                : "Giữ chỗ 10 phút đã được kích hoạt từ thời điểm tạo booking."}
            </div>

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

            {bookingResult.destination?.imageUrl && (
              <div style={{ marginBottom: 20 }}>
                <img
                  src={bookingResult.destination.imageUrl}
                  alt={bookingResult.destination?.destinationName || bookingResult.tourTitle || "Điểm đến"}
                  style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 16 }}
                />
              </div>
            )}

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
              {bookingResult.cityName && (
                <div style={{display: "flex", justifyContent: "space-between", marginBottom: 10}}>
                  <span style={{color: "#666", fontSize: 13}}>🏙️ Điểm đến</span>
                  <span style={{fontWeight: 700, fontSize: 13, color: "#333", textAlign: "right"}}>
                    {bookingResult.cityName}
                  </span>
                </div>
              )}
              {bookingResult.pickupName && (
                <div style={{display: "flex", justifyContent: "space-between", marginBottom: 10}}>
                  <span style={{color: "#666", fontSize: 13}}>📍 Điểm đón</span>
                  <span style={{fontWeight: 700, fontSize: 13, color: "#333", textAlign: "right"}}>
                    {bookingResult.pickupName}
                  </span>
                </div>
              )}
              {bookingResult.pickupAddress && (
                <div style={{display: "flex", justifyContent: "space-between", marginBottom: 10}}>
                  <span style={{color: "#666", fontSize: 13}}>🛣️ Địa chỉ đón</span>
                  <span style={{fontWeight: 700, fontSize: 13, color: "#333", textAlign: "right"}}>
                    {bookingResult.pickupAddress}
                  </span>
                </div>
              )}
              <div style={{display: "flex", justifyContent: "space-between", borderTop: "1px solid #eee", paddingTop: 10}}>
                <span style={{color: "#666", fontSize: 13}}>💰 {bookingResult.paymentRatio === 50 ? "Tiền cọc (50%)" : "Tổng thanh toán"}</span>
                <span style={{fontWeight: 900, fontSize: 16, color: "#D32F2F"}}>{formatPrice(bookingResult.depositAmount)}</span>
              </div>
            </div>

            {bookingResult.message && (
              <div style={{
                background: "#FFF8E1",
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 20,
                textAlign: "left",
                color: "#7A4E00",
                fontSize: 13,
                lineHeight: 1.6,
              }}>
                <strong>Diễn giải tính tiền:</strong> {bookingResult.message}
              </div>
            )}

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
            <div style={{display: "grid", gridTemplateColumns: "1fr", gap: 12}}>
              <button
                onClick={continueToCheckout}
                disabled={holdRemainingMs !== null && holdRemainingMs <= 0}
                style={{
                  width: "100%", padding: "13px 20px", borderRadius: 12,
                  background: holdRemainingMs !== null && holdRemainingMs <= 0 ? "#f5f5f5" : "#FFF8F0",
                  color: holdRemainingMs !== null && holdRemainingMs <= 0 ? "#999" : "#FF6B00",
                  fontWeight: 800,
                  border: "1.5px solid #FFB57A",
                  cursor: holdRemainingMs !== null && holdRemainingMs <= 0 ? "not-allowed" : "pointer",
                  fontSize: 14,
                  opacity: holdRemainingMs !== null && holdRemainingMs <= 0 ? 0.7 : 1,
                }}
              >
                {holdRemainingMs !== null && holdRemainingMs <= 0
                  ? "Đã hết thời gian giữ chỗ"
                  : "Tiếp tục nhập thông tin thanh toán"}
              </button>
              <button
                onClick={() => router.push(`/booking/${bookingResult.bookingCode}`)}
                style={{
                  width: "100%", padding: "13px 20px", borderRadius: 12,
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
                  width: "100%", padding: "13px 20px", borderRadius: 12,
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

          <div className="row">
            <div className="col-lg-7 mb-4">
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
                {isCheckoutMode ? (
                  <div className="checkout-two-column">
                    <div className="checkout-panel checkout-panel-left">
                      <h5 className="font-weight-bold mb-3" style={{fontSize: "1rem"}}>4. Thanh toán</h5>

                      <div className="mb-4 p-3" style={{background: "#FFF8F0", borderRadius: 12}}>
                        <div className="summary-item">
                          <span>Tổng tiền:</span>
                          <span className="font-weight-bold">{formatPrice(finalTotal)}</span>
                        </div>
                        <div className="summary-item mb-0">
                          <span>Thanh toán:</span>
                          <span className="text-danger font-weight-bold">{formatPrice(depositAmount)}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="font-weight-bold mb-2 d-block">Chọn hình thức thanh toán</label>
                        <div className={`payment-option ${paymentMethod === 'bank' ? 'active' : ''}`} onClick={() => setPaymentMethod('bank')}>
                          <div className="d-flex align-items-center">
                            <i className="fas fa-university mr-3 text-primary" style={{fontSize: "1.2rem"}}></i>
                            <div className="font-weight-bold">Chuyển khoản ngân hàng</div>
                          </div>
                          {paymentMethod === 'bank' && (
                            <div className="bank-info mt-3" style={{border: "1px dashed #FF6B00"}}>
                              <div className="mb-1">Xác nhận thanh toán để giữ chỗ trong 10 phút.</div>
                              <div className="mt-2 text-warning font-weight-bold small">Hết 10 phút booking sẽ tự hết hiệu lực.</div>
                            </div>
                          )}
                        </div>
                        <div className={`payment-option ${paymentMethod === 'cash' ? 'active' : ''}`} onClick={() => setPaymentMethod('cash')}>
                          <div className="d-flex align-items-center">
                            <i className="fas fa-money-bill-wave mr-3 text-success" style={{fontSize: "1.2rem"}}></i>
                            <div className="font-weight-bold">Thanh toán tiền mặt tại văn phòng</div>
                          </div>
                        </div>
                      </div>

                      <div className="border-top pt-4">
                        <button className="cta-btn" onClick={handleBooking} disabled={bookingSubmitting} style={{display: "flex", alignItems: "center", justifyContent: "center", gap: 10}}>
                          {bookingSubmitting ? "Đang xử lý..." : `Xác nhận thanh toán ${formatPrice(depositAmount)}`}
                        </button>
                      </div>

                      <div className="text-center mt-3">
                        <button type="button" className="btn btn-link text-muted small" onClick={() => setIsCheckoutMode(false)}>
                          <i className="fas fa-chevron-left mr-2"></i> Quay lại chọn hành khách
                        </button>
                      </div>
                    </div>

                    <div className="checkout-panel checkout-panel-right">
                      <h5 className="font-weight-bold mb-3" style={{fontSize: "1rem"}}>5. Thông tin user</h5>
                      <div className="mb-3 p-3" style={{background: "#F8F9FA", borderRadius: 12}}>
                        <div className="summary-item"><span>User ID:</span><span className="font-weight-bold">{authUser?.userId ?? "Chưa có"}</span></div>
                        <div className="summary-item"><span>Họ tên:</span><span className="font-weight-bold">{contactName}</span></div>
                        <div className="summary-item"><span>Email:</span><span className="font-weight-bold">{contactEmail || authUser?.email}</span></div>
                        <div className="summary-item mb-0"><span>Địa chỉ:</span><span className="font-weight-bold text-right">{contactAddress}</span></div>
                      </div>

                      <div className="mb-4">
                        <div className="form-group mb-3">
                          <label>Họ và tên</label>
                          <input type="text" className="form-control" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Nguyễn Văn A" />
                        </div>
                        <div className="form-group mb-3">
                          <label>Số điện thoại</label>
                          <input type="text" className="form-control" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="090xxxxxxx" />
                        </div>
                        <div className="form-group mb-3">
                          <label>Email</label>
                          <input type="email" className="form-control" value={contactEmail || authUser?.email || ""} onChange={(e) => setContactEmail(e.target.value)} placeholder="email@example.com" />
                        </div>
                        <div className="form-group mb-0">
                          <label>Địa chỉ</label>
                          <textarea className="form-control" rows={3} value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} placeholder="Địa chỉ nhận vé / địa chỉ liên hệ" />
                        </div>
                      </div>

                      <div className="mb-4">
                        <h5 className="font-weight-bold mb-3" style={{fontSize: "1rem"}}>6. Promotion / Voucher</h5>
                        <div className="voucher-input-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nhập mã giảm giá (GIAM50K, GIAM100K...)"
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value)}
                          />
                          <button className="btn btn-primary" type="button" style={{borderRadius: 8, padding: "0 20px", background: "#FF6B00", border: "none"}} onClick={applyVoucher}>Áp dụng</button>
                        </div>
                        {appliedVouchers.length > 0 && (
                          <div className="d-flex flex-wrap" style={{gap: 8}}>
                            {appliedVouchers.map((v, i) => (
                              <div key={i} className="badge p-2 d-flex align-items-center" style={{fontSize: "0.85rem", background: "#E8F5E9", color: "#2E7D32", borderRadius: 6}}>
                                {v.code} (-{formatPrice(v.value)})
                                <i className="fas fa-times ml-2 cursor-pointer" onClick={() => setAppliedVouchers(appliedVouchers.filter((_, idx) => idx !== i))} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mb-0">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="font-weight-bold">Mã tour</span>
                          <span>{tourDetail?.tourId || selectedDepId}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="font-weight-bold">Mã giảm giá</span>
                          <span>{voucherCode || "Chưa nhập"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                
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
                        <button className="counter-btn" disabled={numAdults <= 1} onClick={() => changePassengerCount("adult", -1)}>–</button>
                      <div className="counter-value">{numAdults}</div>
                        <button className="counter-btn" onClick={() => changePassengerCount("adult", 1)}>+</button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <div className="font-weight-bold">Trẻ em (TE)</div>
                      <div className="text-muted small">{formatPrice(childPrice)}</div>
                    </div>
                    <div className="d-flex align-items-center">
                        <button className="counter-btn" disabled={numChildren <= 0} onClick={() => changePassengerCount("child", -1)}>–</button>
                      <div className="counter-value">{numChildren}</div>
                        <button className="counter-btn" onClick={() => changePassengerCount("child", 1)}>+</button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="font-weight-bold">Em bé (EB)</div>
                      <div className="text-muted small">0đ (miễn phí)</div>
                    </div>
                    <div className="d-flex align-items-center">
                        <button className="counter-btn" disabled={numBabies <= 0} onClick={() => changePassengerCount("baby", -1)}>–</button>
                      <div className="counter-value">{numBabies}</div>
                        <button className="counter-btn" onClick={() => changePassengerCount("baby", 1)}>+</button>
                    </div>
                  </div>
                </div>

                  {(numAdults > 0 || numChildren > 0 || numBabies > 0) && (
                    <div
                      role="button"
                      tabIndex={0}
                      className="payment-option"
                      style={{ background: "#FFF8F0", borderColor: "#FFB57A", marginBottom: 16 }}
                      onClick={() => setPassengerModalOpen(true)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setPassengerModalOpen(true);
                        }
                      }}
                    >
                      <div className="font-weight-bold mb-1">Vui lòng nhập thông tin hành khách</div>
                      <div className="small text-muted">
                        {hasIncompletePassengers()
                          ? "Chưa đủ thông tin hành khách. Nhấn vào đây để nhập theo số lượng đã chọn."
                          : "Đã có thông tin hành khách. Bạn có thể kiểm tra lại trước khi đặt tour."}
                      </div>
                    </div>
                  )}

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

                  </>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
