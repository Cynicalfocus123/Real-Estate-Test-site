import { gql } from "@apollo/client";

export const PROPERTY_CARD_FIELDS = gql`
  fragment PropertyCardFields on Property {
    id
    title
    location
    price
    beds
    baths
    areaSqFt
    imageUrl
    latitude
    longitude
    status
  }
`;

export const GET_FEATURED_PROPERTIES = gql`
  query GetFeaturedProperties($status: PropertyStatus, $limit: Int = 6) {
    featuredProperties(status: $status, limit: $limit) {
      ...PropertyCardFields
    }
  }
  ${PROPERTY_CARD_FIELDS}
`;

export const GET_PROPERTIES_BY_MAP_BOUNDS = gql`
  query GetPropertiesByMapBounds(
    $north: Float!
    $south: Float!
    $east: Float!
    $west: Float!
    $status: PropertyStatus
    $limit: Int = 100
  ) {
    propertiesByBounds(
      north: $north
      south: $south
      east: $east
      west: $west
      status: $status
      limit: $limit
    ) {
      ...PropertyCardFields
    }
  }
  ${PROPERTY_CARD_FIELDS}
`;
