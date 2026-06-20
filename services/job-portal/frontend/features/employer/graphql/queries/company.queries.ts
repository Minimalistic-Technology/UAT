export const GET_MY_COMPANY_DASHBOARD_DETAILS_QUERY = `
  query GetMyCompanyDashboardDetails {
    getMyCompanyDashboardDetails {
      id
      name
      isVerified
      industry
      activeListings
      totalMembers
      remainingJobPosts
      currentPlan {
        name
      }
      kycStatus
      kycRejectionReason
    }
  }
`;
