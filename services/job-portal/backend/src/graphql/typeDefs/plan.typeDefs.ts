export const planTypeDefs = `#graphql
  type Plan {
    _id: ID!
    name: String!
    description: String
    price: Float!
    currency: String!
    durationDays: Int!
    jobPostLimit: Int!
    teamMemberLimit: Int!
    isFeatured: Boolean!
    isDefault: Boolean!
    displayOrder: Int!
    features: [String!]!
    isActive: Boolean!
    allowResumeDownload: Boolean!
    postValidityDays: Int!
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
