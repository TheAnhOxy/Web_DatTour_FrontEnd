export const kpiCards = [
  {
    label: "Tổng tour",
    value: "248",
    delta: "+12% so với tháng trước",
    gradient: "from-cyan-500 to-blue-600",
    icon: "✈️",
  },
  {
    label: "Booking hôm nay",
    value: "42",
    delta: "+8 booking đang chờ",
    gradient: "from-fuchsia-500 to-violet-600",
    icon: "🛒",
  },
  {
    label: "Doanh thu",
    value: "2.4M",
    delta: "Tăng 18% tháng này",
    gradient: "from-emerald-500 to-teal-600",
    icon: "💰",
  },
  {
    label: "Hành khách mới",
    value: "156",
    delta: "34 tài khoản hôm nay",
    gradient: "from-amber-500 to-orange-600",
    icon: "👥",
  },
];

export const revenueSeries = [
  { month: "T1", revenue: 14.2 },
  { month: "T2", revenue: 16.5 },
  { month: "T3", revenue: 18.3 },
  { month: "T4", revenue: 22.1 },
  { month: "T5", revenue: 26.4 },
  { month: "T6", revenue: 28.9 },
  { month: "T7", revenue: 31.5 },
  { month: "T8", revenue: 35.7 },
  { month: "T9", revenue: 34.8 },
  { month: "T10", revenue: 38.2 },
  { month: "T11", revenue: 36.9 },
  { month: "T12", revenue: 41.4 },
];

export const bookingStatusSeries = [
  { name: "Pending", value: 18, color: "#f59e0b" },
  { name: "Confirmed", value: 67, color: "#22c55e" },
  { name: "Cancelled", value: 9, color: "#ef4444" },
  { name: "Completed", value: 28, color: "#3b82f6" },
];

export const popularTours = [
  { name: "Hạ Long", booking: 85, fill: "#2563eb" },
  { name: "Nha Trang", booking: 72, fill: "#7c3aed" },
  { name: "Đà Nẵng", booking: 65, fill: "#ec4899" },
  { name: "Phan Thiết", booking: 58, fill: "#10b981" },
];

export const recentBookings = [
  {
    id: "BK-2026-001",
    customer: "Nguyễn Văn A",
    tour: "Hạ Long 3N2Đ",
    date: "2026-05-08",
    status: "Confirmed",
    amount: "5.0M",
  },
  {
    id: "BK-2026-002",
    customer: "Trần Thị B",
    tour: "Nha Trang 4N3Đ",
    date: "2026-05-07",
    status: "Pending",
    amount: "3.5M",
  },
  {
    id: "BK-2026-003",
    customer: "Lê Văn C",
    tour: "Đà Nẵng 3N2Đ",
    date: "2026-05-06",
    status: "Confirmed",
    amount: "4.2M",
  },
  {
    id: "BK-2026-004",
    customer: "Phạm Thị D",
    tour: "Phan Thiết 2N1Đ",
    date: "2026-05-05",
    status: "Cancelled",
    amount: "2.8M",
  },
];

export const liveOperations = [
  { label: "Lịch khởi hành", value: "32 chuyến", tone: "cyan" },
  { label: "Mã giảm giá", value: "18 active", tone: "violet" },
  { label: "Phản hồi support", value: "7 ticket", tone: "amber" },
  { label: "Tin nhắn mới", value: "24 unread", tone: "emerald" },
];
