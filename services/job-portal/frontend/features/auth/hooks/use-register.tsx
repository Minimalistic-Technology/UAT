import { useMutation } from "@tanstack/react-query";
import { registerUser, confirmRegistration, ConfirmRegistrationInput } from "../services/auth.service";
import { RegisterUserInput } from "../validations/auth.schema";

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterUserInput) => registerUser(data),
  });
};

export const useConfirmRegistration = () => {
  return useMutation({
    mutationFn: (data: ConfirmRegistrationInput) => confirmRegistration(data),
  });
};