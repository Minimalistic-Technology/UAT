import { useMutation } from "@tanstack/react-query";
import { registerEmployer } from "../services/employer.service";
import { EmployerRegisterInput } from "../employer.schema";
import { toast } from "sonner";

export const useEmployerRegister = () => {
  return useMutation({
    mutationFn: (data: EmployerRegisterInput) => registerEmployer(data),
    onSuccess: (data) => {
      console.log("Success data for employer registration: ", data);
      toast.success("Employer registration successful! Please login.");
    },
    onError: (error) => {
      console.error("Error for employer registration: ", error);
      toast.error("Failed to register employer");
    },
  });
};
