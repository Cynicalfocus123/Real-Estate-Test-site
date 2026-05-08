export type NotificationFrequency = "realtime" | "daily" | "none";
export type MarketingPreference = "yes" | "no";

export type AccountSettings = {
  name: string;
  lastName: string;
  address: string;
  subdistrict: string;
  district: string;
  province: string;
  zipCode: string;
  phone: string;
  email: string;
  savedListingsEmailFrequency: NotificationFrequency;
  marketingUpdates: MarketingPreference;
};

export type EditableProfileField =
  | "name"
  | "lastName"
  | "address"
  | "subdistrict"
  | "district"
  | "province"
  | "zipCode"
  | "phone"
  | "email";
