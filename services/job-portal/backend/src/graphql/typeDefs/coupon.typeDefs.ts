export const couponTypeDefs = `#graphql
  type Coupon {
    _id: ID!
    code: String!
    type: String!
    value: Float!
    isActive: Boolean!
    expiryDate: String
    maxUses: Int
    usageCount: Int!
    usedBy: [ID!]
  }

  type CouponPagination {
    currentPage: Int!
    totalPages: Int!
    hasNextPage: Boolean!
    hasPrevPage: Boolean!
    totalItems: Int!
  }

  type CouponsResponse {
    coupons: [Coupon!]!
    pagination: CouponPagination!
  }

  extend type Query {
    getCoupons(page: Int, limit: Int): CouponsResponse!
  }
`;
