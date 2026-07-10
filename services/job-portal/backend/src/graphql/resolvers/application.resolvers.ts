import { GraphQLError } from "graphql";
import { prisma } from "../../lib/prisma.js";
import { MyContext } from "../context.js";

export const applicationResolvers = {
  Query: {
    getDashboardApplications: async (
      _: any,
      { page = 1, limit = 5 }: { page?: number; limit?: number },
      context: MyContext
    ) => {
      try {
        if (!context.user) {
          throw new GraphQLError("Not authenticated", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        }

        const userId = context.user.id;

        const companyMember = await prisma.companyMember.findFirst({
          where: { userId },
        });

        if (!companyMember) {
          throw new GraphQLError("Company member not found", {
            extensions: { code: "BAD_REQUEST" },
          });
        }

        const companyId = companyMember.companyId;
        const skip = (page - 1) * limit;

        const [applicationsDocs, totalApplications] = await Promise.all([
          prisma.application.findMany({
            where: { listing: { companyId } },
            include: {
              listing: { select: { title: true } },
              jobSeeker: { select: { firstName: true, lastName: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
          }),
          prisma.application.count({
            where: { listing: { companyId } },
          }),
        ]);

        const applications = applicationsDocs.map((app) => ({
          id: app.id,
          jobSeeker: app.jobSeeker,
          listing: app.listing,
          listingType: app.listingType,
          status: app.status,
          createdAt: app.createdAt.toISOString(),
        }));

        return {
          applications,
          pagination: {
            totalItems: totalApplications,
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
