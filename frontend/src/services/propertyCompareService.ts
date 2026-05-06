const COMPARE_STORAGE_KEY = "buyhomeforless:compare:v1";
const SAFE_PROPERTY_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,127}$/i;
const COMPARE_LIMIT = 2;

function sanitizePropertyId(propertyId: string) {
  return propertyId.trim().replace(/[^a-zA-Z0-9-]/g, "").slice(0, 128);
}

function isSafePropertyId(propertyId: string) {
  return SAFE_PROPERTY_ID_PATTERN.test(propertyId);
}

function readCompareIds() {
  try {
    const raw = window.localStorage.getItem(COMPARE_STORAGE_KEY);
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
    ).slice(0, COMPARE_LIMIT);
  } catch {
    return [];
  }
}

function writeCompareIds(propertyIds: string[]) {
  const safeIds = Array.from(
    new Set(
      propertyIds
        .map((propertyId) => sanitizePropertyId(propertyId))
        .filter((propertyId) => isSafePropertyId(propertyId)),
    ),
  ).slice(0, COMPARE_LIMIT);
  window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(safeIds));
}

export function getComparePropertyIds(): string[] {
  return readCompareIds();
}

export function clearComparePropertyIds(): void {
  window.localStorage.removeItem(COMPARE_STORAGE_KEY);
}

export function removeComparePropertyId(propertyId: string): string[] {
  const safePropertyId = sanitizePropertyId(propertyId);
  if (!isSafePropertyId(safePropertyId)) return readCompareIds();

  const nextIds = readCompareIds().filter((id) => id !== safePropertyId);
  writeCompareIds(nextIds);
  return nextIds;
}

export function toggleComparePropertyId(propertyId: string) {
  const safePropertyId = sanitizePropertyId(propertyId);
  const currentIds = readCompareIds();
  if (!isSafePropertyId(safePropertyId)) {
    return {
      compareIds: currentIds,
      selected: false,
      limitReached: false,
    };
  }

  if (currentIds.includes(safePropertyId)) {
    const nextIds = currentIds.filter((id) => id !== safePropertyId);
    writeCompareIds(nextIds);
    return {
      compareIds: nextIds,
      selected: false,
      limitReached: false,
    };
  }

  if (currentIds.length >= COMPARE_LIMIT) {
    return {
      compareIds: currentIds,
      selected: false,
      limitReached: true,
    };
  }

  const nextIds = [...currentIds, safePropertyId];
  writeCompareIds(nextIds);
  return {
    compareIds: nextIds,
    selected: true,
    limitReached: false,
  };
}
