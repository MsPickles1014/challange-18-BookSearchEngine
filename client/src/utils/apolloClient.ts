import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// ✅ Use the correct GraphQL API endpoint
const httpLink = createHttpLink({
  uri: "https://challange-18-BookSearchEngine-server-and.onrender.com/graphql", // ✅ Ensure `/graphql` is included
  credentials: "include", // ✅ Ensure cookies & auth headers are sent
});

// ✅ Attach authentication token (JWT) to requests
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("id_token"); // Get token from localStorage
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// ✅ Initialize Apollo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
