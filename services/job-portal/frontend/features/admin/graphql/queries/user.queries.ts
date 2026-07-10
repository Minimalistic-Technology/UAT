export const GET_ALL_USERS_QUERY = `
  query GetAllUsers($page: Int, $limit: Int) {
    getAllUsers(page: $page, limit: $limit) {
      count
      users {
        id
        firstName
        lastName
        email
        role
        isActive
        isVerified
        isEmployee
        companyRole
        companyName
        createdAt
        updatedAt
        avatar {
          url
        }
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
