import client from "../utils/apiClient";

/* ─── Interfaces (khớp với Backend Java DTOs) ─── */

export type PassengerAgeGroup = "ADULT" | "CHILD_10_14" | "CHILD_4_9" | "BABY";
export type PassengerGender = "MALE" | "FEMALE";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

/** Khớp PassengerDTO.java */
export interface PassengerDTO {
  fullName: string;
  dob: string;           // ISO date "YYYY-MM-DD"
  gender: PassengerGender;
  ageGroup: PassengerAgeGroup;
  idCardNumber?: string;
}

/** Khớp BookingNoteDTO.java */
export interface BookingNoteDTO {
  noteId?: number;
  content: string;
  createdAt?: string;
}

/** Khớp CancellationDTO.java */
export interface CancellationDTO {
  cancellationId?: number;
  bookingId?: number;
  reason?: string;
  refundAmount?: number;
  cancelledAt?: string;
}

/** Khớp BookingRequest.java */
export interface BookingRequest {
  userId?: number;
  departureId: number;
  passengers: PassengerDTO[];
  note?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

/** Khớp CancelBookingRequest.java */
export interface CancelBookingRequest {
  bookingCode: string;
  reason?: string;
}

/** Khớp BatchBookingRequest.java */
export interface BatchBookingRequest {
  bookingIds: number[];
}

/** Khớp BookingResponse.java */
export interface BookingResponse {
  bookingId?: number;
  bookingCode: string;
  status: BookingStatus;
  totalAmount: number;
  paidAmount?: number;
  createdAt: string;
  paymentMethod?: string;
  paymentDueAt?: string;
  userId?: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
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

/** Khớp BookingDetailResponse.java */
export interface BookingDetailResponse extends BookingResponse {
  bookingNotes?: BookingNoteDTO[];
  cancellation?: CancellationDTO;
}

/** Khớp PaginatedResponse.java */
export interface PaginatedResponse<T> {
  data: T[];
  totalElements: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
}

/** Khớp BookingSummaryDTO.java */
export interface BookingSummaryDTO {
  totalBookings: number;
  totalAmount: number;
  totalPaidAmount: number;
  byStatus: Record<BookingStatus, number>;
}

export interface ApiResponse<T> {
  status: number;
  message?: string;
  data: T | null;
}

type ApiEnvelope = {
  status?: number;
  message?: string;
  data?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

/* ─── Internal helper (khớp Backend ApiResponse) ─── */
const wrap = (res: ApiEnvelope): ApiResponse<any> => {
  const responseData = res?.data;
  if (
    isRecord(responseData) &&
    (responseData.status !== undefined ||
      responseData.message !== undefined ||
      responseData.data !== undefined)
  ) {
    return {
      status: (responseData.status as number) || 200,
      message: (responseData.message as string | undefined) || undefined,
      data: (responseData.data as any) || null
    };
  }
  return { status: res?.status || 200, message: undefined, data: responseData ?? null };
};

/* ─── API Functions ─── */

/**
 * POST  /bookings/create
 * Tạo booking mới
 */
export const createBooking = async (bookingData: BookingRequest): Promise<ApiResponse<BookingResponse>> => {
  try {
    const res = await client.post(" /bookings/create", bookingData);
    return wrap(res);
  } catch (err: unknown) {
    return { status: 500, message: err instanceof Error ? err.message : "Unknown error", data: null };
  }
};

/**
 * GET  /bookings/{bookingCode}
 * Lấy chi tiết booking theo mã (với passengers, notes, cancellation)
 */
export const getBookingByCode = async (bookingCode: string): Promise<ApiResponse<BookingDetailResponse>> => {
  try {
    const res = await client.get(`/bookings/${encodeURIComponent(bookingCode)}`);
    return wrap(res);
  } catch (err: unknown) {
    return { status: 500, message: err instanceof Error ? err.message : "Unknown error", data: null };
  }
};

/**
 * GET /bookings/id/{bookingId}
 * Lấy chi tiết booking theo ID
 */
export const getBookingById = async (bookingId: number): Promise<ApiResponse<BookingDetailResponse>> => {
  try {
    const res = await client.get(`/bookings/id/${bookingId}`);
    return wrap(res);
  } catch (err: unknown) {
    return { status: 500, message: err instanceof Error ? err.message : "Unknown error", data: null };
  }
};

/**
 * GET /bookings/user/{userId}
 * Lấy danh sách booking của user (có phân trang)
 * Query params: status, page (0-indexed), limit
 */
export const getBookingsByUserId = async (
  userId: number,
  status?: string,
  page: number = 0,
  limit: number = 10
): Promise<ApiResponse<PaginatedResponse<BookingResponse>>> => {
  try {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const res = await client.get(`/bookings/user/${userId}?${params.toString()}`);
    return wrap(res);
  } catch (err: unknown) {
    return { status: 500, message: err instanceof Error ? err.message : "Unknown error", data: null };
  }
};

/**
 * GET /bookings
 * Lấy tất cả booking (admin endpoint) với filter
 * Query params: status, paymentMethod, page, limit
 */
export const getAllBookings = async (
  status?: string,
  paymentMethod?: string,
  page: number = 0,
  limit: number = 10
): Promise<ApiResponse<PaginatedResponse<BookingResponse>>> => {
  try {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (paymentMethod) params.append("paymentMethod", paymentMethod);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const res = await client.get(`/bookings?${params.toString()}`);
    return wrap(res);
  } catch (err: unknown) {
    return { status: 500, message: err instanceof Error ? err.message : "Unknown error", data: null };
  }
};

/**
 * GET /bookings/{bookingCode}/passengers
 * Lấy danh sách hành khách của booking
 */
export const getPassengersByBookingCode = async (bookingCode: string): Promise<ApiResponse<PassengerDTO[]>> => {
  try {
    const res = await client.get(`/bookings/${encodeURIComponent(bookingCode)}/passengers`);
    return wrap(res);
  } catch (err: unknown) {
    return { status: 500, message: err instanceof Error ? err.message : "Unknown error", data: null };
  }
};

/**
 * GET /bookings/{bookingCode}/notes
 * Lấy danh sách ghi chú của booking
 */
export const getBookingNotesByBookingCode = async (bookingCode: string): Promise<ApiResponse<BookingNoteDTO[]>> => {
  try {
    const res = await client.get(`/bookings/${encodeURIComponent(bookingCode)}/notes`);
    return wrap(res);
  } catch (err: unknown) {
    return { status: 500, message: err instanceof Error ? err.message : "Unknown error", data: null };
  }
};

/**
 * GET /bookings/{bookingCode}/cancellation
 * Lấy thông tin hủy booking
 */
export const getCancellationByBookingCode = async (bookingCode: string): Promise<ApiResponse<CancellationDTO>> => {
  try {
    const res = await client.get(`/bookings/${encodeURIComponent(bookingCode)}/cancellation`);
    return wrap(res);
  } catch (err: unknown) {
    return { status: 500, message: err instanceof Error ? err.message : "Unknown error", data: null };
  }
};

/**
 * POST /bookings/batch
 * Lấy nhiều booking từ danh sách ID
 */
export const getBookingsByIds = async (bookingIds: number[]): Promise<ApiResponse<Record<number, BookingDetailResponse>>> => {
  try {
    const res = await client.post("/bookings/batch", { bookingIds });
    return wrap(res);
  } catch (err: unknown) {
    return { status: 500, message: err instanceof Error ? err.message : "Unknown error", data: null };
  }
};

/**
 * GET /bookings/user/{userId}/summary
 * Lấy thống kê booking của user
 */
export const getUserBookingSummary = async (userId: number): Promise<ApiResponse<BookingSummaryDTO>> => {
  try {
    const res = await client.get(`/bookings/user/${userId}/summary`);
    return wrap(res);
  } catch (err: unknown) {
    return { status: 500, message: err instanceof Error ? err.message : "Unknown error", data: null };
  }
};

/**
 * POST /bookings/cancel
 * Hủy booking
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
  getBookingById,
  getBookingsByUserId,
  getAllBookings,
  getPassengersByBookingCode,
  getBookingNotesByBookingCode,
  getCancellationByBookingCode,
  getBookingsByIds,
  getUserBookingSummary,
  cancelBooking,
};

export default bookingApi;
