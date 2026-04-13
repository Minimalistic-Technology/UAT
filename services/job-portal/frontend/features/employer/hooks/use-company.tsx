import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteEmployee, getAllEmployees } from "../services/company.service";
import { toast } from "sonner";

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
