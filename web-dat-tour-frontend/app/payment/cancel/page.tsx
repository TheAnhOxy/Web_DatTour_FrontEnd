"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function StripePaymentCancelPage() {
  const params = useSearchParams();
  const bookingId = params.get("booking_id");

  return (
    <>
      <style>{css}</style>
      <div className="pc-page">
        <div className="pc-card">

          {/* ── Icon ── */}
          <div className="pc-icon">✕</div>

          {/* ── Copy ── */}
          <h1 className="pc-title">Thanh toán đã bị huỷ</h1>
          <p className="pc-sub">
            Bạn đã huỷ quá trình thanh toán qua Stripe. Đơn đặt tour vẫn đang được
            giữ chỗ — bạn có thể quay lại và thử thanh toán bất cứ lúc nào trước khi
            hết thời hạn.
          </p>

          {/* ── Notice box ── */}
          <div className="pc-notice">
            <span className="pc-notice__icon">ℹ</span>
            <span>
              Chỗ ngồi sẽ được giữ trong <strong>10 phút</strong> kể từ lúc đặt.
              Nếu hết thời hạn, đơn hàng sẽ tự động bị huỷ.
            </span>
          </div>

          {/* ── Actions ── */}
          <div className="pc-actions">
            {bookingId ? (
              <Link
                href={`/booking/checkout?bid=${bookingId}`}
                className="pc-btn pc-btn--primary"
              >
                Quay lại thanh toán
              </Link>
            ) : (
              <Link href="/tours" className="pc-btn pc-btn--primary">
                Tìm tour khác
              </Link>
            )}
            <Link href="/" className="pc-btn pc-btn--ghost">
              Về trang chủ
            </Link>
          </div>

          {/* ── Brand ── */}
          <div className="pc-brand">
            <span className="pc-brand__logo">✈</span>
            <span>HTravel</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

  .pc-page {
    min-height: 100vh;
    background: #f4f6fb;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    font-family: 'Outfit', sans-serif;
  }

  .pc-card {
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 8px 40px rgba(0,0,0,.10);
    padding: 48px 40px 36px;
    max-width: 460px;
    width: 100%;
    text-align: center;
  }

  .pc-icon {
    width: 80px; height: 80px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 34px;
    margin: 0 auto 24px;
    background: #fff4e5;
    color: #f59e0b;
    animation: pop .4s cubic-bezier(.34,1.56,.64,1) both;
  }

  .pc-title {
    font-size: 22px; font-weight: 800;
    color: #1a1a2e; margin: 0 0 10px;
  }

  .pc-sub {
    font-size: 14px; color: #666;
    line-height: 1.7; margin: 0 0 20px;
  }

  .pc-notice {
    display: flex; gap: 10px; align-items: flex-start;
    background: #eff6ff;
    border-left: 3px solid #3b82f6;
    border-radius: 0 10px 10px 0;
    padding: 12px 16px;
    font-size: 13px; color: #1e40af;
    text-align: left;
    margin-bottom: 28px;
    line-height: 1.5;
  }
  .pc-notice__icon {
    font-size: 15px; flex-shrink: 0; margin-top: 1px;
  }

  .pc-actions {
    display: flex; flex-direction: column; gap: 10px;
    margin-bottom: 32px;
  }

  .pc-btn {
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 12px; padding: 13px 22px;
    font-weight: 700; font-size: 15px;
    font-family: 'Outfit', sans-serif;
    text-decoration: none !important;
    transition: all .18s; border: none; cursor: pointer;
  }
  .pc-btn--primary {
    background: #63AB45; color: #fff !important;
    box-shadow: 0 6px 18px rgba(99,171,69,.28);
  }
  .pc-btn--primary:hover { opacity: .9; transform: translateY(-1px); }
  .pc-btn--ghost {
    background: #fff; color: #555 !important;
    border: 1.5px solid #E0E0E0;
  }
  .pc-btn--ghost:hover { border-color: #63AB45; color: #4d8a34 !important; }

  .pc-brand {
    display: flex; align-items: center; justify-content: center;
    gap: 6px; font-size: 13px; color: #aaa;
    border-top: 1px solid #f0f0f0; padding-top: 20px;
  }
  .pc-brand__logo { color: #0057a8; font-size: 18px; }

  @keyframes pop {
    from { transform: scale(.5); opacity: 0; }
    to   { transform: scale(1);  opacity: 1; }
  }
`;
