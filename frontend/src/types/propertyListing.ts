export type ListingHomeType =
  | "House"
  | "Condo"
  | "Townhouse"
  | "Multi Family"
  | "Land"
  | "Apartment"
  | "Single Detach House"
  | "Semi Detached House";

export type ListingMode = "sale" | "rent";
export type ListingChannel = "standard" | "senior-home";
export type PropertyFurnishing = "Furnished" | "Unfurnished";
export type PropertyView =
  | "Beach"
  | "Rural"
  | "Mountain"
  | "Lake"
  | "Waterfall"
  | "Cities";

export type NearbyLocationType =
  | "Hospital"
  | "School"
  | "Airport"
  | "Shopping Mall"
  | "Beach"
  | "Transportation"
  | "Cities";

export type ListingSpecialCategory =
  | "Distress Property"
  | "Foreclosure"
  | "Pre-Foreclosure"
  | "Fixer Upper"
  | "Urgent Sale";

export type PropertyFaq = {
  question: string;
  answer: string;
};

export type BackendReadyValue = string | number | boolean;

export type PropertyAgent = {
  name: string;
  phone: string;
  email: string;
};

export type PropertyAddress = {
  street?: string;
  village?: string;
  soi?: string;
  tambon?: string;
  amphoe?: string;
  district?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
};

export type NearbyLocation = {
  type: NearbyLocationType;
  name: string;
  distance: string;
  sortOrder?: number;
};

export type PropertyListing = {
  id: string;
  slug?: string;
  mode: ListingMode;
  listingChannel?: ListingChannel;
  title: string;
  city: string;
  province: string;
  priceLabel: string;
  priceValue: number;
  depositAmount?: number;
  depositMonths?: number;
  beds: number;
  baths: number;
  areaSqm: number;
  homeType: ListingHomeType;
  builtYear: number;
  nearby: string[];
  nearbyLocations?: NearbyLocation[];
  amenities: string[];
  image: string;
  galleryImages: string[];
  statusLabel: string;
  description: string;
  floorCount: number;
  garageSpaces: number;
  propertyTypeLabel: string;
  propertyCondition?: string;
  agent: PropertyAgent;
  address?: PropertyAddress;
  features: string[];
  faqs?: PropertyFaq[];
  specialCategory?: ListingSpecialCategory;
  furnishing?: PropertyFurnishing;
  view?: PropertyView;
  downPaymentAmount?: string;
  mortgageTerm?: string;
  mortgageInterestRate?: string;
  estimatedMonthlyMortgage?: string;
  roomSize?: BackendReadyValue;
  buildingSize?: BackendReadyValue;
  caregiverIncluded?: BackendReadyValue;
  condition?: string;
  seniorCareService?: BackendReadyValue;
  serviceDuration?: BackendReadyValue;
  serviceDeposit?: BackendReadyValue;
  monthlyServiceFee?: BackendReadyValue;
  servicesIncluded?: string[];
  propertyFeatureItems?: string[];
  communityAmenityItems?: string[];
  seo?: { title?: string | null; metaDescription?: string | null; canonicalUrl?: string | null; indexStatus?: "index" | "noindex"; followStatus?: "follow" | "nofollow"; ogTitle?: string | null; ogDescription?: string | null; ogImage?: string | null; schemaType?: string | null };
};
