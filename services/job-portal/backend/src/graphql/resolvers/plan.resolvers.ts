import { GraphQLError } from "graphql";
import { prisma } from "../../lib/prisma.js";
import { MyContext } from "../context.js";

export const planResolvers = {
  Query: {
    getPlans: async () => {
      try {
        const plans = await prisma.plan.findMany({
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
        });
        return {
          count: plans.length,
          plans,
        };
      } catch (error: any) {
        throw new GraphQLError(error.message, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    getAllAdminPlans: async (
      _: any,
      { page = 1, limit = 10 }: { page?: number; limit?: number },
      context: MyContext,
    ) => {
      try {
        if (!context.user) {
          throw new GraphQLError("Not authenticated", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        }
        if (context.user.role !== "SUPER_ADMIN") {
          throw new GraphQLError("Forbidden", {
            extensions: { code: "FORBIDDEN" },
          });
        }

        const pageNumber = Math.max(1, page || 1);
        const limitNumber = Math.min(100, Math.max(1, limit || 10));
        const skip = (pageNumber - 1) * limitNumber;

        const totalPlans = await prisma.plan.count();
        const plans = await prisma.plan.findMany({
          orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
          skip,
          take: limitNumber,
        });

        return {
          plans,
          pagination: {
            currentPage: pageNumber,
            totalPages: Math.ceil(totalPlans / limitNumber),
            totalItems: totalPlans,
            itemsPerPage: limitNumber,
            hasNextPage: pageNumber < Math.ceil(totalPlans / limitNumber),
            hasPreviousPage: pageNumber > 1,
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
