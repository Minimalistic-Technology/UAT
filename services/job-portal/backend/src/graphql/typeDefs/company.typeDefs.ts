export const companyTypeDefs = `#graphql
  type CompanyDetails {
    id: ID!
    name: String!
    isVerified: Boolean!
    industry: String!
    activeListings: Int!
    totalMembers: Int!
    remainingJobPosts: Int
    currentPlan: Plan
    kycStatus: String
    kycRejectionReason: String
  }

  extend type Query {
    getMyCompanyDashboardDetails: CompanyDetails
  }
`;
