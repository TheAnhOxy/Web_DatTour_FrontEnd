# Tổng hợp cấu trúc dữ liệu từ các file JSON

## 1. `bookings.json`
Quản lý thông tin đặt tour.

| Thuộc tính | Kiểu dữ liệu | Mô tả |
|---|---|---|
| id | number | ID booking |
| booking_code | string | Mã booking |
| user_id | number | ID người dùng |
| departure_id | number | ID lịch khởi hành |
| total_amount | string/decimal | Tổng tiền |
| paid_amount | string/decimal/null | Số tiền đã thanh toán |
| status | string | Trạng thái booking |
| price_snapshot | object | Snapshot giá tại thời điểm đặt |
| promotion_snapshot | object/null | Snapshot khuyến mãi |
| version | number | Version optimistic locking |
| created_at | datetime | Ngày tạo booking |

### Các trạng thái `status`
- `CONFIRMED`
- `CANCELLED`
- `CANCELLED_TIMEOUT`

### Cấu trúc `price_snapshot`

```json
{
  "startDate": "datetime",
  "tourTitle": "string",
  "priceConfig": {
    "id": "number",
    "babyPrice": "number",
    "adultPrice": "number",
    "departureId": "number",
    "child49Price": "number",
    "child1014Price": "number"
  },
  "pickupAddress": "string"
}
```

### Cấu trúc `promotion_snapshot`

```json
{
  "code": "string",
  "discount_amount": "number"
}
```

---

## 2. `passengers.json`
Quản lý danh sách hành khách của booking.

| Thuộc tính | Kiểu dữ liệu | Mô tả |
|---|---|---|
| id | number | ID hành khách |
| booking_id | number | ID booking |
| full_name | string | Họ tên |
| dob | date | Ngày sinh |
| gender | string | Giới tính |
| age_group | string | Nhóm tuổi |
| id_card_number | string/null | CCCD/CMND |
| passport_number | string/null | Số hộ chiếu |

### Giá trị `gender`
- `MALE`
- `FEMALE`

### Giá trị `age_group`
- `ADULT`
- `BABY`

---

## 3. `booking_notes.json`
Ghi chú cho booking.

| Thuộc tính | Kiểu dữ liệu | Mô tả |
|---|---|---|
| id | number | ID ghi chú |
| booking_id | number | ID booking |
| content | string | Nội dung ghi chú |
| created_at | datetime | Thời gian tạo |

---

## 4. `cancellations.json`
Thông tin hủy booking.

| Thuộc tính | Kiểu dữ liệu | Mô tả |
|---|---|---|
| id | number | ID hủy booking |
| booking_id | number | ID booking |
| reason | string | Lý do hủy |
| refund_amount | string/null | Số tiền hoàn |
| cancelled_at | datetime | Thời gian hủy |

---

## 5. `flyway_schema_history.json`
Lịch sử migration database Flyway.

| Thuộc tính | Kiểu dữ liệu | Mô tả |
|---|---|---|
| installed_rank | number | Thứ tự migration |
| version | string | Phiên bản migration |
| description | string | Mô tả migration |
| type | string | Loại migration |
| script | string | Tên file SQL |
| checksum | number | Checksum file |
| installed_by | string | Người chạy migration |
| installed_on | datetime | Thời gian chạy |
| execution_time | number | Thời gian thực thi (ms) |
| success | boolean | Trạng thái thành công |

---

# Quan hệ dữ liệu

```text
bookings
 ├── passengers (booking_id)
 ├── booking_notes (booking_id)
 └── cancellations (booking_id)
```

---

# Mô hình nghiệp vụ tổng quát

## Booking Flow

```text
User
  ↓
Booking
  ├── Passengers
  ├── Booking Notes
  ├── Promotion Snapshot
  └── Price Snapshot
        ↓
   Payment / Cancellation
        ↓
Cancellation Record
```

---

# Các entity chính trong hệ thống

| Entity | Vai trò |
|---|---|
| Booking | Đơn đặt tour |
| Passenger | Hành khách |
| BookingNote | Ghi chú booking |
| Cancellation | Thông tin hủy |
| FlywaySchemaHistory | Lịch sử migration DB |

---

# Gợi ý thiết kế database

## Quan hệ chính

```text
bookings 1 --- n passengers
bookings 1 --- n booking_notes
bookings 1 --- 1 cancellations
```

---

# Nhận xét dữ liệu

- Hệ thống đang dùng:
  - Snapshot giá (`price_snapshot`)
  - Snapshot khuyến mãi (`promotion_snapshot`)
  - Optimistic locking (`version`)
  - Flyway migration

- Có hỗ trợ:
  - Hành khách trẻ em / em bé
  - Hủy booking
  - Booking timeout
  - Ghi chú khách hàng

- Dữ liệu booking chủ yếu liên quan:
  - Tour du lịch
  - Lịch khởi hành
  - Thanh toán
  - Khuyến mãi
