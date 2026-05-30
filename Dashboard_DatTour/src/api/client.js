import axios from "axios";

const API_GATEWAY = import.meta.env.VITE_API_GATEWAY || "http://localhost:8080";

const client = axios.create({
  baseURL: API_GATEWAY,
  headers: {
    "Content-Type": "application/json",
  },
});

// Dynamic routing for API Gateway and Identity Service (Auth)
client.interceptors.request.use(
  (config) => {
    if (config.url && config.url.startsWith("/auth")) {
      config.baseURL = import.meta.env.VITE_API_AUTH || "http://localhost:8080/api/v1";
    } else {
      config.baseURL = import.meta.env.VITE_API_GATEWAY || "http://localhost:8080";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common["Authorization"];
  }
};

export default client;
