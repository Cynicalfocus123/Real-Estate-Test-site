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

export function sanitizeStringArray(values: string[], maxItems = 50, maxItemLength = 120): string[] {
  return values
    .slice(0, maxItems)
    .map((value) => sanitizePlainText(value, maxItemLength))
    .filter(Boolean);
}
