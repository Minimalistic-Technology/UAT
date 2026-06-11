import { GraphQLError } from "graphql";
import { Testimonial } from "../../models/Testimonial.model.js";

export const testimonialResolvers = {
  Query: {
    getTestimonials: async (_: any, { limit = 10 }: { limit?: number }) => {
      try {
        const testimonials = await Testimonial.find()
          .sort({ createdAt: -1 })
          .limit(limit)
          .populate("user");
        return testimonials;
      } catch (error: any) {
        throw new GraphQLError(error.message, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};
