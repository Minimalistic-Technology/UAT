import axios, { AxiosError, isAxiosError } from "axios";

export { isAxiosError };
export type { AxiosError };

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1",
  withCredentials: true, // Send cookies by default
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Silently handle expected 401 for /me (guest mode)
    if (error.response?.status === 401 && error.config.url?.endsWith("/auth/me")) {
      return Promise.resolve({ data: { data: { user: null } } });
    }

    // You can add global error handling here (e.g., logging out on 401)
    if (error.response?.status === 401 && typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      // Optional: Redirect to login or clear auth state if 401 occurs unexpectedly
    }
    return Promise.reject(error);
  }
);

export default api;
