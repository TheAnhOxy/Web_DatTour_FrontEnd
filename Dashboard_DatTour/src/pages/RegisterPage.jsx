import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const fieldClassName =
  "w-full rounded-2xl border border-white/20 bg-white/12 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white/85 focus:shadow-[0_0_0_4px_rgba(56,189,248,0.18)]";

const fieldErrorClassName =
  "w-full rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-rose-300 focus:border-rose-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(251,113,133,0.12)]";

const messageMap = {
  EMAIL_REQUIRED: "Vui lòng nhập email.",
  INVALID_EMAIL: "Email không hợp lệ.",
  PASSWORD_REQUIRED: "Vui lòng nhập mật khẩu.",
  PASSWORD_TOO_SHORT: "Mật khẩu phải có ít nhất 8 ký tự.",
  FULL_NAME_REQUIRED: "Vui lòng nhập họ và tên.",
  PHONE_REQUIRED: "Vui lòng nhập số điện thoại.",
  INVALID_PHONE_FORMAT: "Số điện thoại phải gồm đúng 10 chữ số.",
};

const translateMessage = (message, fallback) => {
  if (!message) return fallback;
  if (messageMap[message]) return messageMap[message];
  const upperMessage = message.toUpperCase();
  if (messageMap[upperMessage]) return messageMap[upperMessage];
  return message;
};

const validateField = (name, value) => {
  const trimmed = typeof value === "string" ? value.trim() : value;

  switch (name) {
    case "email":
      if (!trimmed) return messageMap.EMAIL_REQUIRED;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
        return messageMap.INVALID_EMAIL;
      return "";
    case "password":
      if (!trimmed) return messageMap.PASSWORD_REQUIRED;
      if (trimmed.length < 8) return messageMap.PASSWORD_TOO_SHORT;
      return "";
    case "fullName":
      if (!trimmed) return messageMap.FULL_NAME_REQUIRED;
      return "";
    case "phone":
      if (!trimmed) return messageMap.PHONE_REQUIRED;
      if (!/^\d{10}$/.test(trimmed)) return messageMap.INVALID_PHONE_FORMAT;
      return "";
    default:
      return "";
  }
};

