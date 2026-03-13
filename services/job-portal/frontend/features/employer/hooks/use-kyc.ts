import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { KYCFormValues } from "../schemas";
import { submitKyc } from "../services";

export const useSubmitKyc = () => {
  return useMutation({
    mutationFn: async (data: KYCFormValues) => {
      const formData = new FormData();
      formData.append("companyName", data.companyName);
      formData.append("aadharNo", data.aadharNo);
      formData.append("gstNo", data.gstNo);
      formData.append("cinNo", data.cinNo);

      if (data.photo?.[0]) {
        formData.append("photo", data.photo[0]);
      }

      if (data.lightbill?.[0]) {
        formData.append("lightbill", data.lightbill[0]);
      }

      return submitKyc(formData);
    },
    onSuccess: () => {
      toast.success("KYC Details Submitted Successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit KYC");
    },
  });
};
