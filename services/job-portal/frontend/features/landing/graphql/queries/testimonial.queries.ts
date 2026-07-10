export const GET_TESTIMONIALS_QUERY = `
  query GetTestimonials($limit: Int) {
    getTestimonials(limit: $limit) {
      id
      content
      rating
      authorName
      authorRole
      authorCompany
      user {
        id
        firstName
        lastName
        avatarUrl
      }
    }
  }
`;
