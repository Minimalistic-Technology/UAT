import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth-service";

export const useRegister = () => {
  return useMutation({
    mutationFn: authService.register,
  });
};
