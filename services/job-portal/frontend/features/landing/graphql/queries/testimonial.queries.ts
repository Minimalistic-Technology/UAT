export const GET_TESTIMONIALS_QUERY = `
  query GetTestimonials($limit: Int) {
    getTestimonials(limit: $limit) {
      id
      content
      rating
      user {
        id
        firstName
        lastName
        avatarUrl
        role
      }
    }
  }
`;
