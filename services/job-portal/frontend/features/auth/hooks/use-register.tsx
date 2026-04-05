import { useMutation } from "@tanstack/react-query";
import { registerUser, registerEmployer, confirmRegistration, ConfirmRegistrationInput } from "../services/auth.service";
import { RegisterUserInput, EmployerRegisterInput } from "../validations/auth.schema";

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterUserInput) => registerUser(data),
  });
};

export const useRegisterEmployer = () => {
  return useMutation({
    mutationFn: (data: EmployerRegisterInput) => registerEmployer(data),
  });
};

export const useConfirmRegistration = () => {
  return useMutation({
    mutationFn: (data: ConfirmRegistrationInput) => confirmRegistration(data),
  });
};