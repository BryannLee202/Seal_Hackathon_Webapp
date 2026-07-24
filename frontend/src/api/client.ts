import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BFF_URL ?? "http://localhost:4001",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      "Đã xảy ra lỗi không xác định";
    return Promise.reject(new Error(message));
  },
);
