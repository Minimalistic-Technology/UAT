import apiClient from "@/lib/api-client";
import { API_URL } from "@/constants";
import { GET_TESTIMONIALS_QUERY } from "../graphql/queries/testimonial.queries";

export const getLandingTestimonials = async (limit: number = 3) => {
  const response = await apiClient.post(
    "/graphql",
    {
      query: GET_TESTIMONIALS_QUERY,
      variables: { limit },
    },
    {
      baseURL: API_URL.replace("/api", ""),
    }
  );

  return response.data.data.getTestimonials;
};
