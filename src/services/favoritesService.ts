const FAVORITES_STORAGE_PREFIX = "buyhomeforless:favorites:";
const SAFE_USER_KEY_PATTERN = /^[a-z0-9._-]{1,64}$/;
const SAFE_PROPERTY_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,127}$/i;

function sanitizeUserKey(userKey: string) {
  return userKey.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 64);
}

function sanitizePropertyId(propertyId: string) {
  return propertyId.trim().replace(/[^a-zA-Z0-9-]/g, "").slice(0, 128);
}

function isSafeUserKey(userKey: string) {
  return SAFE_USER_KEY_PATTERN.test(userKey);
}

function isSafePropertyId(propertyId: string) {
  return SAFE_PROPERTY_ID_PATTERN.test(propertyId);
}

function getStorageKey(userKey: string) {
  const safeUserKey = sanitizeUserKey(userKey);
  if (!isSafeUserKey(safeUserKey)) {
    return null;
  }

  return `${FAVORITES_STORAGE_PREFIX}${safeUserKey}`;
}

function readFavorites(storageKey: string) {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [] as string[];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [] as string[];

    return Array.from(
      new Set(
        parsed
          .filter((item): item is string => typeof item === "string")
          .map((item) => sanitizePropertyId(item))
          .filter((item) => isSafePropertyId(item)),
      ),
    );
  } catch {
    return [];
  }
}

function writeFavorites(storageKey: string, propertyIds: string[]) {
  const safeIds = Array.from(
    new Set(
      propertyIds
        .map((propertyId) => sanitizePropertyId(propertyId))
        .filter((propertyId) => isSafePropertyId(propertyId)),
    ),
  );
  window.localStorage.setItem(storageKey, JSON.stringify(safeIds));
}

export function getFavorites(userKey: string): string[] {
  const storageKey = getStorageKey(userKey);
  if (!storageKey) return [];
  return readFavorites(storageKey);
}

export function addFavorite(userKey: string, propertyId: string): void {
  const storageKey = getStorageKey(userKey);
  const safePropertyId = sanitizePropertyId(propertyId);
  if (!storageKey || !isSafePropertyId(safePropertyId)) return;

  const current = readFavorites(storageKey);
  if (current.includes(safePropertyId)) return;
  writeFavorites(storageKey, [...current, safePropertyId]);
}

export function removeFavorite(userKey: string, propertyId: string): void {
  const storageKey = getStorageKey(userKey);
  const safePropertyId = sanitizePropertyId(propertyId);
  if (!storageKey || !isSafePropertyId(safePropertyId)) return;

  const current = readFavorites(storageKey);
  writeFavorites(
    storageKey,
    current.filter((id) => id !== safePropertyId),
  );
}

export function toggleFavorite(userKey: string, propertyId: string): boolean {
  const storageKey = getStorageKey(userKey);
  const safePropertyId = sanitizePropertyId(propertyId);
  if (!storageKey || !isSafePropertyId(safePropertyId)) return false;

  const current = readFavorites(storageKey);
  const exists = current.includes(safePropertyId);
  if (exists) {
    writeFavorites(
      storageKey,
      current.filter((id) => id !== safePropertyId),
    );
    return false;
  }

  writeFavorites(storageKey, [...current, safePropertyId]);
  return true;
}

export function isFavorite(userKey: string, propertyId: string): boolean {
  const storageKey = getStorageKey(userKey);
  const safePropertyId = sanitizePropertyId(propertyId);
  if (!storageKey || !isSafePropertyId(safePropertyId)) return false;
  return readFavorites(storageKey).includes(safePropertyId);
}
