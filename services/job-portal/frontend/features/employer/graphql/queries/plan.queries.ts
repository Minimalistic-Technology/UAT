export const GET_ACTIVE_PLANS_QUERY = `
  query GetPlans {
    getPlans {
      count
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
    }
  }
`;
