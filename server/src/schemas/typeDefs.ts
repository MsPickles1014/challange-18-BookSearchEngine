import { gql } from "graphql-tag";


const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    savedBooks: [Book]!  # ✅ Fixed this line (changed "Books" to "Book")
  }

  type Book {
    bookId: String!
    title: String!
    authors: [String]
    description: String!
    image: String
    link: String
  }

  type Auth {
    token: String!
    user: User!
  }

  input AddBookInput {
    bookId: String!
    title: String!
    authors: [String!]
    description: String!
    image: String
    link: String
  }

  input UserInput {
    username: String!
    email: String!
    password: String!
  }

  type Query {
    me: User
    getUser(username: String!): User
    getUsers: [User]
    getBook(bookId: String!): Book 
}
  type Mutation {
    addBook(input: AddBookInput!): Book
    addUser(input: UserInput!): Auth 
    login(email: String!, password: String!): Auth  
    saveBook(input: AddBookInput!): User
    removeBook(bookId: String!): User
  }
`;

export default typeDefs;
