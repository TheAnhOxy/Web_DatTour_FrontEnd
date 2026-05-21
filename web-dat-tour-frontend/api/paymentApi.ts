import client from "../utils/apiClient";

export type PaymentGateway = "STRIPE" | "SEPAY" | "CASH_OFFICE";
export type PaymentStatus  = "PENDING" | "SUCCESS" | "FAILED";

export interface PaymentInfo {
  id: number;
  bookingId: number;
  amount: number;
  transactionId: string;
  gateway: PaymentGateway;
  paymentUrl: string | null;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
}

interface ApiEnvelope {
  status?: number;
  message?: string;
  data?: unknown;
}

type ClientResult = { data?: unknown };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** apiClient.post/get trả { data: ApiResponse }; cần lấy .data.data */
const unwrapApi = <T>(res: ClientResult): T | null => {
  const raw = res?.data;
  if (!isRecord(raw)) return null;
  if (isRecord(raw.data)) return raw.data as T;
  return raw as T;
};

const unwrap = (res: ClientResult): PaymentInfo | null => unwrapApi<PaymentInfo>(res);

/**
 * Lấy thông tin payment (bao gồm paymentUrl) theo bookingId.
 * Endpoint: GET /payments/booking/{bookingId}
 */
export const getPaymentByBookingId = async (bookingId: number): Promise<PaymentInfo | null> => {
  try {
    const res = await client.get(`/payments/booking/${bookingId}`);
    return unwrap(res);
  } catch {
    return null;
  }
};

/**
 * Lấy thông tin payment theo transactionId (Stripe session ID).
 * Endpoint: GET /payments/transaction/{transactionId}
 */
export const getPaymentByTransactionId = async (transactionId: string): Promise<PaymentInfo | null> => {
  try {
    const res = await client.get(`/payments/transaction/${encodeURIComponent(transactionId)}`);
    return unwrap(res);
  } catch {
    return null;
  }
};

/**
 * Tạo hoặc thay thế payment với đúng gateway user chọn.
 * Endpoint: POST /payments/initiate
 */
export type InitiatePaymentParams = {
  bookingId: number;
  gateway: string;
  bookingCode?: string;
  amount?: number;
};

export const initiatePayment = async (params: InitiatePaymentParams): Promise<PaymentInfo | null> => {
  try {
    const res = await client.post(`/payments/initiate`, params);
    return unwrap(res);
  } catch {
    return null;
  }
};

/**
 * Xác nhận Stripe ngay sau redirect — không chờ webhook (nhanh hơn).
 */
export interface OfficeReservationResult {
  bookingId: number;
  bookingCode: string;
  gateway?: string;
  status?: string;
  paymentDueAt: string;
  emailSent: boolean;
}

export type ConfirmOfficeParams = {
  bookingId: number;
  bookingCode: string;
  amount?: number;
  contactEmail?: string;
  contactName?: string;
  tourTitle?: string;
  startDate?: string;
  /** ISO thời điểm tạo booking — hạn quầy = bookedAt + 48h */
  bookedAt?: string;
  createdAt?: string;
};

export const confirmOfficeReservation = async (
  params: ConfirmOfficeParams
): Promise<OfficeReservationResult | null> => {
  try {
    const res = await client.post(`/payments/cash-office/confirm-reservation`, params);
    return unwrapApi<OfficeReservationResult>(res);
  } catch {
    return null;
  }
};

export const confirmStripeSession = async (sessionId: string): Promise<PaymentInfo | null> => {
  try {
    const res = await client.post(
      `/payments/stripe/confirm-session?session_id=${encodeURIComponent(sessionId)}`
    );
    return unwrap(res);
  } catch {
    return null;
  }
};

const paymentApi = {
  getPaymentByBookingId,
  getPaymentByTransactionId,
  initiatePayment,
  confirmOfficeReservation,
  confirmStripeSession,
};
export default paymentApi;
