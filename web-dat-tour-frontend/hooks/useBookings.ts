import { useState, useCallback } from 'react';
import bookingApi, {
  BookingResponse,
  BookingDetailResponse,
  PaginatedResponse,
  BookingSummaryDTO,
  PassengerDTO,
} from '@/api/bookingApi';

interface UseBookingsResult {
  bookings: BookingResponse[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  fetchBookings: (userId: number, status?: string, page?: number, limit?: number) => Promise<void>;
  setPage: (page: number) => void;
}

interface UseBookingDetailResult {
  booking: BookingDetailResponse | null;
  loading: boolean;
  error: string | null;
  fetchBookingByCode: (code: string) => Promise<void>;
  fetchBookingById: (id: number) => Promise<void>;
  cancelBooking: (bookingCode: string, reason?: string) => Promise<boolean>;
}

interface UseBookingSummaryResult {
  summary: BookingSummaryDTO | null;
  loading: boolean;
  error: string | null;
  fetchSummary: (userId: number) => Promise<void>;
}

/**
 * Hook for fetching user bookings with pagination
 */
export const useBookings = (): UseBookingsResult => {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchBookings = useCallback(
    async (userId: number, status?: string, pageNum: number = 0, limit: number = 10) => {
      try {
        setLoading(true);
        setError(null);
        const response = await bookingApi.getBookingsByUserId(userId, status, pageNum, limit);
        
        if (response.status === 200 && response.data) {
          const data = response.data as PaginatedResponse<BookingResponse>;
          setBookings(data.data || []);
          setTotalPages(data.totalPages || 0);
          setPage(pageNum);
        } else {
          setError(response.message || 'Failed to fetch bookings');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { bookings, loading, error, page, totalPages, fetchBookings, setPage };
};

/**
 * Hook for fetching booking details
 */
export const useBookingDetail = (): UseBookingDetailResult => {
  const [booking, setBooking] = useState<BookingDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookingByCode = useCallback(async (code: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingApi.getBookingByCode(code);
      
      if (response.status === 200 && response.data) {
        setBooking(response.data);
      } else {
        setError(response.message || 'Booking not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBookingById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingApi.getBookingById(id);
      
      if (response.status === 200 && response.data) {
        setBooking(response.data);
      } else {
        setError(response.message || 'Booking not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (bookingCode: string, reason?: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingApi.cancelBooking({ bookingCode, reason });
      
      if (response.status === 200) {
        // Refresh booking data
        await fetchBookingByCode(bookingCode);
        return true;
      } else {
        setError(response.message || 'Failed to cancel booking');
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchBookingByCode]);

  return { booking, loading, error, fetchBookingByCode, fetchBookingById, cancelBooking };
};

/**
 * Hook for fetching booking summary
 */
export const useBookingSummary = (): UseBookingSummaryResult => {
  const [summary, setSummary] = useState<BookingSummaryDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async (userId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingApi.getUserBookingSummary(userId);
      
      if (response.status === 200 && response.data) {
        setSummary(response.data);
      } else {
        setError(response.message || 'Failed to fetch summary');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  return { summary, loading, error, fetchSummary };
};
