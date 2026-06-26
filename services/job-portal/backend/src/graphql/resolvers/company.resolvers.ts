import { GraphQLError } from "graphql";
import Company from "../../models/Company.model.js";
import CompanyMember from "../../models/CompanyMember.model.js";
import Job from "../../models/Job.model.js";
import Internship from "../../models/Internship.model.js";
import Subscription from "../../models/Subscription.model.js";
import KYC from "../../models/KYC.model.js";
import { JobStatus } from "../../models/BaseJob.model.js";
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

        const companyMember = await CompanyMember.findOne({ user: context.user._id });

        if (!companyMember) {
          throw new GraphQLError("Company member not found", {
            extensions: { code: "BAD_REQUEST" },
          });
        }

        const company = await Company.findById(companyMember.company);

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
          Job.countDocuments({ company: company._id, status: JobStatus.ACTIVE }),
          Internship.countDocuments({
            company: company._id,
            status: JobStatus.ACTIVE,
          }),
          CompanyMember.countDocuments({ company: company._id, isActive: true }),
          Subscription.findOne({
            companyId: company._id,
            status: "active",
          }).populate("planId", "name"),
          KYC.findOne({ user: context.user._id }),
        ]);

        return {
          id: company._id.toString(),
          name: company.name,
          isVerified: company.isVerified,
          industry: company.industry,
          activeListings: activeJobs + activeInternships,
          totalMembers,
          remainingJobPosts: currentSubscription
            ? currentSubscription.postsRemaining
            : null,
          currentPlan: currentSubscription ? currentSubscription.planId : null,
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
