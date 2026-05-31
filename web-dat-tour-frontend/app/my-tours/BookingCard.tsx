'use client';

import Link from 'next/link';
import { BookingResponse, BookingStatus } from '@/api/bookingApi';
import { formatUtcDateOnly as formatDate } from '@/utils/dateUtils';

interface BookingCardProps {
  booking: BookingResponse;
}

const statusConfig: Record<BookingStatus, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: 'Chờ thanh toán', color: '#FF6B00', bgColor: '#FFF2E8' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#00A854', bgColor: '#E8F8F0' },
  CANCELLED: { label: 'Đã hủy', color: '#FF4D4F', bgColor: '#FFE8E8' },
  COMPLETED: { label: 'Hoàn thành', color: '#1890FF', bgColor: '#E8F4FD' },
};

function formatCurrency(value: number | undefined) {
  if (!value) return '0 VND';
  return new Intl.NumberFormat('vi-VN').format(value) + ' VND';
}

export default function BookingCard({ booking }: BookingCardProps) {
  const status = (booking.status || 'PENDING') as BookingStatus;
  const config = statusConfig[status];

  return (
    <Link href={`/booking/${booking.bookingCode}`}>
      <div className="booking-card" style={{
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #E8E8E8',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginBottom: '16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        alignItems: 'center',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
        el.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = 'none';
        el.style.transform = 'translateY(0)';
      }}
      >
        {/* Booking Code & Status */}
        <div>
          <p style={{ fontSize: '12px', color: '#999', margin: '0 0 8px 0' }}>MÃ ĐẶT TOUR</p>
          <h4 style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#000' }}>
            {booking.bookingCode}
          </h4>
          <div style={{
            marginTop: '8px',
            padding: '6px 12px',
            borderRadius: '20px',
            display: 'inline-block',
            fontSize: '12px',
            fontWeight: '500',
            color: config.color,
            backgroundColor: config.bgColor,
          }}>
            {config.label}
          </div>
        </div>

        {/* Tour Info */}
        <div>
          <p style={{ fontSize: '12px', color: '#999', margin: '0 0 8px 0' }}>TOUR</p>
          <h5 style={{ margin: '0', fontSize: '15px', fontWeight: '600', color: '#000' }}>
            {booking.destination?.destinationName || 'Tour không xác định'}
          </h5>
          <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>
            📍 {booking.destination?.cityName || '-'}
          </p>
        </div>

        {/* Date Info */}
        <div>
          <p style={{ fontSize: '12px', color: '#999', margin: '0 0 8px 0' }}>NGÀY ĐẶT</p>
          <p style={{ margin: '0', fontSize: '15px', fontWeight: '600', color: '#000' }}>
            {formatDate(booking.createdAt)}
          </p>
          <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 0 0' }}>
            Hạn thanh toán: {formatDate(booking.paymentDueAt)}
          </p>
        </div>

        {/* Passengers */}
        <div>
          <p style={{ fontSize: '12px', color: '#999', margin: '0 0 8px 0' }}>HÀNH KHÁCH</p>
          <p style={{ margin: '0', fontSize: '15px', fontWeight: '600', color: '#000' }}>
            {booking.passengers?.length || 0} người
          </p>
          <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
            {booking.passengers?.map(p => p.fullName).join(', ') || '-'}
          </p>
        </div>

        {/* Amount */}
        <div>
          <p style={{ fontSize: '12px', color: '#999', margin: '0 0 8px 0' }}>TỔNG TIỀN</p>
          <p style={{ margin: '0', fontSize: '16px', fontWeight: '700', color: '#FF6B00' }}>
            {formatCurrency(booking.totalAmount)}
          </p>
          {booking.paidAmount !== undefined && (
            <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 0 0' }}>
              Đã thanh toán: {formatCurrency(booking.paidAmount)}
            </p>
          )}
        </div>

        {/* Action */}
        <div style={{ textAlign: 'right' }}>
          <button style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#FF6B00',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
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
          </button>
        </div>
      </div>
    </Link>
  );
}
