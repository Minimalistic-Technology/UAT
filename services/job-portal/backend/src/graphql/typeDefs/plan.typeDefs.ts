export const planTypeDefs = `#graphql
  type Plan {
    id: ID!
    name: String!
    description: String
    price: Float!
    currency: String!
    subscriptionDurationDays: Int!
    maxActiveJobPosts: Int!
    maxTeamMembers: Int!
    isDefault: Boolean!
    displayOrder: Int!
    features: [String!]!
    isActive: Boolean!
    allowResumeDownload: Boolean!
    jobPostValidityDays: Int!
    createdAt: String!
    updatedAt: String!
  }

  type PlanPagination {
    currentPage: Int!
    totalPages: Int!
    totalItems: Int!
    itemsPerPage: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type ActivePlansResponse {
    count: Int!
    plans: [Plan!]!
  }

  type AdminPlansResponse {
    plans: [Plan!]!
    pagination: PlanPagination!
  }

  extend type Query {
    getPlans: ActivePlansResponse!
    getAllAdminPlans(page: Int, limit: Int): AdminPlansResponse!
  }
`;
