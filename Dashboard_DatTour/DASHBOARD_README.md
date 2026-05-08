# DatTour Admin Dashboard 🌴

Một hệ thống quản lý đặt tour chuyên nghiệp, hiện đại và dễ sử dụng, được xây dựng với React, Tailwind CSS và các công nghệ frontend tiên tiến.

## ✨ Tính Năng

### 🔐 Xác Thực

- **Trang Đăng Nhập Đẹp**: Giao diện login với hình nền biển sinh động
- **Đăng Nhập Nhanh**: Tài khoản test có sẵn để kiểm tra
- **Quản Lý Phiên**: Theo dõi người dùng đăng nhập

### 📊 Dashboard

- **Tổng Quan Chi Tiết**: Thống kê tour, booking, doanh thu, hành khách
- **Biểu Đồ Doanh Thu**: Hiển thị doanh thu theo tháng
- **Tour Phổ Biến**: Xếp hạng top tours
- **Booking Gần Đây**: Danh sách booking mới nhất

### ✈️ Quản Lý Tour

- **Danh Sách Tour**: Hiển thị tất cả tours với chi tiết
- **Thêm Tour Mới**: Form để tạo tour mới
- **Chỉnh Sửa/Xóa**: Quản lý tour hiện tại
- **Thống Kê**: Tổng tours, bookings, rating

### 🎉 Quản Lý Promotion

- **Mã Giảm Giá**: Tạo và quản lý mã khuyến mãi
- **Theo Dõi Hiệu Lực**: Quản lý ngày hết hạn
- **Trạng Thái**: Bật/Tắt promotion

### 🛒 Booking

- **Tour Booking**: Quản lý yêu cầu đặt tour
- **Xác Nhận Booking**: Duyệt và phê duyệt bookings
- **Lịch Sử**: Xem lịch sử đặt tour

### 💳 Payment

- **Quản Lý Thanh Toán**: Theo dõi tất cả giao dịch
- **Phương Thức Thanh Toán**: Thẻ tín dụng, chuyển khoản, ví điện tử
- **Trạng Thái Giao Dịch**: Thành công, chờ xử lý, thất bại
- **Tổng Thu**: Tính toán doanh thu tổng

### 💬 Tin Nhắn

- **Chat Trực Tiếp**: Giao diện chat đơn giản
- **Danh Sách Hội Thoại**: Quản lý các cuộc trò chuyện
- **Thông Báo**: Tin nhắn chưa đọc

### 👥 Quản Lý Hành Khách

- **Danh Sách Hành Khách**: Xem tất cả hành khách
- **Thông Tin Chi Tiết**: Email, điện thoại, lịch sử booking
- **Quản Lý Trạng Thái**: Kích hoạt/vô hiệu hóa hành khách

## 🚀 Bắt Đầu

### Yêu Cầu

- Node.js 16.0+
- npm 7.0+

### Cài Đặt

```bash
# Clone hoặc tải project
cd Dashboard_DatTour

# Cài đặt dependencies
npm install

# Chạy dev server
npm run dev
```

Dev server sẽ chạy tại: **http://localhost:5176**

### Build Production

```bash
npm run build
```

## 🔐 Tài Khoản Đăng Nhập Test

### Admin Account

- **Username**: `admin`
- **Password**: `admin123`

### Test Account

- **Username**: `test`
- **Password**: `test`

## 📁 Cấu Trúc Thư Mục

```
src/
├── pages/
│   ├── LoginPage.jsx           # Trang đăng nhập
│   ├── Dashboard.jsx           # Dashboard chính
│   ├── TourPage.jsx           # Quản lý tour
│   ├── PromotionPage.jsx      # Quản lý promotion
│   ├── TourBookingPage.jsx    # Quản lý tour booking
│   ├── PaymentPage.jsx        # Quản lý payment
│   ├── MessagesPage.jsx       # Tin nhắn
│   └── PassengersPage.jsx     # Quản lý hành khách
├── components/
│   ├── MainLayout.jsx         # Layout chính (sidebar + header)
│   └── ProtectedRoute.jsx     # Route bảo vệ
├── context/
│   └── AuthContext.jsx        # Auth context
├── App.jsx                    # Routing chính
└── main.jsx                   # Entry point
```

## 🎨 Màu Sắc & Thiết Kế

- **Primary**: Blue (#4f46e5)
- **Secondary**: Purple (#6366f1)
- **Success**: Green (#22c55e)
- **Warning**: Orange (#f59e0b)
- **Danger**: Red (#ef4444)
- **Dark**: Navy (#0f172a)
- **Light**: Sky (#f8fafc)

## 🔧 Công Nghệ

- **React 19**: Library UI
- **React Router v7**: Navigation & Routing
- **Tailwind CSS v4**: Styling
- **JavaScript ES6+**: Ngôn ngữ lập trình
- **Vite 8**: Build tool & Dev server

## 📱 Tính Năng Responsive

Dashboard được thiết kế responsive cho:

- 📱 Mobile (< 640px)
- 📲 Tablet (640px - 1024px)
- 💻 Desktop (> 1024px)

## ⚙️ Cấu Hình

### tailwind.config.js

Customization cho các màu sắc, shadow, border radius

### vite.config.js

Cấu hình Vite với React plugin

### postcss.config.js

Cấu hình PostCSS với Tailwind

## 🚨 Lưu Ý Quan Trọng

1. **API Integration**: Hiện tại dashboard sử dụng dữ liệu mock. Để kết nối với backend Spring Microservice, cần update các API calls.

2. **Authentication**: Cần kết nối với backend authentication API

3. **Data Persistence**: Dữ liệu không được lưu, cần kết nối database

## 🔄 Kết Nối Backend

Để kết nối với backend Spring Microservice:

```javascript
// Ví dụ API call
const response = await fetch("http://your-backend-api/api/tours", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## 📚 Documentation

### Các Thư Viện Chính

- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite](https://vitejs.dev)

## 🎯 Roadmap

- [ ] API Integration
- [ ] Real-time Chat
- [ ] Advanced Analytics
- [ ] Export Reports
- [ ] Mobile App
- [ ] Dark Mode
- [ ] Multi-language Support

## 📞 Support

Liên hệ cho hỗ trợ hoặc báo cáo lỗi.

## 📄 License

© 2024 DatTour Admin Dashboard. All rights reserved.

---

**Version**: 1.0.0  
**Last Updated**: May 2024  
**Developer**: Senior Developer Team
