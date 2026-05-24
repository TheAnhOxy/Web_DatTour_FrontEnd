'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import bookingApi, { BookingResponse, PaginatedResponse } from '@/api/bookingApi';
import BookingCard from './BookingCard';

export default function MyToursPage() {
  const authUser = useAuthStore((state) => state.user);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const LIMIT = 10;

  useEffect(() => {
    const loadBookings = async () => {
      if (!authUser?.userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await bookingApi.getBookingsByUserId(
          authUser.userId,
          selectedStatus || undefined,
          page,
          LIMIT
        );

        if (response.status === 200 && response.data) {
          const paginatedData = response.data as PaginatedResponse<BookingResponse>;
          setBookings(paginatedData.data || []);
          setTotalPages(paginatedData.totalPages || 0);
        } else {
          setError(response.message || 'Không thể tải danh sách tour');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [authUser?.userId, page, selectedStatus]);

  if (!authUser?.userId) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Vui lòng đăng nhập để xem các tour đã đặt</h2>
        <a href="/login" style={{
          display: 'inline-block',
          marginTop: '20px',
          padding: '12px 30px',
          backgroundColor: '#FF6B00',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: '600',
        }}>
          Đăng nhập
        </a>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingTop: '40px', paddingBottom: '60px' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px', color: '#000' }}>
            Các Tour Của Tôi
          </h1>
          <p style={{ fontSize: '16px', color: '#666' }}>
            Quản lý và theo dõi tất cả các đặt tour của bạn
          </p>
        </div>

        {/* Filter Bar */}
        <div style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #E8E8E8',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <label style={{ fontSize: '14px', fontWeight: '600', color: '#000' }}>
            Lọc theo trạng thái:
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(0);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ thanh toán</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #FF6B00',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <p style={{ marginTop: '16px', color: '#666' }}>Đang tải...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{
            padding: '20px',
            backgroundColor: '#FFE8E8',
            border: '1px solid #FF4D4F',
            borderRadius: '8px',
            color: '#FF4D4F',
            marginBottom: '20px',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && bookings.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #E8E8E8',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#000' }}>
              Chưa có tour nào
            </h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
              {selectedStatus
                ? `Không có tour nào với trạng thái này`
                : `Bạn chưa đặt tour nào. Hãy khám phá và đặt tour ngay!`}
            </p>
            <a href="/tours" style={{
              display: 'inline-block',
              padding: '12px 30px',
              backgroundColor: '#FF6B00',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
            }}>
              Khám phá tour →
            </a>
          </div>
        )}

        {/* Bookings List */}
        {!loading && bookings.length > 0 && (
          <>
            <div style={{ marginBottom: '30px' }}>
              {bookings.map((booking) => (
                <BookingCard key={booking.bookingCode} booking={booking} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '30px',
              }}>
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    backgroundColor: page === 0 ? '#f5f5f5' : '#fff',
                    cursor: page === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: page === 0 ? '#999' : '#000',
                  }}
                >
                  ← Trước
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: i === page ? 'none' : '1px solid #ddd',
                      backgroundColor: i === page ? '#FF6B00' : '#fff',
                      color: i === page ? '#fff' : '#000',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page === totalPages - 1}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    backgroundColor: page === totalPages - 1 ? '#f5f5f5' : '#fff',
                    cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: page === totalPages - 1 ? '#999' : '#000',
                  }}
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
