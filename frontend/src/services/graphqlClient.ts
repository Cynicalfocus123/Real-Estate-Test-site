import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { apiBaseUrl } from "../config/runtime";

export const GRAPHQL_ENDPOINT = `${apiBaseUrl}/graphql`;

export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: GRAPHQL_ENDPOINT,
  }),
  cache: new InMemoryCache(),
});
