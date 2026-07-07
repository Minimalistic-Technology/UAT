export const applicationTypeDefs = `#graphql
  type MinimalUser {
    firstName: String
    lastName: String
    email: String
  }

  type MinimalListing {
    title: String
  }

  type MinimalApplication {
    id: ID!
    jobSeeker: MinimalUser
    listing: MinimalListing
    listingType: String
    status: String
    createdAt: String
  }

  type ApplicationsPagination {
    totalItems: Int!
  }

  type DashboardApplicationsResponse {
    applications: [MinimalApplication!]!
    pagination: ApplicationsPagination!
  }

  extend type Query {
    getDashboardApplications(page: Int, limit: Int): DashboardApplicationsResponse!
  }
`;
