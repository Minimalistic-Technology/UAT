import { API_URL } from "@/constants";
import axios, { AxiosResponse } from "axios";
import { getSession } from "next-auth/react";

export interface ApiSuccessResponse<T = any> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface ApiError {
  statusCode: number;
  message: string;
  success: boolean;
  data: null;
  errors: any[];
  stack?: string;
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.user && "accessToken" in session.user) {
      config.headers.Authorization = `Bearer ${(session.user as any).accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosResponse<ApiError>) => {
    const status = error.data?.statusCode || error.status;

    if (status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
