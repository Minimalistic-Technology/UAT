import { useQuery } from "@tanstack/react-query";
import { getMyPayments } from "../services/payment.service";

export const useGetMyPayments = () => {
  return useQuery({
    queryKey: ["my-payments"],
    queryFn: getMyPayments,
  });
};
