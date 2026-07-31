import { useQuery } from "@tanstack/react-query";
import {
  getInternshipDetailsById,
  getRelatedInternshipsById,
} from "../services/internship.service";

export const useGetInternshipDetailsById = (internshipId: string) => {
  return useQuery({
    queryKey: ["internship", internshipId],
    queryFn: () => getInternshipDetailsById(internshipId),
    enabled: !!internshipId,
  });
};

export const useGetRelatedInternshipsById = (internshipId: string) => {
  return useQuery({
    queryKey: ["related-internships", internshipId],
    queryFn: () => getRelatedInternshipsById(internshipId),
  });
};
