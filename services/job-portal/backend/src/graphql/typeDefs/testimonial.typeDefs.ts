export const testimonialTypeDefs = `#graphql
  type TestimonialUser {
    id: ID!
    firstName: String!
    lastName: String!
    avatarUrl: String
    role: String
  }

  type Testimonial {
    id: ID!
    user: TestimonialUser!
    content: String!
    rating: Float
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    getTestimonials(limit: Int): [Testimonial!]!
  }
`;
