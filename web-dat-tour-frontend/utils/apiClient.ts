const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY || "http://localhost:8080";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Merge headers
    const headers = new Headers({
      "Content-Type": "application/json",
      ...(options.headers || {}),
    });

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    try {
      const response = await fetch(url, { ...options, headers });
      
      let data;
      // Handle empty responses
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = text;
      }

      if (!response.ok) {
        return { data: { status: response.status, message: data?.message || response.statusText, data: null }};
      }

      return { data };
    } catch (error: any) {
      return { data: { status: 500, message: error.message, data: null }};
    }
  }

  get(endpoint: string, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint: string, body: any, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
  }
}

const client = new ApiClient(API_GATEWAY);

export default client;
