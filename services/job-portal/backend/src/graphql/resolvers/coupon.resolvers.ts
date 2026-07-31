import { GraphQLError } from "graphql";
import { prisma } from "../../lib/prisma.js";
import { MyContext } from "../context.js";

export const couponResolvers = {
  Query: {
    getCoupons: async (
      _: any,
      { page = 1, limit = 10 }: { page?: number; limit?: number },
      context: MyContext
    ) => {
      try {
        if (!context.user) {
          throw new GraphQLError("Not authenticated", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        }

        const pageNumber = Math.max(1, page || 1);
        const limitNumber = Math.min(100, Math.max(1, limit || 10));
        const skip = (pageNumber - 1) * limitNumber;

        const totalCoupons = await prisma.coupon.count();
        const coupons = await prisma.coupon.findMany({
          orderBy: { createdAt: "desc" },
          skip,
          take: limitNumber,
        });

        const totalPages = Math.ceil(totalCoupons / limitNumber);

        return {
          coupons,
          pagination: {
            currentPage: pageNumber,
            totalPages,
            hasNextPage: pageNumber < totalPages,
            hasPrevPage: pageNumber > 1,
            totalItems: totalCoupons,
          },
        };
      } catch (error: any) {
        throw new GraphQLError(error.message, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};

