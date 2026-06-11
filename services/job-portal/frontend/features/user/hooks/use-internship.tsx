import { useQuery } from "@tanstack/react-query";
import { getInternshipDetailsById } from "../services/internship.service";

export const useGetInternshipDetailsById = (internshipId: string) => {
  return useQuery({
    queryKey: ["internship", internshipId],
    queryFn: () => getInternshipDetailsById(internshipId),
    enabled: !!internshipId,
  });
};