const validateForm = (form) => ({
  email: validateField("email", form.email),
  password: validateField("password", form.password),
  fullName: validateField("fullName", form.fullName),
  phone: validateField("phone", form.phone),
});

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    address: "",
    dob: "",
    gender: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const todayIso = useMemo(() => new Date().toISOString().split("T")[0], []);

  const showError = (field) => submitted || Boolean(touched[field]);

  const updateField = (name, value) => {
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);
    setTouched((current) => ({ ...current, [name]: true }));
    setErrors(validateForm(nextForm));
    setServerError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setServerError("");
    setSuccess("");

    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) return;

    setIsLoading(true);
    const res = await register(form);
    setIsLoading(false);

    if (res && res.status === 201) {
      setSuccess("Đăng ký thành công. Vui lòng đăng nhập để tiếp tục.");
      setTimeout(() => navigate("/login"), 1400);
      return;
    }

    const normalized = translateMessage(
      res && res.message ? res.message : "Đăng ký thất bại",
      "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.",
    );
    setServerError(normalized);
  };

  const inputStateClass = (field) =>
    showError(field) && errors[field] ? fieldErrorClassName : fieldClassName;

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        backgroundImage: "url(/images/nenDangKy.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,16,37,0.78)_0%,rgba(7,36,65,0.58)_52%,rgba(15,23,42,0.74)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.14),transparent_22%),radial-gradient(circle_at_80%_12%,rgba(255,255,255,0.10),transparent_18%),radial-gradient(circle_at_80%_78%,rgba(255,255,255,0.08),transparent_18%)]" />
      <div className="pointer-events-none absolute left-[-8%] top-[16%] h-24 w-24 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[12%] right-[8%] h-32 w-32 rounded-full bg-sky-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex items-center">
            <div className="max-w-lg text-white">
              <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-xl shadow-[0_18px_50px_rgba(2,6,23,0.18)]">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-lg shadow-lg shadow-sky-900/20">
                  ✈️
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                  Go Tour Admin
                </span>
              </div>

              <h1 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-[58px]">
                Xin chào, bắt đầu với Go Tour
              </h1>
              <p className="max-w-lg text-base leading-7 text-white/80 sm:text-lg">
                Tạo tài khoản gọn gàng để quản lý tour, với phản hồi lỗi trực
                tiếp và thao tác rõ ràng.
              </p>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-2xl rounded-[28px] border border-white/20 bg-white/12 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-4 rounded-[22px] border border-white/15 bg-white/10 px-5 py-4 text-white backdrop-blur-xl">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">
                    Đăng ký
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                    Go Tour
                  </h2>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl shadow-lg shadow-cyan-950/20 animate-[float_4s_ease-in-out_infinite]">
                  🌍
                </div>
              </div>

              <div className="mb-4 rounded-[22px] border border-white/15 bg-white/10 px-5 py-4 text-white backdrop-blur-xl shadow-[0_20px_50px_rgba(2,6,23,0.16)]">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.28em] text-white/70">
                  <span>Go Tour</span>
                  <span>Bay vào trải nghiệm mới</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <span
                    className="block h-full w-1/3 rounded-full bg-linear-to-r from-cyan-300 via-sky-400 to-blue-500"
                    style={{ animation: "runway 2.2s linear infinite" }}
                  />
                </div>
              </div>

              {serverError && (
                <div className="mb-4 rounded-2xl border border-rose-300/40 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 shadow-sm">
                  {serverError}
                </div>
              )}

              {success && (
                <div className="mb-4 rounded-2xl border border-emerald-300/50 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-white/75">
                      <FiMail /> Email
                    </label>
                    <input
                      name="email"
                      value={form.email}
                      onChange={(e) =>
                        updateField(e.target.name, e.target.value)
                      }
                      placeholder="you@example.com"
                      className={inputStateClass("email")}
                      autoComplete="email"
                    />
                    {showError("email") && errors.email && (
                      <p className="mt-2 text-sm font-medium text-rose-200">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-white/75">
                      <FiPhone /> Số điện thoại
                    </label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={(e) =>
                        updateField(
                          e.target.name,
                          e.target.value.replace(/\D/g, ""),
                        )
                      }
                      placeholder="10 chữ số"
                      className={inputStateClass("phone")}
                      inputMode="numeric"
                      autoComplete="tel"
                    />
                    {showError("phone") && errors.phone && (
                      <p className="mt-2 text-sm font-medium text-rose-200">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-white/75">
                      <FiUser /> Họ và tên
                    </label>
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={(e) =>
                        updateField(e.target.name, e.target.value)
                      }
                      placeholder="Nhập họ và tên"
                      className={inputStateClass("fullName")}
                      autoComplete="name"
                    />
                    {showError("fullName") && errors.fullName && (
                      <p className="mt-2 text-sm font-medium text-rose-200">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-white/75">
                      <FiClock /> Ngày sinh
                    </label>
                    <input
                      name="dob"
                      type="date"
                      value={form.dob}
                      onChange={(e) =>
                        updateField(e.target.name, e.target.value)
                      }
                      max={todayIso}
                      className={fieldClassName}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-white/75">
                      Mật khẩu
                    </label>
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        updateField(e.target.name, e.target.value)
                      }
                      placeholder="Tối thiểu 8 ký tự"
                      className={inputStateClass("password")}
                      autoComplete="new-password"
                    />
                    {showError("password") && errors.password && (
                      <p className="mt-2 text-sm font-medium text-rose-200">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-white/75">
                      <FiMapPin /> Giới tính
                    </label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={(e) =>
                        updateField(e.target.name, e.target.value)
                      }
                      className="w-full rounded-2xl border border-white/20 bg-white/12 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white/85 focus:shadow-[0_0_0_4px_rgba(56,189,248,0.18)]"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-white/75">
                    Địa chỉ
                  </label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={(e) => updateField(e.target.name, e.target.value)}
                    placeholder="Địa chỉ liên hệ"
                    className={fieldClassName}
                    autoComplete="street-address"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-[0_18px_40px_rgba(14,116,144,0.35)] transition hover:scale-[1.01] hover:shadow-[0_22px_50px_rgba(14,116,144,0.42)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <FiCheckCircle />
                    {isLoading ? "Đang đăng ký..." : "Tạo tài khoản"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/18"
                  >
                    <FiArrowLeft />
                    Quay lại đăng nhập
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        @keyframes runway {
          0% { transform: translateX(-115%); }
          100% { transform: translateX(290%); }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
