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
  TestimonialUser: {
    role: (user: any) => {
      if (user.experience && user.experience.length > 0) {
        const currentExp =
          user.experience.find((e: any) => e.current) || user.experience[0];
        if (currentExp.title && currentExp.company) {
          return `${currentExp.title} at ${currentExp.company}`;
        }
        return currentExp.title || "User";
      }
      return "User";
    },
    avatarUrl: (user: any) => {
      return user.avatar?.url || null;
    },
  },
};
