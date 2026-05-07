const bookingDetail = {
  fullName: "Nguyen Minh Dien",
  email: "duchaunguyen131@gmail.com",
  phoneNumber: "0900000000",
  address: "470 Tran Dai Nghia, Da Nang",
  tourId: "T-2026-001",
  title: "Kham pha Ba Na - Hoi An",
  startDate: "12-05-2026",
  endDate: "14-05-2026",
  numAdults: 2,
  numChildren: 1,
  priceAdult: "2.900.000",
  priceChild: "1.800.000",
  totalPrice: "7.600.000",
  discount: "0",
  paymentMethod: "office-payment",
  bookingStatus: "y",
};

export default function TourBookedPage() {
  return (
    

    <>
      <section
        className="page-banner-area pt-50 pb-35 rel z-1 bgs-cover"
        style={{ backgroundImage: "url(/clients/assets/images/banner/banner.jpg)" }}
      >
        <div className="container">
          <div className="banner-inner text-white">
            <h2
              className="page-title mb-10"
              data-aos="fade-left"
              data-aos-duration="1500"
              data-aos-offset="50"
            >
              Tour Booked
            </h2>
            <nav aria-label="breadcrumb">
              <ol
                className="breadcrumb justify-content-center mb-20"
                data-aos="fade-right"
                data-aos-delay="200"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                <li className="breadcrumb-item">
                  <a href="/">Trang chu</a>
                </li>
                <li className="breadcrumb-item active">Tour Booked</li>
              </ol>
            </nav>
          </div>
        </div>
      </section>

      <section className="container" style={{ marginTop: 50, marginBottom: 100 }}>
        <form action="#" method="POST" className="booking-container">
          <div className="booking-info">
            <h2 className="booking-header">Thong Tin Lien Lac</h2>
            <div className="booking__infor">
              <div className="form-group">
                <label htmlFor="username">Ho va ten*</label>
                <input
                  type="text"
                  id="username"
                  placeholder="Nhap Ho va ten"
                  name="fullName"
                  value={bookingDetail.fullName}
                  readOnly
                />
                <span className="error-message" id="usernameError"></span>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email*</label>
                <input
                  type="email"
                  id="email"
                  placeholder="sample@gmail.com"
                  name="email"
                  value={bookingDetail.email}
                  readOnly
                />
                <span className="error-message" id="emailError"></span>
              </div>

              <div className="form-group">
                <label htmlFor="tel">So dien thoai*</label>
                <input
                  type="number"
                  id="tel"
                  placeholder="Nhap so dien thoai lien he"
                  name="tel"
                  value={bookingDetail.phoneNumber}
                  readOnly
                />
                <span className="error-message" id="telError"></span>
              </div>

              <div className="form-group">
                <label htmlFor="address">Dia chi*</label>
                <input
                  type="text"
                  id="address"
                  placeholder="Nhap dia chi lien he"
                  name="address"
                  value={bookingDetail.address}
                  readOnly
                />
                <span className="error-message" id="addressError"></span>
              </div>
            </div>

            <div className="privacy-section">
              <p>
                Bang cach nhap chuot vao nut "DONG Y" duoi day, Khach hang dong y rang cac dieu kien dieu khoan nay se
                duoc ap dung. Vui long doc ky dieu kien dieu khoan truoc khi lua chon su dung dich vu cua HTravel.
              </p>
              <div className="privacy-checkbox">
                <input type="checkbox" id="agree" name="agree" checked disabled />
                <label htmlFor="agree">
                  Toi da doc va dong y voi <a href="#">Dieu khoan thanh toan</a>
                </label>
              </div>
            </div>

            <h2 className="booking-header">Phuong Thuc Thanh Toan</h2>

            <label className="payment-option">
              <input
                type="radio"
                value="office-payment"
                checked={bookingDetail.paymentMethod === "office-payment"}
                disabled
              />
              <img src="/clients/assets/images/contact/icon.png" alt="Office Payment" />
              Thanh toan tai van phong
            </label>

            <label className="payment-option">
              <input
                type="radio"
                value="paypal-payment"
                checked={bookingDetail.paymentMethod === "paypal-payment"}
                disabled
              />
              <img src="/clients/assets/images/booking/cong-thanh-toan-paypal.jpg" alt="PayPal" />
              Thanh toan bang PayPal
            </label>

            <label className="payment-option">
              <input
                type="radio"
                value="momo-payment"
                checked={bookingDetail.paymentMethod === "momo-payment"}
                disabled
              />
              <img src="/clients/assets/images/booking/thanh-toan-momo.jpg" alt="MoMo" />
              Thanh toan bang Momo
            </label>
          </div>

          <div className="booking-summary">
            <div className="summary-section">
              <div>
                <p>Ma tour : {bookingDetail.tourId}</p>
                <h5 className="widget-title">{bookingDetail.title}</h5>
                <p>Ngay khoi hanh : {bookingDetail.startDate}</p>
                <p>Ngay ket thuc : {bookingDetail.endDate}</p>
              </div>

              <div className="order-summary" style={{ borderBottom: "1px solid #d6d6d6", marginBottom: 20 }}>
                <div className="summary-item">
                  <span>Nguoi lon:</span>
                  <div>
                    <span className="quantity__adults-booked">{bookingDetail.numAdults}</span>
                    <span>X</span>
                    <span className="total-price-booked">{bookingDetail.priceAdult} VND</span>
                  </div>
                </div>
                <div className="summary-item">
                  <span>Tre em:</span>
                  <div>
                    <span className="quantity__children-booked">{bookingDetail.numChildren}</span>
                    <span>X</span>
                    <span className="total-price-booked">{bookingDetail.priceChild} VND</span>
                  </div>
                </div>
                <div className="summary-item">
                  <span>Giam gia:</span>
                  <div>
                    <span className="total-price-booked">{bookingDetail.discount} VND</span>
                  </div>
                </div>
                <div className="summary-item total-price-booked">
                  <span>Tong cong:</span>
                  <span>{bookingDetail.totalPrice} VND</span>
                </div>
              </div>

              {bookingDetail.bookingStatus === "f" ? (
                <a href={`/tours/${bookingDetail.tourId}`} className="booking-btn" style={{ display: "inline-block", textAlign: "center" }}>
                  Danh gia
                </a>
              ) : (
                <button type="submit" className="booking-btn btn-cancel-booking">
                  Huy Tour
                </button>
              )}
            </div>
          </div>
        </form>
      </section>
    </>
  );
}
