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

export type PropertyAgent = {
  name: string;
  phone: string;
  email: string;
};

export type PropertyListing = {
  id: string;
  mode: ListingMode;
  title: string;
  city: string;
  province: string;
  priceLabel: string;
  priceValue: number;
  beds: number;
  baths: number;
  areaSqm: number;
  homeType: ListingHomeType;
  builtYear: number;
  nearby: string[];
  amenities: string[];
  image: string;
  galleryImages: string[];
  statusLabel: string;
  description: string;
  floorCount: number;
  garageSpaces: number;
  propertyTypeLabel: string;
  agent: PropertyAgent;
  faqs?: PropertyFaq[];
  specialCategory?: ListingSpecialCategory;
};
