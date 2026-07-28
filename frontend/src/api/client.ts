import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BFF_URL ?? "http://localhost:4001",
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  withXSRFToken: true,
});

type UnauthorizedListener = () => void;
const unauthorizedListeners = new Set<UnauthorizedListener>();

/** Subscribe to session-expiry (401) events from any API call. Returns an unsubscribe function. */
export function onUnauthorized(listener: UnauthorizedListener) {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      unauthorizedListeners.forEach((listener) => listener());
    }
    const message =
      error.response?.data?.message ??
      error.message ??
      "Đã xảy ra lỗi không xác định";
    return Promise.reject(new Error(message));
  },
);
