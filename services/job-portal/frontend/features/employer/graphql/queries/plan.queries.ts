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
        durationDays
        jobPostLimit
        teamMemberLimit
        isFeatured
        isDefault
        displayOrder
        features
        isActive
        allowResumeDownload
        postValidityDays
        createdAt
        updatedAt
      }
    }
  }
`;
