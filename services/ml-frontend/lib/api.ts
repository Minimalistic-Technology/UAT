import axios, { AxiosError, isAxiosError } from "axios";

export { isAxiosError };
export type { AxiosError };

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can add global error handling here (e.g., logging out on 401)
    return Promise.reject(error);
  }
);

export default api;
