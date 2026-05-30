import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const socialButtonStyle = {
  width: "48px",
  height: "48px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.12)",
  color: "white",
  fontSize: "18px",
  fontWeight: 700,
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  cursor: "pointer",
  boxShadow: "0 10px 20px rgba(0,0,0,0.12)",
};

const quickButtonStyle = (accentColor) => ({
  flex: 1,
  height: "42px",
  borderRadius: "12px",
  border: `1px solid ${accentColor}`,
  background: "rgba(255,255,255,0.12)",
  color: "white",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 700,
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
});

const loginMessageMap = {
  INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng.",
  BAD_CREDENTIALS: "Email hoặc mật khẩu không đúng.",
  USER_NOT_FOUND: "Không tìm thấy tài khoản.",
  PASSWORD_TOO_SHORT: "Mật khẩu phải có ít nhất 8 ký tự.",
};

const translateLoginMessage = (message) => {
  if (!message) return "Đăng nhập thất bại. Vui lòng thử lại.";
  if (loginMessageMap[message]) return loginMessageMap[message];
  const upperMessage = message.toUpperCase();
  if (loginMessageMap[upperMessage]) return loginMessageMap[upperMessage];
  return message;
};

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const result = await login(username, password);
    setIsLoading(false);
    if (result.ok) {
      navigate("/dashboard");
    } else {
      const msg =
        result.res && result.res.message
          ? result.res.message
          : "Đăng nhập thất bại";
      setError(translateLoginMessage(msg));
    }
  };

  const handleQuickLogin = (user) => {
    setUsername(user.username);
    setPassword(user.password);
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        backgroundImage: "url(/images/anhbien.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
        margin: 0,
        padding: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(3, 20, 45, 0.58) 0%, rgba(6, 38, 80, 0.42) 48%, rgba(18, 17, 34, 0.48) 100%)",
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 28%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.05), transparent 22%), radial-gradient(circle at 55% 80%, rgba(255,255,255,0.06), transparent 24%)",
          zIndex: 2,
        }}
      />

      <div
        className="login-shell"
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "1180px",
          padding: "32px 24px",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "56px",
        }}
      >
        <div
          className="login-hero"
          style={{
            flex: 1,
            minWidth: 0,
            color: "white",
            textShadow: "0 12px 30px rgba(0,0,0,0.35)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <div className="mb-6 flex items-center gap-4">
            <div
              style={{
                width: "126px",
                height: "126px",
                borderRadius: "36px",
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.18)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                display: "grid",
                placeItems: "center",
                fontSize: "64px",
                boxShadow: "0 22px 60px rgba(0,0,0,0.18)",
                animation: "float 3s ease-in-out infinite",
              }}
            >
              ✈️
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              <div
                style={{
                  position: "relative",
                  width: "220px",
                  height: "2px",
                  borderRadius: "999px",
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.85), rgba(255,255,255,0))",
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "-26px",
                    transform: "translateY(-50%)",
                    animation: "flyAcross 3.6s linear infinite",
                    fontSize: "20px",
                  }}
                >
                  🛩️
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,0.78)",
                  fontSize: "13px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                }}
              >
                Hành trình bay thẳng vào hệ thống
              </p>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "999px",
                background: "#67e8f9",
                boxShadow: "0 0 0 0 rgba(103,232,249,0.7)",
                animation: "pulseDot 1.8s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontSize: "12px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.78)",
                fontWeight: 700,
              }}
            >
              Go Tour admin access
            </span>
          </div>
          <h1
            style={{
              fontSize: "clamp(42px, 5vw, 66px)",
              lineHeight: 1,
              margin: "0 0 14px 0",
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            Go Tour
          </h1>
          <p
            style={{
              fontSize: "clamp(16px, 1.8vw, 20px)",
              maxWidth: "420px",
              margin: 0,
              color: "rgba(255,255,255,0.84)",
              lineHeight: 1.6,
            }}
          >
            Xin chào, đã đến với cổng đăng nhập Go Tour admin. Quản lý nhanh,
            thao tác gọn và không gian sáng rõ để bắt đầu làm việc ngay.
          </p>
        </div>

        <div
          className="login-card"
          style={{
            width: "100%",
            maxWidth: "500px",
            flex: "0 0 500px",
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.14)",
              border: "1px solid rgba(255, 255, 255, 0.28)",
              borderRadius: "20px",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
              boxShadow: "0 28px 70px rgba(0,0,0,0.26)",
              padding: "24px 26px 22px",
              color: "white",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "18px" }}>
              <div
                style={{
                  display: "inline-flex",
                  width: "72px",
                  height: "72px",
                  borderRadius: "20px",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))",
                  border: "1px solid rgba(255,255,255,0.16)",
                  fontSize: "34px",
                  marginBottom: "12px",
                }}
              >
                🌊
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "26px",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                }}
              >
                Đăng nhập
              </h2>
              <p
                style={{
                  margin: "6px 0 0 0",
                  color: "rgba(255,255,255,0.74)",
                  fontSize: "13px",
                }}
              >
                Truy cập hệ thống để quản lý tour
              </p>
            </div>

            {error && (
              <div
                style={{
                  marginBottom: "12px",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  background: "rgba(239, 68, 68, 0.18)",
                  border: "1px solid rgba(239, 68, 68, 0.32)",
                  color: "#ffe4e6",
                  fontSize: "13px",
                }}
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleLogin}
              style={{ display: "grid", gap: "12px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    marginLeft: "4px",
                    textAlign: "left",
                    width: "100%",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.84)",
                  }}
                >
                  Email
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username@gmail.com"
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "0 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.24)",
                    background: "rgba(255,255,255,0.12)",
                    color: "white",
                    outline: "none",
                    boxSizing: "border-box",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    marginLeft: "4px",
                    textAlign: "left",
                    width: "100%",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.84)",
                  }}
                >
                  Mật khẩu
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    style={{
                      width: "100%",
                      height: "44px",
                      padding: "0 48px 0 16px",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.24)",
                      background: "rgba(255,255,255,0.12)",
                      color: "white",
                      outline: "none",
                      boxSizing: "border-box",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "32px",
                      height: "32px",
                      borderRadius: "10px",
                      border: "1px solid rgba(255,255,255,0.14)",
                      background: "rgba(255,255,255,0.12)",
                      color: "white",
                      display: "grid",
                      placeItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "-2px",
                }}
              >
                <a
                  href="/forgot-password"
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.9)",
                    textDecoration: "underline",
                  }}
                >
                  Quên mật khẩu?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  height: "44px",
                  marginTop: "2px",
                  border: "0",
                  borderRadius: "12px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  color: "white",
                  fontWeight: 800,
                  fontSize: "14px",
                  letterSpacing: "0.04em",
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                  boxShadow: "0 16px 30px rgba(37, 99, 235, 0.28)",
                }}
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <div
              style={{
                margin: "16px 0 14px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: "rgba(255,255,255,0.18)",
                }}
              />
              <span
                style={{ fontSize: "12px", color: "rgba(255,255,255,0.68)" }}
              >
                hoặc tiếp tục với
              </span>
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: "rgba(255,255,255,0.18)",
                }}
              />
            </div>

            <div
              style={{ display: "flex", gap: "12px", justifyContent: "center" }}
            >
              <button
                type="button"
                style={{
                  ...socialButtonStyle,
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  fontSize: "16px",
                }}
              >
                G
              </button>
              <button
                type="button"
                style={{
                  ...socialButtonStyle,
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  fontSize: "16px",
                }}
              >
                ⌘
              </button>
              <button
                type="button"
                style={{
                  ...socialButtonStyle,
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  fontSize: "16px",
                }}
              >
                f
              </button>
            </div>

            <div
              style={{
                marginTop: 14,
                textAlign: "center",
                fontSize: 12,
                color: "rgba(255,255,255,0.74)",
              }}
            >
              Chưa có tài khoản?{" "}
              <a
                href="/register"
                style={{
                  color: "white",
                  fontWeight: 700,
                  textDecoration: "underline",
                }}
              >
                Đăng ký
              </a>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "14px" }}>
              <button
                type="button"
                onClick={() =>
                  handleQuickLogin({ username: "admin@gotour.com", password: "password123" })
                }
                style={{
                  ...quickButtonStyle("#2563eb"),
                  height: "40px",
                  borderRadius: "10px",
                  fontSize: "12px",
                }}
              >
                Demo quản trị
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickLogin({ username: "khachhang@gmail.com", password: "password123" })
                }
                style={{
                  ...quickButtonStyle("#7c3aed"),
                  height: "40px",
                  borderRadius: "10px",
                  fontSize: "12px",
                }}
              >
                Demo thử
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-18px); }
        }

        @keyframes flyAcross {
          0% { transform: translate(-10px, -50%) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translate(94px, -50%) rotate(2deg); opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(210px, -50%) rotate(0deg); opacity: 0; }
        }

        @keyframes pulseDot {
          0% { transform: scale(0.92); box-shadow: 0 0 0 0 rgba(103,232,249,0.65); }
          70% { transform: scale(1); box-shadow: 0 0 0 16px rgba(103,232,249,0); }
          100% { transform: scale(0.92); box-shadow: 0 0 0 0 rgba(103,232,249,0); }
        }

        input::placeholder {
          color: rgba(255,255,255,0.45);
        }

        @media (max-width: 1024px) {
          .login-shell {
            flex-direction: column;
            gap: 24px;
          }

          .login-hero {
            align-items: center !important;
            text-align: center;
          }

          .login-card {
            max-width: 520px;
            flex: 1 1 auto !important;
          }
        }
      `}</style>
    </div>
  );
};
