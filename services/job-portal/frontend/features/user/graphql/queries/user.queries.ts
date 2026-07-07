export const GET_USER_BY_ID_QUERY = `
  query GetUserById($id: ID!) {
    getUserById(id: $id) {
      id
      firstName
      lastName
      email
      phone
      role
      isActive
      isVerified
      createdAt
      updatedAt
      avatar {
        url
      }
      resume {
        url
        originalName
        atsScore {
          overallScore
          sectionScore
          formattingScore
          keywordScore
          contentScore
          sectionsFound
          sectionsMissing
          matchedKeywords
        }
      }
      experiences {
        id
        title
        company
        workType
        location
        startDate
        endDate
        current
        description
      }
      educations {
        id
        degree
        institution
        graduationYear
        fieldOfStudy
      }
      location {
        city
        state
        country
      }
      skills
      languages
    }
  }
`;