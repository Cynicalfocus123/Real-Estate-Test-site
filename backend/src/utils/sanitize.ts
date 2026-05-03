const SAFE_TEXT_REGEX = /[<>`]/g;

export function sanitizeText(value: string, maxLength: number): string {
  return value.replace(SAFE_TEXT_REGEX, "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function sanitizeNullableText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const next = sanitizeText(value, maxLength);
  return next.length > 0 ? next : null;
}

export function sanitizeStringArray(values: unknown, itemMaxLength = 120, maxItems = 60): string[] {
  if (!Array.isArray(values)) return [];

  const deduped = new Set<string>();
  for (const value of values) {
    if (typeof value !== "string") continue;
    const cleaned = sanitizeText(value, itemMaxLength);
    if (!cleaned) continue;
    deduped.add(cleaned);
    if (deduped.size >= maxItems) break;
  }

  return Array.from(deduped);
}

export function toSlug(value: string): string {
  const normalized = sanitizeText(value.toLowerCase(), 120)
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "property";
}

