"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cancelBooking, getBookingByCode, type BookingResponse } from "../../../api/bookingApi";
import { confirmOfficeReservation, getPaymentByBookingId, initiatePayment } from "../../../api/paymentApi";
import {
  OFFICE_HOURS_AFTER_BOOKING,
  formatDueMs,
  officePaymentDueMs,
} from "../../../lib/officePaymentSchedule";

const PAYMENT_HOLD_MINUTES = 10;
const PAYMENT_HOLD_MS = PAYMENT_HOLD_MINUTES * 60 * 1000;

const CANCELLED_STATUSES = new Set(["CANCELLED", "CANCELLED_TIMEOUT"]);

// ─────────────────────────────────────────────────────────────────────────────
// Bank transfer config (map với sepay config ở backend)
// ─────────────────────────────────────────────────────────────────────────────
const BANK_CODE    = process.env.NEXT_PUBLIC_BANK_CODE    ?? "ICB";
const BANK_ACCOUNT = process.env.NEXT_PUBLIC_BANK_ACCOUNT ?? "109876820087";
const BANK_NAME    = process.env.NEXT_PUBLIC_BANK_NAME    ?? "VietinBank";
const BANK_HOLDER  = process.env.NEXT_PUBLIC_BANK_HOLDER  ?? "NGUYEN DUC HAU";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type PaymentMethod = "bank" | "stripe" | "cash";
type FlowState = "idle" | "checking" | "success" | "expired" | "error" | "redirecting" | "recovering";

interface CheckoutPayload {
  bookingId?: number;
  bookingCode?: string;
  tourTitle?: string;
  startDate?: string;
  cityName?: string;
  pickupName?: string;
  pickupAddress?: string;
  paymentMethod?: string;
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
  appliedVouchers?: { code: string; value: number }[];
  passengers?: { fullName: string; ageGroup: string; gender: string; idCardNumber?: string }[];
  createdAt?: string;
  expiresAt?: number; // ms — deadline đang hiển thị
  officeExpiresAt?: number; // ms — hạn 48h quầy (sau xác nhận)
  bookingStatus?: string;
}

interface State {
  payload: CheckoutPayload | null;
  method: PaymentMethod;
  flow: FlowState;
  secsLeft: number;
  copiedKey: string | null;
  promoInput: string;
  errorMsg: string;
  bookingStatus: string | null;
  cashPaymentReady: boolean;
  cashInitError: string;
}

type Action =
  | { type: "INIT"; payload: CheckoutPayload }
  | { type: "SET_METHOD"; method: PaymentMethod }
  | { type: "SET_FLOW"; flow: FlowState; errorMsg?: string }
  | { type: "TICK"; secsLeft: number }
  | { type: "COPIED"; key: string }
  | { type: "CLEAR_COPY" }
  | { type: "SET_PROMO"; value: string }
  | { type: "BOOKING_STATUS"; status: string }
  | { type: "CASH_PAYMENT_READY" }
  | { type: "CASH_PAYMENT_ERROR"; message: string }
  | { type: "CASH_PAYMENT_RETRY" }
  | { type: "OFFICE_RESERVED"; paymentDueAt: string };

/** Online (bank/stripe): 10 phút. Quầy: 10 phút trước xác nhận, 48h sau xác nhận. */
function getExpiresAtMs(
  payload: CheckoutPayload | null,
  method: PaymentMethod,
  cashPaymentReady: boolean,
): number {
  const createdMs = payload?.createdAt
    ? new Date(payload.createdAt).getTime()
    : Date.now();
  const tenMinHold = createdMs + PAYMENT_HOLD_MS;

  if (method === "bank" || method === "stripe") {
    return tenMinHold;
  }
  if (cashPaymentReady) {
    return payload?.officeExpiresAt ?? payload?.expiresAt ?? tenMinHold;
  }
  return tenMinHold;
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "INIT": {
      const m = a.payload.paymentMethod === "cash" ? "cash" : a.payload.paymentMethod === "stripe" ? "stripe" : "bank";
      const createdMs = a.payload.createdAt ? new Date(a.payload.createdAt).getTime() : Date.now();
      const longHold = (a.payload.expiresAt ?? 0) > createdMs + 20 * 60 * 1000;
      const cashReady = m === "cash" && longHold;
      const payload: CheckoutPayload = {
        ...a.payload,
        officeExpiresAt: cashReady ? a.payload.expiresAt : a.payload.officeExpiresAt,
      };
      const expiresAt = getExpiresAtMs(payload, m as PaymentMethod, cashReady);
      const secs = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      const expired = Date.now() >= expiresAt;
      return {
        ...s,
        payload: { ...payload, expiresAt },
        method: m as PaymentMethod,
        cashPaymentReady: cashReady,
        secsLeft: secs,
        flow: expired ? "expired" : s.flow,
      };
    }
    case "SET_METHOD": {
      const leavingBank = a.method !== "bank" && s.flow === "checking";
      const cashReady = a.method === "cash" && s.cashPaymentReady;
      const expiresAt = getExpiresAtMs(s.payload, a.method, cashReady);
      const secsLeft = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      return {
        ...s,
        method: a.method,
        flow: leavingBank ? "idle" : s.flow,
        cashPaymentReady: s.cashPaymentReady,
        cashInitError: a.method === "cash" ? s.cashInitError : "",
        secsLeft,
        payload: s.payload ? { ...s.payload, expiresAt } : s.payload,
      };
    }
    case "CASH_PAYMENT_READY":
      return { ...s, cashPaymentReady: true, cashInitError: "" };
    case "CASH_PAYMENT_ERROR":
      return { ...s, cashPaymentReady: false, cashInitError: a.message };
    case "CASH_PAYMENT_RETRY":
      return { ...s, cashPaymentReady: false, cashInitError: "" };
    case "OFFICE_RESERVED": {
      const dueMs = new Date(a.paymentDueAt).getTime();
      const secsLeft = Math.max(0, Math.round((dueMs - Date.now()) / 1000));
      return {
        ...s,
        cashPaymentReady: true,
        cashInitError: "",
        payload: s.payload
          ? { ...s.payload, expiresAt: dueMs, officeExpiresAt: dueMs, paymentMethod: "cash" }
          : s.payload,
        secsLeft,
      };
    }
    case "SET_FLOW":      return { ...s, flow: a.flow, errorMsg: a.errorMsg ?? "" };
    case "TICK":          return { ...s, secsLeft: a.secsLeft };
    case "COPIED":        return { ...s, copiedKey: a.key };
    case "CLEAR_COPY":    return { ...s, copiedKey: null };
    case "SET_PROMO":     return { ...s, promoInput: a.value };
    case "BOOKING_STATUS":return { ...s, bookingStatus: a.status };
    default:              return s;
  }
}

const init: State = {
  payload: null, method: "bank", flow: "idle",
  secsLeft: 600, copiedKey: null, promoInput: "", errorMsg: "", bookingStatus: null,
  cashPaymentReady: false, cashInitError: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.max(0, Math.round(n))) + "đ";

