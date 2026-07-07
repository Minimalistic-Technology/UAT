export const GET_ALL_ADMIN_PLANS_QUERY = `
  query GetAllAdminPlans($page: Int, $limit: Int) {
    getAllAdminPlans(page: $page, limit: $limit) {
      plans {
        _id
        name
        description
        price
        currency
        subscriptionDurationDays
        maxActiveJobPosts
        maxTeamMembers
        isDefault
        displayOrder
        features
        isActive
        allowResumeDownload
        jobPostValidityDays
        createdAt
        updatedAt
      }
      pagination {
        currentPage
        totalPages
        totalItems
        itemsPerPage
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;
