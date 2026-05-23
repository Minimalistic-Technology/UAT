import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth-service";

export const useVerifyOTP = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.verifyOTP,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
    },
  });
};
