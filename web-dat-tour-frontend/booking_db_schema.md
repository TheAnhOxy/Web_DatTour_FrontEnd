# Tài liệu Cấu trúc Database (booking_db) dùng cho Prompting

Tài liệu này tổng hợp chi tiết cấu trúc các bảng trong hệ cơ sở dữ liệu `booking_db` (PostgreSQL/Neon). Bạn có thể sử dụng toàn bộ nội dung này làm ngữ cảnh (Context) gửi cho AI để sinh mã nguồn, viết API, hoặc tối ưu hóa các câu lệnh SQL cho **Booking Service**.

---

## 1. Bảng `bookings` (Quản lý thông tin đặt chỗ chính)
Bảng này lưu trữ thông tin tổng quan về một giao dịch đặt chỗ, trạng thái thanh toán, thông tin liên hệ và các bản chụp (snapshot) giá trị tại thời điểm đặt.

* **Thuộc tính (Columns):**
    * `id` (`BIGSERIAL`, PRIMARY KEY): Khóa chính tự tăng của lượt đặt chỗ.
    * `booking_code` (`VARCHAR(30)`, UNIQUE): Mã đặt chỗ (Code định danh duy nhất, ví dụ: BKG123456).
    * `user_id` (`BIGINT`): ID của người dùng thực hiện đặt chỗ (có thể NULL nếu đặt vãng lai).
    * `departure_id` (`BIGINT`, NOT NULL): ID của chuyến đi/lịch trình khởi hành.
    * `total_amount` (`NUMERIC(38, 2)`): Tổng số tiền của đơn đặt chỗ.
    * `paid_amount` (`NUMERIC(38, 2)`, DEFAULT '0'): Số tiền thực tế khách đã thanh toán.
    * `status` (`VARCHAR(30)`): Trạng thái đơn hàng (Ví dụ: `PENDING`, `CONFIRMED`, `CANCELLED`, `PAID`).
    * `price_snapshot` (`JSONB`): Bản chụp chi tiết cơ cấu giá tại thời điểm đặt (giá vé, phụ phí, thuế...).
    * `promotion_snapshot` (`JSONB`): Bản chụp chi tiết chương trình khuyến mãi/mã giảm giá được áp dụng.
    * `version` (`BIGINT`, DEFAULT 0): Phiên bản bản ghi (Dùng để xử lý Optimistic Locking tránh xung đột dữ liệu).
    * `created_at` (`TIMESTAMP`, DEFAULT CURRENT_TIMESTAMP): Thời gian tạo đơn đặt chỗ.
    * `contact_email` (`VARCHAR(255)`): Email của người liên hệ.
    * `contact_name` (`VARCHAR(255)`): Họ tên của người liên hệ.
    * `contact_phone` (`VARCHAR(255)`): Số điện thoại của người liên hệ.
    * `payment_due_at` (`TIMESTAMP`): Hạn chót phải hoàn tất thanh toán.
    * `payment_method` (`VARCHAR(30)`): Phương thức thanh toán (Ví dụ: `CREDIT_CARD`, `VNPAY`, `MOMO`, `BANK_TRANSFER`).

* **Ràng buộc & Chỉ mục (Constraints & Indexes):**
    * `bookings_pkey`: PRIMARY KEY (`id`) -> `USING BTREE`
    * `bookings_booking_code_key`: UNIQUE (`booking_code`) -> `USING BTREE`

---

## 2. Bảng `passenger` (Thông tin hành khách)
Lưu trữ danh sách thông tin chi tiết của các hành khách đi kèm trong mỗi đơn đặt chỗ. Một đơn `booking` có thể có một hoặc nhiều hành khách.

* **Thuộc tính (Columns):**
    * `id` (`BIGSERIAL`, PRIMARY KEY): Khóa chính tự tăng.
    * `booking_id` (`BIGINT`): ID liên kết với bảng `bookings`.
    * `full_name` (`VARCHAR(120)`): Họ và tên đầy đủ của hành khách.
    * `dob` (`DATE`): Ngày tháng năm sinh.
    * `gender` (`VARCHAR(20)`): Giới tính (Ví dụ: `MALE`, `FEMALE`, `OTHER`).
    * `age_group` (`VARCHAR(20)`): Nhóm tuổi (Ví dụ: `ADULT`, `CHILD`, `INFANT`).
    * `id_card_number` (`VARCHAR(30)`): Số CMND/CCCD.
    * `passport_number` (`VARCHAR(50)`): Số hộ chiếu.

