import apiClient from "@/lib/axios";
import type {
  AuthResponseData,
  RegisterResponseData,
} from "@/features/auth/types";
import type {
  LoginInput,
  RegisterInput,
  VerifyOtpInput,
} from "../lib/auth-validator";

export const authService = {
  register: async (data: RegisterInput): Promise<RegisterResponseData> => {
    const res = await apiClient.post<any, RegisterResponseData>(
      "/auth/register",
      data,
    );
    console.log("registration res (unwrapped): ", res);

    return res;
  },

  verifyOtp: async (
    data: VerifyOtpInput,
  ): Promise<AuthResponseData> => {
    const res = await apiClient.post<any, AuthResponseData>(
      "/auth/verify-otp",
      data,
    );
    return res;
  },

  login: async (
    data: LoginInput,
  ): Promise<AuthResponseData> => {
    const res = await apiClient.post<any, AuthResponseData>(
      "/auth/login",
      data,
    );
    return res;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  getCurrentUser: async (): Promise<any> => {
    const res = await apiClient.get("/auth/current-user");
    return res;
  },

  refreshAccessToken: async(refreshToken: string) => {
    const res = await apiClient.post<any, Omit<AuthResponseData, "user">>(
      "/auth/refresh-token",
      { refreshToken },
    );
    return res;
  }
};
