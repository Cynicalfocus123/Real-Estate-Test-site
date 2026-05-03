export type NotificationFrequency = "realtime" | "daily" | "none";
export type MarketingPreference = "yes" | "no";

export type AccountSettings = {
  name: string;
  address: string;
  phone: string;
  email: string;
  savedListingsEmailFrequency: NotificationFrequency;
  marketingUpdates: MarketingPreference;
};

export type EditableProfileField = "name" | "address" | "phone" | "email";
