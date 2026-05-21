"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getPaymentByTransactionId } from "../../../api/paymentApi";

// ── Polling helper ─────────────────────────────────────────────────────────────
const POLL_INTERVAL = 3000;
const MAX_POLLS = 20; // tối đa ~60s

async function fetchPaymentStatus(sessionId: string): Promise<"SUCCESS" | "PENDING" | "FAILED" | null> {
  try {
    const info = await getPaymentByTransactionId(sessionId);
    if (!info) return "PENDING";
    const s = info.status?.toUpperCase();
    if (s === "SUCCESS") return "SUCCESS";
    if (s === "FAILED") return "FAILED";
    return "PENDING";
  } catch {
    return null;
  }
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function StripeSuccessPage() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  const [state, setState] = useState<"loading" | "confirmed" | "pending" | "failed">("loading");
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      setState("confirmed");
      return;
    }

    let count = 0;
    const timer = setInterval(async () => {
      count++;
      setPollCount(count);
      const status = await fetchPaymentStatus(sessionId);

      if (status === "SUCCESS") {
        setState("confirmed");
        clearInterval(timer);
      } else if (status === "FAILED") {
        setState("failed");
        clearInterval(timer);
      } else if (count >= MAX_POLLS) {
        setState("pending");
        clearInterval(timer);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(timer);
  }, [sessionId]);

  return (
    <>
      <style>{css}</style>
      <div className="ps-page">
        <div className="ps-card">

          {/* ── Loading ── */}
          {state === "loading" && (
            <>
              <div className="ps-icon ps-icon--spin">⏳</div>
              <h1 className="ps-title">Đang xác nhận thanh toán…</h1>
              <p className="ps-sub">Stripe đang thông báo kết quả, vui lòng chờ ({pollCount * 3}s).</p>
              <div className="ps-progress">
                <div className="ps-progress__bar" style={{ width: `${Math.min(pollCount * 5, 95)}%` }} />
              </div>
            </>
          )}

          {/* ── Success ── */}
          {state === "confirmed" && (
            <>
              <div className="ps-icon ps-icon--success">✓</div>
              <h1 className="ps-title ps-title--green">Thanh toán thành công!</h1>
              <p className="ps-sub">
                Đơn đặt tour của bạn đã được xác nhận. Chúng tôi sẽ gửi email xác nhận
                và liên hệ xác nhận lịch trình trong vòng 24h.
              </p>

              {sessionId && (
                <div className="ps-info-row">
                  <span className="ps-info-label">Mã giao dịch Stripe</span>
                  <span className="ps-info-value">{sessionId}</span>
                </div>
              )}

              <div className="ps-actions">
                <Link href="/my-tours" className="ps-btn ps-btn--primary">
                  Xem đơn đặt tour của tôi
                </Link>
                <Link href="/" className="ps-btn ps-btn--ghost">
                  Về trang chủ
                </Link>
              </div>
            </>
          )}

          {/* ── Still Pending (timeout) ── */}
          {state === "pending" && (
            <>
              <div className="ps-icon ps-icon--warn">🕐</div>
              <h1 className="ps-title ps-title--warn">Đang xử lý…</h1>
              <p className="ps-sub">
                Giao dịch đang được xử lý. Vui lòng kiểm tra lại trong vài phút.
                Nếu Stripe đã trừ tiền, đơn hàng sẽ được xác nhận tự động.
              </p>
              <div className="ps-actions">
                <Link href="/my-tours" className="ps-btn ps-btn--primary">
                  Kiểm tra đơn của tôi
                </Link>
                <Link href="/" className="ps-btn ps-btn--ghost">Về trang chủ</Link>
              </div>
            </>
          )}

          {/* ── Failed ── */}
          {state === "failed" && (
            <>
              <div className="ps-icon ps-icon--error">✕</div>
              <h1 className="ps-title ps-title--red">Thanh toán thất bại</h1>
              <p className="ps-sub">
                Stripe thông báo giao dịch không thành công. Vui lòng thử lại hoặc chọn
                phương thức thanh toán khác.
              </p>
              <div className="ps-actions">
                <Link href="/booking" className="ps-btn ps-btn--primary">
                  Thử lại
                </Link>
                <Link href="/" className="ps-btn ps-btn--ghost">Về trang chủ</Link>
              </div>
            </>
          )}

          {/* ── Brand footer ── */}
          <div className="ps-brand">
            <span className="ps-brand__logo">✈</span>
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

  .ps-page {
    min-height: 100vh;
    background: #f4f6fb;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    font-family: 'Outfit', sans-serif;
  }

  .ps-card {
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 8px 40px rgba(0,0,0,.10);
    padding: 48px 40px 36px;
    max-width: 480px;
    width: 100%;
    text-align: center;
  }

  /* ── Icon ── */
  .ps-icon {
    width: 80px; height: 80px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 36px;
    margin: 0 auto 24px;
    background: #f4f6fb;
  }
  .ps-icon--success {
    background: #d1fae5;
    color: #16a34a;
    animation: pop .4s cubic-bezier(.34,1.56,.64,1) both;
  }
  .ps-icon--warn   { background: #fef9c3; color: #ca8a04; }
  .ps-icon--error  { background: #fee2e2; color: #dc2626; }
  .ps-icon--spin   { background: #eff6ff; color: #3b82f6; animation: spin 1.2s linear infinite; }

  /* ── Typography ── */
  .ps-title {
    font-size: 22px; font-weight: 800;
    color: #1a1a2e; margin: 0 0 10px;
  }
  .ps-title--green { color: #16a34a; }
  .ps-title--warn  { color: #b45309; }
  .ps-title--red   { color: #dc2626; }

  .ps-sub {
    font-size: 14px; color: #666;
    line-height: 1.6; margin: 0 0 24px;
  }

  /* ── Progress bar ── */
  .ps-progress {
    height: 6px; background: #e8eaf0; border-radius: 99px;
    overflow: hidden; margin-bottom: 20px;
  }
  .ps-progress__bar {
    height: 100%; background: #635BFF;
    border-radius: 99px;
    transition: width .8s ease;
  }

  /* ── Info row ── */
  .ps-info-row {
    display: flex; justify-content: space-between; align-items: center;
    background: #f8fafc; border-radius: 10px;
    padding: 12px 16px; margin-bottom: 24px;
    font-size: 13px;
  }
  .ps-info-label { color: #888; }
  .ps-info-value {
    font-weight: 600; color: #635BFF;
    font-size: 11px; word-break: break-all; text-align: right;
    max-width: 220px;
  }

  /* ── Buttons ── */
  .ps-actions {
    display: flex; flex-direction: column; gap: 10px;
    margin-bottom: 32px;
  }
  .ps-btn {
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 12px; padding: 13px 22px;
    font-weight: 700; font-size: 15px;
    font-family: 'Outfit', sans-serif;
    text-decoration: none !important;
    transition: all .18s; border: none; cursor: pointer;
  }
  .ps-btn--primary {
    background: #63AB45; color: #fff !important;
    box-shadow: 0 6px 18px rgba(99,171,69,.32);
  }
  .ps-btn--primary:hover { opacity: .9; transform: translateY(-1px); }
  .ps-btn--ghost {
    background: #fff; color: #555 !important;
    border: 1.5px solid #E0E0E0;
  }
  .ps-btn--ghost:hover { border-color: #63AB45; color: #4d8a34 !important; }

  /* ── Brand ── */
  .ps-brand {
    display: flex; align-items: center; justify-content: center;
    gap: 6px; font-size: 13px; color: #aaa;
    border-top: 1px solid #f0f0f0; padding-top: 20px;
  }
  .ps-brand__logo { color: #0057a8; font-size: 18px; }

  @keyframes pop {
    from { transform: scale(.5); opacity: 0; }
    to   { transform: scale(1);  opacity: 1; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;
