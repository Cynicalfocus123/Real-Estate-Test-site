export type ListingHomeType =
  | "House"
  | "Condo"
  | "Townhouse"
  | "Multi Family"
  | "Land"
  | "Apartment"
  | "Single Detach House"
  | "Semi Detached House";

export type PropertyListing = {
  id: string;
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
  statusLabel: string;
};
