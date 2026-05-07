export default function Footer() {
  return (
    <footer
      className="main-footer footer-two bgp-bottom bgc-black rel z-15 pt-100 pb-115"
      style={{
        backgroundImage: "url(/clients/assets/images/backgrounds/footer-two.png)",
      }}
    >
      <div className="widget-area">
        <div className="container">
          <div className="row row-cols-xxl-5 row-cols-xl-4 row-cols-md-3 row-cols-2">
            <div
              className="col col-small"
              data-aos="fade-up"
              data-aos-duration="1500"
              data-aos-offset="50"
            >
              <div className="footer-widget footer-text">
                <div className="footer-logo mb-40">
                  <a href="/">
                    <img src="/clients/assets/images/logos/logo.png" alt="Logo" />
                  </a>
                </div>
                <div className="footer-map">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61349.64701146602!2d108.16542067386848!3d16.047164798501537!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219c792252a13%3A0xfc14e3a044436487!2sDa%20Nang%2C%20H%E1%BA%A3i%20Ch%C3%A2u%20District%2C%20Da%20Nang%2C%20Vietnam!5e0!3m2!1sen!2s!4v1729087157388!5m2!1sen!2s"
                    style={{ border: 0, width: "100%" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>

            <div
              className="col col-small"
              data-aos="fade-up"
              data-aos-delay="50"
              data-aos-duration="1500"
              data-aos-offset="50"
            >
              <div className="footer-widget footer-links ms-sm-5">
                <div className="footer-title">
                  <h5>Dich vu</h5>
                </div>
                <ul className="list-style-three">
                  <li>
                    <a href="/tours">Dat tour</a>
                  </li>
                  <li>
                    <a href="/tours">Dat ve</a>
                  </li>
                </ul>
              </div>
            </div>

            <div
              className="col col-small"
              data-aos="fade-up"
              data-aos-delay="100"
              data-aos-duration="1500"
              data-aos-offset="50"
            >
              <div className="footer-widget footer-links ms-md-4">
                <div className="footer-title">
                  <h5>Cong ty</h5>
                </div>
                <ul className="list-style-three">
                  <li>
                    <a href="/about">Gioi thieu ve cong ty</a>
                  </li>
                  <li>
                    <a href="/contact">Viec lam va nghe nghiep</a>
                  </li>
                  <li>
                    <a href="/contact">Lien he voi chung toi</a>
                  </li>
                </ul>
              </div>
            </div>

            <div
              className="col col-small"
              data-aos="fade-up"
              data-aos-delay="150"
              data-aos-duration="1500"
              data-aos-offset="50"
            >
              <div className="footer-widget footer-links ms-lg-4">
                <div className="footer-title">
                  <h5>Diem den</h5>
                </div>
                <ul className="list-style-three">
                  <li>
                    <a href="/destination">Mien Bac</a>
                  </li>
                  <li>
                    <a href="/destination">Mien Trung</a>
                  </li>
                  <li>
                    <a href="/destination">Mien Nam</a>
                  </li>
                </ul>
              </div>
            </div>

            <div
              className="col col-md-6 col-10 col-small"
              data-aos="fade-up"
              data-aos-delay="200"
              data-aos-duration="1500"
              data-aos-offset="50"
            >
              <div className="footer-widget footer-contact">
                <div className="footer-title">
                  <h5>Lien he</h5>
                </div>
                <ul className="list-style-one">
                  <li>
                    <i className="fal fa-map-marked-alt"></i> Phạm Văn chiêu,
                    Phường 9, Gò Vấp, Hồ Chí Minh
                  </li>
                  <li>
                    <i className="fal fa-envelope"></i>{" "}
                    <a href="mailto:duchaunguyen131@gmail.com">
                      duchaunguyen131@gmail.com
                    </a>
                  </li>
                  <li>
                    <i className="fal fa-phone-volume"></i>{" "}
                    <a href="callto:+88012334588">+880 (123) 345 88</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom bg-transparent pt-20 pb-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-5">
              <div className="copyright-text text-center text-lg-start">
                <p>
                  @Copy 2024 <a href="/">HTravel</a>, All rights reserved
                </p>
              </div>
            </div>
            <div className="col-lg-7 text-center text-lg-end">
              <ul className="footer-bottom-nav">
                <li>
                  <a href="/about">Dieu khoan</a>
                </li>
                <li>
                  <a href="/about">Chinh sach bao mat</a>
                </li>
                <li>
                  <a href="/about">Thong bao phap ly</a>
                </li>
                <li>
                  <a href="/about">Kha nang truy cap</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
