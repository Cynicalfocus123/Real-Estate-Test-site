const CONTROL_CHARS_REGEX = /[\u0000-\u001f\u007f]/g;

export function sanitizePlainText(value: string, maxLength = 500): string {
  return value.replace(CONTROL_CHARS_REGEX, "").trim().slice(0, maxLength);
}

export function sanitizeEmail(value: string): string {
  return sanitizePlainText(value, 320).toLowerCase();
}

export function sanitizeSlug(value: string): string {
  const cleaned = sanitizePlainText(value, 120).toLowerCase();
  return cleaned
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function sanitizeHttpUrl(value: string, maxLength = 500): string | null {
  const cleaned = sanitizePlainText(value, maxLength);
  if (!cleaned) {
    return null;
  }
  try {
    const url = new URL(cleaned);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString().slice(0, maxLength) : null;
  } catch (_error) {
    return null;
  }
}

export function sanitizeImageReference(value: string, maxLength = 500): string | null {
  const cleaned = sanitizePlainText(value, maxLength);
  if (!cleaned) {
    return null;
  }
  if (cleaned.startsWith("/uploads/")) {
    return cleaned.slice(0, maxLength);
  }
  return sanitizeHttpUrl(cleaned, maxLength);
}

export function sanitizeStringArray(values: string[], maxItems = 50, maxItemLength = 120): string[] {
  return values
    .slice(0, maxItems)
    .map((value) => sanitizePlainText(value, maxItemLength))
    .filter(Boolean);
}
