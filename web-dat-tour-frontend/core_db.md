# Tài liệu Cấu trúc Cơ sở Dữ liệu (Core DB)

Tài liệu này tổng hợp cấu trúc các bảng và thuộc tính từ các tệp dữ liệu hệ thống du lịch.

---

## 1. Tổng quan các bảng (Database Overview)

| Tên bảng | Mô tả | Tệp nguồn |
| :--- | :--- | :--- |
| **tours** | Thông tin chi tiết về các tour du lịch | tours.json |
| **wishlists** | Danh sách tour yêu thích của người dùng | wishlists.json |
| **transportations** | Danh mục các loại phương tiện di chuyển | transportations.json |
| **tour_categories** | Phân loại tour (Trong nước, Quốc tế, v.v.) | tour_categories.json |
| **promotions** | Thông tin mã giảm giá và chương trình khuyến mãi | promotions.json |
| **price_configs** | Cấu hình giá chi tiết theo từng đối tượng khách hàng | price_configs.json |
| **tour_images** | Quản lý hình ảnh của tour | tour_images.json |
| **tour_destinations** | Liên kết tour với các địa danh/điểm đến | tour_destinations.json |
| **tour_promotions** | Liên kết Tour - Khuyến mãi (Dữ liệu rỗng) | tour_promotions.json |
| **pricing_rules** | Các quy tắc định giá bổ sung (Dữ liệu rỗng) | pricing_rules.json |

---

## 2. Chi tiết thuộc tính các bảng (Table Attributes)

### 2.1 Bảng `tours`
Lưu trữ thông tin chính của sản phẩm tour.

| Cột | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | Integer | Khóa chính |
| `category_id` | Integer | ID danh mục tour (FK) |
| `transportation_id` | Integer | ID phương tiện (FK) |
| `title` | String | Tiêu đề tour |
| `slug` | String | Đường dẫn thân thiện cho SEO |
| `description` | Text | Mô tả chi tiết nội dung tour |
| `duration_days` | Integer | Số ngày diễn ra tour |
| `status` | String | Trạng thái (Ví dụ: ACTIVE) |
| `is_hot` | Boolean | Đánh dấu tour nổi bật |
| `base_price` | Decimal | Giá cơ bản tham khảo |
| `created_at` | DateTime | Thời điểm tạo bản ghi |

### 2.2 Bảng `wishlists`
Lưu trữ các tour mà người dùng quan tâm.

| Cột | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | Integer | Khóa chính |
| `user_id` | Integer | ID người dùng tham chiếu |
| `tour_id` | Integer | ID tour tham chiếu |
| `created_at` | DateTime | Thời điểm thêm vào yêu thích |

### 2.3 Bảng `promotions`
Quản lý các chương trình khuyến mãi và mã giảm giá.

| Cột | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | Integer | Khóa chính |
| `code` | String | Mã giảm giá (Vd: SUMMER10) |
| `discount_percent` | Decimal | Phần trăm giảm giá |
| `max_discount` | Decimal | Số tiền giảm tối đa |
| `usage_limit` | Integer | Giới hạn số lần sử dụng |
| `used_count` | Integer | Số lần đã sử dụng thực tế |
| `valid_from` | DateTime | Ngày bắt đầu hiệu lực |
| `valid_to` | DateTime | Ngày hết hạn |
| `is_active` | Boolean | Trạng thái kích hoạt của mã |

### 2.4 Bảng `price_configs`
Cấu hình giá linh hoạt cho từng lịch khởi hành.

| Cột | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | Integer | Khóa chính |
| `departure_id` | Integer | ID chuyến khởi hành (FK) |
| `adult_price` | Decimal | Giá cho người lớn |
| `child_10_14_price` | Decimal | Giá trẻ em từ 10-14 tuổi |
| `child_4_9_price` | Decimal | Giá trẻ em từ 4-9 tuổi |
| `baby_price` | Decimal | Giá cho trẻ sơ sinh |
| `created_at` | DateTime | Thời điểm tạo cấu hình |

### 2.5 Bảng `tour_images`
Quản lý thư viện ảnh cho các tour.

| Cột | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | Integer | Khóa chính |
| `tour_id` | Integer | ID tour sở hữu ảnh |
| `image_url` | String | Đường dẫn đến file ảnh |
| `alt_text` | String | Văn bản thay thế (SEO) |
| `is_cover` | Boolean | Có phải ảnh bìa chính không |
| `sort_order` | Integer | Thứ tự sắp xếp hiển thị |
| `created_at` | DateTime | Thời điểm tải lên |

### 2.6 Các bảng danh mục & liên kết

#### Bảng `transportations`
- `id`: Khóa chính
- `type`: Loại phương tiện (BUS, PLANE, TRAIN...)

#### Bảng `tour_categories`
- `id`: Khóa chính
- `name`: Tên danh mục (Domestic, International...)

#### Bảng `tour_destinations`
- `tour_id`: ID tour
- `destination_id`: ID điểm đến

---
*Ghi chú: Các bảng `tour_promotions` và `pricing_rules` hiện tại đang trống trong bộ dữ liệu được cung cấp.*
