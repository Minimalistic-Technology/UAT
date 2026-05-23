import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import { LoginUserInput } from "../validations/auth.schema";

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginUserInput) => {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    },
  });
};
