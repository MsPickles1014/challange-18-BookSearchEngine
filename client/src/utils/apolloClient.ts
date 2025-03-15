import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// Define the backend GraphQL API endpoint
const httpLink = createHttpLink({
  uri: "http://localhost:3001/graphql", // Change this if your backend is deployed
});

// Attach authentication token (JWT) to requests
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("id_token"); // Get token from localStorage
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Initialize Apollo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
