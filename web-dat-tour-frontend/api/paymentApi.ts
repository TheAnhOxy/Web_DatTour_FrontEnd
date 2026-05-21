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

const unwrap = (res: ApiEnvelope): PaymentInfo | null => {
  const d = res?.data;
  if (d && typeof d === "object" && !Array.isArray(d)) return d as PaymentInfo;
  return null;
};

/**
 * Lấy thông tin payment (bao gồm paymentUrl) theo bookingId.
 * Endpoint: GET /payments/booking/{bookingId}
 */
export const getPaymentByBookingId = async (bookingId: number): Promise<PaymentInfo | null> => {
  try {
    const res = await client.get(`/payments/booking/${bookingId}`);
    return unwrap(res as ApiEnvelope) ?? (res as unknown as PaymentInfo);
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
    return unwrap(res as ApiEnvelope) ?? (res as unknown as PaymentInfo);
  } catch {
    return null;
  }
};

const paymentApi = { getPaymentByBookingId, getPaymentByTransactionId };
export default paymentApi;
