# Core DB Schema - Hệ Thống Quản Lý Tour Du Lịch

Tài liệu này mô tả chi tiết thiết kế cơ sở dữ liệu (Core DB) của hệ thống quản lý tour du lịch, bao gồm cấu trúc bảng, kiểu dữ liệu, khóa chính (Primary Key - PK), và khóa ngoại (Foreign Key - FK). Cấu trúc được chia theo các phân hệ (Module) để dễ dàng theo dõi.

---

## 1. Module Catalog (Sản phẩm & Cấu hình)

### 1.1. Bảng `tour_categories`
Quản lý các danh mục phân loại tour (ví dụ: Du lịch trong nước, Du lịch quốc tế, Du lịch biển đảo...).

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INT | **PK**, Auto Increment | Mã định danh danh mục. |
| `name` | VARCHAR | Not Null | Tên danh mục. |

### 1.2. Bảng `transportations`
Quản lý các loại hình phương tiện di chuyển (ví dụ: BUS, PLANE, TRAIN).

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INT | **PK**, Auto Increment | Mã định danh phương tiện. |
| `type` | VARCHAR | Not Null | Tên/Loại phương tiện. |

### 1.3. Bảng `tours`
Thực thể trung tâm lưu trữ thông tin chi tiết về từng tour du lịch.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INT | **PK**, Auto Increment | Mã định danh tour. |
| `category_id` | INT | **FK** (`tour_categories.id`) | Danh mục chứa tour này. |
| `transportation_id` | INT | **FK** (`transportations.id`) | Phương tiện di chuyển chính của tour. |
| `title` | VARCHAR | Not Null | Tên hiển thị của tour. |
| `slug` | VARCHAR | Unique, Not Null | Đường dẫn tĩnh (URL) của tour. |
| `description` | TEXT | | Mô tả ngắn về tour. |
| `overview` | TEXT | | Tổng quan chi tiết về chương trình tour. |
| `duration_days` | INT | Not Null | Tổng số ngày của tour. |
| `status` | VARCHAR | Default 'ACTIVE' | Trạng thái (ACTIVE, INACTIVE). |
| `is_hot` | BOOLEAN | Default FALSE | Cờ đánh dấu tour nổi bật/đang hot. |
| `base_price` | DECIMAL(10,2) | Not Null | Mức giá cơ bản. |
| `itinerary` | JSON | | Thông tin chi tiết lịch trình từng ngày (Ngày 1, Ngày 2,...). |
| `inclusions` | JSON/Array | | Danh sách các dịch vụ bao gồm. |
| `exclusions` | JSON/Array | | Danh sách các dịch vụ không bao gồm. |
| `policies` | JSON | | Ghi chú, chính sách trẻ em, chính sách hủy phạt. |
| `rating` | DECIMAL(3,2) | Default 0.00 | Điểm đánh giá trung bình. |
| `review_count` | INT | Default 0 | Số lượng lượt đánh giá. |
| `created_at` | TIMESTAMP | | Thời gian tạo bản ghi. |

### 1.4. Bảng `destinations`
Danh mục các điểm đến/thành phố du lịch.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INT | **PK**, Auto Increment | Mã định danh điểm đến. |
| `city_name` | VARCHAR | Not Null | Tên thành phố/địa danh. |
| `region` | VARCHAR | | Tên vùng/miền. |
| `country` | VARCHAR | | Tên quốc gia. |
| `image_url` | VARCHAR | | Hình ảnh đại diện cho điểm đến. |

### 1.5. Bảng `tour_destinations`
Bảng trung gian thiết lập mối quan hệ nhiều-nhiều (N:M) giữa Tour và Điểm đến. Một tour có thể qua nhiều điểm đến, một điểm đến có nhiều tour.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `tour_id` | INT | **PK**, **FK** (`tours.id`) | Mã tour. |
| `destination_id` | INT | **PK**, **FK** (`destinations.id`) | Mã điểm đến. |

### 1.6. Bảng `tour_images`
Quản lý thư viện hình ảnh minh họa cho các tour.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INT | **PK**, Auto Increment | Mã định danh ảnh. |
| `tour_id` | INT | **FK** (`tours.id`) | Mã tour sở hữu ảnh. |
| `image_url` | VARCHAR | Not Null | Đường dẫn trực tiếp đến ảnh. |
| `alt_text` | VARCHAR | Nullable | Text thay thế hỗ trợ SEO. |
| `is_cover` | BOOLEAN | Default FALSE | Ảnh này có phải ảnh đại diện của tour không. |
| `sort_order` | INT | Default 0 | Thứ tự hiển thị ảnh. |
| `created_at` | TIMESTAMP | | Thời gian upload ảnh. |

---

## 2. Module Inventory (Vận hành & Đặt chỗ)

### 2.1. Bảng `departures`
Quản lý các chuyến đi (lịch khởi hành) thực tế của một tour.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INT | **PK**, Auto Increment | Mã lịch khởi hành. |
| `tour_id` | INT | **FK** (`tours.id`) | Mã tour áp dụng. |
| `start_date` | DATETIME | Not Null | Thời gian bắt đầu khởi hành. |
| `end_date` | DATETIME | Not Null | Thời gian kết thúc. |
| `max_slots` | INT | Not Null | Số chỗ tối đa. |
| `booked_slots` | INT | Default 0 | Số chỗ đã được đặt. |
| `status` | VARCHAR | Default 'OPEN' | Trạng thái đặt chỗ (OPEN/CLOSED). |
| `pickup_name` | VARCHAR | Nullable | Tên điểm đón khách. |
| `pickup_address` | VARCHAR | Nullable | Địa chỉ đón khách chi tiết. |
| `pickup_latitude` | FLOAT | Nullable | Tọa độ Vĩ độ điểm đón. |
| `pickup_longitude` | FLOAT | Nullable | Tọa độ Kinh độ điểm đón. |
| `pickup_time` | DATETIME | Nullable | Thời gian đón khách. |

