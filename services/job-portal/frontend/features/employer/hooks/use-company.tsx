import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addEmployee, deleteEmployee, getAllEmployees, getMyCompany, submitKycData, updateCompanyDetails, uploadCompanyLogo, getEmployeeById, updateEmployee } from "../services/company.service";
import { toast } from "sonner";
import {useRouter} from "next/navigation"
import { getValidationErrorMessage } from "@/lib/validation-error";

export const useGetAllEmployees = () => {
  return useQuery({
    queryKey: ["all-employees"],
    queryFn: () => getAllEmployees(),
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: any) => addEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-employees"] });
      toast.success("Employee added successfully");
      router.push("/employer-dashboard/team");
    },
    onError: (error: any) => {
      console.error("Error adding employee:", error);
      const errorMsg = error?.response?.data?.message || "Failed to add employee";
      if (errorMsg === "Validation failed") {
        const firstErrorMessage = getValidationErrorMessage(error);
        toast.error(firstErrorMessage);
        return;
      }
      toast.error(errorMsg);
    },
  });
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

export const useGetEmployeeById = (id: string) => {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: () => getEmployeeById(id),
    enabled: !!id,
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateEmployee({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-employees"] });
      toast.success("Employee updated successfully");
      router.push("/employer-dashboard/team");
    },
    onError: (error: any) => {
      console.error("Error updating employee:", error);
      const errorMsg = error?.response?.data?.message || "Failed to update employee";
      if (errorMsg === "Validation failed") {
        const firstErrorMessage = getValidationErrorMessage(error);
        toast.error(firstErrorMessage);
        return;
      }
      toast.error(errorMsg);
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
      queryClient.invalidateQueries({ queryKey: ["user-details", "my-company-details"] });
      router.push("/employer-dashboard");
    },
    onError: (error: any) => {
      console.log("error", error?.response?.data?.errors);
      const errorMsg = error?.response?.data?.message || "Failed to submit KYC";

      if(errorMsg === 'Validation failed'){
        const firstErrorMessage = getValidationErrorMessage(error)
        toast.error(firstErrorMessage);
        return;

      }
      toast.error(errorMsg);
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCompanyDetails,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-company-details"] });
      toast.success("Company profile updated successfully");
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || "Failed to update company profile";
      toast.error(errorMsg);
    },
  });
};

export const useUploadCompanyLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadCompanyLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-company-details"] });
      toast.success("Company logo updated successfully");
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || "Failed to upload company logo";
      toast.error(errorMsg);
    },
  });
};
