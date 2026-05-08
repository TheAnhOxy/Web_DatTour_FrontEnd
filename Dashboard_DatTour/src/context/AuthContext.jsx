import React, { createContext, useContext, useState } from "react";
import * as authApi from "../api/authApi";
import { setAuthToken } from "../api/client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const storedUser =
    typeof window !== "undefined" ? localStorage.getItem("auth_user") : null;
  const initialUser = storedUser ? JSON.parse(storedUser) : null;
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(initialUser));
  const [user, setUser] = useState(initialUser);

  // ensure auth token is set on startup if present
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) setAuthToken(token);
  }

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      if (res.status === 200 && res.data) {
        const { token, refreshToken, email: userEmail, userId } = res.data;
        const nextUser = { id: userId, email: userEmail, avatar: null };
        setIsAuthenticated(true);
        setUser(nextUser);
        localStorage.setItem("auth_user", JSON.stringify(nextUser));
        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_refresh", refreshToken || "");
        setAuthToken(token);
        return { ok: true, res };
      }
      return { ok: false, res };
    } catch (err) {
      return { ok: false, res: { status: 500, message: err.message } };
    }
  };

  const logout = () => {
    // call backend to blacklist token
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (token) {
      setAuthToken(token);
      authApi.logout().catch(() => {});
    }
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_refresh");
    setAuthToken(null);
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    return res;
  };

  const forgotPassword = async (email) => {
    const res = await authApi.forgotPassword(email);
    return res;
  };

  const verifyOtp = async (email, otp) => {
    const res = await authApi.verifyOtp(email, otp);
    return res;
  };

  const resetPassword = async (payload) => {
    const res = await authApi.resetPassword(payload);
    return res;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, register, forgotPassword, verifyOtp, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
