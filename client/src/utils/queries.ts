import { gql } from "@apollo/client";

// ✅ GraphQL Query to Get the Logged-In User
export const GET_ME = gql`
  query Me {
    me {
      username
      email
      savedBooks {
        bookId
        title
        authors
        description
        image
        link
      }
    }
  }
`;

export const GET_USER = gql`
  query GetUser($username: String!) {
    getUser(username: $username) {
      id
      username
      email
      savedBooks {
        bookId
        title
        authors
        description
        image
        link
      }
    }
  }
`;

// Future 
// export const GET_USERS = gql`
//   query GetUsers {
//     getUsers {
//       id
//       username
//       email
//       savedBooks {
//         bookId
//         title
//         authors
//         description
//         image
//       }
//     }
//   }
// `;