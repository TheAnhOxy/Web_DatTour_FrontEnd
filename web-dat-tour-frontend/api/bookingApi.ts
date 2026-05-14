import client from "../utils/apiClient";

/* ─── Interfaces (khớp với Backend Java DTOs) ─── */

export type PassengerAgeGroup = "ADULT" | "CHILD_10_14" | "CHILD_4_9" | "BABY";
export type PassengerGender = "MALE" | "FEMALE";

/** Khớp PassengerDTO.java */
export interface PassengerDTO {
  fullName: string;
  dob: string;           // ISO date "YYYY-MM-DD"
  gender: PassengerGender;
  ageGroup: PassengerAgeGroup;
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
  cityName?: string;
  pickupName?: string;
  pickupAddress?: string;
  pickupTime?: string;
  destination?: {
    destinationId?: number;
    destinationName?: string;
    cityName?: string;
    imageUrl?: string;
    [key: string]: unknown;
  };
  priceDetail?: Record<string, unknown>;
  passengers?: PassengerDTO[];
}

export interface BookingApiResponse {
  status: number;
  message?: string;
  data: BookingResponse | null;
}

type ApiEnvelope = {
  status?: number;
  message?: string;
  data?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

/* ─── Internal helper (same pattern as Dashboard bookingApi.js) ─── */
const wrap = (res: ApiEnvelope) => {
  const responseData = res?.data;
  if (
    isRecord(responseData) &&
    (responseData.status !== undefined ||
      responseData.message !== undefined ||
      responseData.data !== undefined)
  ) {
    return responseData;
  }
  return { status: res?.status || 200, message: null, data: responseData ?? null };
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
  } catch (err: unknown) {
    return { status: 500, message: err instanceof Error ? err.message : "Unknown error", data: null };
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
  } catch (err: unknown) {
    return { status: 500, message: err instanceof Error ? err.message : "Unknown error", data: null };
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
  } catch (err: unknown) {
    return { status: 500, message: err instanceof Error ? err.message : "Unknown error", data: null };
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
  } catch (err: unknown) {
    return { status: 500, message: err instanceof Error ? err.message : "Unknown error", data: null };
  }
};

const bookingApi = {
  createBooking,
  getBookingByCode,
  getBookingsByUserId,
  cancelBooking,
};

export default bookingApi;
