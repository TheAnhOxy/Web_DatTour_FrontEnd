import React, { createContext, useContext, useState } from "react";
import * as authApi from "../api/authApi";
import { setAuthToken } from "../api/client";

const AuthContext = createContext();

const normalizeUser = (source = {}) => ({
  id: source.id ?? source.userId ?? source.userID ?? null,
  userId: source.userId ?? source.userID ?? source.id ?? null,
  email: source.email ?? source.userEmail ?? "",
  username: source.username ?? source.email ?? "",
  fullName: source.fullName ?? source.name ?? "",
  name: source.name ?? source.fullName ?? "",
  phone: source.phone ?? "",
  address: source.address ?? "",
  dob: source.dob ?? source.dateOfBirth ?? "",
  gender: source.gender ?? "",
  avatarUrl: source.avatarUrl ?? source.avatar ?? "",
  avatar: source.avatar ?? source.avatarUrl ?? null,
  role: source.role ?? source.roles?.[0] ?? "",
});

const extractResponseData = (response) => {
  if (!response) return null;
  if (response.status && Object.prototype.hasOwnProperty.call(response, "data")) {
    return response.data;
  }
  return response.data ?? response;
};

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
        setAuthToken(token);

        let profileData = res.data.user || res.data.profile || null;
        if (!profileData && userId != null) {
          const profileRes = await authApi.getUserById(userId);
          profileData = extractResponseData(profileRes);
        }

        const nextUser = normalizeUser({
          ...profileData,
          id: userId,
          userId,
          email: profileData?.email || userEmail,
          avatarUrl: profileData?.avatarUrl || profileData?.avatar || "",
          avatar: profileData?.avatar || profileData?.avatarUrl || null,
        });

        setIsAuthenticated(true);
        setUser(nextUser);
        localStorage.setItem("auth_user", JSON.stringify(nextUser));
        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_refresh", refreshToken || "");
        return { ok: true, res };
      }
      return { ok: false, res };
    } catch (err) {
      return { ok: false, res: { status: 500, message: err.message } };
    }
  };

  const logout = () => {
    // call backend to blacklist token
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
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

  const refreshCurrentUser = async () => {
    if (!user?.id) {
      return { ok: false, res: { status: 400, message: "Không tìm thấy người dùng hiện tại." } };
    }

    const res = await authApi.getUserById(user.id);
    const profileData = extractResponseData(res);
    if (res && res.status === 200 && profileData) {
      const nextUser = normalizeUser({
        ...user,
        ...profileData,
        id: user.id,
        userId: user.userId ?? user.id,
      });

      setUser(nextUser);
      localStorage.setItem("auth_user", JSON.stringify(nextUser));
      return { ok: true, res, user: nextUser };
    }

    return { ok: false, res };
  };

  const updateProfile = async (payload) => {
    if (!user?.id) {
      return { ok: false, res: { status: 400, message: "Không tìm thấy người dùng hiện tại." } };
    }

    const res = await authApi.updateProfile(user.id, payload);
    if (res && (res.status === 200 || res.status === 201)) {
      const savedProfile = extractResponseData(res) || {};
      const nextUser = normalizeUser({
        ...user,
        ...savedProfile,
        ...payload,
        id: user.id,
        userId: user.userId ?? user.id,
        avatarUrl: payload.avatarUrl || savedProfile.avatarUrl || user.avatarUrl || user.avatar || "",
        avatar: payload.avatarUrl || savedProfile.avatar || savedProfile.avatarUrl || user.avatar || null,
      });

      setUser(nextUser);
      localStorage.setItem("auth_user", JSON.stringify(nextUser));
      return { ok: true, res };
    }

    return { ok: false, res };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        register,
        forgotPassword,
        verifyOtp,
        resetPassword,
        refreshCurrentUser,
        updateProfile,
      }}
    >
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
