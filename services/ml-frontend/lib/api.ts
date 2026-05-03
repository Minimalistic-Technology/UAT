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

// Request interceptor to add Authorization header
api.interceptors.request.use((config) => {
  // Cookies are sent automatically with withCredentials: true
  // This is a backup mechanism in case cookies fail
  if (typeof window !== "undefined") {
    const token = getCookieValue("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
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

// Helper function to read cookie value
function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export default api;
