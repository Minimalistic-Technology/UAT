import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteEmployee, getAllEmployees, getMyCompany, submitKycData } from "../services/company.service";
import { toast } from "sonner";
import {useRouter} from "next/navigation"

export const useGetAllEmployees = () => {
  return useQuery({
    queryKey: ["all-employees"],
    queryFn: () => getAllEmployees(),
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  //
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-employees"] });
      toast.success("Employee deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting employee:", error);
      toast.error("Failed to delete employee");
    },
  });
};

export const useGetMyCompanyDetails = () => {
  return useQuery({
    queryKey: ["my-company-details"],
    queryFn: () => getMyCompany()
  })
}

export const useSubmitKyc = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (formData: FormData) => submitKycData(formData),
    onSuccess: (data) => {
      toast.success(data.message || "KYC submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-details"] });
      router.push("/employer-dashboard");
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || "Failed to submit KYC";
      toast.error(errorMsg);
    },
  });
};
