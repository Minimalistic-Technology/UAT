import { useMutation } from "@tanstack/react-query";
import {
  resendRegistrationOTP,
  ResendOtpInput,
} from "../services/auth.service";

export const useResendRegistrationOtp = () => {
  return useMutation({
    mutationFn: (data: ResendOtpInput) => resendRegistrationOTP(data),
  });
};
