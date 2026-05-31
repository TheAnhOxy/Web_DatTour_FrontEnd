'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import bookingApi from '@/api/bookingApi';
import { formatUtcDateTime as formatDate } from '@/utils/dateUtils';

// Color definitions matching modern premium aesthetics
const theme = {
  primary: '#FF6B00',
  primaryHover: '#E55A00',
  primaryLight: '#FFF2E8',
  textDark: '#1A1A1A',
  textMuted: '#666666',
  textLight: '#999999',
  border: '#E8E8E8',
  bgLight: '#F8F9FA',
  white: '#FFFFFF',
  shadow: 'rgba(0, 0, 0, 0.05)',
  shadowHover: 'rgba(0, 0, 0, 0.12)',
};

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: 'Chờ thanh toán', color: '#D46B08', bgColor: '#FFF7E6' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#389E0D', bgColor: '#F6FFED' },
  CANCELLED: { label: 'Đã hủy', color: '#CF1322', bgColor: '#FFF1F0' },
  COMPLETED: { label: 'Hoàn thành', color: '#096DD9', bgColor: '#E6F7FF' },
  CANCELLED_TIMEOUT: { label: 'Quá hạn (Hủy)', color: '#8C8C8C', bgColor: '#F5F5F5' },
};

function formatCurrency(value: number | undefined) {
  if (value === undefined) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
}

