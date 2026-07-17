export const userTypeDefs = `#graphql
  type Avatar {
    id: ID!
    url: String!
    publicId: String!
    createdAt: String!
    updatedAt: String!
  }

  type AtsScore {
    id: ID!
    overallScore: Int!
    sectionScore: Int!
    formattingScore: Int!
    keywordScore: Int!
    contentScore: Int!
    sectionsFound: [String!]!
    sectionsMissing: [String!]!
    matchedKeywords: [String!]!
    createdAt: String!
    updatedAt: String!
  }

  type Resume {
    id: ID!
    url: String!
    publicId: String!
    originalName: String
    atsScore: AtsScore
    createdAt: String!
    updatedAt: String!
  }

  type Location {
    id: ID!
    city: String
    state: String
    country: String
  }

  type Experience {
    id: ID!
    title: String!
    company: String!
    workType: String
    location: String
    startDate: String!
    endDate: String
    current: Boolean!
    description: String
  }

  type Education {
    id: ID!
    degree: String!
    institution: String!
    graduationYear: Int!
    fieldOfStudy: String!
  }

  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    role: String!
    avatar: Avatar
    resume: Resume
    skills: [String!]!
    languages: [String!]!
    experiences: [Experience!]!
    educations: [Education!]!
    location: Location
    isActive: Boolean!
    isVerified: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type AdminUser {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    role: String!
    isActive: Boolean!
    isVerified: Boolean!
    avatar: Avatar
    createdAt: String!
    updatedAt: String!
    isEmployee: Boolean!
    companyRole: String
    companyName: String
  }

  type AdminUsersResponse {
    count: Int!
    users: [AdminUser!]!
    pagination: PlanPagination!
  }

  extend type Query {
    me: User
    getUserById(id: ID!): User
    getAllUsers(page: Int, limit: Int): AdminUsersResponse!
  }
`;
