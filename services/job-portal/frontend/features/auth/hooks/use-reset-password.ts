import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../services/auth.service";
import { ResetPasswordInput } from "../validations/auth.schema";

export const useResetPassword = (token: string) => {
  return useMutation({
    mutationFn: (data: ResetPasswordInput) => resetPassword(token, data),
  });
};
