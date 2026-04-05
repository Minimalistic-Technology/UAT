import { useQuery } from "@tanstack/react-query";
import { getPlans } from "../services/plan.service";

export const useGetPlans = () => {
  return useQuery({
    queryKey: ["plans"],
    queryFn: () => getPlans(),
  });
};
