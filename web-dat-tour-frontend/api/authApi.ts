import client from "../utils/apiClient";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address?: string;
  dob?: string;
  gender?: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  refreshToken?: string;
  userId: number;
}

export interface ApiResponse<T = unknown> {
  status: number;
  message?: string;
  data?: T;
}

const login = (email: string, password: string) =>
  client.post("/auth/login", { email, password } as LoginRequest);

const register = (data: RegisterRequest) =>
  client.post("/auth/register", data);

const verifyOtp = (email: string, otp: string) =>
  client.post("/auth/verify-otp", { email, otp });

const refreshToken = (token: string) =>
  client.post("/auth/refresh-token", { refreshToken: token });

const logout = () =>
  client.post("/auth/logout", {});

export default { login, register, verifyOtp, refreshToken, logout };
