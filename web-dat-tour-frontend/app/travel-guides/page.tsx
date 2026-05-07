const guides = [
  {
    id: 1,
    name: "DEV DIEN",
    role: "Founder",
    image: "/clients/assets/images/team/guide-dien.jpg",
    socials: [
      { href: "https://www.facebook.com/dienne.dev", icon: "fab fa-twitter" },
      { href: "https://www.facebook.com/dienne.dev", icon: "fab fa-facebook-f" },
      { href: "https://www.facebook.com/dienne.dev", icon: "fab fa-instagram" },
      { href: "https://www.youtube.com/@dienne248", icon: "fab fa-youtube" },
    ],
  },
  {
    id: 2,
    name: "BAO NGAN",
    role: "Co-founder",
    image: "/clients/assets/images/team/guide-ngan.jpg",
    socials: [
      { href: "/contact", icon: "fab fa-twitter" },
      { href: "https://www.facebook.com/dienne.dev", icon: "fab fa-facebook-f" },
      { href: "/contact", icon: "fab fa-instagram" },
      { href: "https://www.youtube.com/@dienne248", icon: "fab fa-youtube" },
    ],
  },
  {
    id: 3,
    name: "MINH TOAN",
    role: "Travel Guide",
    image: "/clients/assets/images/team/guide1.jpg",
    socials: [
      { href: "/contact", icon: "fab fa-twitter" },
      { href: "https://www.facebook.com/dienne.dev", icon: "fab fa-facebook-f" },
      { href: "/contact", icon: "fab fa-instagram" },
      { href: "https://www.youtube.com/@dienne248", icon: "fab fa-youtube" },
    ],
  },
  {
    id: 4,
    name: "TRONG HAI",
    role: "Senior Guide",
    image: "/clients/assets/images/team/guide2.jpg",
    socials: [
      { href: "/contact", icon: "fab fa-twitter" },
      { href: "https://www.facebook.com/dienne.dev", icon: "fab fa-facebook-f" },
      { href: "/contact", icon: "fab fa-instagram" },
      { href: "https://www.youtube.com/@dienne248", icon: "fab fa-youtube" },
    ],
  },
  {
    id: 5,
    name: "NGOC THU",
    role: "Travel Guide",
    image: "/clients/assets/images/team/guide3.jpg",
    socials: [
      { href: "/contact", icon: "fab fa-twitter" },
      { href: "https://www.facebook.com/dienne.dev", icon: "fab fa-facebook-f" },
      { href: "/contact", icon: "fab fa-instagram" },
      { href: "https://www.youtube.com/@dienne248", icon: "fab fa-youtube" },
    ],
  },
  {
    id: 6,
    name: "DUC ANH",
    role: "Travel Guide",
    image: "/clients/assets/images/team/guide4.jpg",
    socials: [
      { href: "/contact", icon: "fab fa-twitter" },
      { href: "https://www.facebook.com/dienne.dev", icon: "fab fa-facebook-f" },
      { href: "/contact", icon: "fab fa-instagram" },
      { href: "https://www.youtube.com/@dienne248", icon: "fab fa-youtube" },
    ],
  },
  {
    id: 7,
    name: "THANH NHAN",
    role: "Co-founder",
    image: "/clients/assets/images/team/guide5.jpg",
    socials: [
      { href: "/contact", icon: "fab fa-twitter" },
      { href: "https://www.facebook.com/dienne.dev", icon: "fab fa-facebook-f" },
      { href: "/contact", icon: "fab fa-instagram" },
      { href: "https://www.youtube.com/@dienne248", icon: "fab fa-youtube" },
    ],
  },
  {
    id: 8,
    name: "CONG LAM",
    role: "Senior Guide",
    image: "/clients/assets/images/team/guide6.jpg",
    socials: [
      { href: "/contact", icon: "fab fa-twitter" },
      { href: "https://www.facebook.com/dienne.dev", icon: "fab fa-facebook-f" },
      { href: "/contact", icon: "fab fa-instagram" },
      { href: "https://www.youtube.com/@dienne248", icon: "fab fa-youtube" },
    ],
  },
];

