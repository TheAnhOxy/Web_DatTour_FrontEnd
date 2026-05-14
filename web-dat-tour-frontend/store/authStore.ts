import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import authApi, { RegisterRequest, LoginResponse } from "../api/authApi";

export interface User {
  userId: number;
  email: string;
  token: string;
  refreshToken: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (data: RegisterRequest) => Promise<AuthResult>;
  logout: () => Promise<void>;
  /** Gọi khi access token hết hạn (401) — trả về access token mới hoặc null nếu thất bại */
  doRefresh: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      _hasHydrated: false,

      setHasHydrated: (val) => set({ _hasHydrated: val }),

      login: async (email, password) => {
        try {
          const res = await authApi.login(email, password);
          const body = res.data as {
            status: number;
            message?: string;
            data?: LoginResponse;
          };

          if (body?.status === 200 && body.data?.token) {
            const { token, refreshToken, email: userEmail, userId } = body.data;
            localStorage.setItem("token", token);
            localStorage.setItem("refreshToken", refreshToken ?? "");
            set({
              user: { token, refreshToken: refreshToken ?? "", email: userEmail, userId },
              isLoggedIn: true,
            });
            return { success: true, message: "Đăng nhập thành công!" };
          }

          return {
            success: false,
            message: body?.message || "Email hoặc mật khẩu không đúng!",
          };
        } catch {
          return { success: false, message: "Lỗi kết nối đến server!" };
        }
      },

      register: async (data) => {
        try {
          const res = await authApi.register(data);
          const body = res.data as { status: number; message?: string };

          if (body?.status === 201) {
            return {
              success: true,
              message: body.message || "Đăng ký thành công! Vui lòng kiểm tra email.",
            };
          }

          return {
            success: false,
            message: body?.message || "Đăng ký thất bại, vui lòng thử lại!",
          };
        } catch {
          return { success: false, message: "Lỗi kết nối đến server!" };
        }
      },

      doRefresh: async () => {
        const currentRefreshToken = get().user?.refreshToken
          || localStorage.getItem("refreshToken");

        if (!currentRefreshToken) return null;

        try {
          const res = await authApi.refreshToken(currentRefreshToken);
          const body = res.data as {
            status: number;
            message?: string;
            data?: LoginResponse;
          };

          if (body?.status === 200 && body.data?.token) {
            const { token, refreshToken, email: userEmail, userId } = body.data;
            localStorage.setItem("token", token);
            localStorage.setItem("refreshToken", refreshToken ?? "");
            set({
              user: { token, refreshToken: refreshToken ?? "", email: userEmail, userId },
              isLoggedIn: true,
            });
            return token;
          }
        } catch {
          // refresh thất bại → buộc logout
        }

        // Refresh token hết hạn → logout
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        set({ user: null, isLoggedIn: false });
        return null;
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // ignore API error, still clear local state
        }
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        set({ user: null, isLoggedIn: false });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isLoggedIn: state.isLoggedIn }),
      onRehydrateStorage: () => (state) => {
        if (state?.user?.token) {
          localStorage.setItem("token", state.user.token);
          localStorage.setItem("refreshToken", state.user.refreshToken ?? "");
        }
        state?.setHasHydrated(true);
      },
    }
  )
);
