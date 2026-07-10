import { GraphQLError } from "graphql";
import { prisma } from "../../lib/prisma.js";
import { MyContext } from "../context.js";

export const companyResolvers = {
  Query: {
    getMyCompanyDashboardDetails: async (_: any, __: any, context: MyContext) => {
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

        const company = await prisma.company.findUnique({
          where: { id: companyMember.companyId },
        });

        if (!company) {
          throw new GraphQLError("You have not created a company yet", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        const [
          activeJobs,
          activeInternships,
          totalMembers,
          currentSubscription,
          kyc,
        ] = await Promise.all([
          prisma.baseListing.count({
            where: { companyId: company.id, opportunityType: "JOB", status: "ACTIVE", isDeleted: false },
          }),
          prisma.baseListing.count({
            where: { companyId: company.id, opportunityType: "INTERNSHIP", status: "ACTIVE", isDeleted: false },
          }),
          prisma.companyMember.count({ where: { companyId: company.id, isActive: true } }),
          prisma.subscription.findFirst({
            where: { companyId: company.id, status: "ACTIVE" },
            include: { plan: true },
          }),
          prisma.kYC.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
          }),
        ]);

        return {
          id: company.id,
          name: company.name,
          isVerified: company.isVerified,
          industry: company.industry,
          activeListings: activeJobs + activeInternships,
          totalMembers,
          remainingJobPosts: currentSubscription
            ? currentSubscription.postsRemaining
            : null,
          currentPlan: currentSubscription ? currentSubscription.plan : null,
          kycStatus: kyc ? kyc.status : null,
          kycRejectionReason: kyc?.rejectionReason || null,
        };
      } catch (error: any) {
        throw new GraphQLError(error.message, {
          extensions: { code: error.extensions?.code || "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};