export default function TravelGuidesPage() {
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
              Travel Guides
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
                <li className="breadcrumb-item active">Travel Guides</li>
              </ol>
            </nav>
          </div>
        </div>
      </section>

      <section className="benefit-area mt-100 rel z-1">
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-xl-5 col-lg-6">
              <div
                className="mobile-app-content rmb-55"
                data-aos="fade-up"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                <div className="section-title counter-text-wrap mb-40">
                  <h2>Ultimate Explorer's Handbook Huong dan day du cua ban ve cac chuyen di</h2>
                </div>
                <p>
                  Chung toi hop tac chat che voi khach hang de hieu ro nhung thach thuc va muc tieu, cung cap cac giai
                  phap tuy chinh nham nang cao hieu qua, tang loi nhuan va thuc day tang truong ben vung.
                </p>
                <div className="skillbar mt-80" data-percent="93">
                  <span className="skillbar-title">Clients Satisfactions</span>
                  <div
                    className="progress-bar-striped skillbar-bar progress-bar-animated"
                    role="progressbar"
                    aria-valuenow={93}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                  <span className="skill-bar-percent"></span>
                </div>
                <ul className="list-style-two mt-35 mb-30">
                  <li>Co quan trai nghiem</li>
                  <li>Doi ngu chuyen nghiep</li>
                </ul>
                <a href="/about" className="theme-btn style-two">
                  <span data-hover="Kham pha Guides">Kham pha Guides</span>
                  <i className="fal fa-arrow-right"></i>
                </a>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="benefit-image-part style-two">
                <div
                  className="image-one"
                  data-aos="fade-down"
                  data-aos-delay="50"
                  data-aos-duration="1500"
                  data-aos-offset="50"
                >
                  <img src="/clients/assets/images/benefit/benefit1.png" alt="Benefit" />
                </div>
                <div
                  className="image-two"
                  data-aos="fade-up"
                  data-aos-delay="50"
                  data-aos-duration="1500"
                  data-aos-offset="50"
                >
                  <img src="/clients/assets/images/benefit/benefit2.png" alt="Benefit" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-team-area pt-100 rel z-1">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-12">
              <div
                className="section-title text-center counter-text-wrap mb-50"
                data-aos="fade-up"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                <p>
                  Website{" "}
                  <span className="count-text plus bgc-primary" data-speed="3000" data-stop="34500">
                    0
                  </span>{" "}
                  trai nghiem pho bien nhat ma ban se nho
                </p>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            {guides.map((guide, index) => (
              <div className="col-xl-3 col-lg-4 col-sm-6" key={guide.id}>
                <div
                  className="team-item hover-content"
                  data-aos="fade-up"
                  data-aos-delay={index > 2 ? 50 : 0}
                  data-aos-duration="1500"
                  data-aos-offset="50"
                >
                  <img src={guide.image} alt="Guide" />
                  <div className="content">
                    <h6>{guide.name}</h6>
                    <span className="designation">{guide.role}</span>
                    <div className="social-style-one inner-content">
                      {guide.socials.map((social, socialIndex) => (
                        <a href={social.href} key={`${guide.id}-${socialIndex}`}>
                          <i className={social.icon}></i>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="newsletter-three bgc-primary py-100 rel z-1"
        style={{ backgroundImage: "url(/clients/assets/images/newsletter/newsletter-bg-lines.png)" }}
      >
        <div className="container container-1500">
          <div className="row">
            <div className="col-lg-6">
              <div
                className="newsletter-content-part text-white rmb-55"
                data-aos="zoom-in-right"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                <div className="section-title counter-text-wrap mb-45">
                  <h2>Dang ky nhan ban tin cua chung toi de nhan them nhieu uu dai & meo</h2>
                  <p>
                    Website{" "}
                    <span className="count-text plus" data-speed="3000" data-stop="34500">
                      0
                    </span>{" "}
                    trai nghiem pho bien nhat ma ban se nho
                  </p>
                </div>
                <form className="newsletter-form mb-15" action="#">
                  <input id="news-email" type="email" placeholder="Email Address" required />
                  <button type="submit" className="theme-btn bgc-secondary style-two">
                    <span data-hover="Subscribe">Subscribe</span>
                    <i className="fal fa-arrow-right"></i>
                  </button>
                </form>
                <p>Khong yeu cau the tin dung. Khong cam ket</p>
              </div>
              <div
                className="newsletter-bg-image"
                data-aos="zoom-in-up"
                data-aos-delay="100"
                data-aos-duration="1500"
                data-aos-offset="50"
              >
                <img src="/clients/assets/images/newsletter/newsletter-bg-image.png" alt="Newsletter" />
              </div>
            </div>
            <div className="col-lg-6">
              <div
                className="newsletter-image-part bgs-cover"
                style={{
                  backgroundImage:
                    "url(/clients/assets/images/newsletter/newsletter-two-right.jpg)",
                }}
                data-aos="fade-left"
                data-aos-duration="1500"
                data-aos-offset="50"
              ></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
