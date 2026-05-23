import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/api";
import { useAuthStore } from "@/store/auth.store";

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1` || "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiSuccessResponse<any>>) => {
    return response.data.data;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status;

    if (status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        useAuthStore.getState().logout();
        if (!window.location.pathname.includes("/auth/login")) {
          window.location.href = "/auth/login";
        }
      }
    }

    const errorMessage =
      error.response?.data?.message || "An unexpected error occurred";
    return Promise.reject(new Error(errorMessage));
  },
);

export default apiClient;
