const tourDetail = {
  tourId: "T-2026-001",
  title: "Kham pha Ba Na - Hoi An",
  startDate: "12-05-2026",
  endDate: "14-05-2026",
  quantity: 12,
  priceAdult: "2.900.000",
  priceChild: "1.800.000",
};

export default function BookingDetailPage() {
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
              Booking Detail
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
                <li className="breadcrumb-item active">Booking Detail</li>
              </ol>
            </nav>
          </div>
        </div>
      </section>

      <section className="container" style={{ marginTop: 50, marginBottom: 100 }}>
        <form action="#" method="post" className="booking-container">
          <div className="booking-info">
            <h2 className="booking-header">Thong Tin Lien Lac</h2>
            <div className="booking__infor">
              <div className="form-group">
                <label htmlFor="username">Ho va ten*</label>
                <input type="text" id="username" placeholder="Nhap Ho va ten" name="fullName" required />
                <span className="error-message" id="usernameError"></span>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email*</label>
                <input type="email" id="email" placeholder="sample@gmail.com" name="email" required />
                <span className="error-message" id="emailError"></span>
              </div>

              <div className="form-group">
                <label htmlFor="tel">So dien thoai*</label>
                <input
                  type="number"
                  id="tel"
                  placeholder="Nhap so dien thoai lien he"
                  name="tel"
                  required
                />
                <span className="error-message" id="telError"></span>
              </div>

              <div className="form-group">
                <label htmlFor="address">Dia chi*</label>
                <input type="text" id="address" placeholder="Nhap dia chi lien he" name="address" required />
                <span className="error-message" id="addressError"></span>
              </div>
            </div>

            <h2 className="booking-header">Hanh Khach</h2>

            <div className="booking__quantity">
              <div className="form-group quantity-selector">
                <label>Nguoi lon</label>
                <div className="input__quanlity">
                  <button type="button" className="quantity-btn">
                    -
                  </button>
                  <input
                    type="number"
                    className="quantity-input"
                    defaultValue={1}
                    min={1}
                    id="numAdults"
                    name="numAdults"
                    readOnly
                  />
                  <button type="button" className="quantity-btn">
                    +
                  </button>
                </div>
              </div>

              <div className="form-group quantity-selector">
                <label>Tre em</label>
                <div className="input__quanlity">
                  <button type="button" className="quantity-btn">
                    -
                  </button>
                  <input
                    type="number"
                    className="quantity-input"
                    defaultValue={0}
                    min={0}
                    id="numChildren"
                    name="numChildren"
                    readOnly
                  />
                  <button type="button" className="quantity-btn">
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="privacy-section">
              <p>
                Bang cach nhap chuot vao nut "DONG Y" duoi day, Khach hang dong y rang cac dieu kien dieu khoan nay se
                duoc ap dung. Vui long doc ky dieu kien dieu khoan truoc khi lua chon su dung dich vu cua HTravel.
              </p>
              <div className="privacy-checkbox">
                <input type="checkbox" id="agree" name="agree" required />
                <label htmlFor="agree">
                  Toi da doc va dong y voi <a href="#">Dieu khoan thanh toan</a>
                </label>
              </div>
            </div>

            <h2 className="booking-header">Phuong Thuc Thanh Toan</h2>

            <label className="payment-option">
              <input type="radio" name="payment" value="office-payment" required />
              <img src="/clients/assets/images/contact/icon.png" alt="Office Payment" />
              Thanh toan tai van phong
            </label>

            <label className="payment-option">
              <input type="radio" name="payment" value="paypal-payment" required />
              <img src="/clients/assets/images/booking/cong-thanh-toan-paypal.jpg" alt="PayPal" />
              Thanh toan bang PayPal
            </label>

            <label className="payment-option">
              <input type="radio" name="payment" value="momo-payment" required />
              <img src="/clients/assets/images/booking/thanh-toan-momo.jpg" alt="MoMo" />
              Thanh toan bang Momo
            </label>
          </div>

          <div className="booking-summary">
            <div className="summary-section">
              <div>
                <p>Ma tour : {tourDetail.tourId}</p>
                <h5 className="widget-title">{tourDetail.title}</h5>
                <p>Ngay khoi hanh : {tourDetail.startDate}</p>
                <p>Ngay ket thuc : {tourDetail.endDate}</p>
                <p className="quantityAvailable">So cho con nhan : {tourDetail.quantity}</p>
              </div>

              <div className="order-summary">
                <div className="summary-item">
                  <span>Nguoi lon:</span>
                  <div>
                    <span className="quantity__adults">1</span>
                    <span>X</span>
                    <span className="total-price">{tourDetail.priceAdult} VND</span>
                  </div>
                </div>
                <div className="summary-item">
                  <span>Tre em:</span>
                  <div>
                    <span className="quantity__children">0</span>
                    <span>X</span>
                    <span className="total-price">{tourDetail.priceChild} VND</span>
                  </div>
                </div>
                <div className="summary-item">
                  <span>Giam gia:</span>
                  <div>
                    <span className="total-price">0 VND</span>
                  </div>
                </div>
                <div className="summary-item total-price">
                  <span>Tong cong:</span>
                  <span>0 VND</span>
                </div>
              </div>

              <div className="order-coupon">
                <input type="text" placeholder="Ma giam gia" style={{ width: "65%" }} />
                <button type="button" style={{ width: "30%" }} className="booking-btn btn-coupon">
                  Ap dung
                </button>
              </div>

              <div id="paypal-button-container"></div>

              <button type="submit" className="booking-btn btn-submit-booking">
                Xac Nhan
              </button>

              <button type="button" className="booking-btn" style={{ display: "none" }}>
                Thanh toan voi Momo
                <img
                  src="/clients/assets/images/booking/icon-thanh-toan-momo.png"
                  alt=""
                  style={{ width: "10%" }}
                />
              </button>
            </div>
          </div>
        </form>
      </section>
    </>
  );
}
