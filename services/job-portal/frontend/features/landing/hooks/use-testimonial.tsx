import { useQuery } from "@tanstack/react-query";
import { getLandingTestimonials } from "../services/testimonial.service";

export const useFetchTestimonials = (limit: number = 3) => {
  return useQuery({
    queryKey: ["landing-testimonials", limit],
    queryFn: () => getLandingTestimonials(limit),
  });
};
