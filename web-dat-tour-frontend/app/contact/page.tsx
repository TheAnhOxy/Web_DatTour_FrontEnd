export default function ContactPage() {
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
              Liên hệ
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
                  <a href="/">Trang chủ</a>
                </li>
                <li className="breadcrumb-item active">Liên hệ</li>
              </ol>
            </nav>
          </div>
        </div>
      </section>

      <section className="contact-info-area pt-100 rel z-1">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-4">
              <div
                className="contact-info-content mb-30 rmb-55"
                data-aos="fade-up"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                <div className="section-title mb-30">
                </div>
                <p>
                  Đội ngũ hỗ trợ tận tâm của chúng tôi luôn sẵn sàng hỗ trợ bạn giải đáp mọi thắc mắc hoặc vấn đề, cung cấp
                  các giải pháp nhanh chóng và được cá nhân hóa để đáp ứng nhu cầu của bạn.
                </p>
                <div className="features-team-box mt-40">
                  <h6>85+ Thành viên nhóm chuyên gia</h6>
                  <div className="feature-authors">
                    <img src="/clients/assets/images/features/feature-author1.jpg" alt="Author" />
                    <img src="/clients/assets/images/features/feature-author2.jpg" alt="Author" />
                    <img src="/clients/assets/images/features/feature-author3.jpg" alt="Author" />
                    <img src="/clients/assets/images/features/feature-author4.jpg" alt="Author" />
                    <img src="/clients/assets/images/features/feature-author5.jpg" alt="Author" />
                    <img src="/clients/assets/images/features/feature-author6.jpg" alt="Author" />
                    <img src="/clients/assets/images/features/feature-author7.jpg" alt="Author" />
                    <span>+</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="row align-items-stretch g-4">
                <div className="col-md-6 d-flex">
                  <div
                    className="contact-info-item w-100"
                    style={{ height: "100%" }}
                    data-aos="fade-up"
                    data-aos-duration="1500"
                    data-aos-offset="50"
                    data-aos-delay="50"
                  >
                    <div className="icon">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <div className="content">
                      <h5>Cần trợ giúp và hỗ trợ</h5>
                      <div className="text">
                        <i className="far fa-envelope"></i>{" "}
                        <a href="mailto:duchaunguyen131@gmail.com">duchaunguyen131@gmail.com</a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 d-flex">
                  <div
                    className="contact-info-item w-100"
                    style={{ height: "100%" }}
                    data-aos="fade-up"
                    data-aos-duration="1500"
                    data-aos-offset="50"
                    data-aos-delay="100"
                  >
                    <div className="icon">
                      <i className="fas fa-phone"></i>
                    </div>
                    <div className="content">
                      <h5>Cần bất kỳ việc khẩn cấp nào</h5>
                      <div className="text">
                        <i className="far fa-phone"></i>{" "}
                        <a href="callto:+0001234588">+000 (123) 45 88</a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 d-flex">
                  <div
                    className="contact-info-item w-100"
                    style={{ height: "100%" }}
                    data-aos="fade-up"
                    data-aos-duration="1500"
                    data-aos-offset="50"
                    data-aos-delay="50"
                  >
                    <div className="icon">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div className="content">
                      <h5>Gia Lai</h5>
                      <div className="text">
                        <i className="fal fa-map-marker-alt"></i> Cửu An, An Khê, Gia Lai
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 d-flex">
                  <div
                    className="contact-info-item w-100"
                    style={{ height: "100%" }}
                    data-aos="fade-up"
                    data-aos-duration="1500"
                    data-aos-offset="50"
                    data-aos-delay="100"
                  >
                    <div className="icon">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div className="content">
                      <h5>Ký túc xá Việt Hàn</h5>
                      <div className="text">
                        <i className="fal fa-map-marker-alt"></i> 470 Trần Đại Nghĩa, Ngũ Hành Sơn, Tp. Đà Nẵng
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-form-area py-70 rel z-1">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <div className="comment-form bgc-lighter z-1 rel mb-30 rmb-55">
                <form
                  id="contactForm"
                  className="contactForm"
                  name="contactForm"
                  action="#"
                  method="post"
                  data-aos="fade-left"
                  data-aos-duration="1500"
                  data-aos-offset="50"
                >
                  <div className="section-title">
                    <h2>Liên hệ</h2>
                  </div>
                  <p>
                    Địa chỉ email của bạn sẽ không được công bố. Các trường bắt buộc được đánh dấu <span style={{ color: "red" }}>*</span>
                  </p>
                  <div className="row mt-35">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="name">
                          Họ và tên <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          className="form-control"
                          placeholder="Họ và tên"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="phone_number">
                          Số điện thoại <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          type="text"
                          id="phone_number"
                          name="phone_number"
                          className="form-control"
                          placeholder="Số điện thoại"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="form-group">
                        <label htmlFor="email">
                          Địa chỉ Email <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className="form-control"
                          placeholder="Nhập email"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="form-group">
                        <label htmlFor="message">
                          Nội dung <span style={{ color: "red" }}>*</span>
                        </label>
                        <textarea
                          name="message"
                          id="message"
                          className="form-control"
                          rows={5}
                          placeholder="Nội dung"
                          required
                        ></textarea>
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="form-group mb-0">
                        <button type="submit" className="theme-btn style-two">
                          <span data-hover="Send Comments">Gửi</span>
                          <i className="fal fa-arrow-right"></i>
                        </button>
                        <div id="msgSubmit" className="hidden"></div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="col-lg-5">
              <div
                className="contact-images-part"
                data-aos="fade-right"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                <div className="row">
                  <div className="col-12">
                    <img src="/clients/assets/images/contact/contact1.jpg" alt="Contact" />
                  </div>
                  <div className="col-6">
                    <img src="/clients/assets/images/contact/contact2.jpg" alt="Contact" />
                  </div>
                  <div className="col-6">
                    <img src="/clients/assets/images/contact/contact3.jpg" alt="Contact" />
                  </div>
                </div>
                <div className="circle-logo">
                  <img src="/clients/assets/images/contact/icon.png" alt="Logo" />
                  <span className="title h2">HTravel</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="contact-map">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61349.64701146602!2d108.16542067386848!3d16.047164798501537!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219c792252a13%3A0xfc14e3a044436487!2sDa%20Nang%2C%20H%E1%BA%A3i%20Ch%C3%A2u%20District%2C%20Da%20Nang%2C%20Vietnam!5e0!3m2!1sen!2s!4v1729087157388!5m2!1sen!2s"
          style={{ border: 0, width: "100%" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </>
  );
}
