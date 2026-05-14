import client from "../utils/apiClient";

/* ─── Interfaces (khớp với Backend Java DTOs) ─── */

/** Khớp PassengerDTO.java */
export interface PassengerDTO {
  fullName: string;
  dob: string;           // ISO date "YYYY-MM-DD"
  gender: "MALE" | "FEMALE";
  ageGroup: "ADULT" | "CHILD" | "BABY";
  idCardNumber?: string;
}

/** Khớp BookingRequest.java */
export interface BookingRequest {
  userId: number;
  departureId: number;
  passengers: PassengerDTO[];
  note?: string;
}

/** Khớp CancelBookingRequest.java */
export interface CancelBookingRequest {
  bookingCode: string;
  reason?: string;
}

/** Khớp BookingResponse.java */
export interface BookingResponse {
  bookingCode: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | string;
  totalAmount: number;
  createdAt: string;
  userId: number;
  message?: string;
  tourTitle?: string;
  startDate?: string;
  priceDetail?: Record<string, unknown>;
  passengers?: PassengerDTO[];
}

/* ─── Internal helper (same pattern as Dashboard bookingApi.js) ─── */
const wrap = (res: any) => {
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
  return { status: res?.status || 200, message: null, data: res?.data ?? null };
};

/* ─── API Functions ─── */

/**
 * POST /bookings/create
 * Tạo booking mới → trả về BookingResponse với bookingCode
 */
export const createBooking = async (bookingData: BookingRequest) => {
  try {
    const res = await client.post("/bookings/create", bookingData);
    return wrap(res);
  } catch (err: any) {
    return { status: 500, message: err.message, data: null };
  }
};

/**
 * GET /bookings/{bookingCode}
 * Lấy chi tiết booking theo mã (BK-XXXX)
 */
export const getBookingByCode = async (bookingCode: string) => {
  try {
    const res = await client.get(`/bookings/${encodeURIComponent(bookingCode)}`);
    return wrap(res);
  } catch (err: any) {
    return { status: 500, message: err.message, data: null };
  }
};

/**
 * GET /bookings/user/{userId}
 * Lấy danh sách booking của một user
 */
export const getBookingsByUserId = async (userId: number) => {
  try {
    const res = await client.get(`/bookings/user/${userId}`);
    return wrap(res);
  } catch (err: any) {
    return { status: 500, message: err.message, data: null };
  }
};

/**
 * POST /bookings/cancel
 * Hủy booking theo mã
 */
export const cancelBooking = async (cancelData: CancelBookingRequest) => {
  try {
    const res = await client.post("/bookings/cancel", cancelData);
    return wrap(res);
  } catch (err: any) {
    return { status: 500, message: err.message, data: null };
  }
};

export default {
  createBooking,
  getBookingByCode,
  getBookingsByUserId,
  cancelBooking,
};
