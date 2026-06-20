import { GraphQLError } from "graphql";
import Application from "../../models/Application.model.js";
import CompanyMember from "../../models/CompanyMember.model.js";
import Job from "../../models/Job.model.js";
import Internship from "../../models/Internship.model.js";
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

        const companyMember = await CompanyMember.findOne({
          user: context.user._id,
        });

        if (!companyMember) {
          throw new GraphQLError("Company member not found", {
            extensions: { code: "BAD_REQUEST" },
          });
        }

        const companyId = companyMember.company;

        const skip = (page - 1) * limit;

        const [allJobs, allInternships] = await Promise.all([
          Job.find({ company: companyId }).select("_id"),
          Internship.find({ company: companyId }).select("_id"),
        ]);

        const allListings = [...allJobs, ...allInternships];
        const query: any = { listing: { $in: allListings.map((l) => l._id) } };

        const [applicationsDocs, totalApplications] = await Promise.all([
          Application.find(query)
            .populate({
              path: "listing",
              select: "title",
            })
            .populate("jobSeeker", "firstName lastName email")
            .sort("-createdAt")
            .skip(skip)
            .limit(limit),
          Application.countDocuments(query),
        ]);

        const applications = applicationsDocs.map((app: any) => {
          return {
            _id: app._id.toString(),
            jobSeeker: app.jobSeeker,
            listing: app.listing,
            listingType: app.listingType,
            status: app.status,
            createdAt: app.createdAt.toISOString(),
          };
        });

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
