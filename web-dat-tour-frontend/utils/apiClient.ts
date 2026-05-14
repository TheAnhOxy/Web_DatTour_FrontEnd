const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY || "http://localhost:8080";

class ApiClient {
  private baseURL: string;
  // Tránh gọi refresh nhiều lần cùng lúc (promise dùng chung)
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getToken(): string | null {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
  }

  private buildHeaders(extra?: HeadersInit): Headers {
    const headers = new Headers({
      "Content-Type": "application/json",
      ...(extra || {}),
    });
    const token = this.getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  }

  private async rawFetch(url: string, options: RequestInit): Promise<Response> {
    return fetch(url, { ...options, headers: this.buildHeaders(options.headers as HeadersInit) });
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;

    try {
      let response = await this.rawFetch(url, options);

      // ── Tự động refresh khi access token hết hạn ──
      if (response.status === 401 && typeof window !== "undefined") {
        // Nếu chưa có refresh đang chạy thì tạo mới, ngược lại dùng chung
        if (!this.refreshPromise) {
          this.refreshPromise = this.doRefresh().finally(() => {
            this.refreshPromise = null;
          });
        }
        const newToken = await this.refreshPromise;

        if (newToken) {
          // Retry với token mới
          response = await this.rawFetch(url, options);
        } else {
          // Refresh thất bại → redirect về login
          window.location.href = "/login";
          return { data: { status: 401, message: "Phiên đăng nhập hết hạn!", data: null } };
        }
      }

      let data;
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = text;
      }

      if (!response.ok) {
        return { data: { status: response.status, message: data?.message || response.statusText, data: null } };
      }

      return { data };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { data: { status: 500, message, data: null } };
    }
  }

  /** Gọi refresh-token endpoint, cập nhật localStorage */
  private async doRefresh(): Promise<string | null> {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return null;

      const body = await res.json();
      if (body?.status === 200 && body?.data?.token) {
        const { token, refreshToken: newRefreshToken } = body.data;
        localStorage.setItem("token", token);
        if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);

        // Đồng bộ Zustand store nếu có
        try {
          const { useAuthStore } = await import("../store/authStore");
          const store = useAuthStore.getState();
          await store.doRefresh();
        } catch {
          // store chưa sẵn sàng — bỏ qua, token trong localStorage đã được cập nhật
        }

        return token;
      }
    } catch {
      // network error
    }
    return null;
  }

  get(endpoint: string, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  post(endpoint: string, body: unknown, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: "POST", body: JSON.stringify(body) });
  }

  put(endpoint: string, body: unknown, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) });
  }

  delete(endpoint: string, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }
}

const client = new ApiClient(API_GATEWAY);
export default client;
