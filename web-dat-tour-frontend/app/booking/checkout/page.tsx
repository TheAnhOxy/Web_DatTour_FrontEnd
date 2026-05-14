"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const formatPrice = (value: number) => new Intl.NumberFormat("vi-VN").format(Math.max(0, Math.round(value))) + "đ";

type CheckoutPayload = {
  bookingCode?: string;
  tourTitle?: string;
  startDate?: string;
  cityName?: string;
  pickupName?: string;
  pickupAddress?: string;
  paymentMethod?: "bank" | "cash" | string;
  paymentRatio?: number;
  subtotalAmount?: number;
  totalDiscount?: number;
  totalAmount?: number;
  depositAmount?: number;
  numAdults?: number;
  numChildren?: number;
  numBabies?: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
  voucherCode?: string;
  appliedVouchers?: Array<{ code: string; value: number }>;
  passengers?: Array<{ fullName: string; ageGroup: string; gender: string; idCardNumber?: string }>;
};

const formatFullDate = (dateInput?: string) => {
  if (!dateInput) return "Chưa xác định";
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return "Chưa xác định";
  const days = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const dayName = days[d.getDay()];
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dayName}, ${dd}/${mm}/${yyyy}`;
};

export default function BookingCheckoutPage() {
  const [payload, setPayload] = useState<CheckoutPayload | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<"bank" | "momo" | "vnpay">("bank");
  const [promoInput, setPromoInput] = useState("");
  const [promoSelect, setPromoSelect] = useState("");

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem("htour.checkout");
      if (stored) {
        const parsed = JSON.parse(stored) as CheckoutPayload;
        setPayload(parsed);
        if (parsed.paymentMethod === "cash") {
          setSelectedPayment("bank");
        } else if (parsed.paymentMethod === "momo") {
          setSelectedPayment("momo");
        } else if (parsed.paymentMethod === "vnpay") {
          setSelectedPayment("vnpay");
        }
      }
    } catch (error) {
      console.warn("Không thể đọc thông tin checkout:", error);
    }
  }, []);

  const passengerSummary = useMemo(() => {
    if (!payload) return "Chưa có dữ liệu";
    const adults = payload.numAdults ?? 0;
    const children = payload.numChildren ?? 0;
    const babies = payload.numBabies ?? 0;
    return `${adults} NL${children ? ` · ${children} TE` : ""}${babies ? ` · ${babies} EB` : ""}`;
  }, [payload]);

  const appliedVouchers = payload?.appliedVouchers ?? [];
  const voucherOptions = appliedVouchers.length
    ? appliedVouchers.map((voucher) => ({ code: voucher.code, value: voucher.value }))
    : [
        { code: "GIAM50K", value: 50000 },
        { code: "GIAM100K", value: 100000 },
        { code: "GIAM150K", value: 150000 },
      ];

  return (
    <div className="checkout-shell">
      <style>{`
        :root {
          --ink-900: #1f2a37;
          --ink-700: #3f4b5b;
          --ink-500: #667085;
          --sunset-500: #ff6b00;
          --sunset-300: #ffb074;
          --sea-500: #1c7ed6;
          --mint-500: #12b886;
          --paper: #f8f6f2;
          --card: #ffffff;
          --border-soft: #e9e2d7;
          --shadow-soft: 0 24px 70px rgba(31, 42, 55, 0.08);
          --font-display: "Playfair Display", "Times New Roman", serif;
          --font-body: "Poppins", "Noto Sans", sans-serif;
        }
        .checkout-shell {
          min-height: 100vh;
          background: radial-gradient(circle at top left, #fff4ea 0%, #fffaf4 40%, #f3f6fb 100%);
          font-family: var(--font-body);
          color: var(--ink-900);
          padding: 60px 0 90px;
        }
        .checkout-container {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .checkout-hero {
          background: linear-gradient(120deg, #fff7ef 0%, #ffe2c9 45%, #ffd3aa 100%);
          border-radius: 28px;
          padding: 36px 38px;
          display: flex;
          justify-content: space-between;
          gap: 28px;
          align-items: center;
          box-shadow: var(--shadow-soft);
          border: 1px solid #ffe5cc;
          margin-bottom: 32px;
        }
        .checkout-hero h1 {
          font-family: var(--font-display);
          font-size: 2.2rem;
          margin: 0 0 10px;
          color: var(--ink-900);
        }
        .checkout-hero p {
          margin: 0;
          color: var(--ink-700);
          max-width: 520px;
        }
        .hero-badge {
          background: #fff;
          border-radius: 16px;
          padding: 16px 20px;
          border: 1px dashed var(--sunset-300);
          text-align: center;
          min-width: 220px;
        }
        .hero-badge span {
          display: block;
          font-size: 12px;
          color: var(--ink-500);
        }
        .hero-badge strong {
          font-size: 20px;
          color: var(--sunset-500);
          letter-spacing: 2px;
        }
        .grid-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
          gap: 28px;
        }
        .card {
          background: var(--card);
          border-radius: 22px;
          padding: 24px;
          border: 1px solid var(--border-soft);
          box-shadow: var(--shadow-soft);
        }
        .card-title {
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 16px;
        }
        .section-title {
          font-weight: 700;
          font-size: 1.05rem;
          margin-bottom: 12px;
          color: var(--ink-900);
        }
        .list-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
          font-size: 0.95rem;
        }
        .list-row strong {
          color: var(--ink-900);
        }
        .muted {
          color: var(--ink-500);
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #f1fdf8;
          color: var(--mint-500);
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .voucher-stack {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }
        .voucher-item {
          background: #e8f5e9;
          color: #1b5e20;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .price-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #f0e6d8;
          font-weight: 700;
          font-size: 1.2rem;
          color: #d32f2f;
        }
        .pay-method {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid #d9e8ff;
          background: #f3f8ff;
          margin-top: 12px;
          font-weight: 600;
          color: var(--sea-500);
        }
        .payment-option-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 16px;
          border: 1px solid #ede1d2;
          background: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .payment-option-card:hover {
          border-color: #ffb074;
          box-shadow: 0 10px 26px rgba(255, 107, 0, 0.14);
          transform: translateY(-2px);
        }
        .payment-option-card.active {
          border-color: #ff6b00;
          background: #fff4ea;
        }
        .payment-logo {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: #fff7ef;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .payment-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .select-control {
          width: 100%;
          border-radius: 12px;
          border: 1px solid #eadfce;
          padding: 10px 12px;
          font-weight: 600;
          background: #fff;
        }
        .select-control:focus {
          outline: none;
          border-color: #ff6b00;
          box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.15);
        }
        .policy-list {
          display: grid;
          gap: 10px;
          font-size: 0.9rem;
          color: var(--ink-700);
        }
        .policy-item {
          display: flex;
          gap: 10px;
        }
        .policy-item span {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff0e4;
          color: var(--sunset-500);
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .cta-group {
          display: grid;
          gap: 10px;
          margin-top: 18px;
        }
        .cta-primary {
          border: none;
          background: linear-gradient(135deg, #ff6b00, #ff8f34);
          color: white;
          border-radius: 14px;
          padding: 14px 16px;
          font-weight: 700;
          text-align: center;
          box-shadow: 0 12px 28px rgba(255, 107, 0, 0.28);
        }
        .cta-secondary {
          border: 1px solid #ffd2ac;
          background: #fffaf5;
          color: #c95b00;
          border-radius: 14px;
          padding: 12px 16px;
          font-weight: 600;
          text-align: center;
        }
        .passenger-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        .passenger-table th,
        .passenger-table td {
          padding: 10px 6px;
          border-bottom: 1px solid #f0e6d8;
          text-align: left;
        }
        .passenger-table th {
          color: var(--ink-500);
          font-weight: 600;
        }
        @media (max-width: 960px) {
          .checkout-hero {
            flex-direction: column;
            align-items: flex-start;
          }
          .grid-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="checkout-container">
        <div className="checkout-hero">
          <div>
            <h1>Thanh toán tour đã đặt</h1>
            <p>Hoàn thiện thanh toán, kiểm tra thông tin người dùng, voucher và chính sách trước khi xác nhận.</p>
          </div>
          <div className="hero-badge">
            <span>Mã đặt chỗ</span>
            <strong>{payload?.bookingCode ?? "—"}</strong>
          </div>
        </div>

        {!payload ? (
          <div className="card" style={{ textAlign: "center" }}>
            <h2 className="card-title" style={{ justifyContent: "center" }}>
              <span>!</span> Chưa có dữ liệu thanh toán
            </h2>
            <p className="muted">Vui lòng quay lại trang booking để tiếp tục quy trình đặt tour.</p>
            <div className="cta-group" style={{ maxWidth: 320, margin: "18px auto 0" }}>
              <Link href="/booking" className="cta-primary">
                Quay lại Booking
              </Link>
              <Link href="/" className="cta-secondary">
                Về trang chủ
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid-layout">
            <div style={{ display: "grid", gap: 24 }}>
              <div className="card">
                <div className="card-title">Tổng quan chuyến đi</div>
                <div className="list-row">
                  <span className="muted">Tour</span>
                  <strong>{payload.tourTitle ?? "Chưa có"}</strong>
                </div>
                <div className="list-row">
                  <span className="muted">Ngày khởi hành</span>
                  <strong>{formatFullDate(payload.startDate)}</strong>
                </div>
                <div className="list-row">
                  <span className="muted">Hành khách</span>
                  <strong>{passengerSummary}</strong>
                </div>
                <div className="list-row">
                  <span className="muted">Điểm đến</span>
                  <strong>{payload.cityName ?? "Chưa có"}</strong>
                </div>
                {(payload.pickupName || payload.pickupAddress) && (
                  <div className="list-row">
                    <span className="muted">Điểm đón</span>
                    <strong>{payload.pickupName ?? ""} {payload.pickupAddress ? `- ${payload.pickupAddress}` : ""}</strong>
                  </div>
                )}
              </div>

              <div className="card">
                <div className="card-title">Thông tin hành khách</div>
                {payload.passengers && payload.passengers.length > 0 ? (
                  <table className="passenger-table">
                    <thead>
                      <tr>
                        <th>Họ tên</th>
                        <th>Đối tượng</th>
                        <th>Giới tính</th>
                        <th>CCCD/CMND</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payload.passengers.map((p, index) => (
                        <tr key={`${p.fullName}-${index}`}>
                          <td>{p.fullName}</td>
                          <td>{p.ageGroup === "ADULT" ? "Người lớn" : p.ageGroup === "CHILD_10_14" ? "Trẻ em" : p.ageGroup === "CHILD_4_9" ? "Trẻ em" : "Em bé"}</td>
                          <td>{p.gender === "MALE" ? "Nam" : "Nữ"}</td>
                          <td>{p.idCardNumber || "Không áp dụng"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="muted">Chưa có dữ liệu hành khách.</p>
                )}
              </div>

              <div className="card">
                <div className="card-title">Thông tin người đặt</div>
                <div className="list-row">
                  <span className="muted">Họ tên</span>
                  <strong>{payload.contactName ?? "Chưa có"}</strong>
                </div>
                <div className="list-row">
                  <span className="muted">Điện thoại</span>
                  <strong>{payload.contactPhone ?? "Chưa có"}</strong>
                </div>
                <div className="list-row">
                  <span className="muted">Email</span>
                  <strong>{payload.contactEmail ?? "Chưa có"}</strong>
                </div>
                <div className="list-row" style={{ alignItems: "flex-start" }}>
                  <span className="muted">Địa chỉ</span>
                  <strong style={{ textAlign: "right" }}>{payload.contactAddress ?? "Chưa có"}</strong>
                </div>
                <div className="pill" style={{ marginTop: 12 }}>
                  {payload.paymentRatio === 50 ? "Thanh toán 50%" : "Thanh toán 100%"}
                </div>
              </div>

              <div className="card">
                <div className="card-title">Promotion & Voucher</div>
                <div className="list-row">
                  <span className="muted">Mã khuyến mãi</span>
                  <strong>{payload.voucherCode || "Không áp dụng"}</strong>
                </div>
                <div className="list-row">
                  <span className="muted">Giảm giá</span>
                  <strong>{formatPrice(payload.totalDiscount ?? 0)}</strong>
                </div>
                <div className="voucher-stack" style={{ marginTop: 12 }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập mã giảm giá"
                    value={promoInput}
                    onChange={(event) => setPromoInput(event.target.value)}
                  />
                  <button className="cta-secondary" type="button">
                    Áp dụng
                  </button>
                </div>
                <div style={{ marginTop: 12 }}>
                  <select
                    className="select-control"
                    value={promoSelect}
                    onChange={(event) => setPromoSelect(event.target.value)}
                  >
                    <option value="">Chọn voucher có sẵn</option>
                    {voucherOptions.map((voucher) => (
                      <option key={voucher.code} value={voucher.code}>
                        {voucher.code} (-{formatPrice(voucher.value)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Chính sách & lưu ý</div>
                <div className="policy-list">
                  <div className="policy-item"><span>✓</span> Giữ chỗ trong 10 phút sau khi xác nhận.</div>
                  <div className="policy-item"><span>✓</span> Vui lòng mang giấy tờ tùy thân khi khởi hành.</div>
                  <div className="policy-item"><span>✓</span> Có thể đổi tên hành khách trước 48 giờ.</div>
                  <div className="policy-item"><span>✓</span> Hủy tour trước 7 ngày được hoàn tiền theo quy định.</div>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gap: 24 }}>
              <div className="card">
                <div className="card-title">Thanh toán</div>
                <div className="list-row">
                  <span className="muted">Tạm tính</span>
                  <strong>{formatPrice(payload.subtotalAmount ?? payload.totalAmount ?? 0)}</strong>
                </div>
                <div className="list-row">
                  <span className="muted">Giảm giá</span>
                  <strong>-{formatPrice(payload.totalDiscount ?? 0)}</strong>
                </div>
                <div className="price-total">
                  <span>Cần thanh toán</span>
                  <span>{formatPrice(payload.depositAmount ?? payload.totalAmount ?? 0)}</span>
                </div>

                <div className="section-title" style={{ marginTop: 16 }}>Chọn hình thức thanh toán</div>
                <select
                  className="select-control"
                  value={selectedPayment}
                  onChange={(event) => setSelectedPayment(event.target.value as "bank" | "momo" | "vnpay")}
                >
                  <option value="bank">Chuyển khoản ngân hàng</option>
                  <option value="momo">Ví MoMo</option>
                  <option value="vnpay">VNPay</option>
                </select>
                <div className="pay-method" style={{ marginTop: 12 }}>
                  {selectedPayment === "bank" && (
                    <>
                      <img src="/clients/assets/images/contact/icon.png" alt="Ngân hàng" style={{ width: 28, height: 28 }} />
                      Chuyển khoản ngân hàng
                    </>
                  )}
                  {selectedPayment === "momo" && (
                    <>
                      <img src="/clients/assets/images/booking/icon-thanh-toan-momo.png" alt="MoMo" style={{ width: 28, height: 28 }} />
                      Ví MoMo
                    </>
                  )}
                  {selectedPayment === "vnpay" && (
                    <>
                      <i className="fas fa-credit-card" style={{ color: "#1c7ed6", fontSize: 20 }} />
                      VNPay
                    </>
                  )}
                </div>

                <div className="cta-group">
                  <Link href="/transaction" className="cta-primary">
                    Tiến hành thanh toán
                  </Link>
                  <Link href={payload.bookingCode ? `/booking/${payload.bookingCode}` : "/booking"} className="cta-secondary">
                    Xem lại đơn đặt
                  </Link>
                  <Link href="/" className="cta-secondary">
                    Về trang chủ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
