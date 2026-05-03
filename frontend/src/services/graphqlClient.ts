import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { safeGraphqlEndpoint } from "../utils/security";

export const GRAPHQL_ENDPOINT = safeGraphqlEndpoint(import.meta.env.VITE_GRAPHQL_ENDPOINT);

export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: GRAPHQL_ENDPOINT,
  }),
  cache: new InMemoryCache(),
});
