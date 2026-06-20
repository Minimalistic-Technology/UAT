export const GET_DASHBOARD_APPLICATIONS_QUERY = `
  query GetDashboardApplications($page: Int, $limit: Int) {
    getDashboardApplications(page: $page, limit: $limit) {
      applications {
        _id
        jobSeeker {
          firstName
          lastName
          email
        }
        listing {
          title
        }
        listingType
        status
        createdAt
      }
      pagination {
        totalItems
      }
    }
  }
`;