### 2.2. Bảng `price_configs`
Cấu hình bảng giá theo độ tuổi cho từng lịch khởi hành. 

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INT | **PK**, Auto Increment | Mã cấu hình giá. |
| `departure_id` | INT | **FK** (`departures.id`) | Mã lịch khởi hành được áp dụng. |
| `adult_price` | DECIMAL(10,2) | Not Null | Giá vé người lớn. |
| `child_10_14_price` | DECIMAL(10,2) | Not Null | Giá vé trẻ em (10-14 tuổi). |
| `child_4_9_price` | DECIMAL(10,2) | Not Null | Giá vé trẻ em (4-9 tuổi). |
| `baby_price` | DECIMAL(10,2) | Not Null | Giá vé em bé (<4 tuổi). |
| `created_at` | TIMESTAMP | | Thời gian tạo cấu hình. |

### 2.3. Bảng `pricing_rules`
Định nghĩa các bộ quy tắc tự động tính/điều chỉnh giá (Ví dụ: Early bird, Giờ vàng).

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INT | **PK**, Auto Increment | Mã quy tắc. |
| `departure_id` | INT | **FK** (`departures.id`) | (Tùy chọn) Quy tắc áp dụng cho 1 khởi hành cụ thể. |
| `rule_name` | VARCHAR | Not Null | Tên quy tắc (VD: Early Bird - 30 ngày). |
| `rule_type` | VARCHAR | Not Null | Phân loại quy tắc (EARLY_BIRD, LAST_MINUTE). |
| `adjustment_type` | VARCHAR | Not Null | Kiểu giảm giá (FIXED, PERCENTAGE). |
| `adjustment_value` | DECIMAL(10,2) | Not Null | Giá trị điều chỉnh. |
| `min_days_before` | INT | | Số ngày đặt trước tối thiểu để áp dụng. |
| `max_days_before` | INT | | Số ngày đặt trước tối đa. |
| `min_slots_left` | INT | | Số chỗ trống tối thiểu còn lại. |
| `max_slots_left` | INT | | Số chỗ trống tối đa còn lại. |
| `valid_from` | DATETIME | Nullable | Có hiệu lực từ. |
| `valid_to` | DATETIME | Nullable | Có hiệu lực đến. |
| `priority` | INT | Default 0 | Độ ưu tiên của rule khi có xung đột. |
| `is_active` | BOOLEAN | Default TRUE | Cờ trạng thái rule. |
| `created_at` | TIMESTAMP | | Thời gian tạo. |

---

## 3. Module Marketing (Tiếp thị & Khuyến mãi)

### 3.1. Bảng `promotions`
Quản lý các mã giảm giá tổng (Promo Code).

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INT | **PK**, Auto Increment | Mã chiến dịch/mã giảm giá. |
| `code` | VARCHAR | Unique, Not Null | Mã nhập (VD: SUMMER10). |
| `discount_percent` | DECIMAL(5,2) | Not Null | Tỉ lệ phần trăm giảm giá. |
| `max_discount` | DECIMAL(10,2) | Not Null | Mức giảm tối đa cho phép. |
| `usage_limit` | INT | Not Null | Tổng số lượt dùng tối đa. |
| `used_count` | INT | Default 0 | Số lượt đã sử dụng. |
| `valid_from` | DATETIME | Not Null | Thời điểm bắt đầu có hiệu lực. |
| `valid_to` | DATETIME | Not Null | Thời điểm hết hạn. |
| `is_active` | BOOLEAN | Default FALSE | Khóa kích hoạt mã. |

### 3.2. Bảng `tour_promotions`
Bảng trung gian kết nối các mã khuyến mãi (Promotions) với một số Tour cụ thể (Nếu khuyến mãi không áp dụng toàn hệ thống).

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `tour_id` | INT | **PK**, **FK** (`tours.id`) | Mã tour. |
| `promotion_id` | INT | **PK**, **FK** (`promotions.id`) | Mã khuyến mãi. |

---

## 4. Module User Data (Tương tác Người Dùng)

### 4.1. Bảng `wishlists`
Lưu trữ danh sách tour yêu thích được người dùng lưu lại.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INT | **PK**, Auto Increment | ID dòng yêu thích. |
| `user_id` | INT | **FK** (`users.id`) | Mã định danh người dùng. |
| `tour_id` | INT | **FK** (`tours.id`) | Mã định danh tour được yêu thích. |
| `created_at` | TIMESTAMP | | Thời gian lưu. |

---
*Ghi chú: Toàn bộ bảng dữ liệu đều được ánh xạ dựa trên các khóa ngoại (Foreign Keys) để bảo đảm tính toàn vẹn. Trong lúc thực thi ứng dụng backend, cần đảm bảo sử dụng Transactions và On-Delete Constraints phù hợp.*