export default function MyToursPage() {
  const authUser = useAuthStore((state) => state.user);
  const authHydrated = useAuthStore((state) => state._hasHydrated);

  // States
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search state
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Pagination & Filter state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const LIMIT = 10;

  // Cancel modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelingBooking, setCancelingBooking] = useState<any | null>(null);
  const [cancelReasonOption, setCancelReasonOption] = useState('Thay đổi lịch trình cá nhân đột xuất');
  const [customReason, setCustomReason] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  // Alert message banner state
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showAlert = (text: string, type: 'success' | 'error') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  // Load Bookings History
  const loadBookings = useCallback(async () => {
    if (!authUser?.userId) {
      console.log("DEBUG: No authUser.userId found", authUser);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("DEBUG: Loading history...", {
        gateway: process.env.NEXT_PUBLIC_API_GATEWAY,
        userId: authUser.userId,
        token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
      });

      const response = await bookingApi.getMyHistory(
        selectedStatus || undefined,
        page,
        LIMIT,
        authUser.userId
      );

      console.log("DEBUG: MyHistory response:", response);

      // Handle standard 401 response from filter
      if (response.status === 401) {
        setError('Yêu cầu đăng nhập để thực hiện chức năng này!');
        return;
      }

      if (response.status === 200 && response.data) {
        const paginatedData = response.data;
        const items = paginatedData.content || paginatedData.data || [];
        setBookings(items);
        setTotalPages(paginatedData.totalPages || 0);
      } else {
        setError(response.message || 'Không thể tải danh sách đặt tour');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu lịch sử');
    } finally {
      setLoading(false);
    }
  }, [authUser?.userId, page, selectedStatus]);

  useEffect(() => {
    if (authHydrated && authUser?.userId) {
      loadBookings();
    }
  }, [authHydrated, authUser?.userId, page, selectedStatus, loadBookings]);

  // Handle Booking Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = searchCode.trim().toUpperCase();
    if (!code) return;

    try {
      setSearching(true);
      setSearchError(null);
      setSearchResult(null);

      const response = await bookingApi.getBookingByCode(code);

      if (response.status === 401) {
        setSearchError('Yêu cầu đăng nhập để tìm kiếm đơn hàng!');
        return;
      }

      if (response.status === 200 && response.data) {
        setSearchResult(response.data);
      } else {
        setSearchError(response.message || 'Không tìm thấy đơn hàng với mã này');
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Lỗi khi tìm kiếm đơn hàng');
    } finally {
      setSearching(false);
    }
  };

  // Open Cancel Dialog
  const openCancelModal = (booking: any) => {
    setCancelingBooking(booking);
    setCancelReasonOption('Thay đổi lịch trình cá nhân đột xuất');
    setCustomReason('');
    setShowCancelModal(true);
  };

  // Submit Cancellation Request
  const handleCancelSubmit = async () => {
    if (!cancelingBooking) return;
    
    const reason = cancelReasonOption === 'Lý do khác' ? customReason.trim() : cancelReasonOption;
    if (cancelReasonOption === 'Lý do khác' && !reason) {
      showAlert('Vui lòng nhập lý do hủy cụ thể!', 'error');
      return;
    }

    try {
      setCancelSubmitting(true);
      const payload = {
        bookingId: cancelingBooking.bookingId,
        cancellationReason: reason,
        bookingCode: cancelingBooking.bookingCode,
      };

      const response = await bookingApi.cancelBooking(payload);

      if (response.status === 200) {
        showAlert('Hủy đơn hàng thành công!', 'success');
        setShowCancelModal(false);
        // Refresh bookings and search results
        loadBookings();
        if (searchResult && searchResult.bookingId === cancelingBooking.bookingId) {
          setSearchResult({ ...searchResult, status: 'CANCELLED' });
        }
      } else {
        showAlert(response.message || 'Không thể hủy đơn hàng', 'error');
      }
    } catch (err) {
      showAlert(err instanceof Error ? err.message : 'Lỗi khi hủy đơn hàng', 'error');
    } finally {
      setCancelSubmitting(false);
    }
  };

  // Auth guard page
  if (authHydrated && !authUser) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.bgLight,
        fontFamily: 'system-ui, sans-serif',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '480px',
          width: '100%',
          backgroundColor: theme.white,
          borderRadius: '20px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
          padding: '40px 30px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: theme.primaryLight,
            color: theme.primary,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            marginBottom: '24px'
          }}>
            🔒
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.textDark, marginBottom: '12px' }}>
            Yêu Cầu Đăng Nhập
          </h2>
          <p style={{ color: theme.textMuted, fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
            Vui lòng đăng nhập tài khoản của bạn để truy cập lịch sử và thông tin đặt tour cá nhân.
          </p>
          <a href={`/login?returnUrl=${encodeURIComponent('/my-tours')}`} style={{
            display: 'block',
            width: '100%',
            padding: '14px 20px',
            backgroundColor: theme.primary,
            color: theme.white,
            textDecoration: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '16px',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primaryHover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.primary}
          >
            Đăng nhập ngay
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.bgLight,
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: '80px',
      position: 'relative'
    }}>
      {/* Toast Alert Banner */}
      {alertMsg && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          backgroundColor: alertMsg.type === 'success' ? '#389E0D' : '#CF1322',
          color: theme.white,
          padding: '12px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: '600',
          fontSize: '14px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <span>{alertMsg.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Hero Banner Header */}
      <div style={{
        background: `linear-gradient(135deg, ${theme.primary} 0%, #FF9A44 100%)`,
        padding: '60px 0 100px 0',
        color: theme.white,
        textAlign: 'center',
        boxShadow: 'inset 0 -10px 20px rgba(0,0,0,0.05)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.5px' }}>
            Đơn Hàng Của Tôi
          </h1>
          <p style={{ fontSize: '16px', opacity: 0.9, fontWeight: '400' }}>
            Tìm kiếm mã đơn hàng và quản lý toàn bộ hành trình đặt tour của bạn
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div style={{
        maxWidth: '1200px',
        margin: '-50px auto 0 auto',
        padding: '0 20px',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '30px'
        }}>
          {/* Section 1: Search Form Card */}
          <div style={{
            backgroundColor: theme.white,
            borderRadius: '16px',
            boxShadow: `0 4px 20px ${theme.shadow}`,
            padding: '24px',
            border: `1px solid ${theme.border}`
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.textDark, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔍 Tra cứu nhanh đơn đặt tour
            </h3>
            <form onSubmit={handleSearch} style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <input
                type="text"
                placeholder="Nhập mã đặt tour (ví dụ: BK20260531XYZ)..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '260px',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  border: `1px solid ${theme.border}`,
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.target.style.borderColor = theme.primary}
                onBlur={(e) => e.target.style.borderColor = theme.border}
              />
              <button
                type="submit"
                disabled={searching || !searchCode.trim()}
                style={{
                  padding: '14px 28px',
                  backgroundColor: theme.primary,
                  color: theme.white,
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: searching || !searchCode.trim() ? 'not-allowed' : 'pointer',
                  opacity: searching || !searchCode.trim() ? 0.7 : 1,
                  transition: 'background-color 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!searching && searchCode.trim()) {
                    e.currentTarget.style.backgroundColor = theme.primaryHover;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.primary;
                }}
              >
                {searching ? 'Đang tìm...' : 'Tìm kiếm'}
              </button>
            </form>

            {/* Search Results Display */}
            {searching && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 0' }}>
                <div className="spinner" style={{
                  width: '30px',
                  height: '30px',
                  border: `3px solid ${theme.bgLight}`,
                  borderTop: `3px solid ${theme.primary}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              </div>
            )}

            {searchError && (
              <div style={{
                marginTop: '16px',
                padding: '14px 18px',
                backgroundColor: '#FFF1F0',
                border: '1px solid #FFA39E',
                borderRadius: '8px',
                color: '#CF1322',
                fontSize: '14px'
              }}>
                ❌ {searchError}
              </div>
            )}

            {searchResult && (
              <div style={{
                marginTop: '20px',
                padding: '24px',
                backgroundColor: '#FFFDF6',
                border: `2px solid ${theme.primary}`,
                borderRadius: '12px',
                position: 'relative',
                animation: 'fadeIn 0.3s ease'
              }}>
                <button
                  onClick={() => setSearchResult(null)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    fontSize: '18px',
                    cursor: 'pointer',
                    color: theme.textLight
                  }}
                  title="Đóng kết quả"
                >
                  ✕
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: theme.primary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🎯 Kết quả tìm kiếm
                  </span>
                  <div style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: statusConfig[searchResult.status]?.color || theme.textDark,
                    backgroundColor: statusConfig[searchResult.status]?.bgColor || theme.bgLight,
                  }}>
                    {statusConfig[searchResult.status]?.label || searchResult.status}
                  </div>
                </div>

                <h4 style={{ fontSize: '18px', fontWeight: '700', color: theme.textDark, marginBottom: '16px' }}>
                  {searchResult.tourName || searchResult.tourTitle || searchResult.destination?.destinationName || 'Tour du lịch'}
                </h4>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <span style={{ fontSize: '12px', color: theme.textLight, display: 'block', marginBottom: '2px' }}>MÃ ĐƠN HÀNG</span>
                    <strong style={{ fontSize: '15px', color: theme.textDark }}>{searchResult.bookingCode}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: theme.textLight, display: 'block', marginBottom: '2px' }}>NGƯỜI LIÊN HỆ</span>
                    <span style={{ fontSize: '14px', color: theme.textDark, fontWeight: '500' }}>
                      {searchResult.contactName || '-'}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: theme.textLight, display: 'block', marginBottom: '2px' }}>EMAIL / SỐ ĐT</span>
                    <span style={{ fontSize: '14px', color: theme.textDark }}>
                      {searchResult.contactEmail} / {searchResult.contactPhone}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: theme.textLight, display: 'block', marginBottom: '2px' }}>NGÀY ĐẶT</span>
                    <span style={{ fontSize: '14px', color: theme.textDark }}>{formatDate(searchResult.createdAt)}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: theme.textLight, display: 'block', marginBottom: '2px' }}>TỔNG TIỀN ĐƠN</span>
                    <strong style={{ fontSize: '18px', color: theme.primary }}>{formatCurrency(searchResult.totalPrice ?? searchResult.totalAmount)}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <a href={`/booking/${searchResult.bookingCode}`} style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: `1.5px solid ${theme.border}`,
                    backgroundColor: theme.white,
                    color: theme.textDark,
                    fontSize: '14px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.textLight;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.border;
                  }}
                  >
                    Xem chi tiết →
                  </a>
                  {(searchResult.status === 'PENDING' || searchResult.status === 'CONFIRMED') && (
                    <button
                      onClick={() => openCancelModal(searchResult)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#FF4D4F',
                        color: theme.white,
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D9363E'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF4D4F'}
                    >
                      Hủy đặt tour
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Bookings List Card */}
          <div style={{
            backgroundColor: theme.white,
            borderRadius: '16px',
            boxShadow: `0 4px 20px ${theme.shadow}`,
            padding: '24px',
            border: `1px solid ${theme.border}`
          }}>
            {/* Filter Tabs menu */}
            <div style={{
              display: 'flex',
              borderBottom: `2px solid ${theme.border}`,
              marginBottom: '24px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              gap: '24px'
            }}>
              {[
                { value: '', label: 'Tất cả đơn đặt' },
                { value: 'PENDING', label: 'Chờ thanh toán' },
                { value: 'CONFIRMED', label: 'Đã xác nhận' },
                { value: 'CANCELLED', label: 'Đã hủy' }
              ].map((tab) => {
                const isActive = selectedStatus === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setSelectedStatus(tab.value);
                      setPage(0);
                    }}
                    style={{
                      padding: '14px 4px',
                      background: 'none',
                      border: 'none',
                      borderBottom: isActive ? `3px solid ${theme.primary}` : '3px solid transparent',
                      color: isActive ? theme.primary : theme.textMuted,
                      fontWeight: isActive ? '700' : '500',
                      fontSize: '15px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      outline: 'none',
                      marginBottom: '-2px'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Loading State */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{
                  display: 'inline-block',
                  width: '36px',
                  height: '36px',
                  border: `3px solid ${theme.bgLight}`,
                  borderTop: `3px solid ${theme.primary}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
                <p style={{ marginTop: '16px', color: theme.textMuted, fontSize: '14px' }}>Đang tải lịch sử đơn hàng...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div style={{
                padding: '16px 20px',
                backgroundColor: '#FFF1F0',
                border: '1px solid #FFA39E',
                borderRadius: '10px',
                color: '#CF1322',
                marginBottom: '20px',
                fontSize: '15px'
              }}>
                ⚠️ Lỗi: {error}
              </div>
            )}

            {/* Empty State */}
            {!loading && bookings.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                border: `2px dashed ${theme.border}`,
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                <h4 style={{ fontSize: '18px', fontWeight: '700', color: theme.textDark, marginBottom: '8px' }}>
                  Không có đơn đặt tour nào
                </h4>
                <p style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '24px' }}>
                  {selectedStatus
                    ? `Bạn không có đơn đặt nào với trạng thái này.`
                    : `Bạn chưa thực hiện đặt tour nào trên hệ thống.`}
                </p>
                <a href="/tours" style={{
                  display: 'inline-block',
                  padding: '12px 28px',
                  backgroundColor: theme.primary,
                  color: theme.white,
                  textDecoration: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '15px',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primaryHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.primary}
                >
                  Khám phá các tour ngay →
                </a>
              </div>
            )}

            {/* Bookings List */}
            {!loading && bookings.length > 0 && (
              <div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {bookings.map((booking) => {
                    const statusVal = booking.status || 'PENDING';
                    const config = statusConfig[statusVal] || { label: statusVal, color: theme.textDark, bgColor: theme.bgLight };
                    
                    return (
                      <div
                        key={booking.bookingCode}
                        style={{
                          border: `1px solid ${theme.border}`,
                          borderRadius: '10px',
                          padding: '14px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          backgroundColor: theme.white,
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
                          flexWrap: 'wrap'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = `0 6px 20px ${theme.shadow}`;
                          e.currentTarget.style.borderColor = theme.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.01)';
                          e.currentTarget.style.borderColor = theme.border;
                        }}
                      >
                        {/* 1. Code & Date */}
                        <div style={{ flex: '0 0 180px', minWidth: '150px' }}>
                          <span style={{ fontSize: '11px', color: theme.textLight, fontWeight: '600', display: 'block', textTransform: 'uppercase' }}>Mã đặt chỗ</span>
                          <strong style={{ fontSize: '14px', color: theme.textDark }}>{booking.bookingCode}</strong>
                          <span style={{ fontSize: '12px', color: theme.textMuted, display: 'block', marginTop: '2px' }}>{formatDate(booking.createdAt)}</span>
                        </div>

                        {/* 2. Tour Title */}
                        <div style={{ flex: '1 1 250px', minWidth: '200px' }}>
                          <span style={{ fontSize: '11px', color: theme.textLight, fontWeight: '600', display: 'block', textTransform: 'uppercase' }}>Chuyến đi</span>
                          <h5 style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: '600', color: theme.textDark, lineHeight: '1.4' }}>
                            {booking.tourName || booking.tourTitle || booking.destination?.destinationName || 'Tour du lịch'}
                          </h5>
                        </div>

                        {/* 3. Price */}
                        <div style={{ flex: '0 0 130px', minWidth: '110px' }}>
                          <span style={{ fontSize: '11px', color: theme.textLight, fontWeight: '600', display: 'block', textTransform: 'uppercase' }}>Tổng thanh toán</span>
                          <strong style={{ fontSize: '15px', color: theme.primary }}>{formatCurrency(booking.totalPrice ?? booking.totalAmount)}</strong>
                        </div>

                        {/* 4. Status Badge */}
                        <div style={{ flex: '0 0 150px', minWidth: '120px' }}>
                          <div style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textAlign: 'center',
                            display: 'inline-block',
                            color: config.color,
                            backgroundColor: config.bgColor,
                          }}>
                            {config.label}
                          </div>
                        </div>

                        {/* 5. Buttons */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', flex: '0 0 200px', justifyContent: 'flex-end', minWidth: '180px' }}>
                          <a href={`/booking/${booking.bookingCode}`} style={{
                            padding: '8px 14px',
                            borderRadius: '6px',
                            border: `1.5px solid ${theme.border}`,
                            backgroundColor: theme.white,
                            color: theme.textDark,
                            fontSize: '13px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            textAlign: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = theme.textLight;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = theme.border;
                          }}
                          >
                            Chi tiết
                          </a>
                          {(statusVal === 'PENDING' || statusVal === 'CONFIRMED') && (
                            <button
                              onClick={() => openCancelModal(booking)}
                              style={{
                                padding: '8px 14px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#FF4D4F',
                                color: theme.white,
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D9363E'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF4D4F'}
                            >
                              Hủy đặt
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '32px'
                  }}>
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: page === 0 ? '#f5f5f5' : theme.white,
                        color: page === 0 ? theme.textLight : theme.textDark,
                        cursor: page === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      ←
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '8px',
                          border: i === page ? 'none' : `1px solid ${theme.border}`,
                          backgroundColor: i === page ? theme.primary : theme.white,
                          color: i === page ? theme.white : theme.textDark,
                          fontWeight: '600',
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page === totalPages - 1}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: page === totalPages - 1 ? '#f5f5f5' : theme.white,
                        color: page === totalPages - 1 ? theme.textLight : theme.textDark,
                        cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Modal Backdrop */}
      {showCancelModal && cancelingBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          animation: 'fadeIn 0.2s ease'
        }}>
          {/* Modal Container */}
          <div style={{
            backgroundColor: theme.white,
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            animation: 'slideUp 0.3s cubic-bezier(0.23, 1, 0.32, 1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.border}`, paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.textDark, margin: 0 }}>
                Hủy đơn đặt tour
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: theme.textLight
                }}
              >
                ✕
              </button>
            </div>

            <div>
              <p style={{ fontSize: '14px', color: theme.textMuted, margin: '0 0 16px 0', lineHeight: '1.5' }}>
                Bạn đang yêu cầu hủy tour: <strong style={{ color: theme.textDark }}>{cancelingBooking.tourName}</strong> (Mã đơn: <span style={{ color: theme.primary, fontWeight: '700' }}>{cancelingBooking.bookingCode}</span>).
              </p>
              
              <label style={{ fontSize: '14px', fontWeight: '600', color: theme.textDark, display: 'block', marginBottom: '10px' }}>
                Lý do hủy đơn *
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                {[
                  'Thay đổi lịch trình cá nhân đột xuất',
                  'Tìm thấy tour khác phù hợp hơn',
                  'Vấn đề về sức khỏe / cá nhân',
                  'Lý do khác'
                ].map((option) => (
                  <label key={option} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px',
                    color: theme.textDark,
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: cancelReasonOption === option ? theme.primaryLight : 'transparent',
                    border: cancelReasonOption === option ? `1px solid ${theme.primary}50` : '1px solid transparent',
                    transition: 'all 0.2s'
                  }}>
                    <input
                      type="radio"
                      name="cancelReason"
                      value={option}
                      checked={cancelReasonOption === option}
                      onChange={() => setCancelReasonOption(option)}
                      style={{ accentColor: theme.primary }}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>

              {cancelReasonOption === 'Lý do khác' && (
                <textarea
                  placeholder="Vui lòng cho chúng tôi biết lý do chi tiết..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`,
                    fontSize: '14px',
                    outline: 'none',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  required
                />
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: `1px solid ${theme.border}`, paddingTop: '16px' }}>
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelSubmitting}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: `1.5px solid ${theme.border}`,
                  backgroundColor: theme.white,
                  color: theme.textDark,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: cancelSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleCancelSubmit}
                disabled={cancelSubmitting}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#FF4D4F',
                  color: theme.white,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: cancelSubmitting ? 'not-allowed' : 'pointer',
                  opacity: cancelSubmitting ? 0.7 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {cancelSubmitting ? 'Đang xử lý...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Animations and Keyframes */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
