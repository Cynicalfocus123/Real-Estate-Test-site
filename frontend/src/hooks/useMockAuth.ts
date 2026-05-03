import { useEffect, useMemo, useState } from "react";

const MOCK_AUTH_SESSION_KEY = "bhfl-mock-auth-v1";
const MOCK_AUTH_CHANGE_EVENT = "bhfl:mock-auth-changed";

export type MockUser = {
  email: string;
  displayName: string;
  avatarInitial: string;
};

type StoredMockUser = {
  email: string;
  displayName: string;
};

export function sanitizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value);
}

export function getDisplayNameFromEmail(email: string) {
  const prefix = email.split("@")[0] ?? "";
  const compact = prefix.replace(/[^a-zA-Z0-9._-]/g, "").trim();
  if (compact.length > 0) {
    return compact.slice(0, 24);
  }
  return email.slice(0, 24);
}

function getAvatarInitial(displayName: string) {
  const first = displayName.trim().charAt(0);
  return first ? first.toUpperCase() : "U";
}

function toMockUser(email: string, displayNameOverride?: string): MockUser {
  const displayName = displayNameOverride && displayNameOverride.trim().length > 0
    ? displayNameOverride.trim().slice(0, 24)
    : getDisplayNameFromEmail(email);

  return {
    email,
    displayName,
    avatarInitial: getAvatarInitial(displayName),
  };
}

export function setMockUser(emailInput: string) {
  const email = sanitizeEmail(emailInput);
  if (!isValidEmail(email)) {
    return null;
  }

  const user = toMockUser(email);
  const safeStored: StoredMockUser = {
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
    const email = sanitizeEmail(parsed.email ?? "");
    if (!isValidEmail(email)) {
      return null;
    }
    return toMockUser(email, parsed.displayName);
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

  function loginWithEmail(emailInput: string) {
    const user = setMockUser(emailInput);
    if (user) {
      setMockUserState(user);
      return { ok: true as const, user };
    }
    return { ok: false as const };
  }

  function logout() {
    clearMockUser();
    setMockUserState(null);
  }

  return {
    mockUser,
    isSignedIn,
    loginWithEmail,
    logout,
  };
}
