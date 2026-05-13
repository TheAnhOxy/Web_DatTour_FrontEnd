"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import authApi from "../../api/authApi";

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  rePassword: string;
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(
    () => searchParams.get("tab") === "signup" ? "signup" : "signin"
  );

  // Bước xác thực OTP sau đăng ký
  const [otpStep, setOtpStep] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");

  const [loginForm, setLoginForm] = useState<LoginForm>({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    rePassword: "",
  });

  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [showRegisterPwd, setShowRegisterPwd] = useState(false);
  const [showRegisterRePwd, setShowRegisterRePwd] = useState(false);

  const { login, register, isLoggedIn } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    const result = await login(loginForm.email, loginForm.password);
    setLoading(false);
    if (result.success) {
      router.push("/");
    } else {
      setLoginError(result.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");

    if (registerForm.password !== registerForm.rePassword) {
      setRegisterError("Mật khẩu nhập lại không khớp!");
      return;
    }
    if (registerForm.password.length < 8) {
      setRegisterError("Mật khẩu phải có ít nhất 8 ký tự!");
      return;
    }
    if (!/^\d{10}$/.test(registerForm.phone)) {
      setRegisterError("Số điện thoại phải có đúng 10 chữ số!");
      return;
    }

    setLoading(true);
    const result = await register({
      email: registerForm.email,
      password: registerForm.password,
      fullName: registerForm.fullName,
      phone: registerForm.phone,
    });
    setLoading(false);

    if (result.success) {
      // Chuyển sang bước nhập OTP
      setOtpEmail(registerForm.email);
      setOtpStep(true);
      setRegisterForm({ fullName: "", email: "", phone: "", password: "", rePassword: "" });
    } else {
      setRegisterError(result.message);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    setOtpSuccess("");

    if (otpValue.length !== 6 || !/^\d+$/.test(otpValue)) {
      setOtpError("Mã OTP phải gồm đúng 6 chữ số!");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.verifyOtp(otpEmail, otpValue);
      const body = res.data as { status: number; message?: string };
      if (body?.status === 200) {
        setOtpSuccess("Xác thực thành công! Đang chuyển về đăng nhập...");
        setTimeout(() => {
          setOtpStep(false);
          setOtpValue("");
          setActiveTab("signin");
        }, 2000);
      } else {
        setOtpError(body?.message || "Mã OTP không đúng hoặc đã hết hạn!");
      }
    } catch {
      setOtpError("Lỗi kết nối đến server!");
    }
    setLoading(false);
  };

  // ===== BƯỚC OTP =====
  if (otpStep) {
    return (
      <>
        <div className="login-template">
          <div className="main">
            <section className="sign-in show" style={{ display: "block" }}>
              <div className="container">
                <div className="signin-content">
                  <div className="signin-image">
                    <figure>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/clients/assets/images/login/signin-image.jpg"
                        alt="otp"
                      />
                    </figure>
                    <a
                      href="#"
                      className="signup-image-link"
                      onClick={(e) => {
                        e.preventDefault();
                        setOtpStep(false);
                        setActiveTab("signup");
                      }}
                    >
                      Quay lại đăng ký
                    </a>
                  </div>

                  <div className="signin-form">
                    <h2 className="form-title">Xác thực OTP</h2>
                    <p style={{ color: "#777", fontSize: 14, marginBottom: 16 }}>
                      Mã OTP đã được gửi đến email{" "}
                      <strong style={{ color: "#333" }}>{otpEmail}</strong>.<br />
                      Vui lòng kiểm tra hộp thư và nhập mã 6 chữ số.
                    </p>

                    <form
                      className="login-form"
                      style={{ marginTop: 15 }}
                      onSubmit={handleVerifyOtp}
                    >
                      {otpError && (
                        <div
                          className="invalid-feedback"
                          style={{ display: "block", marginBottom: 10, color: "#dc3545" }}
                        >
                          {otpError}
                        </div>
                      )}
                      {otpSuccess && (
                        <div
                          style={{
                            marginBottom: 10,
                            color: "#28a745",
                            background: "#d4edda",
                            border: "1px solid #c3e6cb",
                            borderRadius: 4,
                            padding: "8px 12px",
                            fontSize: 14,
                          }}
                        >
                          {otpSuccess}
                        </div>
                      )}

                      <div className="form-group">
                        <label htmlFor="otp_input">
                          <i className="zmdi zmdi-shield-check"></i>
                        </label>
                        <input
                          type="text"
                          id="otp_input"
                          placeholder="Nhập mã OTP (6 chữ số)"
                          maxLength={6}
                          required
                          value={otpValue}
                          onChange={(e) =>
                            setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))
                          }
                          style={{ letterSpacing: 6, fontSize: 20, textAlign: "center" }}
                        />
                      </div>

                      <div className="form-group form-button">
                        <button
                          type="submit"
                          className="form-submit"
                          disabled={loading || otpValue.length !== 6}
                          style={{
                            cursor: loading || otpValue.length !== 6 ? "not-allowed" : "pointer",
                            opacity: loading || otpValue.length !== 6 ? 0.7 : 1,
                          }}
                        >
                          {loading ? "Đang xác thực..." : "Xác nhận OTP"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="login-template">
        <div className="main">
          {/* ===== SIGN IN ===== */}
          <section
            className={`sign-in${activeTab === "signin" ? " show" : ""}`}
            style={{ display: activeTab === "signin" ? "block" : "none" }}
          >
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
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("signup");
                      setLoginError("");
                    }}
                  >
                    Tạo tài khoản
                  </a>
                </div>

                <div className="signin-form">
                  <h2 className="form-title">Đăng nhập</h2>
                  <form
                    className="login-form"
                    id="login-form"
                    style={{ marginTop: 15 }}
                    onSubmit={handleLogin}
                  >
                    {loginError && (
                      <div
                        className="invalid-feedback"
                        style={{ display: "block", marginBottom: 10, color: "#dc3545" }}
                      >
                        {loginError}
                      </div>
                    )}

                    <div className="form-group">
                      <label htmlFor="email_login">
                        <i className="zmdi zmdi-email"></i>
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email_login"
                        placeholder="Email"
                        required
                        value={loginForm.email}
                        onChange={(e) =>
                          setLoginForm({ ...loginForm, email: e.target.value })
                        }
                      />
                    </div>

                    <div className="form-group" style={{ position: "relative" }}>
                      <label htmlFor="password_login">
                        <i className="zmdi zmdi-lock"></i>
                      </label>
                      <input
                        type={showLoginPwd ? "text" : "password"}
                        name="password"
                        id="password_login"
                        placeholder="Mật khẩu"
                        required
                        value={loginForm.password}
                        onChange={(e) =>
                          setLoginForm({ ...loginForm, password: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowLoginPwd((v) => !v)}
                        style={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#aaa",
                          fontSize: 20,
                          padding: 0,
                          lineHeight: 1,
                        }}
                        aria-label={showLoginPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        <i className={showLoginPwd ? "bx bx-hide" : "bx bx-show"}></i>
                      </button>
                    </div>

                    <div className="form-group form-button">
                      <button
                        type="submit"
                        className="form-submit"
                        disabled={loading}
                        style={{
                          cursor: loading ? "not-allowed" : "pointer",
                          opacity: loading ? 0.7 : 1,
                        }}
                      >
                        {loading ? "Đang xử lý..." : "Đăng nhập"}
                      </button>
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
                        <a href="#">
                          <i className="display-flex-center zmdi zmdi-google"></i>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===== SIGN UP ===== */}
          <section
            className="signup"
            style={{ display: activeTab === "signup" ? "block" : "none" }}
          >
            <div className="container">
              <div className="signup-content">
                <div className="signup-form">
                  <h2 className="form-title">Đăng ký</h2>
                  <form
                    className="register-form"
                    id="register-form"
                    style={{ marginTop: 15 }}
                    onSubmit={handleRegister}
                  >
                    {registerError && (
                      <div
                        className="invalid-feedback"
                        style={{ display: "block", marginBottom: 10, color: "#dc3545" }}
                      >
                        {registerError}
                      </div>
                    )}

                    <div className="form-group">
                      <label htmlFor="fullName_register">
                        <i className="zmdi zmdi-account material-icons-name"></i>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        id="fullName_register"
                        placeholder="Họ và tên"
                        required
                        value={registerForm.fullName}
                        onChange={(e) =>
                          setRegisterForm({ ...registerForm, fullName: e.target.value })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email_register">
                        <i className="zmdi zmdi-email"></i>
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email_register"
                        placeholder="Email"
                        required
                        value={registerForm.email}
                        onChange={(e) =>
                          setRegisterForm({ ...registerForm, email: e.target.value })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone_register">
                        <i className="zmdi zmdi-phone"></i>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone_register"
                        placeholder="Số điện thoại (10 chữ số)"
                        required
                        value={registerForm.phone}
                        onChange={(e) =>
                          setRegisterForm({ ...registerForm, phone: e.target.value })
                        }
                      />
                    </div>

                    <div className="form-group" style={{ position: "relative" }}>
                      <label htmlFor="password_register">
                        <i className="zmdi zmdi-lock"></i>
                      </label>
                      <input
                        type={showRegisterPwd ? "text" : "password"}
                        name="password"
                        id="password_register"
                        placeholder="Mật khẩu (ít nhất 8 ký tự)"
                        required
                        value={registerForm.password}
                        onChange={(e) =>
                          setRegisterForm({ ...registerForm, password: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowRegisterPwd((v) => !v)}
                        style={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#aaa",
                          fontSize: 20,
                          padding: 0,
                          lineHeight: 1,
                        }}
                        aria-label={showRegisterPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        <i className={showRegisterPwd ? "bx bx-hide" : "bx bx-show"}></i>
                      </button>
                    </div>

                    <div className="form-group" style={{ position: "relative" }}>
                      <label htmlFor="re_pass">
                        <i className="zmdi zmdi-lock-outline"></i>
                      </label>
                      <input
                        type={showRegisterRePwd ? "text" : "password"}
                        name="re_pass"
                        id="re_pass"
                        placeholder="Nhập lại mật khẩu"
                        required
                        value={registerForm.rePassword}
                        onChange={(e) =>
                          setRegisterForm({ ...registerForm, rePassword: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowRegisterRePwd((v) => !v)}
                        style={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#aaa",
                          fontSize: 20,
                          padding: 0,
                          lineHeight: 1,
                        }}
                        aria-label={showRegisterRePwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        <i className={showRegisterRePwd ? "bx bx-hide" : "bx bx-show"}></i>
                      </button>
                    </div>

                    <div className="form-group form-button">
                      <button
                        type="submit"
                        className="form-submit"
                        disabled={loading}
                        style={{
                          cursor: loading ? "not-allowed" : "pointer",
                          opacity: loading ? 0.7 : 1,
                        }}
                      >
                        {loading ? "Đang xử lý..." : "Đăng ký"}
                      </button>
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
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("signin");
                      setRegisterError("");
                    }}
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
