import { useQuery, useMutation } from "@tanstack/react-query";
import { getDbCollections, runDbQuery } from "../services/developer.service";
import { toast } from "sonner";

export const useGetDbCollections = () => {
  return useQuery({
    queryKey: ["db-collections"],
    queryFn: getDbCollections,
  });
};

export const useRunDbQuery = () => {
  return useMutation({
    mutationFn: (query: string) => runDbQuery(query),
  });
};
