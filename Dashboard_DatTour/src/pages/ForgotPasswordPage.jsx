import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "../components/Icon";

export const ForgotPasswordPage = () => {
  const { forgotPassword, verifyOtp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1=request otp, 2=verify otp, 3=set new password
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRequestOtp = async (e) => {
    e && e.preventDefault();
    setError("");
    setMessage("");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Email không hợp lệ');
    setLoading(true);
    const res = await forgotPassword(email);
    setLoading(false);
    if (res && res.status === 200) {
      setMessage(res.message || 'OTP đã được gửi tới email');
      setStep(2);
    } else {
      setError(res && res.message ? res.message : 'Gửi OTP thất bại');
    }
  };

  const handleVerifyOtp = async (e) => {
    e && e.preventDefault();
    setError("");
    setMessage("");
    if (!otp || !/^\d{4,6}$/.test(otp)) return setError('OTP không hợp lệ');
    setVerifying(true);
    const res = await verifyOtp(email, otp);
    setVerifying(false);
    if (res && res.status === 200) {
      setMessage(res.message || 'OTP hợp lệ, bạn có thể đặt mật khẩu mới');
      setStep(3);
    } else {
      setError(res && res.message ? res.message : 'Xác thực OTP thất bại');
    }
  };

  const handleReset = async (e) => {
    e && e.preventDefault();
    setError("");
    setMessage("");
    if (!newPassword || newPassword.length < 8) return setError('Mật khẩu mới phải ít nhất 8 ký tự');
    if (newPassword !== confirmPassword) return setError('Mật khẩu xác nhận không khớp');
    setLoading(true);
    const res = await resetPassword({ email, otp, newPassword });
    setLoading(false);
    if (res && res.status === 200) {
      setMessage(res.message || 'Đổi mật khẩu thành công');
      setTimeout(() => navigate('/login'), 1200);
    } else {
      setError(res && res.message ? res.message : 'Đổi mật khẩu thất bại');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ maxWidth: 540, margin: '40px auto' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Quên mật khẩu</h2>
        <p style={{ color: '#555', marginBottom: 18 }}>Yêu cầu OTP qua email, xác thực rồi đặt lại mật khẩu</p>

        {error && <div style={{ background: '#fee2e2', padding: 10, borderRadius: 8, marginBottom: 12, color: '#7f1d1d' }}>{error}</div>}
        {message && <div style={{ background: '#ecfdf5', padding: 10, borderRadius: 8, marginBottom: 12, color: '#064e3b' }}>{message}</div>}

        {step === 1 && (
          <form onSubmit={handleRequestOtp} style={{ display: 'grid', gap: 12 }}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="rounded-xl border px-3 py-2" />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={loading} className="rounded-xl bg-sky-600 px-4 py-2 text-white">{loading ? 'Đang gửi...' : 'Gửi OTP'}</button>
              <button type="button" onClick={() => navigate('/login')} className="rounded-xl border px-4 py-2">Quay lại</button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Nhập OTP" className="rounded-xl border px-3 py-2" />
              <button type="submit" disabled={verifying} className="rounded-xl bg-emerald-600 px-4 py-2 text-white">{verifying ? 'Đang xác thực...' : 'Xác thực OTP'}</button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => { setStep(1); setMessage(''); setError(''); }} className="rounded-xl border px-4 py-2">Gửi lại OTP</button>
              <button type="button" onClick={() => navigate('/login')} className="rounded-xl border px-4 py-2">Quay lại</button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleReset} style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mật khẩu mới"
                  type={showNew ? 'text' : 'password'}
                  className="rounded-xl border px-3 py-2 w-full"
                />
                <button type="button" onClick={() => setShowNew((s) => !s)} style={{ position: 'absolute', right: 8, top: 8 }} aria-label="toggle" className="p-1">
                  <Icon name="eye" className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu"
                  type={showConfirm ? 'text' : 'password'}
                  className="rounded-xl border px-3 py-2 w-full"
                />
                <button type="button" onClick={() => setShowConfirm((s) => !s)} style={{ position: 'absolute', right: 8, top: 8 }} aria-label="toggle" className="p-1">
                  <Icon name="eye" className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={loading} className="rounded-xl bg-sky-600 px-4 py-2 text-white">{loading ? 'Đang lưu...' : 'Đặt lại mật khẩu'}</button>
              <button type="button" onClick={() => { setStep(2); setMessage(''); }} className="rounded-xl border px-4 py-2">Quay lại</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
