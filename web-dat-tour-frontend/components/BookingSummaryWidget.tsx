'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import bookingApi, { BookingSummaryDTO } from '@/api/bookingApi';

export default function BookingSummaryWidget() {
  const authUser = useAuthStore((state) => state.user);
  const [summary, setSummary] = useState<BookingSummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser?.userId) {
      setLoading(false);
      return;
    }

    const loadSummary = async () => {
      try {
        setLoading(true);
        const response = await bookingApi.getUserBookingSummary(authUser.userId);
        if (response.status === 200 && response.data) {
          setSummary(response.data);
        } else {
          setError(response.message || 'Failed to load summary');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [authUser?.userId]);

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #E8E8E8',
        padding: '24px',
        textAlign: 'center',
      }}>
        <p style={{ color: '#999' }}>Đang tải...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div style={{
        backgroundColor: '#FFE8E8',
        borderRadius: '12px',
        border: '1px solid #FF4D4F',
        padding: '24px',
        color: '#FF4D4F',
      }}>
        <p>{error || 'Could not load booking summary'}</p>
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    PENDING: 'Chờ thanh toán',
    CONFIRMED: 'Đã xác nhận',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
  };

  const statusColors: Record<string, string> = {
    PENDING: '#FF6B00',
    CONFIRMED: '#00A854',
    COMPLETED: '#1890FF',
    CANCELLED: '#FF4D4F',
  };

  function formatCurrency(value: number | undefined) {
    if (!value) return '0 VND';
    return new Intl.NumberFormat('vi-VN').format(value) + ' VND';
  }

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      border: '1px solid #E8E8E8',
      padding: '24px',
    }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '700',
        marginBottom: '20px',
        color: '#000',
      }}>
        📊 Thống kê đặt tour
      </h2>

      {/* Main Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {/* Total Bookings */}
        <div style={{
          backgroundColor: '#F0F5FF',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
            TỔNG SỐ TOUR
          </p>
          <p style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1890FF',
            margin: '0',
          }}>
            {summary.totalBookings}
          </p>
        </div>

        {/* Total Amount */}
        <div style={{
          backgroundColor: '#FFF5E8',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
            TỔNG TIỀN
          </p>
          <p style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#FF6B00',
            margin: '0',
          }}>
            {formatCurrency(summary.totalAmount)}
          </p>
        </div>

        {/* Total Paid */}
        <div style={{
          backgroundColor: '#E8F8F0',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
            ĐÃ THANH TOÁN
          </p>
          <p style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#00A854',
            margin: '0',
          }}>
            {formatCurrency(summary.totalPaidAmount)}
          </p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '700',
          marginBottom: '12px',
          color: '#000',
        }}>
          Phân bố theo trạng thái:
        </h3>
        <div style={{ display: 'grid', gap: '8px' }}>
          {Object.entries(summary.byStatus || {}).map(([status, count]) => {
            const label = statusLabels[status];
            const color = statusColors[status];
            const percentage = summary.totalBookings
              ? Math.round((count / summary.totalBookings) * 100)
              : 0;

            return (
              <div key={status}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '4px',
                  fontSize: '13px',
                }}>
                  <span style={{ color: '#000', fontWeight: '500' }}>
                    {label}
                  </span>
                  <span style={{ color: '#999' }}>
                    {count} tour ({percentage}%)
                  </span>
                </div>
                <div style={{
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px',
                  height: '6px',
                  overflow: 'hidden',
                }}>
                  <div
                    style={{
                      backgroundColor: color,
                      height: '100%',
                      width: `${percentage}%`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* View Details Link */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a
          href="/my-tours"
          style={{
            display: 'inline-block',
            padding: '10px 24px',
            backgroundColor: '#FF6B00',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.backgroundColor = '#E55A00';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.backgroundColor = '#FF6B00';
          }}
        >
          Xem chi tiết →
        </a>
      </div>
    </div>
  );
}
