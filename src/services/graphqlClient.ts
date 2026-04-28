import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

export const GRAPHQL_ENDPOINT =
  import.meta.env.VITE_GRAPHQL_ENDPOINT ?? "http://localhost:4000/graphql";

export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: GRAPHQL_ENDPOINT,
  }),
  cache: new InMemoryCache(),
});
