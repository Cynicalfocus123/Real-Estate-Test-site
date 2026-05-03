import { gql } from "@apollo/client";

// Backend foundation helpers (kept optional so mock fallback remains active).
export const BACKEND_PROPERTY_SUMMARY_FIELDS = gql`
  fragment BackendPropertySummaryFields on PropertySummary {
    id
    slug
    title
    listingType
    city
    province
    location
    price
    rentPrice
    bedrooms
    bathrooms
    sqm
    imageUrl
  }
`;

export const BACKEND_PROPERTIES_QUERY = gql`
  query BackendProperties(
    $filters: PropertyFiltersInput
    $sort: PropertySort
    $pagination: PaginationInput
  ) {
    properties(filters: $filters, sort: $sort, pagination: $pagination) {
      total
      page
      pageSize
      hasNextPage
      items {
        id
        slug
        title
        listingType
        saleCategory
        propertyType
        status
        price
        rentPrice
        depositAmount
        depositText
        bedrooms
        bathrooms
        sqm
        landSize
        builtYear
        province
        city
        district
        subdistrict
        streetAddress
        postalCode
        country
        latitude
        longitude
        description
        features
        amenities
        location
        priceLabel
        coverImageUrl
      }
    }
  }
`;

export const BACKEND_MY_FAVORITES_QUERY = gql`
  query BackendMyFavorites {
    myFavorites {
      ...BackendPropertySummaryFields
    }
  }
  ${BACKEND_PROPERTY_SUMMARY_FIELDS}
`;

