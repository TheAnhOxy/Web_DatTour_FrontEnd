'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import bookingApi, { BookingDetailResponse, CancelBookingRequest } from '@/api/bookingApi';

const statusConfig = {
  PENDING: { label: 'Chờ thanh toán', color: '#FF6B00', bgColor: '#FFF2E8' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#00A854', bgColor: '#E8F8F0' },
  CANCELLED: { label: 'Đã hủy', color: '#FF4D4F', bgColor: '#FFE8E8' },
  COMPLETED: { label: 'Hoàn thành', color: '#1890FF', bgColor: '#E8F4FD' },
};

function formatCurrency(value: number | undefined) {
  if (!value) return '0 VND';
  return new Intl.NumberFormat('vi-VN').format(value) + ' VND';
}

function formatDate(dateString: string | undefined) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

function getAgeGroupLabel(ageGroup: string): string {
  const labels: Record<string, string> = {
    ADULT: 'Người lớn',
    CHILD_10_14: 'Trẻ em (10-14)',
    CHILD_4_9: 'Trẻ em (4-9)',
    BABY: 'Trẻ sơ sinh',
  };
  return labels[ageGroup] || ageGroup;
}

function getGenderLabel(gender: string): string {
  return gender === 'MALE' ? 'Nam' : 'Nữ';
}

export default function BookingDetailPage() {
  const params = useParams();
  const bookingCode = params?.id as string;

  const [booking, setBooking] = useState<BookingDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (!bookingCode) return;

    const loadBooking = async () => {
      try {
        setLoading(true);
        const response = await bookingApi.getBookingByCode(bookingCode);
        if (response.status === 200 && response.data) {
          setBooking(response.data);
        } else {
          setError(response.message || 'Không tìm thấy đặt tour');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingCode]);

  const handleCancel = async () => {
    if (!booking) return;

    try {
      setCanceling(true);
      const cancelData: CancelBookingRequest = {
        bookingCode: booking.bookingCode,
        reason: cancelReason || undefined,
      };

      const response = await bookingApi.cancelBooking(cancelData);
      if (response.status === 200) {
        alert('Hủy đặt tour thành công!');
        // Reload booking data
        window.location.reload();
      } else {
        alert(response.message || 'Không thể hủy đặt tour');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi hủy');
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
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
    );
  }

  if (error || !booking) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2 style={{ color: '#FF4D4F', marginBottom: '12px' }}>⚠️ {error || 'Không tìm thấy đặt tour'}</h2>
        <a href="/my-tours" style={{
          display: 'inline-block',
          marginTop: '20px',
          padding: '12px 30px',
          backgroundColor: '#FF6B00',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: '600',
        }}>
          Quay lại danh sách
        </a>
      </div>
    );
  }

  const statusKey = (booking.status || 'PENDING') as keyof typeof statusConfig;
  const config = statusConfig[statusKey];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingTop: '40px', paddingBottom: '60px' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', color: '#000' }}>
              Chi tiết đặt tour
            </h1>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Mã đặt tour: <strong>{booking.bookingCode}</strong>
            </p>
          </div>
          <div style={{
            padding: '8px 16px',
            borderRadius: '20px',
            backgroundColor: config.bgColor,
            color: config.color,
            fontSize: '14px',
            fontWeight: '600',
          }}>
            {config.label}
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
          {/* Left Column */}
          <div>
            {/* Tour Info */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #E8E8E8',
              padding: '24px',
              marginBottom: '20px',
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#000' }}>
                🎫 Thông tin tour
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>TÊN TOUR</p>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#000' }}>
                    {booking.destination?.destinationName || '-'}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>THÀNH PHỐ</p>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#000' }}>
                    {booking.destination?.cityName || '-'}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>NGÀY ĐẶT</p>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#000' }}>
                    {formatDate(booking.createdAt)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>HẠN THANH TOÁN</p>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#FF6B00' }}>
                    {formatDate(booking.paymentDueAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Passengers */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #E8E8E8',
              padding: '24px',
              marginBottom: '20px',
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#000' }}>
                👥 Hành khách
              </h2>
              {booking.passengers && booking.passengers.length > 0 ? (
                <div>
                  {booking.passengers.map((passenger, idx) => (
                    <div key={idx} style={{
                      padding: '12px 0',
                      borderBottom: idx < booking.passengers!.length - 1 ? '1px solid #E8E8E8' : 'none',
                    }}>
                      <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px', color: '#000' }}>
                        {idx + 1}. {passenger.fullName}
                      </p>
                      <p style={{ fontSize: '13px', color: '#666', marginBottom: '2px' }}>
                        Ngày sinh: {passenger.dob} • {getGenderLabel(passenger.gender)}
                      </p>
                      <p style={{ fontSize: '13px', color: '#666', marginBottom: '2px' }}>
                        Nhóm tuổi: {getAgeGroupLabel(passenger.ageGroup)}
                      </p>
                      {passenger.idCardNumber && (
                        <p style={{ fontSize: '13px', color: '#666' }}>
                          CMND/CCCD: {passenger.idCardNumber}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#999' }}>Chưa có thông tin hành khách</p>
              )}
            </div>

            {/* Booking Notes */}
            {booking.bookingNotes && booking.bookingNotes.length > 0 && (
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: '1px solid #E8E8E8',
                padding: '24px',
                marginBottom: '20px',
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#000' }}>
                  📝 Ghi chú
                </h2>
                {booking.bookingNotes.map((note, idx) => (
                  <div key={idx} style={{ marginBottom: '12px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#000' }}>
                      {note.content}
                    </p>
                    <p style={{ fontSize: '12px', color: '#999' }}>
                      {formatDate(note.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Cancellation Info */}
            {booking.cancellation && (
              <div style={{
                backgroundColor: '#FFE8E8',
                borderRadius: '12px',
                border: '1px solid #FF4D4F',
                padding: '24px',
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#FF4D4F' }}>
                  ❌ Thông tin hủy
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>LÝ DO HỦY</p>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#000' }}>
                      {booking.cancellation.reason || '-'}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>SỐ TIỀN HOÀN</p>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#FF4D4F' }}>
                      {formatCurrency(booking.cancellation.refundAmount)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Payment Info & Actions */}
          <div>
            {/* Payment Summary */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #E8E8E8',
              padding: '24px',
              marginBottom: '20px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#000' }}>
                💰 Thông tin thanh toán
              </h3>
              <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Tổng tiền</p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#FF6B00' }}>
                  {formatCurrency(booking.totalAmount)}
                </p>
              </div>
              {booking.paidAmount !== undefined && (
                <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Đã thanh toán</p>
                  <p style={{ fontSize: '16px', fontWeight: '700', color: '#00A854' }}>
                    {formatCurrency(booking.paidAmount)}
                  </p>
                </div>
              )}
              {booking.paymentMethod && (
                <div>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Phương thức</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#000' }}>
                    {booking.paymentMethod === 'CASH_OFFICE' ? 'Thanh toán tại quầy' : booking.paymentMethod}
                  </p>
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #E8E8E8',
              padding: '24px',
              marginBottom: '20px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#000' }}>
                📞 Thông tin liên hệ
              </h3>
              {booking.contactName && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '12px', color: '#999' }}>TÊN</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#000' }}>{booking.contactName}</p>
                </div>
              )}
              {booking.contactEmail && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '12px', color: '#999' }}>EMAIL</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#000' }}>{booking.contactEmail}</p>
                </div>
              )}
              {booking.contactPhone && (
                <div>
                  <p style={{ fontSize: '12px', color: '#999' }}>ĐIỆN THOẠI</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#000' }}>{booking.contactPhone}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            {booking.status === 'PENDING' && (
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: '1px solid #E8E8E8',
                padding: '24px',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#000' }}>
                  ⚙️ Tác vụ
                </h3>
                <div style={{ marginBottom: '12px' }}>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Lý do hủy (tùy chọn)"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      fontSize: '13px',
                      marginBottom: '12px',
                      fontFamily: 'inherit',
                    }}
                    rows={3}
                  />
                </div>
                <button
                  onClick={handleCancel}
                  disabled={canceling}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#FF4D4F',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: canceling ? 'not-allowed' : 'pointer',
                    opacity: canceling ? 0.6 : 1,
                  }}
                >
                  {canceling ? 'Đang xử lý...' : '❌ Hủy đặt tour'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <a href="/my-tours" style={{
          display: 'inline-block',
          padding: '12px 24px',
          backgroundColor: '#f5f5f5',
          color: '#000',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          transition: 'background-color 0.3s',
        }}>
          ← Quay lại danh sách
        </a>
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