const fmtDate = (s?: string) => {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "—";
  const dn = ["CN","T2","T3","T4","T5","T6","T7"][d.getDay()];
  return `${dn}, ${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
};

/** Đếm ngược: dưới 1 giờ → MM:SS; từ 1 giờ trở lên → HH:MM:SS */
const fmtCountdown = (totalSec: number) => {
  if (totalSec <= 0) return "00:00";
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const ageLabel = (ag: string) =>
  ag === "ADULT" ? "Người lớn" : ag.startsWith("CHILD") ? "Trẻ em" : "Em bé";

const vietQrUrl = (amount: number, info: string) =>
  `https://img.vietqr.io/image/${BANK_CODE}-${BANK_ACCOUNT}-compact2.png` +
  `?amount=${Math.round(amount)}&addInfo=${encodeURIComponent(info)}&accountName=${encodeURIComponent(BANK_HOLDER)}`;

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function BookingCheckoutPage() {
  const [s, dispatch] = useReducer(reducer, init);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const searchParams = useSearchParams();

  // ── Load from sessionStorage — fallback sang URL ?code= nếu trống ────────

  useEffect(() => {
    const load = async () => {
      // 1. Thử sessionStorage trước
      try {
        const raw = window.sessionStorage.getItem("htour.checkout");
        if (raw) {
          const stored = JSON.parse(raw) as CheckoutPayload;
          dispatch({ type: "INIT", payload: stored });
          if (stored.bookingCode && CANCELLED_STATUSES.has(stored.bookingStatus ?? "")) {
            dispatch({ type: "SET_FLOW", flow: "expired" });
          }
          return;
        }
      } catch { /* ignore */ }

      // 2. sessionStorage trống → đọc ?code= từ URL
      const code = searchParams?.get("code");
      if (!code) return; // không có gì để phục hồi

      dispatch({ type: "SET_FLOW", flow: "recovering" });
      try {
        const res = await getBookingByCode(code) as { data?: BookingResponse };
        const booking = res?.data;
        if (!booking) return;

        if (CANCELLED_STATUSES.has(booking.status ?? "")) {
          const cancelled: CheckoutPayload = {
            bookingCode: booking.bookingCode ?? code,
            bookingStatus: booking.status,
          };
          dispatch({ type: "INIT", payload: cancelled });
          dispatch({ type: "SET_FLOW", flow: "expired" });
          return;
        }

        const createdMs = booking.createdAt ? new Date(booking.createdAt).getTime() : Date.now();
        const isOffice = booking.paymentMethod === "CASH_OFFICE";
        const officeDueMs = isOffice && booking.paymentDueAt
          ? new Date(booking.paymentDueAt).getTime()
          : null;
        const expiresAt = officeDueMs != null && officeDueMs > Date.now()
          ? officeDueMs
          : createdMs + PAYMENT_HOLD_MS;

        // Dựng lại payload tối thiểu từ dữ liệu booking API
        const partial: CheckoutPayload = {
          bookingId:    booking.bookingId,
          bookingCode:  booking.bookingCode ?? code,
          tourTitle:    booking.tourTitle,
          startDate:    booking.startDate,
          cityName:     booking.cityName,
          totalAmount:  booking.totalAmount ? Number(booking.totalAmount) : undefined,
          depositAmount:booking.totalAmount ? Number(booking.totalAmount) : undefined,
          paymentMethod: isOffice ? "cash" : "bank",
          createdAt: booking.createdAt,
          expiresAt,
          bookingStatus: booking.status,
          passengers:   booking.passengers?.map(p => ({
            fullName:    p.fullName,
            ageGroup:    p.ageGroup as string,
            gender:      p.gender as string,
            idCardNumber:p.idCardNumber,
          })),
        };
        // Lưu lại sessionStorage để tránh re-fetch khi reload
        try { window.sessionStorage.setItem("htour.checkout", JSON.stringify(partial)); } catch { /* ignore */ }
        dispatch({ type: "INIT", payload: partial });
        if (isOffice && booking.paymentDueAt) {
          dispatch({ type: "OFFICE_RESERVED", paymentDueAt: booking.paymentDueAt });
        }
      } catch {
        dispatch({ type: "SET_FLOW", flow: "idle" }); // hiện empty state nếu API thất bại
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Countdown timer ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!s.payload || s.flow === "success" || s.flow === "expired") return;

    const tick = () => {
      const remaining = s.payload?.expiresAt
        ? Math.max(0, Math.round((s.payload.expiresAt - Date.now()) / 1000))
        : Math.max(0, s.secsLeft - 1);

      dispatch({ type: "TICK", secsLeft: remaining });

      if (remaining === 0 && s.flow !== "redirecting" && s.flow !== "recovering") {
        dispatch({ type: "SET_FLOW", flow: "expired" });
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.payload, s.flow]);

  // ── Hết giờ: dừng poll + yêu cầu hủy booking (best-effort, BE scheduler vẫn chạy) ──
  useEffect(() => {
    if (s.flow !== "expired" || !s.payload?.bookingCode) return;
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    cancelBooking({
      bookingCode: s.payload.bookingCode,
      reason: `Quá thời gian thanh toán ${PAYMENT_HOLD_MINUTES} phút`,
    }).catch(() => { /* BE scheduler có thể đã hủy */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.flow, s.payload?.bookingCode]);

  // ── Auto-poll CHỈ cho chuyển khoản (SePay webhook tự xác nhận) ───────────

  useEffect(() => {
    if (!s.payload?.bookingCode || s.flow === "success" || s.flow === "expired") return;

    if (s.method !== "bank") {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    if (pollRef.current) return;

    dispatch({ type: "SET_FLOW", flow: "checking" });

    const code = s.payload.bookingCode;
    pollRef.current = setInterval(async () => {
      try {
        const res = await getBookingByCode(code) as { status?: number; data?: { status?: string } };
        const bookingStatus = (res?.data as { status?: string })?.status ?? "";
        dispatch({ type: "BOOKING_STATUS", status: bookingStatus });

        if (bookingStatus === "CONFIRMED" || bookingStatus === "SUCCESS") {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          dispatch({ type: "SET_FLOW", flow: "success" });
        } else if (CANCELLED_STATUSES.has(bookingStatus)) {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          dispatch({ type: "SET_FLOW", flow: "expired" });
        }
      } catch { /* bỏ qua lỗi mạng, thử lại lần sau */ }
    }, 5000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.payload?.bookingCode, s.method]);

  // ── Poll nhẹ sau khi đã xác nhận tại quầy (chờ nhân viên thu tiền & xác nhận) ──
  const officePollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!s.cashPaymentReady || s.method !== "cash" || !s.payload?.bookingCode) return;
    if (officePollRef.current) return;

    const code = s.payload.bookingCode;
    officePollRef.current = setInterval(async () => {
      try {
        const res = await getBookingByCode(code) as { data?: { status?: string } };
        const status = res?.data?.status ?? "";
        if (status === "CONFIRMED" || status === "SUCCESS") {
          if (officePollRef.current) clearInterval(officePollRef.current);
          officePollRef.current = null;
          dispatch({ type: "SET_FLOW", flow: "success" });
        }
      } catch { /* ignore */ }
    }, 15000);

    return () => {
      if (officePollRef.current) {
        clearInterval(officePollRef.current);
        officePollRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.cashPaymentReady, s.method, s.payload?.bookingCode]);

  useEffect(() => () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (officePollRef.current) { clearInterval(officePollRef.current); officePollRef.current = null; }
  }, []);

  // ── SePay: khởi tạo payment khi chọn chuyển khoản ─────────────────────────
  useEffect(() => {
    const bookingId = s.payload?.bookingId;
    if (!bookingId || s.flow === "success" || s.flow === "expired" || s.method !== "bank") return;

    const payAmount = s.payload?.depositAmount ?? s.payload?.totalAmount;
    initiatePayment({
      bookingId,
      gateway: "SEPAY",
      bookingCode: s.payload?.bookingCode,
      amount: payAmount,
    }).catch(() => { /* bỏ qua lỗi, QR vẫn hiển thị */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.method, s.payload?.bookingId]);

  // ── Copy to clipboard ────────────────────────────────────────────────────

  const copy = useCallback((key: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      dispatch({ type: "COPIED", key });
      setTimeout(() => dispatch({ type: "CLEAR_COPY" }), 2000);
    });
  }, []);

  // ── Stripe: lấy paymentUrl rồi redirect ──────────────────────────────────

  const handleStripePayment = useCallback(async () => {
    const bookingId = s.payload?.bookingId;
    const bookingCode = s.payload?.bookingCode;
    const payAmount = s.payload?.depositAmount ?? s.payload?.totalAmount;
    if (!bookingId) {
      dispatch({ type: "SET_FLOW", flow: "error", errorMsg: "Không tìm thấy mã đặt chỗ. Vui lòng thử lại." });
      return;
    }

    dispatch({ type: "SET_FLOW", flow: "redirecting" });

    const isStripeReady = (info: Awaited<ReturnType<typeof getPaymentByBookingId>>) =>
      info?.gateway === "STRIPE" && !!info.paymentUrl && info.paymentUrl.includes("checkout.stripe.com");

    // Bước 1: Yêu cầu backend tạo/thay payment với gateway STRIPE
    let paymentInfo = await initiatePayment({
      bookingId,
      gateway: "STRIPE",
      bookingCode,
      amount: payAmount,
    });

    // Bước 2: Nếu initiate thất bại, fallback poll tối đa 5 lần (chỉ chấp nhận URL Stripe)
    if (!isStripeReady(paymentInfo)) {
      for (let i = 0; i < 5; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        paymentInfo = await getPaymentByBookingId(bookingId);
        if (isStripeReady(paymentInfo)) break;
      }
    }

    if (!isStripeReady(paymentInfo) || !paymentInfo?.paymentUrl) {
      dispatch({ type: "SET_FLOW", flow: "error", errorMsg: "Chưa tạo được link thanh toán Stripe. Vui lòng thử lại." });
      return;
    }

    // Redirect sang Stripe Checkout
    window.location.href = paymentInfo.paymentUrl;
  }, [s.payload?.bookingId, s.payload?.bookingCode, s.payload?.depositAmount, s.payload?.totalAmount]);

  // ── Thanh toán tại quầy: xác nhận đặt chỗ + gửi email (24h) ───────────────
  const [officeSubmitting, setOfficeSubmitting] = useState(false);

  const handleConfirmOfficeReservation = useCallback(async () => {
    const bookingId = s.payload?.bookingId;
    const bookingCode = s.payload?.bookingCode;
    const payAmount = s.payload?.depositAmount ?? s.payload?.totalAmount;
    if (!bookingId || !bookingCode) {
      dispatch({ type: "CASH_PAYMENT_ERROR", message: "Thiếu thông tin đặt chỗ." });
      return;
    }
    if (!s.payload?.contactEmail) {
      dispatch({ type: "CASH_PAYMENT_ERROR", message: "Thiếu email liên hệ để gửi hướng dẫn thanh toán." });
      return;
    }
    if (officeSubmitting) return;
    setOfficeSubmitting(true);

    const result = await confirmOfficeReservation({
      bookingId,
      bookingCode,
      amount: payAmount,
      contactEmail: s.payload.contactEmail,
      contactName: s.payload.contactName,
      tourTitle: s.payload.tourTitle,
      startDate: s.payload.startDate,
      bookedAt: s.payload.createdAt,
    });

    setOfficeSubmitting(false);

    if (result?.paymentDueAt) {
      dispatch({ type: "OFFICE_RESERVED", paymentDueAt: result.paymentDueAt });
      try {
        const dueMs = new Date(result.paymentDueAt).getTime();
        const updated = {
          ...s.payload,
          expiresAt: dueMs,
          officeExpiresAt: dueMs,
          paymentMethod: "cash" as const,
        };
        window.sessionStorage.setItem("htour.checkout", JSON.stringify(updated));
      } catch { /* ignore */ }
    } else {
      dispatch({
        type: "CASH_PAYMENT_ERROR",
        message: "Không xác nhận được đặt chỗ tại quầy. Vui lòng thử lại.",
      });
    }
  }, [s.payload, officeSubmitting]);

  // ── Derived ──────────────────────────────────────────────────────────────

  const p = s.payload;
  const amount = p?.depositAmount ?? p?.totalAmount ?? 0;
  const isOfficeHold = s.method === "cash" && s.cashPaymentReady;
  const isUrgent = isOfficeHold
    ? s.secsLeft > 0 && s.secsLeft <= 2 * 3600
    : s.secsLeft > 0 && s.secsLeft <= 120;
  const isWarning = isOfficeHold
    ? s.secsLeft > 2 * 3600 && s.secsLeft <= 24 * 3600
    : s.secsLeft > 120 && s.secsLeft <= 300;
  const timerColor = s.secsLeft === 0 ? "#ccc" : isUrgent ? "#D32F2F" : isWarning ? "#F7921E" : "#63AB45";

  const passengerLine = useMemo(() => {
    if (!p) return "";
    const parts: string[] = [];
    if (p.numAdults) parts.push(`${p.numAdults} NL`);
    if (p.numChildren) parts.push(`${p.numChildren} TE`);
    if (p.numBabies) parts.push(`${p.numBabies} EB`);
    return parts.join(" · ") || "—";
  }, [p]);

  const officeDueLabel = useMemo(() => {
    if (p?.expiresAt && s.cashPaymentReady) return formatDueMs(p.expiresAt);
    if (p?.createdAt) return formatDueMs(officePaymentDueMs(new Date(p.createdAt).getTime()));
    return null;
  }, [p?.expiresAt, p?.createdAt, s.cashPaymentReady]);

  const officeWindowExpired = useMemo(() => {
    if (!p?.createdAt || s.cashPaymentReady) return false;
    return officePaymentDueMs(new Date(p.createdAt).getTime()) <= Date.now();
  }, [p?.createdAt, s.cashPaymentReady]);

  // ────────────────────────────────────────────────────────────────────────
  // Recovering state (đang dựng lại từ URL ?code=)
  // ────────────────────────────────────────────────────────────────────────

  if (!p && s.flow === "recovering") {
    return (
      <div style={shell}>
        <style>{CSS}</style>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "120px 24px", textAlign: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", margin: "0 auto 24px",
            border: "4px solid #E8F5E2", borderTopColor: "#63AB45",
            animation: "spin .8s linear infinite",
          }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1C231F", margin: "0 0 10px" }}>
            Đang khôi phục đơn đặt chỗ...
          </h2>
          <p style={{ color: "#888", fontSize: 14, margin: 0 }}>
            Phiên làm việc đã hết — đang tải lại thông tin từ mã đặt chỗ trong URL.
          </p>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // Empty state
  // ────────────────────────────────────────────────────────────────────────

  if (!p) {
    return (
      <div style={shell}>
        <style>{CSS}</style>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "100px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 72, marginBottom: 20 }}>🗺️</div>
          <h2 style={{ fontSize: "1.7rem", fontWeight: 800, color: "#1C231F", margin: "0 0 12px" }}>
            Chưa có thông tin thanh toán
          </h2>
          <p style={{ color: "#666", lineHeight: 1.75, margin: "0 0 36px", fontSize: 15 }}>
            Vui lòng chọn một tour và hoàn tất đặt chỗ để tiến hành thanh toán.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 300, margin: "0 auto" }}>
            <Link href="/tours" className="co-btn-primary">
              <i className="fas fa-compass" style={{ marginRight: 8 }} /> Khám phá tours
            </Link>
            <Link href="/" className="co-btn-ghost">
              <i className="fas fa-home" style={{ marginRight: 8 }} /> Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // Success state
  // ────────────────────────────────────────────────────────────────────────

  if (s.flow === "success") {
    return (
      <div style={shell}>
        <style>{CSS}</style>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <div style={{
            width: 96, height: 96, borderRadius: "50%",
            background: "#63AB45",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px",
            boxShadow: "0 12px 36px rgba(99,171,69,.4)",
            animation: "pop .5s cubic-bezier(.34,1.56,.64,1)",
          }}>
            <i className="fas fa-check" style={{ color: "#fff", fontSize: 40 }} />
          </div>
          <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#1C231F", margin: "0 0 12px" }}>
            Thanh toán thành công! 🎉
          </h2>
          <p style={{ color: "#666", fontSize: 15, lineHeight: 1.7, margin: "0 0 10px" }}>
            Đơn đặt tour <strong style={{ color: "#63AB45" }}>{p.bookingCode}</strong> đã được xác nhận.
          </p>
          <p style={{ color: "#888", fontSize: 14, margin: "0 0 36px" }}>
            Email xác nhận đã được gửi đến <strong>{p.contactEmail}</strong>
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 340, margin: "0 auto" }}>
            <Link href={`/booking/${p.bookingCode}`} className="co-btn-primary">
              <i className="fas fa-file-alt" style={{ marginRight: 8 }} /> Xem chi tiết đơn hàng
            </Link>
            <Link href="/my-tours" className="co-btn-ghost">
              <i className="fas fa-suitcase" style={{ marginRight: 8 }} /> Quản lý tours của tôi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // Expired state
  // ────────────────────────────────────────────────────────────────────────

  if (s.flow === "expired") {
    return (
      <div style={shell}>
        <style>{CSS}</style>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 72, marginBottom: 20 }}>⏰</div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#D32F2F", margin: "0 0 12px" }}>
            Phiên đặt chỗ đã hết hạn
          </h2>
          <p style={{ color: "#666", lineHeight: 1.7, margin: "0 0 10px", fontSize: 15 }}>
            Đặt chỗ <strong>{p.bookingCode}</strong> đã quá hạn
            {s.method === "cash"
              ? ` (${OFFICE_HOURS_AFTER_BOOKING} giờ sau khi đặt)`
              : " 10 phút"} mà chưa thanh toán.
          </p>
          <p style={{ color: "#888", fontSize: 14, margin: "0 0 36px" }}>
            Vị trí có thể đã được người khác đặt. Vui lòng thử lại từ đầu.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 320, margin: "0 auto" }}>
            <Link href="/tours" className="co-btn-primary">
              <i className="fas fa-redo" style={{ marginRight: 8 }} /> Đặt tour lại
            </Link>
            <Link href="/" className="co-btn-ghost">
              <i className="fas fa-home" style={{ marginRight: 8 }} /> Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // Main checkout
  // ────────────────────────────────────────────────────────────────────────

  return (
    <div style={shell}>
      <style>{CSS}</style>

      {/* ── HERO ── */}
      <div style={{
        background: "#1a3d10",
        padding: "44px 20px 60px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position:"absolute",top:-50,right:-50,width:200,height:200,borderRadius:"50%",background:"rgba(255,255,255,.05)",pointerEvents:"none" }} />
        <div style={{ position:"absolute",bottom:-30,left:60,width:120,height:120,borderRadius:"50%",background:"rgba(247,146,30,.12)",pointerEvents:"none" }} />

        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          {/* breadcrumb */}
          <div style={{ display:"flex",gap:8,color:"rgba(255,255,255,.65)",fontSize:12,marginBottom:18 }}>
            <Link href="/" style={{ color:"inherit",textDecoration:"none" }}>Trang chủ</Link>
            <span>/</span>
            <Link href="/tours" style={{ color:"inherit",textDecoration:"none" }}>Tours</Link>
            <span>/</span>
            <span style={{ color:"#fff",fontWeight:600 }}>Thanh toán</span>
          </div>

          <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:20,flexWrap:"wrap" }}>
            <div>
              <h1 style={{ color:"#fff",fontSize:"clamp(1.5rem,3vw,2.2rem)",fontWeight:900,margin:"0 0 8px" }}>
                Hoàn tất thanh toán
              </h1>
              <p style={{ color:"rgba(255,255,255,.85)",margin:0,fontSize:14,fontWeight:500 }}>
                {p.tourTitle ?? "Tour du lịch HTravel"}
              </p>
              <div style={{ display:"flex",flexWrap:"wrap",gap:8,marginTop:14 }}>
                {[
                  { icon:"fa-calendar-alt", text: fmtDate(p.startDate) },
                  { icon:"fa-users", text: passengerLine },
                  ...(p.cityName ? [{ icon:"fa-map-marker-alt", text: p.cityName }] : []),
                ].map(t => (
                  <span key={t.text} style={{
                    display:"inline-flex",alignItems:"center",gap:6,
                    background:"rgba(255,255,255,.15)",backdropFilter:"blur(6px)",
                    color:"#fff",padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:500,
                  }}>
                    <i className={`fas ${t.icon}`} style={{ fontSize:11 }} /> {t.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Booking code + timer */}
            <div style={{
              background:"rgba(255,255,255,.13)",backdropFilter:"blur(14px)",
              border:"1px solid rgba(255,255,255,.25)",
              borderRadius:20,padding:"18px 24px",textAlign:"center",minWidth:190,
            }}>
              <div style={{ color:"rgba(255,255,255,.65)",fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6 }}>
                Mã đặt chỗ
              </div>
              <div
                style={{ color:"#fff",fontSize:22,fontWeight:900,letterSpacing:2,marginBottom:8,cursor:"pointer" }}
                onClick={() => p.bookingCode && copy("code", p.bookingCode)}
                title="Nhấn để sao chép"
              >
                {p.bookingCode ?? "—"}
                <i className={`fas ${s.copiedKey === "code" ? "fa-check" : "fa-copy"}`}
                   style={{ fontSize:12,marginLeft:8,opacity:.7 }} />
              </div>
              {/* Timer */}
              <div style={{
                display:"inline-flex",alignItems:"center",gap:6,
                background: s.secsLeft === 0 ? "rgba(255,255,255,.1)" : isUrgent ? "rgba(211,47,47,.3)" : "rgba(255,255,255,.15)",
                borderRadius:10,padding:"5px 10px",
                fontSize:15,fontWeight:800,color: s.secsLeft === 0 ? "rgba(255,255,255,.4)" : "#fff",
                animation: isUrgent && s.secsLeft > 0 ? "pulse 1s infinite" : "none",
              }}>
                <i className="fas fa-clock" style={{ fontSize:12 }} />
                {s.secsLeft > 0 ? fmtCountdown(s.secsLeft) : "Hết giờ"}
              </div>
              <div style={{ color:"rgba(255,255,255,.55)",fontSize:10,marginTop:5 }}>
                {isOfficeHold ? "Hạn thanh toán tại quầy" : "Thời gian giữ chỗ (10 phút)"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STEPS ── */}
      <div style={{ background:"#fff",borderBottom:"1px solid #eee",padding:"0 20px" }}>
        <div style={{ maxWidth:1160,margin:"0 auto",display:"flex",alignItems:"center",gap:0,overflowX:"auto" }}>
          {[
            { n:1, label:"Chọn tour",  done:true  },
            { n:2, label:"Đặt chỗ",   done:true  },
            { n:3, label:"Thanh toán",done:false, active:true },
            { n:4, label:"Hoàn tất",  done:false },
          ].map((step,i) => (
            <div key={step.n} style={{ display:"flex",alignItems:"center",flexShrink:0 }}>
              {i > 0 && <div style={{ width:36,height:2,background:step.done?"#63AB45":"#eee",flexShrink:0 }} />}
              <div style={{ display:"flex",alignItems:"center",gap:8,padding:"13px 10px" }}>
                <div style={{
                  width:26,height:26,borderRadius:"50%",flexShrink:0,
                  background:step.done?"#63AB45":step.active?"#F7921E":"#f0f0f0",
                  color:step.done||step.active?"#fff":"#bbb",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:11,fontWeight:700,
                }}>
                  {step.done ? <i className="fas fa-check" style={{ fontSize:10 }} /> : step.n}
                </div>
                <span style={{
                  fontSize:13,whiteSpace:"nowrap",fontWeight:step.active?700:500,
                  color:step.done?"#63AB45":step.active?"#F7921E":"#bbb",
                }}>
                  {step.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth:1160,margin:"0 auto",padding:"28px 20px 80px" }}>
        <div className="co-grid">

          {/* ─── LEFT: Order summary ─── */}
          <div style={{ display:"flex",flexDirection:"column",gap:18 }}>

            {/* Trip overview */}
            <section className="co-card">
              <SectionHead icon="fa-route" color="#63AB45" title="Thông tin chuyến đi" />
              <div className="co-rows">
                <Row icon="fa-map-marked-alt" label="Tour" val={p.tourTitle ?? "—"} bold />
                <Row icon="fa-calendar-alt"   label="Khởi hành" val={fmtDate(p.startDate)} />
                <Row icon="fa-users"          label="Hành khách" val={passengerLine} />
                {p.cityName   && <Row icon="fa-city"          label="Điểm đến" val={p.cityName} />}
                {p.pickupName && <Row icon="fa-map-marker-alt" label="Điểm đón" val={[p.pickupName,p.pickupAddress].filter(Boolean).join(" – ")} />}
              </div>
            </section>

            {/* Passengers table */}
            {p.passengers && p.passengers.length > 0 && (
              <section className="co-card">
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
                  <SectionHead icon="fa-id-card" color="#63AB45" title="Danh sách hành khách" noMargin />
                  <span style={{ background:"#EEF8EC",color:"#4d8a34",padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:700 }}>
                    {p.passengers.length} người
                  </span>
                </div>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13.5 }}>
                    <thead>
                      <tr>
                        {["#","Họ và tên","Đối tượng","Giới tính","CCCD"].map(h => (
                          <th key={h} style={{ padding:"8px 10px",textAlign:"left",color:"#999",fontWeight:600,fontSize:12,borderBottom:"2px solid #f0f0f0",whiteSpace:"nowrap" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {p.passengers.map((px,i) => (
                        <tr key={i} style={{ borderBottom:"1px solid #F8F8F8" }}>
                          <td style={{ padding:"11px 10px",color:"#bbb",fontSize:12 }}>{i+1}</td>
                          <td style={{ padding:"11px 10px",fontWeight:700,color:"#1C231F" }}>{px.fullName}</td>
                          <td style={{ padding:"11px 10px" }}>
                            <span style={{
                              background:px.ageGroup==="ADULT"?"#EEF8EC":"#FFF3E8",
                              color:px.ageGroup==="ADULT"?"#4d8a34":"#c96200",
                              padding:"3px 8px",borderRadius:20,fontSize:12,fontWeight:600,
                            }}>
                              {ageLabel(px.ageGroup)}
                            </span>
                          </td>
                          <td style={{ padding:"11px 10px",color:"#484848" }}>{px.gender==="MALE"?"Nam":"Nữ"}</td>
                          <td style={{ padding:"11px 10px",color:"#666",fontFamily:"monospace",fontSize:12 }}>
                            {px.idCardNumber ?? <span style={{ color:"#ddd" }}>—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Contact */}
            <section className="co-card">
              <SectionHead icon="fa-user-circle" color="#63AB45" title="Thông tin người đặt" />
              <div className="co-rows">
                <Row icon="fa-user"         label="Họ và tên"  val={p.contactName  ?? "—"} />
                <Row icon="fa-phone"        label="Điện thoại" val={p.contactPhone ?? "—"} />
                <Row icon="fa-envelope"     label="Email"      val={p.contactEmail ?? "—"} />
                <Row icon="fa-map-marker-alt" label="Địa chỉ" val={p.contactAddress ?? "—"} />
              </div>
            </section>

            {/* Voucher */}
            {(p.voucherCode || (p.appliedVouchers?.length ?? 0) > 0) && (
              <section className="co-card">
                <SectionHead icon="fa-tag" color="#F7921E" title="Ưu đãi đã áp dụng" />
                <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                  {p.appliedVouchers?.map(v => (
                    <span key={v.code} style={{ background:"#E8F5E9",color:"#1b5e20",padding:"6px 12px",borderRadius:8,fontSize:13,fontWeight:700 }}>
                      {v.code} · -{fmt(v.value)}
                    </span>
                  ))}
                  {p.voucherCode && !p.appliedVouchers?.find(v => v.code === p.voucherCode) && (
                    <span style={{ background:"#E8F5E9",color:"#1b5e20",padding:"6px 12px",borderRadius:8,fontSize:13,fontWeight:700 }}>
                      {p.voucherCode}
                    </span>
                  )}
                </div>
                {(p.totalDiscount ?? 0) > 0 && (
                  <div style={{ marginTop:12,fontSize:13,color:"#2E7D32",fontWeight:700 }}>
                    Tiết kiệm: {fmt(p.totalDiscount!)}
                  </div>
                )}
              </section>
            )}

            {/* Policy */}
            <section className="co-card">
              <SectionHead icon="fa-clipboard-list" color="#63AB45" title="Chính sách quan trọng" />
              <div style={{ display:"grid",gap:8 }}>
                {[
                  { icon:"fa-clock",       text: s.method === "cash"
                    ? `Thanh toán tại quầy trong ${OFFICE_HOURS_AFTER_BOOKING} giờ sau khi xác nhận đặt chỗ. Quá hạn đơn tự hủy.`
                    : "Giữ chỗ 10 phút. Thanh toán trễ, đặt chỗ tự hủy." },
                  { icon:"fa-id-badge",    text:"Mang CCCD/Passport bản gốc khi khởi hành." },
                  { icon:"fa-user-edit",   text:"Đổi tên hành khách trước 48h (phí áp dụng)." },
                  { icon:"fa-undo-alt",    text:"Hủy trước 7 ngày được hoàn tiền theo quy định." },
                  { icon:"fa-headset",     text:"Hỗ trợ 24/7 · Hotline: 1900-xxxx" },
                ].map((it,i) => (
                  <div key={i} style={{
                    display:"flex",gap:10,padding:"10px 12px",
                    background:"#F9FAF9",borderRadius:10,
                    borderLeft:"3px solid #63AB45",
                  }}>
                    <i className={`fas ${it.icon}`} style={{ color:"#63AB45",marginTop:2,flexShrink:0,fontSize:13 }} />
                    <span style={{ fontSize:13,color:"#484848",lineHeight:1.55 }}>{it.text}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ─── RIGHT: Payment panel ─── */}
          <div className="co-sidebar">

            {/* Price summary */}
            <section className="co-card">
              <SectionHead icon="fa-receipt" color="#F7921E" title="Tóm tắt thanh toán" />
              <div style={{ display:"flex",flexDirection:"column",gap:9 }}>
                <PriceRow label="Tạm tính"   val={fmt(p.subtotalAmount ?? p.totalAmount ?? 0)} />
                {(p.totalDiscount??0) > 0 && (
                  <PriceRow label="Giảm giá" val={`-${fmt(p.totalDiscount!)}`} valColor="#2E7D32" />
                )}
                <PriceRow label="Sau giảm"   val={fmt(p.totalAmount ?? 0)} />
              </div>
              <div style={{
                marginTop:14,paddingTop:14,
                borderTop:"2px dashed #E9E9E9",
                display:"flex",justifyContent:"space-between",alignItems:"center",
              }}>
                <span style={{ fontWeight:700,fontSize:15,color:"#1C231F" }}>Cần thanh toán</span>
                <span style={{ fontWeight:900,fontSize:22,color:"#D32F2F" }}>{fmt(amount)}</span>
              </div>
              {p.paymentRatio === 50 && (
                <div style={{
                  marginTop:10,background:"#FFF3E8",borderRadius:8,
                  padding:"8px 12px",fontSize:12,color:"#c96200",
                  display:"flex",gap:6,alignItems:"center",
                }}>
                  <i className="fas fa-info-circle" />
                  Đặt cọc 50%. Số tiền còn lại thanh toán trước ngày khởi hành.
                </div>
              )}
            </section>

            {/* Payment method tabs */}
            <section className="co-card" style={{ padding:0,overflow:"hidden" }}>
              {/* Tabs */}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderBottom:"1px solid #E9E9E9" }}>
                {([
                  { id:"bank",   icon:"fa-qrcode",          label:"Chuyển khoản" },
                  { id:"stripe", icon:"fa-credit-card",      label:"Thẻ quốc tế" },
                  { id:"cash",   icon:"fa-money-bill-wave",  label:"Tại văn phòng" },
                ] as { id: PaymentMethod; icon: string; label: string }[]).map(tab => {
                  const active = s.method === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => dispatch({ type:"SET_METHOD", method: tab.id })}
                      style={{
                        display:"flex",flexDirection:"column",alignItems:"center",gap:4,
                        padding:"14px 8px",border:"none",cursor:"pointer",
                        background:active?"#EEF8EC":"#fff",
                        borderBottom:active?"2.5px solid #63AB45":"2.5px solid transparent",
                        transition:"all .15s",
                        fontFamily:"inherit",
                      }}
                    >
                      <i className={`fas ${tab.icon}`} style={{
                        fontSize:17,
                        color:active?"#63AB45":"#bbb",
                      }} />
                      <span style={{ fontSize:11,fontWeight:active?700:500,color:active?"#4d8a34":"#999",whiteSpace:"nowrap" }}>
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div style={{ padding:"20px 20px 24px" }}>

                {/* ── BANK TRANSFER ── */}
                {s.method === "bank" && (
                  <div>
                    {/* QR */}
                    <div style={{ textAlign:"center",marginBottom:18 }}>
                      <div style={{
                        display:"inline-block",padding:10,
                        background:"#fff",borderRadius:16,
                        boxShadow:"0 4px 20px rgba(0,0,0,.1)",
                        border:"1px solid #E9E9E9",
                      }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={vietQrUrl(amount, p.bookingCode ? `SEVQR${p.bookingCode}` : "SEVQRHTRAVEL")}
                          alt="VietQR thanh toán"
                          style={{ width:200,height:200,display:"block" }}
                        />
                      </div>
                      <div style={{ marginTop:10,fontSize:12,color:"#888" }}>
                        <i className="fas fa-mobile-alt" style={{ marginRight:4 }} />
                        Quét bằng app ngân hàng bất kỳ
                      </div>
                    </div>

                    {/* Bank details */}
                    <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:18 }}>
                      {[
                        { k:"bank",   label:"Ngân hàng",  val:BANK_NAME },
                        { k:"acc",    label:"Số tài khoản", val:BANK_ACCOUNT },
                        { k:"holder", label:"Chủ tài khoản", val:BANK_HOLDER },
                        { k:"amount", label:"Số tiền",     val:fmt(amount) },
                        { k:"ref",    label:"Nội dung CK", val: p.bookingCode ? `SEVQR${p.bookingCode}` : "—" },
                      ].map(row => (
                        <div key={row.k} style={{
                          display:"flex",alignItems:"center",justifyContent:"space-between",
                          padding:"10px 12px",background:"#F9FAF9",borderRadius:10,gap:8,
                        }}>
                          <div>
                            <div style={{ fontSize:11,color:"#999",marginBottom:2 }}>{row.label}</div>
                            <div style={{
                              fontWeight:700,fontSize:14,
                              fontFamily: row.k==="acc"||row.k==="amount"||row.k==="ref" ? "monospace" : "inherit",
                              color: row.k==="amount" ? "#D32F2F" : row.k==="ref" ? "#63AB45" : "#1C231F",
                            }}>
                              {row.val}
                            </div>
                          </div>
                          <button
                            onClick={() => copy(row.k, row.val)}
                            style={{
                              border:"1px solid #E0E0E0",background:"#fff",
                              borderRadius:8,padding:"5px 10px",cursor:"pointer",
                              fontSize:12,color:"#888",display:"flex",alignItems:"center",gap:4,
                              fontFamily:"inherit",flexShrink:0,
                              transition:"all .15s",
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor="#63AB45"; (e.currentTarget as HTMLButtonElement).style.color="#4d8a34"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor="#E0E0E0"; (e.currentTarget as HTMLButtonElement).style.color="#888"; }}
                          >
                            <i className={`fas ${s.copiedKey===row.k?"fa-check":"fa-copy"}`} />
                            {s.copiedKey===row.k ? "Đã sao chép" : "Sao chép"}
                          </button>
                        </div>
                      ))}
                    </div>

                    <div style={{
                      padding:"10px 12px",background:"#FFFDE7",borderRadius:10,
                      border:"1px solid #FFE082",fontSize:12,color:"#7A5F00",
                      lineHeight:1.65,marginBottom:18,
                    }}>
                      <i className="fas fa-exclamation-circle" style={{ marginRight:6 }} />
                      <strong>Quan trọng:</strong> Nội dung chuyển khoản phải là <strong>{p.bookingCode ? `SEVQR${p.bookingCode}` : "—"}</strong> để được xác nhận tự động.
                    </div>

                    {/* Auto-polling status indicator */}
                    <div style={{
                      display:"flex",alignItems:"center",gap:10,
                      padding:"12px 14px",borderRadius:12,
                      background:"#F0F9EC",border:"1px solid #C8E6B8",
                    }}>
                      <div style={{
                        width:18,height:18,borderRadius:"50%",flexShrink:0,
                        border:"2.5px solid #C8E6B8",borderTopColor:"#63AB45",
                        animation:"spin .8s linear infinite",
                      }} />
                      <div>
                        <div style={{ fontWeight:700,fontSize:13,color:"#2E6B1A",marginBottom:2 }}>
                          Đang chờ xác nhận thanh toán...
                        </div>
                        <div style={{ fontSize:12,color:"#5a9044" }}>
                          Trang sẽ tự động cập nhật khi nhận được tiền.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STRIPE CARD ── */}
                {s.method === "stripe" && (
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:48,marginBottom:14 }}>💳</div>
                    <h4 style={{ fontWeight:800,fontSize:16,margin:"0 0 8px",color:"#1C231F" }}>
                      Thanh toán bằng thẻ quốc tế
                    </h4>
                    <p style={{ fontSize:13,color:"#888",margin:"0 0 18px",lineHeight:1.65 }}>
                      Visa, Mastercard, JCB được hỗ trợ.<br />
                      Bảo mật bởi <strong style={{ color:"#635BFF" }}>Stripe</strong>.
                      <br />
                      <span style={{ fontSize:12,color:"#b45309" }}>Tối thiểu 20.000đ / giao dịch (quy định Stripe).</span>
                    </p>
                    <div style={{
                      display:"flex",flexWrap:"wrap",justifyContent:"center",gap:8,
                      marginBottom:18,
                    }}>
                      {["visa","mastercard","jcb"].map(c => (
                        <span key={c} style={{
                          border:"1px solid #E0E0E0",borderRadius:6,padding:"4px 10px",
                          fontSize:12,fontWeight:700,color:"#666",background:"#fafafa",
                          textTransform:"uppercase",letterSpacing:0.5,
                        }}>
                          {c}
                        </span>
                      ))}
                    </div>

                    {s.flow === "redirecting" ? (
                      <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10,color:"#635BFF",padding:"14px 0" }}>
                        <div style={{ width:20,height:20,borderRadius:"50%",border:"2.5px solid #e0e0e0",borderTopColor:"#635BFF",animation:"spin .8s linear infinite" }} />
                        <span style={{ fontWeight:600,fontSize:14 }}>Đang chuyển đến trang thanh toán...</span>
                      </div>
                    ) : s.flow === "error" ? (
                      <div>
                        <div style={{ background:"#FFF3F3",border:"1px solid #FFCDD2",borderRadius:10,padding:"12px 14px",marginBottom:14,fontSize:13,color:"#C62828" }}>
                          <i className="fas fa-exclamation-circle" style={{ marginRight:6 }} />
                          {s.errorMsg || "Có lỗi xảy ra. Vui lòng thử lại."}
                        </div>
                        <button
                          className="co-btn-primary"
                          style={{ width:"100%",justifyContent:"center" }}
                          onClick={() => { dispatch({ type:"SET_FLOW", flow:"idle" }); handleStripePayment(); }}
                        >
                          <i className="fas fa-redo" style={{ marginRight:8 }} /> Thử lại
                        </button>
                      </div>
                    ) : (
                      <button
                        className="co-btn-stripe"
                        onClick={handleStripePayment}
                      >
                        <i className="fas fa-lock" style={{ marginRight:8 }} />
                        Thanh toán {fmt(amount)} bằng Stripe
                      </button>
                    )}

                    <p style={{ fontSize:11,color:"#bbb",marginTop:10 }}>
                      <i className="fas fa-shield-alt" style={{ marginRight:4 }} />
                      Thông tin thẻ được mã hóa SSL 256-bit &nbsp;·&nbsp; Không lưu trên HTravel
                    </p>
                  </div>
                )}

                {/* ── CASH / VĂN PHÒNG ── */}
                {s.method === "cash" && (
                  <div>
                    <div style={{ textAlign:"center",marginBottom:18 }}>
                      <div style={{ fontSize:48,marginBottom:10 }}>🏢</div>
                      <h4 style={{ fontWeight:800,fontSize:16,margin:"0 0 8px",color:"#1C231F" }}>
                        Thanh toán tại văn phòng
                      </h4>
                      <p style={{ fontSize:13,color:"#888",margin:0,lineHeight:1.65 }}>
                        Mang mã đặt chỗ đến quầy HTravel. Nhân viên xác nhận sau khi nhận tiền mặt.
                      </p>
                    </div>

                    <div style={{
                      display:"flex",alignItems:"center",justifyContent:"space-between",
                      padding:"12px 14px",background:"#E3F2FD",borderRadius:10,
                      border:"1px solid #BBDEFB",marginBottom:14,
                    }}>
                      <div>
                        <div style={{ fontSize:11,color:"#1565C0",marginBottom:2 }}>Mã đặt chỗ</div>
                        <div style={{ fontWeight:800,fontSize:18,color:"#0D47A1",letterSpacing:1 }}>
                          {p.bookingCode ?? "—"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => p.bookingCode && copy("code", p.bookingCode)}
                        className="co-btn-ghost"
                        style={{ padding:"6px 12px",fontSize:12 }}
                      >
                        <i className={`fas ${s.copiedKey === "code" ? "fa-check" : "fa-copy"}`} style={{ marginRight:4 }} />
                        {s.copiedKey === "code" ? "Đã sao chép" : "Sao chép"}
                      </button>
                    </div>

                    <div style={{
                      background:"#F9FAF9",borderRadius:12,padding:"14px 16px",
                      marginBottom:14,
                    }}>
                      <div style={{ fontWeight:700,fontSize:13,color:"#1C231F",marginBottom:10 }}>
                        Số tiền cần thanh toán tại quầy
                      </div>
                      <div style={{ fontWeight:900,fontSize:22,color:"#D32F2F",marginBottom:12 }}>
                        {fmt(amount)}
                      </div>
                      {[
                        "Địa chỉ: Phạm Văn chiêu, Phường 9, Gò Vấp, Hồ Chí Minh",
                        "Giờ làm việc: T2–T7, 8:00–17:30",
                        "Hotline: 1900-xxxx",
                      ].map((line, i) => (
                        <div key={i} style={{ display:"flex",gap:8,fontSize:13,color:"#484848",marginBottom:i < 2 ? 8 : 0 }}>
                          <i className="fas fa-map-marker-alt" style={{ color:"#63AB45",marginTop:2,flexShrink:0 }} />
                          {line}
                        </div>
                      ))}
                    </div>

                    <div style={{
                      background:"#FFF3E8",borderRadius:10,padding:"10px 14px",
                      fontSize:12,color:"#7A4E00",lineHeight:1.6,marginBottom:14,
                    }}>
                      <i className="fas fa-clock" style={{ marginRight:6 }} />
                      {s.cashPaymentReady ? (
                        <>Hạn thanh toán tại quầy: còn <strong>{fmtCountdown(s.secsLeft)}</strong>{officeDueLabel ? <> (hạn lúc {officeDueLabel})</> : null} — trong {OFFICE_HOURS_AFTER_BOOKING} giờ sau khi đặt.</>
                      ) : (
                        <>Hoàn tất xác nhận trong <strong>{fmtCountdown(s.secsLeft)}</strong> để giữ chỗ. Sau đó bạn có {OFFICE_HOURS_AFTER_BOOKING} giờ để thanh toán tại quầy.</>
                      )}
                    </div>

                    {officeWindowExpired && !s.cashPaymentReady && (
                      <div style={{
                        background:"#FFF3F3",border:"1px solid #FFCDD2",borderRadius:10,
                        padding:"12px 14px",fontSize:13,color:"#C62828",marginBottom:14,
                      }}>
                        <i className="fas fa-exclamation-circle" style={{ marginRight:6 }} />
                        Đã quá {OFFICE_HOURS_AFTER_BOOKING} giờ kể từ lúc đặt. Vui lòng đặt tour lại hoặc chọn chuyển khoản/thẻ.
                      </div>
                    )}

                    {s.cashInitError && (
                      <div style={{
                        background:"#FFF3F3",border:"1px solid #FFCDD2",borderRadius:10,
                        padding:"12px 14px",fontSize:13,color:"#C62828",marginBottom:14,
                      }}>
                        <i className="fas fa-exclamation-circle" style={{ marginRight:6 }} />
                        {s.cashInitError}
                      </div>
                    )}

                    {s.cashPaymentReady ? (
                      <div style={{
                        display:"flex",alignItems:"flex-start",gap:12,
                        padding:"14px 16px",borderRadius:12,
                        background:"#E8F5E9",border:"1px solid #A5D6A7",marginBottom:14,
                      }}>
                        <i className="fas fa-envelope" style={{ color:"#2E7D32",fontSize:22,marginTop:2 }} />
                        <div style={{ textAlign:"left" }}>
                          <div style={{ fontWeight:700,fontSize:14,color:"#1B5E20",marginBottom:4 }}>
                            Đã xác nhận đặt chỗ — email đã gửi
                          </div>
                          <div style={{ fontSize:13,color:"#388E3C",lineHeight:1.55 }}>
                            Kiểm tra hộp thư <strong>{p.contactEmail}</strong> để xem địa chỉ quầy và hạn thanh toán.
                            Sau khi nhận tiền mặt, nhân viên sẽ xác nhận đơn (không tự động như chuyển khoản).
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="co-btn-primary"
                        style={{ width:"100%",justifyContent:"center",marginBottom:14 }}
                        disabled={officeSubmitting || s.secsLeft === 0 || officeWindowExpired}
                        onClick={handleConfirmOfficeReservation}
                      >
                        {officeSubmitting ? (
                          <>
                            <span style={{
                              display:"inline-block",width:16,height:16,borderRadius:"50%",
                              border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",
                              animation:"spin .8s linear infinite",marginRight:8,
                            }} />
                            Đang xử lý…
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check-circle" style={{ marginRight:8 }} />
                            Xác nhận đặt chỗ &amp; gửi hướng dẫn qua email
                          </>
                        )}
                      </button>
                    )}

                    {!s.cashPaymentReady && (
                      <p style={{ fontSize:12,color:"#888",lineHeight:1.55,margin:0 }}>
                        Bấm nút trên để giữ chỗ và nhận email hướng dẫn. Mang mã <strong>{p.bookingCode}</strong> và CMND/CCCD khi đến quầy.
                      </p>
                    )}

                    <div style={{ marginTop:16 }}>
                      <Link href={p.bookingCode ? `/booking/${p.bookingCode}` : "/booking"} className="co-btn-ghost" style={{ justifyContent:"center" }}>
                        <i className="fas fa-file-alt" style={{ marginRight:8 }} /> Xem chi tiết đơn
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Secondary actions */}
            <section style={{ display:"flex",flexDirection:"column",gap:10 }}>
              <Link
                href={p.bookingCode ? `/booking/${p.bookingCode}` : "/booking"}
                className="co-btn-ghost"
              >
                <i className="fas fa-file-alt" style={{ marginRight:8 }} /> Xem lại đơn đặt chỗ
              </Link>
              <Link href="/" className="co-btn-ghost" style={{ opacity:.75 }}>
                <i className="fas fa-home" style={{ marginRight:8 }} /> Về trang chủ
              </Link>
            </section>

            {/* Trust bar */}
            <div style={{
              display:"flex",justifyContent:"center",gap:20,
              padding:"14px 0",borderTop:"1px solid #eee",
            }}>
              {[
                { icon:"fa-lock",       label:"SSL bảo mật" },
                { icon:"fa-shield-alt", label:"An toàn 100%" },
                { icon:"fa-headset",    label:"Hỗ trợ 24/7" },
              ].map(b => (
                <div key={b.label} style={{ textAlign:"center",color:"#bbb" }}>
                  <i className={`fas ${b.icon}`} style={{ display:"block",fontSize:16,marginBottom:3 }} />
                  <span style={{ fontSize:10,fontWeight:500 }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function SectionHead({ icon, color, title, noMargin }: { icon: string; color: string; title: string; noMargin?: boolean }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:noMargin?0:16 }}>
      <div style={{
        width:34,height:34,borderRadius:9,flexShrink:0,
        background:`${color}18`,
        display:"flex",alignItems:"center",justifyContent:"center",
      }}>
        <i className={`fas ${icon}`} style={{ color,fontSize:14 }} />
      </div>
      <h3 style={{ margin:0,fontWeight:700,fontSize:"0.97rem",color:"#1C231F" }}>{title}</h3>
    </div>
  );
}

function Row({ icon, label, val, bold }: { icon: string; label: string; val: string; bold?: boolean }) {
  return (
    <div style={{
      display:"flex",alignItems:"flex-start",justifyContent:"space-between",
      gap:12,padding:"9px 0",borderBottom:"1px solid #F5F5F5",
    }}>
      <div style={{ display:"flex",alignItems:"center",gap:7,color:"#aaa",fontSize:13,flexShrink:0,minWidth:110 }}>
        <i className={`fas ${icon}`} style={{ width:14,textAlign:"center",color:"#63AB45",fontSize:12 }} />
        {label}
      </div>
      <span style={{ fontWeight:bold?700:600,fontSize:14,color:"#1C231F",textAlign:"right",maxWidth:"60%" }}>
        {val}
      </span>
    </div>
  );
}

function PriceRow({ label, val, valColor }: { label: string; val: string; valColor?: string }) {
  return (
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:14 }}>
      <span style={{ color:"#777" }}>{label}</span>
      <span style={{ fontWeight:600,color:valColor??"#1C231F" }}>{val}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const shell: React.CSSProperties = {
  minHeight:"100vh",
  background:"#F5F7F5",
  fontFamily:'"Outfit", sans-serif',
};

const CSS = `
  * { box-sizing: border-box; }

  .co-card {
    background: #fff;
    border-radius: 18px;
    padding: 22px 24px;
    box-shadow: 0 2px 14px rgba(28,35,31,.06);
    border: 1px solid rgba(0,0,0,.045);
  }
  .co-rows > div:last-child { border-bottom: none !important; }

  .co-grid {
    display: grid;
    grid-template-columns: minmax(0,1.6fr) minmax(0,1fr);
    gap: 24px;
    align-items: start;
  }
  @media (max-width: 860px) {
    .co-grid { grid-template-columns: 1fr; }
    .co-sidebar { position: static !important; top: auto !important; }
  }

  .co-sidebar {
    position: sticky;
    top: 24px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .co-btn-primary {
    display: inline-flex; align-items: center;
    background: #63AB45;
    color: #fff !important; text-decoration: none !important;
    border-radius: 12px; padding: 13px 22px;
    font-weight: 700; font-size: 15px;
    font-family: "Outfit", sans-serif;
    box-shadow: 0 6px 18px rgba(99,171,69,.32);
    transition: all .18s; border: none; cursor: pointer;
  }
  .co-btn-primary:hover { opacity: .9; transform: translateY(-1px); }

  .co-btn-ghost {
    display: inline-flex; align-items: center; justify-content: center;
    background: #fff; color: #555 !important; text-decoration: none !important;
    border-radius: 12px; padding: 11px 18px;
    font-weight: 600; font-size: 13.5px;
    font-family: "Outfit", sans-serif;
    border: 1.5px solid #E0E0E0;
    transition: all .15s;
  }
  .co-btn-ghost:hover { border-color: #63AB45; color: #4d8a34 !important; }

  .co-btn-stripe {
    display: inline-flex; align-items: center; justify-content: center;
    width: 100%;
    background: #635BFF; color: #fff !important;
    border-radius: 12px; padding: 13px 22px;
    font-weight: 700; font-size: 15px;
    font-family: "Outfit", sans-serif;
    box-shadow: 0 6px 18px rgba(99,91,255,.3);
    transition: all .18s; border: none; cursor: pointer;
  }
  .co-btn-stripe:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
  .co-btn-stripe:disabled { opacity: .5; cursor: not-allowed; transform: none; }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pop  { from { transform: scale(.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(211,47,47,.4); }
    50% { box-shadow: 0 0 0 8px rgba(211,47,47,0); }
  }
`;
