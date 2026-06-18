import { api } from "@/lib/api";
import { LoginValues, RegisterValues } from "../types/auth-type";
import { ApiResponse, LoginResponse, SignupResponse } from "../types/auth-response";

export const authService = {
  login: async (data: LoginValues): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },
  verifyOTP: async (data: { email: string; otp: string }): Promise<LoginResponse> => {
    const response = await api.post("/auth/verify-otp", data);
    return response.data;
  },
  register: async (data: RegisterValues): Promise<SignupResponse> => {
    const response = await api.post("/auth/signup", data);
    return response.data;
  },
  getMe: async (): Promise<LoginResponse> => {
    const response = await api.get("/auth/me");
    return response.data;
  },
  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },
  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    const response = await api.post("/auth/password-reset/initiate", { email });
    return response.data;
  },
  resetPassword: async (data: { email: string; token: string; password: string }): Promise<ApiResponse<null>> => {
    const response = await api.post("/auth/password-reset/complete", data);
    return response.data;
  },
};
