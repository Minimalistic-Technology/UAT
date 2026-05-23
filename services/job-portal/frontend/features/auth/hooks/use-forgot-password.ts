import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "../services/auth.service";
import { ForgotPasswordInput } from "../validations/auth.schema";

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordInput) => forgotPassword(data),
  });
};
