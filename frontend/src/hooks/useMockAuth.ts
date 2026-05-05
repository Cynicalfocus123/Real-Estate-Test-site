import { useEffect, useMemo, useState } from "react";

const MOCK_AUTH_SESSION_KEY = "bhfl-mock-auth-v1";
const MOCK_AUTH_CHANGE_EVENT = "bhfl:mock-auth-changed";

export type MockUser = {
  identifier: string;
  authType: "email" | "phone";
  email: string;
  displayName: string;
  avatarInitial: string;
};

type StoredMockUser = {
  identifier: string;
  authType: "email" | "phone";
  email: string;
  displayName: string;
};

export function sanitizeAuthIdentifier(value: string) {
  const cleaned = value.replace(/[<>`]/g, "").trim();
  if (cleaned.includes("@")) {
    return cleaned.toLowerCase();
  }
  return cleaned.replace(/[^\d+]/g, "");
}

export function sanitizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value);
}

export function isValidPhoneNumber(value: string) {
  const normalized = value.replace(/[^\d+]/g, "");
  const digits = normalized.replace(/\D/g, "");
  return /^\+?\d{7,15}$/.test(normalized) && digits.length >= 7 && digits.length <= 15;
}

export function isValidEmailOrPhone(value: string) {
  return isValidEmail(value) || isValidPhoneNumber(value);
}

export function getDisplayNameFromIdentifier(identifier: string) {
  const normalized = identifier.trim();
  const source = normalized.includes("@") ? normalized.split("@")[0] ?? "" : normalized;
  const compact = source.replace(/[^a-zA-Z0-9._+-]/g, "").trim();
  if (compact.length > 0) {
    return compact.slice(0, 24);
  }
  return normalized.slice(0, 24);
}

function getAvatarInitial(displayName: string) {
  const first = displayName.trim().charAt(0);
  return first ? first.toUpperCase() : "U";
}

function toMockUser(
  identifier: string,
  authType: "email" | "phone",
  displayNameOverride?: string,
): MockUser {
  const displayName = displayNameOverride && displayNameOverride.trim().length > 0
    ? displayNameOverride.trim().slice(0, 24)
    : getDisplayNameFromIdentifier(identifier);

  return {
    identifier,
    authType,
    email: authType === "email" ? identifier : "",
    displayName,
    avatarInitial: getAvatarInitial(displayName),
  };
}

export function setMockUser(identifierInput: string) {
  const identifier = sanitizeAuthIdentifier(identifierInput);
  const authType = identifier.includes("@") ? "email" : "phone";
  if (!isValidEmailOrPhone(identifier)) {
    return null;
  }

  const user = toMockUser(identifier, authType);
  const safeStored: StoredMockUser = {
    identifier: user.identifier,
    authType: user.authType,
    email: user.email,
    displayName: user.displayName,
  };
  window.sessionStorage.setItem(MOCK_AUTH_SESSION_KEY, JSON.stringify(safeStored));
  window.dispatchEvent(new CustomEvent(MOCK_AUTH_CHANGE_EVENT));
  return user;
}

export function getMockUser() {
  try {
    const raw = window.sessionStorage.getItem(MOCK_AUTH_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredMockUser;
    const identifier = sanitizeAuthIdentifier(parsed.identifier ?? parsed.email ?? "");
    const authType = parsed.authType === "phone" ? "phone" : identifier.includes("@") ? "email" : "phone";
    if (!isValidEmailOrPhone(identifier)) {
      return null;
    }
    return toMockUser(identifier, authType, parsed.displayName);
  } catch {
    return null;
  }
}

export function clearMockUser() {
  window.sessionStorage.removeItem(MOCK_AUTH_SESSION_KEY);
  window.dispatchEvent(new CustomEvent(MOCK_AUTH_CHANGE_EVENT));
}

export function useMockAuth() {
  const [mockUser, setMockUserState] = useState<MockUser | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return getMockUser();
  });

  const isSignedIn = useMemo(() => Boolean(mockUser), [mockUser]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    function syncMockUser() {
      setMockUserState(getMockUser());
    }

    window.addEventListener(MOCK_AUTH_CHANGE_EVENT, syncMockUser);
    window.addEventListener("storage", syncMockUser);

    return () => {
      window.removeEventListener(MOCK_AUTH_CHANGE_EVENT, syncMockUser);
      window.removeEventListener("storage", syncMockUser);
    };
  }, []);

  function loginWithIdentifier(identifierInput: string) {
    const user = setMockUser(identifierInput);
    if (user) {
      setMockUserState(user);
      return { ok: true as const, user };
    }
    return { ok: false as const };
  }

  function loginWithEmail(emailInput: string) {
    return loginWithIdentifier(emailInput);
  }

  function logout() {
    clearMockUser();
    setMockUserState(null);
  }

  return {
    mockUser,
    isSignedIn,
    loginWithIdentifier,
    loginWithEmail,
    logout,
  };
}
