import { isValidEmail, sanitizeEmail } from "../hooks/useMockAuth";
import {
  type AccountSettings,
  type EditableProfileField,
  type MarketingPreference,
  type NotificationFrequency,
} from "../types/accountSettings";

const ACCOUNT_SETTINGS_STORAGE_PREFIX = "buyhomeforless:account-settings:";

const DEFAULT_NOTIFICATION_FREQUENCY: NotificationFrequency = "realtime";
const DEFAULT_MARKETING_PREFERENCE: MarketingPreference = "yes";

function sanitizePlainText(value: string, maxLength: number) {
  return value.replace(/[<>`]/g, "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function sanitizeName(value: string) {
  return sanitizePlainText(value, 80);
}

export function sanitizeAddress(value: string) {
  return sanitizePlainText(value, 200);
}

export function sanitizePhone(value: string) {
  return sanitizePlainText(value, 30);
}

export function sanitizeSettingsEmail(value: string) {
  return sanitizeEmail(sanitizePlainText(value, 120));
}

export function isValidPhoneNumber(value: string) {
  if (!value) return false;
  const normalized = value.replace(/[^\d+]/g, "");
  const digits = normalized.replace(/\D/g, "");
  const matchesPattern = /^\+?\d{7,15}$/.test(normalized);
  return matchesPattern && digits.length >= 7 && digits.length <= 15;
}

export function toSafeUserKey(email: string) {
  const safeEmail = sanitizeSettingsEmail(email);
  if (!isValidEmail(safeEmail)) {
    return "";
  }
  return encodeURIComponent(safeEmail);
}

function getStorageKey(userKey: string) {
  return `${ACCOUNT_SETTINGS_STORAGE_PREFIX}${userKey}`;
}

function createDefaultSettings(email = ""): AccountSettings {
  const sanitizedEmail = sanitizeSettingsEmail(email);
  return {
    name: "",
    address: "",
    phone: "",
    email: isValidEmail(sanitizedEmail) ? sanitizedEmail : "",
    savedListingsEmailFrequency: DEFAULT_NOTIFICATION_FREQUENCY,
    marketingUpdates: DEFAULT_MARKETING_PREFERENCE,
  };
}

function sanitizeNotificationFrequency(value: unknown): NotificationFrequency {
  return value === "daily" || value === "none" ? value : "realtime";
}

function sanitizeMarketingPreference(value: unknown): MarketingPreference {
  return value === "no" ? "no" : "yes";
}

function sanitizeAccountSettings(input: Partial<AccountSettings>, fallbackEmail = ""): AccountSettings {
  const fallback = createDefaultSettings(fallbackEmail);
  const sanitizedEmail = sanitizeSettingsEmail(input.email ?? fallback.email);

  return {
    name: sanitizeName(input.name ?? fallback.name),
    address: sanitizeAddress(input.address ?? fallback.address),
    phone: sanitizePhone(input.phone ?? fallback.phone),
    email: isValidEmail(sanitizedEmail) ? sanitizedEmail : fallback.email,
    savedListingsEmailFrequency: sanitizeNotificationFrequency(input.savedListingsEmailFrequency),
    marketingUpdates: sanitizeMarketingPreference(input.marketingUpdates),
  };
}

export function getAccountSettings(userKey: string, fallbackEmail = "") {
  if (!userKey) {
    return createDefaultSettings(fallbackEmail);
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(userKey));
    if (!raw) {
      return createDefaultSettings(fallbackEmail);
    }

    const parsed = JSON.parse(raw) as Partial<AccountSettings>;
    return sanitizeAccountSettings(parsed, fallbackEmail);
  } catch {
    return createDefaultSettings(fallbackEmail);
  }
}

export function saveAccountSettings(userKey: string, settings: Partial<AccountSettings>, fallbackEmail = "") {
  if (!userKey) {
    return createDefaultSettings(fallbackEmail);
  }

  const normalized = sanitizeAccountSettings(settings, fallbackEmail);
  window.localStorage.setItem(getStorageKey(userKey), JSON.stringify(normalized));
  return normalized;
}

export function updateProfileField(
  userKey: string,
  field: EditableProfileField,
  value: string,
  fallbackEmail = "",
) {
  const current = getAccountSettings(userKey, fallbackEmail);
  const next = {
    ...current,
    [field]:
      field === "name"
        ? sanitizeName(value)
        : field === "address"
          ? sanitizeAddress(value)
          : field === "phone"
            ? sanitizePhone(value)
            : sanitizeSettingsEmail(value),
  } satisfies AccountSettings;

  return saveAccountSettings(userKey, next, fallbackEmail);
}

export function updateNotificationSettings(
  userKey: string,
  preferences: Pick<AccountSettings, "savedListingsEmailFrequency" | "marketingUpdates">,
  fallbackEmail = "",
) {
  const current = getAccountSettings(userKey, fallbackEmail);
  const next: AccountSettings = {
    ...current,
    savedListingsEmailFrequency: sanitizeNotificationFrequency(preferences.savedListingsEmailFrequency),
    marketingUpdates: sanitizeMarketingPreference(preferences.marketingUpdates),
  };
  return saveAccountSettings(userKey, next, fallbackEmail);
}

export function mockVerifyEmail(_userKey: string) {
  // TODO(back-end): connect verifyEmail GraphQL mutation.
  return "Email verification will be connected to backend authentication later.";
}

export function mockChangeEmail(userKey: string, newEmail: string, fallbackEmail = "") {
  // TODO(back-end): connect changeEmail GraphQL mutation.
  const sanitizedEmail = sanitizeSettingsEmail(newEmail);
  if (!isValidEmail(sanitizedEmail)) {
    return { ok: false as const, error: "Please enter a valid email address." };
  }

  const current = getAccountSettings(userKey, fallbackEmail);
  const nextUserKey = toSafeUserKey(sanitizedEmail);
  const merged: AccountSettings = {
    ...current,
    email: sanitizedEmail,
  };

  if (!nextUserKey) {
    return { ok: false as const, error: "Unable to update email." };
  }

  saveAccountSettings(nextUserKey, merged, sanitizedEmail);
  if (nextUserKey !== userKey && userKey) {
    window.localStorage.removeItem(getStorageKey(userKey));
  }

  return { ok: true as const, userKey: nextUserKey, settings: merged };
}

export function mockChangePassword() {
  // TODO(back-end): connect changePassword GraphQL mutation.
  return "Password change flow is ready for backend connection.";
}

export function mockResetPassword(email: string) {
  // TODO(back-end): connect resetPassword GraphQL mutation.
  const sanitizedEmail = sanitizeSettingsEmail(email);
  if (!isValidEmail(sanitizedEmail)) {
    return "Password reset email flow will be connected to backend authentication later.";
  }
  return "Password reset email flow will be connected to backend authentication later.";
}

export function mockUpdateNotificationPreferences(
  userKey: string,
  preferences: Pick<AccountSettings, "savedListingsEmailFrequency" | "marketingUpdates">,
  fallbackEmail = "",
) {
  // TODO(back-end): connect updateNotificationPreferences GraphQL mutation.
  return updateNotificationSettings(userKey, preferences, fallbackEmail);
}
