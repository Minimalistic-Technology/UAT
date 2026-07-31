import { useQuery } from "@tanstack/react-query";
import { getCompanyById, getCompanyJobs } from "../services/company.service";

export const useGetCompanyById = (id: string) => {
  return useQuery({
    queryKey: ["company", id],
    queryFn: () => getCompanyById(id),
    enabled: !!id,
  });
};

export const useGetCompanyJobs = (companyId: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["company-jobs", companyId, page, limit],
    queryFn: () => getCompanyJobs(companyId, page, limit),
    enabled: !!companyId,
  });
};
