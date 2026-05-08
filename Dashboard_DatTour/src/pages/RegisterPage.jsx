import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Email không hợp lệ";
    if (!form.password || form.password.length < 8)
      return "Mật khẩu phải tối thiểu 8 ký tự";
    if (!form.fullName) return "Tên không được để trống";
    if (!form.phone || !/^\d{10}$/.test(form.phone))
      return "Số điện thoại phải có 10 chữ số";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const v = validate();
    if (v) return setError(v);
    setIsLoading(true);
    const res = await register(form);
    setIsLoading(false);
    if (res && res.status === 201) {
      setSuccess(res.message || "Đăng ký thành công. Vui lòng kiểm tra email.");
      setTimeout(() => navigate("/login"), 1400);
    } else {
      setError(res && res.message ? res.message : "Đăng ký thất bại");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ maxWidth: 540, margin: "40px auto" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
          Đăng ký
        </h2>
        <p style={{ color: "#555", marginBottom: 18 }}>
          Tạo tài khoản quản trị
        </p>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              padding: 10,
              borderRadius: 8,
              marginBottom: 12,
              color: "#7f1d1d",
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            style={{
              background: "#ecfdf5",
              padding: 10,
              borderRadius: 8,
              marginBottom: 12,
              color: "#064e3b",
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="rounded-xl border px-3 py-2"
          />
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Mật khẩu"
            type="password"
            className="rounded-xl border px-3 py-2"
          />
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Họ và tên"
            className="rounded-xl border px-3 py-2"
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Số điện thoại (10 chữ số)"
            className="rounded-xl border px-3 py-2"
          />
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Địa chỉ (tùy chọn)"
            className="rounded-xl border px-3 py-2"
          />
          <input
            name="dob"
            value={form.dob}
            onChange={handleChange}
            placeholder="YYYY-MM-DD (tùy chọn)"
            className="rounded-xl border px-3 py-2"
          />
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="rounded-xl border px-3 py-2"
          >
            <option value="">Giới tính (tùy chọn)</option>
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
            <option value="OTHER">Khác</option>
          </select>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-sky-600 px-4 py-2 text-white"
            >
              {isLoading ? "Đang gửi..." : "Đăng ký"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="rounded-xl border px-4 py-2"
            >
              Quay lại
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
