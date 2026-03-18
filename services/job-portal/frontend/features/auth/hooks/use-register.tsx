import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../auth.service";
import { RegisterUserInput } from "../auth.schema";

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterUserInput) => registerUser(data),
  });
};