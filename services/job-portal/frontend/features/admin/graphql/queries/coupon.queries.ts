export const GET_ADMIN_COUPONS_QUERY = `
  query GetCoupons($page: Int, $limit: Int) {
    getCoupons(page: $page, limit: $limit) {
      coupons {
        _id
        code
        type
        value
        isActive
        usageCount
        maxUses
        expiryDate
      }
      pagination {
        currentPage
        totalPages
        hasNextPage
        hasPrevPage
        totalItems
      }
    }
  }
`;
