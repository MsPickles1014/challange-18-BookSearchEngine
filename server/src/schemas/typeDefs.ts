import { gql } from "apollo-server-express";


const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    savedBooks: [Book]!
    bookCount: Int!


  type Book {
    bookId: String!
    title: String!
    authors: [String]
    description: String!
    image: String
    link: String
  }

type Query {
    getUser(id: ID!): User
    getUsers: [User]
    getBook(bookId: ID!): Book
  }

  type Mutation {
    registerUser(username: String!, email: String!, password: String!): User
    loginUser(email: String!, password: String!): String
    saveBook(userId: ID!, bookId: ID!): User
    removeBook(userId: ID!, bookId: ID!): User
  }

`;

export default typeDefs;
