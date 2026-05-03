export type PropertyStatus = "buy" | "rent" | "sell";

export type Property = {
  id: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  areaSqFt: number;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  status: PropertyStatus;
};
