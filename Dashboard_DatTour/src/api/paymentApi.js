import client from "./client";

const wrap = (res) => {
  // If backend already returns ApiResponse {status,message,data}, forward it.
  if (
    res &&
    res.data &&
    typeof res.data === "object" &&
    (res.data.status !== undefined ||
      res.data.message !== undefined ||
      res.data.data !== undefined)
  ) {
    return res.data;
  }
  // Otherwise normalize to ApiResponse shape
  return { status: res?.status || 200, message: null, data: res?.data ?? null };
};

export const getPaymentReport = async () => {
  try {
    const res = await client.get("/auth/admin/payment-report");
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

// Payment-service endpoints
export const getPaymentByBookingId = async (bookingId) => {
  try {
    const res = await client.get(
      `/payments/booking/${encodeURIComponent(String(bookingId))}`,
    );
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

export const getPaymentByTransactionId = async (transactionId) => {
  try {
    const res = await client.get(
      `/payments/transaction/${encodeURIComponent(String(transactionId))}`,
    );
    return wrap(res);
  } catch (err) {
    if (err.response) return wrap(err.response);
    return { status: 500, message: err.message, data: null };
  }
};

export default {
  getPaymentReport,
  getPaymentByBookingId,
  getPaymentByTransactionId,
};
