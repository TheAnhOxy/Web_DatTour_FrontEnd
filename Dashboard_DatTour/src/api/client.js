import axios from "axios";

const API_GATEWAY = import.meta.env.VITE_API_GATEWAY || "http://localhost:8080";

const client = axios.create({
  baseURL: API_GATEWAY,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthToken = (token) => {
  if (token) {
    client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common["Authorization"];
  }
};

export default client;
