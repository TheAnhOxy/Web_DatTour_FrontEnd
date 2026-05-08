"use client";

import { useState } from "react";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  return (
    

    <>
      <div className="login-template">
        <div className="main">
          {/* Sign In Form */}
          <section className={`sign-in${activeTab === "signin" ? " show" : ""}`}
            style={{ display: activeTab === "signin" ? "block" : "none" }}>
            <div className="container">
              <div className="signin-content">
                <div className="signin-image">
                  <figure>
                    <img
                      src="/clients/assets/images/login/signin-image.jpg"
                      alt="sign in image"
                    />
                  </figure>
                  <a
                    href="#"
                    className="signup-image-link"
                    id="sign-up"
                    onClick={(e) => { e.preventDefault(); setActiveTab("signup"); }}
                  >
                    Tạo tài khoản
                  </a>
                </div>

                <div className="signin-form">
                  <h2 className="form-title">Đăng nhập</h2>
                  <form
                    action="http://localhost:8000/login"
                    method="POST"
                    className="login-form"
                    id="login-form"
                    style={{ marginTop: 15 }}
                  >
                    <input type="hidden" name="_token" value="" />
                    <div className="form-group">
                      <label htmlFor="username_login">
                        <i className="zmdi zmdi-account material-icons-name"></i>
                      </label>
                      <input
                        type="text"
                        name="username_login"
                        id="username_login"
                        placeholder="Tên đăng nhập"
                        required
                      />
                    </div>
                    <div
                      className="invalid-feedback"
                      style={{ marginTop: -15 }}
                      id="validate_username"
                    ></div>
                    <div className="form-group">
                      <label htmlFor="password_login">
                        <i className="zmdi zmdi-lock"></i>
                      </label>
                      <input
                        type="password"
                        name="password_login"
                        id="password_login"
                        placeholder="Mật khẩu"
                        required
                      />
                    </div>
                    <div
                      className="invalid-feedback"
                      style={{ marginTop: -15 }}
                      id="validate_password"
                    ></div>
                    <div className="form-group form-button">
                      <input
                        type="submit"
                        name="signin"
                        id="signin"
                        className="form-submit"
                        value="Đăng nhập"
                      />
                    </div>
                  </form>
                  <div className="social-login">
                    <span className="social-label">Hoặc đăng nhập bằng</span>
                    <ul className="socials">
                      <li>
                        <a href="#">
                          <i className="display-flex-center zmdi zmdi-facebook"></i>
                        </a>
                      </li>
                      <li>
                        <a href="http://localhost:8000/auth/google">
                          <i className="display-flex-center zmdi zmdi-google"></i>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Sign Up Form */}
          <section className="signup"
            style={{ display: activeTab === "signup" ? "block" : "none" }}>
            <div className="container">
              <div className="signup-content">
                <div className="signup-form">
                  <h2 className="form-title">Đăng ký</h2>
                  <div className="loader"></div>
                  <form
                    action="http://localhost:8000/register"
                    method="POST"
                    className="register-form"
                    id="register-form"
                    style={{ marginTop: 15 }}
                  >
                    <input type="hidden" name="_token" value="" />
                    <div className="form-group">
                      <label htmlFor="username_register">
                        <i className="zmdi zmdi-account material-icons-name"></i>
                      </label>
                      <input
                        type="text"
                        name="username_register"
                        id="username_register"
                        placeholder="Tên tài khoản"
                        required
                      />
                    </div>
                    <div
                      className="invalid-feedback"
                      style={{ marginTop: -15 }}
                      id="validate_username_regis"
                    ></div>
                    <div className="form-group">
                      <label htmlFor="email_register">
                        <i className="zmdi zmdi-email"></i>
                      </label>
                      <input
                        type="email"
                        name="email_register"
                        id="email_register"
                        placeholder="Email"
                        required
                      />
                    </div>
                    <div
                      className="invalid-feedback"
                      style={{ marginTop: -15 }}
                      id="validate_email_regis"
                    ></div>
                    <div className="form-group">
                      <label htmlFor="password_register">
                        <i className="zmdi zmdi-lock"></i>
                      </label>
                      <input
                        type="password"
                        name="password_register"
                        id="password_register"
                        placeholder="Mật khẩu"
                        required
                      />
                    </div>
                    <div
                      className="invalid-feedback"
                      style={{ marginTop: -15 }}
                      id="validate_password_regis"
                    ></div>
                    <div className="form-group">
                      <label htmlFor="re_pass">
                        <i className="zmdi zmdi-lock-outline"></i>
                      </label>
                      <input
                        type="password"
                        name="re_pass"
                        id="re_pass"
                        placeholder="Nhập lại mật khẩu"
                        required
                      />
                    </div>
                    <div
                      className="invalid-feedback"
                      style={{ marginTop: -15 }}
                      id="validate_repass"
                    ></div>
                    <div className="form-group form-button">
                      <input
                        type="submit"
                        name="signup"
                        id="signup"
                        className="form-submit"
                        value="Đăng ký"
                      />
                    </div>
                  </form>
                </div>
                <div className="signup-image">
                  <figure>
                    <img
                      src="/clients/assets/images/login/signup-image.jpg"
                      alt="sign up image"
                    />
                  </figure>
                  <a
                    href="#"
                    className="signup-image-link"
                    id="sign-in"
                    onClick={(e) => { e.preventDefault(); setActiveTab("signin"); }}
                  >
                    Tôi đã có tài khoản rồi
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
