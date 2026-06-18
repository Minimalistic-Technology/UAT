import axios, { AxiosError, isAxiosError } from "axios";

export { isAxiosError };
export type { AxiosError };

// Since we are using static HTML export (output: 'export'), we cannot use Next.js
// API rewrites. Therefore, we must ALWAYS hit the exact absolute API base URL directly.
const getBaseURL = () => {
  const rawURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  return rawURL.endsWith("/api/v1") ? rawURL : `${rawURL}/api/v1`;
};
const baseURL = getBaseURL();

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// VERY IMPORTANT for Next.js Fast Refresh: 
// Clear ghost interceptors from old browser memory instances
api.interceptors.request.clear();
api.interceptors.response.clear();

// Request interceptor
api.interceptors.request.use((config) => {
  // If we have a token in localStorage, use it as a fallback
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor for consistent error handling and automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Silently handle expected 401 for /me (guest mode)
    if (error.response?.status === 401 && originalRequest.url?.endsWith("/auth/me")) {
      return Promise.resolve({ data: { data: { user: null } } });
    }

    // Globally intercept completely disabled functionality features
    if (error.response?.status === 503) {
      return Promise.reject(error);
    }

    // If 401 and not a retry yet, and not the refresh token endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.endsWith("/auth/refresh-token") &&
      !originalRequest.url?.endsWith("/auth/login")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Important: use the exact configured baseURL, do not fallback to localhost in production
        const refreshResponse = await axios.post(
          `${baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;

        processQueue(null, newAccessToken);

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // If refresh fails, user is fully logged out. Clear auth state if possible or redirect to login
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          // You could optionally redirect to login here
          // window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
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