* **Ràng buộc & Chỉ mục (Constraints & Indexes):**
    * `passengers_pkey`: PRIMARY KEY (`id`) -> `USING BTREE`
    * `passengers_booking_id_fkey`: FOREIGN KEY (`booking_id`) REFERENCES `public.bookings` (`id`) `ON DELETE CASCADE` (Tự động xóa hành khách nếu đơn booking bị xóa cứng).

---

## 3. Bảng `cancellations` (Thông tin hủy đặt chỗ)
Lưu trữ thông tin chi tiết khi một đơn đặt chỗ bị hủy, bao gồm lý do và số tiền hoàn lại.

* **Thuộc tính (Columns):**
    * `id` (`BIGSERIAL`, PRIMARY KEY): Khóa chính tự tăng.
    * `booking_id` (`BIGINT`, UNIQUE): ID liên kết với bảng `bookings` (Quan hệ 1:1, mỗi booking chỉ có tối đa 1 bản ghi hủy).
    * `reason` (`TEXT`): Lý do hủy đơn.
    * `refund_amount` (`NUMERIC(38, 2)`): Số tiền hoàn lại cho khách hàng.
    * `cancelled_at` (`TIMESTAMP`, DEFAULT CURRENT_TIMESTAMP): Thời gian thực hiện hủy đơn.

* **Ràng buộc & Chỉ mục (Constraints & Indexes):**
    * `cancellations_pkey`: PRIMARY KEY (`id`) -> `USING BTREE`
    * `cancellations_booking_id_key`: UNIQUE (`booking_id`) -> `USING BTREE`
    * `cancellations_booking_id_fkey`: FOREIGN KEY (`booking_id`) REFERENCES `public.bookings` (`id`) `ON DELETE CASCADE`

---

## 4. Bảng `booking_notes` (Ghi chú nội bộ / Chăm sóc khách hàng)
Lưu trữ các ghi chú bổ sung liên quan đến đơn đặt chỗ từ phía khách hàng hoặc nhân viên hệ thống.

* **Thuộc tính (Columns):**
    * `id` (`BIGSERIAL`, PRIMARY KEY): Khóa chính tự tăng.
    * `booking_id` (`BIGINT`): ID liên kết với bảng `bookings` (Quan hệ 1:N).
    * `content` (`TEXT`): Nội dung ghi chú.
    * `created_at` (`TIMESTAMP`, DEFAULT CURRENT_TIMESTAMP): Thời gian tạo ghi chú.

* **Ràng buộc & Chỉ mục (Constraints & Indexes):**
    * `booking_notes_pkey`: PRIMARY KEY (`id`) -> `USING BTREE`
    * `booking_notes_booking_id_fkey`: FOREIGN KEY (`booking_id`) REFERENCES `public.bookings` (`id`) `ON DELETE CASCADE`

---

## 5. Bảng `flyway_schema_history` (Lịch sử Migration dữ liệu)
Bảng hệ thống do công cụ Flyway sử dụng để quản lý phiên bản cập nhật database schema. Không tham gia vào nghiệp vụ chính của Booking Service.

* **Thuộc tính (Columns):**
    * `installed_rank` (`INTEGER`, PRIMARY KEY): Thứ tự cài đặt của file migration.
    * `version` (`VARCHAR(50)`): Phiên bản của script (Ví dụ: `V1__init_db.sql`).
    * `description` (`VARCHAR(200)`, NOT NULL): Mô tả nội dung migration.
    * `type` (`VARCHAR(20)`, NOT NULL): Loại migration (Ví dụ: `SQL`).
    * `script` (`VARCHAR(1000)`, NOT NULL): Tên file script migration.
    * `checksum` (`INTEGER`): Mã kiểm tra tính toàn vẹn của file script.
    * `installed_by` (`VARCHAR(100)`, NOT NULL): Người/User thực hiện migration.
    * `installed_on` (`TIMESTAMP`, DEFAULT now()): Thời gian thực hiện.
    * `execution_time` (`INTEGER`, NOT NULL): Thời gian thực thi tính bằng mili-giây.
    * `success` (`BOOLEAN`, NOT NULL): Trạng thái thành công (`true` / `false`).

* **Ràng buộc & Chỉ mục (Constraints & Indexes):**
    * `flyway_schema_history_pk`: PRIMARY KEY (`installed_rank`) -> `USING BTREE`
    * `flyway_schema_history_s_idx`: INDEX (`success`) -> `USING BTREE`

---


