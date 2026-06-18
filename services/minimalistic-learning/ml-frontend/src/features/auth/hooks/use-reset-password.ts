import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth-service";

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: { email: string; token: string; password: string }) => authService.resetPassword(data),
  });
};
