"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "../../store/authStore";

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
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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
    setRegisterSuccess("");

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
      setRegisterSuccess(result.message);
      setTimeout(() => {
        setActiveTab("signin");
        setRegisterSuccess("");
        setRegisterForm({ fullName: "", email: "", phone: "", password: "", rePassword: "" });
      }, 2500);
    } else {
      setRegisterError(result.message);
    }
  };

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

                    <div className="form-group">
                      <label htmlFor="password_login">
                        <i className="zmdi zmdi-lock"></i>
                      </label>
                      <input
                        type="password"
                        name="password"
                        id="password_login"
                        placeholder="Mật khẩu"
                        required
                        value={loginForm.password}
                        onChange={(e) =>
                          setLoginForm({ ...loginForm, password: e.target.value })
                        }
                      />
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
                    {registerSuccess && (
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
                        {registerSuccess}
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

                    <div className="form-group">
                      <label htmlFor="password_register">
                        <i className="zmdi zmdi-lock"></i>
                      </label>
                      <input
                        type="password"
                        name="password"
                        id="password_register"
                        placeholder="Mật khẩu (ít nhất 8 ký tự)"
                        required
                        value={registerForm.password}
                        onChange={(e) =>
                          setRegisterForm({ ...registerForm, password: e.target.value })
                        }
                      />
                    </div>

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
                        value={registerForm.rePassword}
                        onChange={(e) =>
                          setRegisterForm({ ...registerForm, rePassword: e.target.value })
                        }
                      />
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
                      setRegisterSuccess("");
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
