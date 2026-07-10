import { GraphQLError } from "graphql";
import { prisma } from "../../lib/prisma.js";

export const testimonialResolvers = {
  Query: {
    getTestimonials: async (_: any, { limit = 10 }: { limit?: number }) => {
      try {
        const testimonials = await prisma.testimonial.findMany({
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              include: {
                avatar: true,
              },
            },
          },
        });
        return testimonials;
      } catch (error: any) {
        throw new GraphQLError(error.message, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
  TestimonialUser: {
    avatarUrl: (user: any) => {
      return user.avatar?.url || null;
    },
  },
};
