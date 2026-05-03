export const typeDefs = /* GraphQL */ `
  enum UserRole {
    USER
    ADMIN
  }

  enum ListingType {
    BUY
    RENT
    SENIOR_HOME
  }

  enum SaleCategory {
    NORMAL
    DISTRESS
    FORECLOSURE
    PRE_FORECLOSURE
    FIXER_UPPER
    URGENT_SALE
  }

  enum PropertyStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
  }

  enum SavedListingsEmailFrequency {
    REALTIME
    DAILY
    NONE
  }

  enum PropertySort {
    RECOMMENDED
    NEWEST
    PRICE_LOW
    PRICE_HIGH
    SIZE_HIGH
    SIZE_LOW
  }

  type User {
    id: ID!
    email: String!
    displayName: String
    phone: String
    address: String
    role: UserRole!
    emailVerified: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type AccountSettings {
    id: ID!
    email: String!
    displayName: String
    phone: String
    address: String
    emailVerified: Boolean!
    savedListingsEmailFrequency: SavedListingsEmailFrequency!
    marketingUpdates: Boolean!
  }

  type PropertyImage {
    id: ID!
    propertyId: ID!
    url: String!
    thumbnailUrl: String!
    cardUrl: String!
    galleryUrl: String!
    heroUrl: String!
    altText: String
    width: Int!
    height: Int!
    sortOrder: Int!
    isCover: Boolean!
    createdAt: String!
  }

  type PropertyFAQ {
    id: ID!
    propertyId: ID!
    question: String!
    answer: String!
    sortOrder: Int!
  }

  type Property {
    id: ID!
    slug: String!
    title: String!
    listingType: ListingType!
    saleCategory: SaleCategory!
    propertyType: String!
    status: PropertyStatus!
    price: Int
    rentPrice: Int
    depositAmount: Int
    depositText: String
    bedrooms: Int!
    bathrooms: Int!
    sqm: Float!
    landSize: Float
    builtYear: Int
    province: String!
    city: String!
    district: String
    subdistrict: String
    streetAddress: String
    postalCode: String
    country: String!
    latitude: Float
    longitude: Float
    description: String!
    features: [String!]!
    amenities: [String!]!
    location: String!
    priceLabel: String!
    coverImageUrl: String
    images: [PropertyImage!]!
    faqs: [PropertyFAQ!]!
    createdAt: String!
    updatedAt: String!
  }

  type PropertySummary {
    id: ID!
    slug: String!
    title: String!
    listingType: ListingType!
    city: String!
    province: String!
    location: String!
    price: Int
    rentPrice: Int
    bedrooms: Int!
    bathrooms: Int!
    sqm: Float!
    imageUrl: String
  }

  type PropertyConnection {
    items: [Property!]!
    total: Int!
    page: Int!
    pageSize: Int!
    hasNextPage: Boolean!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type FavoriteToggleResult {
    saved: Boolean!
    favoriteId: ID
  }

  input PaginationInput {
    page: Int = 1
    pageSize: Int = 12
  }

  input PropertyFiltersInput {
    listingType: ListingType
    province: String
    cityOrQuery: String
    minPrice: Int
    maxPrice: Int
    bedrooms: Int
    bathrooms: Int
    propertyType: String
    amenities: [String!]
    saleCategory: SaleCategory
    minLandSize: Float
    maxLandSize: Float
  }

  input RegisterInput {
    email: String!
    password: String!
    displayName: String
    phone: String
    address: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  input UpdateAccountSettingsInput {
    displayName: String
    phone: String
    address: String
    savedListingsEmailFrequency: SavedListingsEmailFrequency
    marketingUpdates: Boolean
  }

  input PropertyInput {
    slug: String
    title: String!
    listingType: ListingType!
    saleCategory: SaleCategory = NORMAL
    propertyType: String!
    status: PropertyStatus = DRAFT
    price: Int
    rentPrice: Int
    depositAmount: Int
    depositText: String
    bedrooms: Int!
    bathrooms: Int!
    sqm: Float!
    landSize: Float
    builtYear: Int
    province: String!
    city: String!
    district: String
    subdistrict: String
    streetAddress: String
    postalCode: String
    country: String
    latitude: Float
    longitude: Float
    description: String!
    features: [String!]
    amenities: [String!]
  }

  input PropertyPatchInput {
    slug: String
    title: String
    listingType: ListingType
    saleCategory: SaleCategory
    propertyType: String
    status: PropertyStatus
    price: Int
    rentPrice: Int
    depositAmount: Int
    depositText: String
    bedrooms: Int
    bathrooms: Int
    sqm: Float
    landSize: Float
    builtYear: Int
    province: String
    city: String
    district: String
    subdistrict: String
    streetAddress: String
    postalCode: String
    country: String
    latitude: Float
    longitude: Float
    description: String
    features: [String!]
    amenities: [String!]
  }

  input UploadImageInput {
    filename: String!
    mimeType: String!
    base64Data: String!
    altText: String
    isCover: Boolean
  }

  input PropertyFAQInput {
    question: String!
    answer: String!
    sortOrder: Int
  }

  type Query {
    properties(filters: PropertyFiltersInput, sort: PropertySort = RECOMMENDED, pagination: PaginationInput): PropertyConnection!
    property(id: ID, slug: String): Property
    featuredProperties(listingType: ListingType, limit: Int = 6): [Property!]!
    similarProperties(propertyId: ID!, limit: Int = 6): [Property!]!

    currentUser: User
    myFavorites: [PropertySummary!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    updateAccountSettings(input: UpdateAccountSettingsInput!): AccountSettings!
    changeEmail(newEmail: String!): AccountSettings!
    verifyEmail: AccountSettings!
    changePassword(input: ChangePasswordInput!): Boolean!
    resetPassword(email: String!): String!

    saveProperty(propertyId: ID!): FavoriteToggleResult!
    unsaveProperty(propertyId: ID!): FavoriteToggleResult!
    toggleFavorite(propertyId: ID!): FavoriteToggleResult!

    createProperty(input: PropertyInput!): Property!
    updateProperty(propertyId: ID!, input: PropertyPatchInput!): Property!
    archiveProperty(propertyId: ID!): Property!
    deleteProperty(propertyId: ID!): Boolean!
    uploadPropertyImages(propertyId: ID!, files: [UploadImageInput!]!): [PropertyImage!]!
    removePropertyImage(propertyId: ID!, imageId: ID!): Boolean!
    reorderPropertyImages(propertyId: ID!, orderedImageIds: [ID!]!): [PropertyImage!]!
    setCoverImage(propertyId: ID!, imageId: ID!): Boolean!
    updatePropertyFeatures(propertyId: ID!, features: [String!]!): Property!
    updatePropertyAmenities(propertyId: ID!, amenities: [String!]!): Property!
    updatePropertyFAQs(propertyId: ID!, faqs: [PropertyFAQInput!]!): Property!
  }
`;

