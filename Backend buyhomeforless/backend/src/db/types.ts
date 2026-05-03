export type AdminRole = "HEAD_ADMIN" | "ADMIN" | "EMPLOYEE";
export type UserStatus = "ACTIVE" | "DISABLED";
export type ListingStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "DELETED";
export type ListingSection = "BUY" | "RENT" | "SENIOR_HOME" | "SELL";
export type ListingCategory =
  | "FORECLOSURE"
  | "PRE_FORECLOSURE"
  | "DISTRESS_PROPERTY"
  | "FIXER_UPPER"
  | "URGENT_SALE"
  | "FEATURED"
  | "NEW_LISTING";

export type SellerApplicationStatus =
  | "NEW"
  | "CONTACTED"
  | "IN_REVIEW"
  | "CLOSED"
  | "SPAM_REJECTED";
