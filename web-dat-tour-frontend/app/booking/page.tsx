'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useAuthStore } from "../../store/authStore";

const tour = {
  tourId: "T-2026-001",
  title: "Kham pha Ba Na - Hoi An",
  startDate: "12-05-2026",
  endDate: "14-05-2026",
  quantity: 18,
  priceAdult: 2900000,
  priceChild: 1800000,
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
  const [fullName, setFullName] = useState(profileFallback.fullName);
  const [email, setEmail] = useState(authUser?.email || profileFallback.email);
  const [phoneNumber, setPhoneNumber] = useState(profileFallback.phoneNumber);
  const [address, setAddress] = useState(profileFallback.address);
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [voucherCode, setVoucherCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"office-payment" | "paypal-payment" | "momo-payment">("office-payment");
  const [agree, setAgree] = useState(true);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const discountAmount = useMemo(() => {
    const code = voucherCode.trim().toUpperCase();
    if (code === "GIAM50K") return 50000;
    if (code === "GIAM100K") return 100000;
    if (code === "GIAM10") return 0.1;
    return 0;
  }, [voucherCode]);

  const subtotal = adultCount * tour.priceAdult + childCount * tour.priceChild;
  const discountValue = typeof discountAmount === "number" && discountAmount < 1 ? Math.round(subtotal * discountAmount) : discountAmount;
  const totalAmount = Math.max(0, subtotal - discountValue);
  const depositAmount = Math.max(0, Math.round(totalAmount * 0.2));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!authUser?.userId) {
      setSubmitMessage("Ban can dang nhap de dat tour.");
      return;
    }

    if (!fullName.trim() || !email.trim() || !phoneNumber.trim() || !address.trim()) {
      setSubmitMessage("Vui long dien day du thong tin lien lac.");
      return;
    }

    if (!agree) {
      setSubmitMessage("Ban can dong y voi dieu khoan thanh toan.");
      return;
    }

    setSubmitMessage(`Da san sang gui dat tour cho userId ${authUser.userId}.`);
  };

  return (
    <form onSubmit={handleSubmit} className="booking-container" style={{ alignItems: "flex-start" }}>
      <div className="booking-info" style={{ flex: 1, minWidth: 0 }}>
        <div className="booking-card p-4 mb-4" style={{ borderRadius: 16, boxShadow: "0 10px 32px rgba(0,0,0,0.06)" }}>
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
            <div>
              <h2 className="booking-header mb-2">Thong Tin Lien Lac</h2>
              <p className="text-muted mb-0">Thong tin dang nhap va dia chi duoc lay tu ho so cua ban.</p>
            </div>
            <div className="badge" style={{ background: "#FFF2E8", color: "#FF6B00", fontSize: 13, padding: "10px 14px" }}>
              User ID: {authUser?.userId ?? "Chua co"}
            </div>
          </div>

          <div className="booking__infor">
            <div className="form-group">
              <label htmlFor="username">Ho va ten*</label>
              <input
                type="text"
                id="username"
                placeholder="Nhap ho va ten"
                name="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email*</label>
              <input
                type="email"
                id="email"
                placeholder="sample@gmail.com"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tel">So dien thoai*</label>
              <input
                type="text"
                id="tel"
                placeholder="Nhap so dien thoai lien he"
                name="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Dia chi*</label>
              <input
                type="text"
                id="address"
                placeholder="Nhap dia chi lien he"
                name="address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="booking-card p-4 mb-4" style={{ borderRadius: 16, boxShadow: "0 10px 32px rgba(0,0,0,0.06)" }}>
          <h2 className="booking-header mb-4">Hanh Khach</h2>

          <div className="booking__quantity" style={{ marginBottom: 16 }}>
            <div className="form-group quantity-selector" style={{ flex: 1 }}>
              <label>Nguoi lon</label>
              <div className="input__quanlity">
                <button type="button" className="quantity-btn" onClick={() => setAdultCount((value) => Math.max(1, value - 1))}>
                  -
                </button>
                <input type="number" className="quantity-input" value={adultCount} min={1} readOnly />
                <button type="button" className="quantity-btn" onClick={() => setAdultCount((value) => value + 1)}>
                  +
                </button>
              </div>
            </div>

            <div className="form-group quantity-selector" style={{ flex: 1 }}>
              <label>Tre em</label>
              <div className="input__quanlity">
                <button type="button" className="quantity-btn" onClick={() => setChildCount((value) => Math.max(0, value - 1))}>
                  -
                </button>
                <input type="number" className="quantity-input" value={childCount} min={0} readOnly />
                <button type="button" className="quantity-btn" onClick={() => setChildCount((value) => value + 1)}>
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="privacy-section" style={{ textAlign: "left" }}>
            <p style={{ marginBottom: 0 }}>
              Bang cach nhap chuot vao nut DONG Y duoi day, Khach hang dong y rang cac dieu kien dieu khoan nay se
              duoc ap dung. Vui long doc ky dieu kien dieu khoan truoc khi lua chon su dung dich vu cua HTravel.
            </p>
            <div className="privacy-checkbox" style={{ justifyContent: "flex-start" }}>
              <input type="checkbox" id="agree" name="agree" checked={agree} onChange={(event) => setAgree(event.target.checked)} />
              <label htmlFor="agree">
                Toi da doc va dong y voi <a href="#">Dieu khoan thanh toan</a>
              </label>
            </div>
          </div>
        </div>

        <div className="booking-card p-4" style={{ borderRadius: 16, boxShadow: "0 10px 32px rgba(0,0,0,0.06)" }}>
          <h2 className="booking-header mb-4">Phuong Thuc Thanh Toan</h2>

          <label className="payment-option" style={paymentMethod === "office-payment" ? { borderColor: "#FF6B00", background: "#FFF8F0" } : undefined}>
            <input type="radio" name="payment" value="office-payment" checked={paymentMethod === "office-payment"} onChange={() => setPaymentMethod("office-payment")} />
            <img src="/clients/assets/images/contact/icon.png" alt="Office Payment" />
            Thanh toan tai van phong
          </label>

          <label className="payment-option" style={paymentMethod === "paypal-payment" ? { borderColor: "#FF6B00", background: "#FFF8F0" } : undefined}>
            <input type="radio" name="payment" value="paypal-payment" checked={paymentMethod === "paypal-payment"} onChange={() => setPaymentMethod("paypal-payment")} />
            <img src="/clients/assets/images/booking/cong-thanh-toan-paypal.jpg" alt="PayPal" />
            Thanh toan bang PayPal
          </label>

          <label className="payment-option" style={paymentMethod === "momo-payment" ? { borderColor: "#FF6B00", background: "#FFF8F0" } : undefined}>
            <input type="radio" name="payment" value="momo-payment" checked={paymentMethod === "momo-payment"} onChange={() => setPaymentMethod("momo-payment")} />
            <img src="/clients/assets/images/booking/thanh-toan-momo.jpg" alt="MoMo" />
            Thanh toan bang Momo
          </label>
        </div>
      </div>

      <aside className="booking-summary" style={{ width: 400, maxWidth: "100%", marginLeft: "auto" }}>
        <div className="summary-section booking-card p-4" style={{ borderRadius: 16, boxShadow: "0 10px 32px rgba(0,0,0,0.08)", position: "sticky", top: 32 }}>
          <div className="mb-4">
            <p className="text-uppercase text-muted small mb-2">Thong tin tour</p>
            <p className="mb-1">Ma tour : {tour.tourId}</p>
            <h5 className="widget-title mb-2">{tour.title}</h5>
            <p className="mb-1">Ngay khoi hanh : {tour.startDate}</p>
            <p className="mb-1">Ngay ket thuc : {tour.endDate}</p>
            <p className="quantityAvailable mb-0">So cho con nhan : {tour.quantity}</p>
          </div>

          <div className="order-summary">
            <div className="summary-item">
              <span>Nguoi lon:</span>
              <div>
                <span className="quantity__adults">{adultCount}</span>
                <span> x </span>
                <span className="total-price">{formatCurrency(tour.priceAdult)}</span>
              </div>
            </div>
            <div className="summary-item">
              <span>Tre em:</span>
              <div>
                <span className="quantity__children">{childCount}</span>
                <span> x </span>
                <span className="total-price">{formatCurrency(tour.priceChild)}</span>
              </div>
            </div>
            <div className="summary-item">
              <span>Giam gia:</span>
              <div>
                <span className="total-price" style={{ color: "#2E7D32" }}>
                  -{formatCurrency(discountValue)}
                </span>
              </div>
            </div>
            <div className="summary-item total-price" style={{ marginTop: 8 }}>
              <span>Tong cong:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            <div className="summary-item" style={{ marginTop: 6 }}>
              <span>Dat coc:</span>
              <span>{formatCurrency(depositAmount)}</span>
            </div>
          </div>

          <div className="order-coupon">
            <input
              type="text"
              placeholder="Ma giam gia"
              style={{ width: "65%" }}
              value={voucherCode}
              onChange={(event) => setVoucherCode(event.target.value)}
            />
            <button type="button" style={{ width: "30%" }} className="booking-btn btn-coupon">
              Ap dung
            </button>
          </div>

          <div className="mb-3" style={{ background: "#FFF8F0", borderRadius: 12, padding: 16, fontSize: 14, color: "#7A4A00" }}>
            <div className="font-weight-bold mb-1">Thong tin se duoc gui kem khi dat tour</div>
            <div>User ID: {authUser?.userId ?? "Chua dang nhap"}</div>
            <div>Email: {email}</div>
            <div>Dia chi: {address}</div>
          </div>

          {submitMessage && (
            <div className="mb-3" style={{ borderRadius: 12, background: "#EEF7EE", color: "#2E7D32", padding: 14, fontSize: 14 }}>
              {submitMessage}
            </div>
          )}

          <button type="submit" className="booking-btn btn-submit-booking">
            Xac Nhan Dat Tour
          </button>

          <button type="button" className="booking-btn" style={{ marginTop: 12, background: "#fff", color: "#FF6B00", border: "1px solid #FF6B00" }}>
            Luu thong tin khach hang
          </button>
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
          <p className="text-muted mb-0">Dang tai thong tin tai khoan...</p>
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
                  <Link href="/">Trang chu</Link>
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
