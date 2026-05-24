'use client';

import Link from "next/link";
import { useMemo, useState, useCallback } from "react";
import type { FormEvent } from "react";
import { useAuthStore } from "../../store/authStore";
import bookingApi, { PassengerDTO } from "@/api/bookingApi";

const tour = {
  tourId: "T-2026-001",
  title: "Kham pha Ba Na - Hoi An",
  startDate: "12-05-2026",
  endDate: "14-05-2026",
  quantity: 18,
  priceAdult: 2900000,
  priceChild: 1800000,
  departureId: 1, // Add departureId for API
};

const profileFallback = {
  fullName: "Nguyen Duc Hau",
  address: "Phạm Văn chiêu, Phường 9, Gò Vấp, Hồ Chí Minh",
  email: "duchaunguyen131@gmail.com",
  phoneNumber: "0900000000",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + " VND";
}

type BookingFormProps = {
  authUser: { userId: number; email: string } | null;
};

function BookingForm({ authUser }: BookingFormProps) {
  // Contact Info
  const [fullName, setFullName] = useState(profileFallback.fullName);
  const [email, setEmail] = useState(authUser?.email || profileFallback.email);
  const [phoneNumber, setPhoneNumber] = useState(profileFallback.phoneNumber);
  const [address, setAddress] = useState(profileFallback.address);

  // Passenger Counts (for pricing)
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);

  // Representative Passenger (Only 1 form, multiple counted for pricing)
  const [representative, setRepresentative] = useState<PassengerDTO>({
    fullName: "",
    dob: "",
    gender: "MALE",
    ageGroup: "ADULT",
    idCardNumber: ""
  });

  // Other
  const [voucherCode, setVoucherCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"BANK_TRANSFER" | "STRIPE" | "CASH_OFFICE">("CASH_OFFICE");
  const [agree, setAgree] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalPassengerCount = adultCount + childCount;

  // Update representative field
  const updateRepresentative = (field: keyof PassengerDTO, value: any) => {
    setRepresentative({ ...representative, [field]: value });
  };

  const handleAdultCountChange = (newCount: number) => {
    setAdultCount(Math.max(1, newCount));
  };

  const handleChildCountChange = (newCount: number) => {
    setChildCount(Math.max(0, newCount));
  };

  const discountAmount = useMemo(() => {
    const code = voucherCode.trim().toUpperCase();
    if (code === "GIAM50K") return 50000;
    if (code === "GIAM100K") return 100000;
    if (code === "GIAM10") return 0.1;
    return 0;
  }, [voucherCode]);

  // Calculate price for all passengers (but only 1 form to fill)
  const subtotal = adultCount * tour.priceAdult + childCount * tour.priceChild;
  const discountValue = typeof discountAmount === "number" && discountAmount < 1 ? Math.round(subtotal * discountAmount) : discountAmount;
  const totalAmount = Math.max(0, subtotal - discountValue);
  const depositAmount = Math.max(0, Math.round(totalAmount * 0.2));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("🔄 Form submit triggered");
    
    setErrorMessage(null);
    setSubmitMessage(null);

    // Validation
    console.log("✅ Step 1: Check auth", { userId: authUser?.userId });
    if (!authUser?.userId) {
      console.log("❌ Validation failed: no userId");
      setErrorMessage("Bạn cần đăng nhập để đặt tour.");
      return;
    }

    // Validate representative
    console.log("✅ Step 2: Check representative", representative);
    if (!representative.fullName.trim()) {
      console.log("❌ Validation failed: no fullName");
      setErrorMessage("Vui lòng nhập tên đầy đủ.");
      return;
    }
    if (!representative.dob) {
      console.log("❌ Validation failed: no dob");
      setErrorMessage("Vui lòng nhập ngày sinh.");
      return;
    }
    if (!representative.gender) {
      console.log("❌ Validation failed: no gender");
      setErrorMessage("Vui lòng chọn giới tính.");
      return;
    }
    if (!representative.ageGroup) {
      console.log("❌ Validation failed: no ageGroup");
      setErrorMessage("Vui lòng chọn nhóm tuổi.");
      return;
    }

    // Contact info validation
    const contactEmailToUse = email.trim();
    const contactPhoneToUse = phoneNumber.trim();

    console.log("✅ Step 3: Check contact info", { email: contactEmailToUse, phone: contactPhoneToUse });
    if (!contactEmailToUse || !contactPhoneToUse) {
      console.log("❌ Validation failed: no email or phone");
      setErrorMessage("Vui lòng điền đầy đủ: Email, Số điện thoại.");
      return;
    }

    console.log("✅ Step 4: Check agree", { agree });
    if (!agree) {
      console.log("❌ Validation failed: not agree");
      setErrorMessage("Bạn cần đồng ý với điều khoản thanh toán.");
      return;
    }

    console.log("✅ All validations passed, preparing to submit...");

    try {
      setSubmitting(true);

      // Send only 1 representative passenger
      const bookingPayload = {
        userId: authUser.userId,
        departureId: tour.departureId,
        passengers: [
          {
            fullName: representative.fullName.trim(),
            dob: representative.dob,
            gender: representative.gender,
            ageGroup: representative.ageGroup,
            idCardNumber: representative.idCardNumber || "",
          }
        ],
        contactName: fullName.trim() || representative.fullName.trim(),
        contactEmail: contactEmailToUse,
        contactPhone: contactPhoneToUse,
      };

      console.log("📤 Booking Payload:", JSON.stringify(bookingPayload, null, 2));

      const response = await bookingApi.createBooking(bookingPayload);

      console.log("📥 API Response:", response);

      if (response.status === 201 || response.status === 200) {
        setSubmitMessage(`✅ Đặt tour thành công! Mã đặt tour: ${response.data?.bookingCode}`);
        // Reset form
        setTimeout(() => {
          window.location.href = `/my-tours`;
        }, 2000);
      } else {
        setErrorMessage(response.message || "Lỗi khi đặt tour. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setErrorMessage(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="booking-container" style={{ alignItems: "flex-start" }}>
      <div className="booking-info" style={{ flex: 1, minWidth: 0 }}>
        {/* Contact Info */}
        <div className="booking-card p-4 mb-4" style={{ borderRadius: 16, boxShadow: "0 10px 32px rgba(0,0,0,0.06)" }}>
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
            <div>
              <h2 className="booking-header mb-2">Thông tin liên hệ</h2>
              <p className="text-muted mb-0">Nếu để trống, sẽ lấy từ thông tin hành khách đại diện (Hành khách 1)</p>
            </div>
            <div className="badge" style={{ background: "#FFF2E8", color: "#FF6B00", fontSize: 13, padding: "10px 14px" }}>
              User ID: {authUser?.userId ?? "Chưa có"}
            </div>
          </div>

          <div className="booking__infor">
            <div className="form-group">
              <label htmlFor="username">Họ và tên (tùy chọn)</label>
              <input
                type="text"
                id="username"
                placeholder="Để trống sẽ dùng tên từ hành khách đại diện"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email (bắt buộc)</label>
              <input
                type="email"
                id="email"
                placeholder="sample@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tel">Số điện thoại (bắt buộc)</label>
              <input
                type="text"
                id="tel"
                placeholder="Nhập số điện thoại liên hệ"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Địa chỉ (tùy chọn)</label>
              <input
                type="text"
                id="address"
                placeholder="Nhập địa chỉ liên hệ"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Passenger Count Selection */}
        <div className="booking-card p-4 mb-4" style={{ borderRadius: 16, boxShadow: "0 10px 32px rgba(0,0,0,0.06)" }}>
          <h2 className="booking-header mb-4">Số lượng hành khách</h2>

          <div className="booking__quantity" style={{ marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group quantity-selector">
              <label>Người lớn *</label>
              <div className="input__quanlity">
                <button type="button" className="quantity-btn" onClick={() => handleAdultCountChange(adultCount - 1)}>
                  −
                </button>
                <input type="number" className="quantity-input" value={adultCount} min={1} readOnly />
                <button type="button" className="quantity-btn" onClick={() => handleAdultCountChange(adultCount + 1)}>
                  +
                </button>
              </div>
            </div>

            <div className="form-group quantity-selector">
              <label>Trẻ em</label>
              <div className="input__quanlity">
                <button type="button" className="quantity-btn" onClick={() => handleChildCountChange(childCount - 1)}>
                  −
                </button>
                <input type="number" className="quantity-input" value={childCount} min={0} readOnly />
                <button type="button" className="quantity-btn" onClick={() => handleChildCountChange(childCount + 1)}>
                  +
                </button>
              </div>
            </div>
          </div>

          <p style={{ fontSize: "13px", color: "#999", marginBottom: 0 }}>
            Tổng: {totalPassengerCount} hành khách
          </p>
        </div>

        {/* Representative Passenger Form */}
        <div className="booking-card p-4 mb-4" style={{ borderRadius: 16, boxShadow: "0 10px 32px rgba(0,0,0,0.06)" }}>
          <h3 className="booking-header mb-3" style={{ fontSize: "16px" }}>
            Thông tin đại diện hành khách <span style={{ color: "#FF6B00", marginLeft: "8px", fontSize: "14px" }}>*</span>
          </h3>

          <p style={{ fontSize: "13px", color: "#666", marginBottom: "16px", fontStyle: "italic" }}>
            ℹ️ Vui lòng điền thông tin cho 1 người đại diện đại diện cho tất cả {totalPassengerCount} hành khách
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label>Họ và tên *</label>
              <input
                type="text"
                placeholder="Nhập tên đầy đủ"
                value={representative.fullName}
                onChange={(e) => updateRepresentative("fullName", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Ngày sinh *</label>
              <input
                type="date"
                value={representative.dob}
                onChange={(e) => updateRepresentative("dob", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Giới tính *</label>
              <select
                value={representative.gender}
                onChange={(e) => updateRepresentative("gender", e.target.value)}
                required
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
              </select>
            </div>

            <div className="form-group">
              <label>Nhóm tuổi *</label>
              <select
                value={representative.ageGroup}
                onChange={(e) => updateRepresentative("ageGroup", e.target.value)}
                required
              >
                <option value="ADULT">Người lớn</option>
                <option value="CHILD_10_14">Trẻ em (10-14 tuổi)</option>
                <option value="CHILD_4_9">Trẻ em (4-9 tuổi)</option>
                <option value="BABY">Trẻ sơ sinh</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>CMND/CCCD (tùy chọn)</label>
              <input
                type="text"
                placeholder="Nhập số CMND/CCCD"
                value={representative.idCardNumber || ""}
                onChange={(e) => updateRepresentative("idCardNumber", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="booking-card p-4 mb-4" style={{ borderRadius: 16, boxShadow: "0 10px 32px rgba(0,0,0,0.06)" }}>
          <div className="privacy-section">
            <div className="privacy-checkbox" style={{ justifyContent: "flex-start", marginBottom: "12px" }}>
              <input
                type="checkbox"
                id="agree"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <label htmlFor="agree" style={{ marginBottom: 0 }}>
                Tôi đã đọc và đồng ý với <a href="#">Điều khoản thanh toán</a> *
              </label>
            </div>
            <p style={{ fontSize: "12px", color: "#999", marginBottom: 0 }}>
              Bằng cách nhấn chuột vào nút ĐỒNG Ý dưới đây, Khách hàng đồng ý rằng các điều kiện điều khoản này sẽ được áp dụng.
            </p>
          </div>
        </div>

        {/* Payment Method */}
        <div className="booking-card p-4" style={{ borderRadius: 16, boxShadow: "0 10px 32px rgba(0,0,0,0.06)" }}>
          <h2 className="booking-header mb-4">Phương thức thanh toán</h2>

          <label className="payment-option" style={paymentMethod === "CASH_OFFICE" ? { borderColor: "#FF6B00", background: "#FFF8F0" } : undefined}>
            <input
              type="radio"
              name="payment"
              value="CASH_OFFICE"
              checked={paymentMethod === "CASH_OFFICE"}
              onChange={() => setPaymentMethod("CASH_OFFICE")}
            />
            <span style={{ marginLeft: "8px" }}>Thanh toán tại văn phòng</span>
          </label>

          <label className="payment-option" style={paymentMethod === "STRIPE" ? { borderColor: "#FF6B00", background: "#FFF8F0" } : undefined}>
            <input
              type="radio"
              name="payment"
              value="STRIPE"
              checked={paymentMethod === "STRIPE"}
              onChange={() => setPaymentMethod("STRIPE")}
            />
            <span style={{ marginLeft: "8px" }}>Thanh toán bằng Stripe</span>
          </label>

          <label className="payment-option" style={paymentMethod === "BANK_TRANSFER" ? { borderColor: "#FF6B00", background: "#FFF8F0" } : undefined}>
            <input
              type="radio"
              name="payment"
              value="BANK_TRANSFER"
              checked={paymentMethod === "BANK_TRANSFER"}
              onChange={() => setPaymentMethod("BANK_TRANSFER")}
            />
            <span style={{ marginLeft: "8px" }}>Chuyển khoản ngân hàng</span>
          </label>
        </div>
      </div>

      {/* Summary Sidebar */}
      <aside className="booking-summary" style={{ width: 400, maxWidth: "100%", marginLeft: "auto" }}>
        <div
          className="summary-section booking-card p-4"
          style={{ borderRadius: 16, boxShadow: "0 10px 32px rgba(0,0,0,0.08)", position: "sticky", top: 32 }}
        >
          <div className="mb-4">
            <p className="text-uppercase text-muted small mb-2">Thông tin tour</p>
            <p className="mb-1">Mã tour: {tour.tourId}</p>
            <h5 className="widget-title mb-2">{tour.title}</h5>
            <p className="mb-1">Ngày khởi hành: {tour.startDate}</p>
            <p className="mb-1">Ngày kết thúc: {tour.endDate}</p>
            <p className="quantityAvailable mb-0">Số chỗ còn nhận: {tour.quantity}</p>
          </div>

          <div className="order-summary">
            <div className="summary-item">
              <span>Người lớn:</span>
              <div>
                <span className="quantity__adults">{adultCount}</span>
                <span> x </span>
                <span className="total-price">{formatCurrency(tour.priceAdult)}</span>
              </div>
            </div>
            {childCount > 0 && (
              <div className="summary-item">
                <span>Trẻ em:</span>
                <div>
                  <span className="quantity__children">{childCount}</span>
                  <span> x </span>
                  <span className="total-price">{formatCurrency(tour.priceChild)}</span>
                </div>
              </div>
            )}
            {discountValue > 0 && (
              <div className="summary-item">
                <span>Giảm giá:</span>
                <div>
                  <span className="total-price" style={{ color: "#2E7D32" }}>
                    -{formatCurrency(discountValue)}
                  </span>
                </div>
              </div>
            )}
            <div className="summary-item total-price" style={{ marginTop: 8 }}>
              <span>Tổng cộng:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            <div className="summary-item" style={{ marginTop: 6 }}>
              <span>Đặt cọc:</span>
              <span>{formatCurrency(depositAmount)}</span>
            </div>
          </div>

          <div className="order-coupon">
            <input
              type="text"
              placeholder="Mã giảm giá"
              style={{ width: "65%" }}
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
            />
            <button type="button" style={{ width: "30%" }} className="booking-btn btn-coupon">
              Áp dụng
            </button>
          </div>

          <div className="mb-3" style={{ background: "#FFF8F0", borderRadius: 12, padding: 16, fontSize: 14, color: "#7A4A00" }}>
            <div style={{ fontWeight: "bold", marginBottom: "8px" }}>Thông tin sẽ được gửi kèm khi đặt tour</div>
            <div>User ID: {authUser?.userId ?? "Chưa đăng nhập"}</div>
            <div>Email: {email}</div>            <div>Hành khách: {totalPassengerCount} người</div>            <div>Đại diện: {representative.fullName || "Chưa nhập"}</div>
          </div>

          {errorMessage && (
            <div className="mb-3" style={{ borderRadius: 12, background: "#FFE8E8", color: "#FF4D4F", padding: 14, fontSize: 14 }}>
              ⚠️ {errorMessage}
            </div>
          )}

          {submitMessage && (
            <div className="mb-3" style={{ borderRadius: 12, background: "#EEF7EE", color: "#2E7D32", padding: 14, fontSize: 14 }}>
              {submitMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !agree}
            className="booking-btn btn-submit-booking"
            style={{ opacity: submitting || !agree ? 0.6 : 1, cursor: submitting || !agree ? "not-allowed" : "pointer" }}
            onClick={() => console.log("🔘 Button clicked", { submitting, agree, authUserId: authUser?.userId })}
          >
            {submitting ? "Đang xử lý..." : "Xác nhận đặt tour"}
          </button>

          <p style={{ fontSize: "12px", color: "#999", marginTop: "12px", textAlign: "center", marginBottom: 0 }}>
            {submitting || !agree ? `⚠️ ${!agree ? "Cần tick \"Tôi đồng ý\"" : "Đang xử lý..."}` : "* Các trường bắt buộc phải điền"}
          </p>
        </div>
      </aside>
    </form>
  );
}

export default function BookingPage() {
  const authUser = useAuthStore((state) => state.user);
  const authHydrated = useAuthStore((state) => state._hasHydrated);

  if (!authHydrated) {
    return (
      <section className="container" style={{ padding: "72px 16px", textAlign: "center" }}>
        <div className="booking-card p-5" style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 className="font-weight-bold mb-3">Booking</h2>
          <p className="text-muted mb-0">Đang tải thông tin tài khoản...</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        className="page-banner-area pt-50 pb-35 rel z-1 bgs-cover"
        style={{ backgroundImage: "url(/clients/assets/images/banner/banner.jpg)" }}
      >
        <div className="container">
          <div className="banner-inner text-white">
            <h2 className="page-title mb-10" data-aos="fade-left" data-aos-duration="1500" data-aos-offset="50">
              Booking
            </h2>
            <nav aria-label="breadcrumb">
              <ol
                className="breadcrumb justify-content-center mb-20"
                data-aos="fade-right"
                data-aos-delay="200"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                <li className="breadcrumb-item">
                  <Link href="/">Trang chủ</Link>
                </li>
                <li className="breadcrumb-item active">Booking</li>
              </ol>
            </nav>
          </div>
        </div>
      </section>

      <section className="container" style={{ marginTop: 50, marginBottom: 100 }}>
        <BookingForm key={authUser?.userId ?? "guest"} authUser={authUser} />
      </section>
    </>
  );
}
