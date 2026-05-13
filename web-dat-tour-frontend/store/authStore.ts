import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import authApi, { RegisterRequest, LoginResponse } from "../api/authApi";

export interface User {
  userId: number;
  email: string;
  token: string;
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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
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
            const { token, email: userEmail, userId } = body.data;
            // sync token for apiClient (reads localStorage.getItem("token"))
            localStorage.setItem("token", token);
            set({ user: { token, email: userEmail, userId }, isLoggedIn: true });
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

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // ignore API error, still clear local state
        }
        localStorage.removeItem("token");
        set({ user: null, isLoggedIn: false });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // only persist user data, not transient state
      partialize: (state) => ({ user: state.user, isLoggedIn: state.isLoggedIn }),
      onRehydrateStorage: () => (state) => {
        // sync token key for apiClient after rehydration
        if (state?.user?.token) {
          localStorage.setItem("token", state.user.token);
        }
        state?.setHasHydrated(true);
      },
    }
  )
);
