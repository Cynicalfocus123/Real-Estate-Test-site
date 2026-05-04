const SAFE_ASSET_PATH = /^[a-zA-Z0-9/_.,@-]+$/;
const SAFE_HASH_PATH = /^#[a-zA-Z0-9_-]+$/;
const LOCALHOST_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export function safeAssetPath(path: string) {
  const normalized = path.replace(/^\/+/, "");

  if (
    normalized.includes("..") ||
    normalized.includes("\\") ||
    normalized.includes("//") ||
    !SAFE_ASSET_PATH.test(normalized)
  ) {
    throw new Error("Unsafe asset path");
  }

  return normalized;
}

export function safeHref(href: string) {
  if (href.startsWith(import.meta.env.BASE_URL) || SAFE_HASH_PATH.test(href)) {
    return href;
  }

  return import.meta.env.BASE_URL;
}

export function safeTelHref(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, "");
  const hasPlusPrefix = normalized.startsWith("+");
  const digitsOnly = normalized.replace(/\D/g, "");
  const isValidLength = digitsOnly.length >= 7 && digitsOnly.length <= 15;
  const isValidFormat = hasPlusPrefix
    ? /^\+\d{7,15}$/.test(normalized)
    : /^\d{7,15}$/.test(normalized);

  if (!isValidLength || !isValidFormat) {
    return "#";
  }

  return `tel:${normalized}`;
}

export function safeMailtoHref(email: string) {
  const normalized = email.trim().toLowerCase();
  const isValidEmail = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(normalized);

  if (!isValidEmail) {
    return "#";
  }

  return `mailto:${normalized}`;
}

export function safeGraphqlEndpoint(endpoint: string | undefined) {
  const fallback = "http://localhost:5000/graphql";

  if (!endpoint) return fallback;

  try {
    const url = new URL(endpoint);
    const isLocalHttp = url.protocol === "http:" && LOCALHOST_HOSTS.has(url.hostname);
    const isHttps = url.protocol === "https:";

    return isLocalHttp || isHttps ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

export function cleanSearchText(value: FormDataEntryValue | null, maxLength = 80) {
  if (typeof value !== "string") return "";

  return value.replace(/[<>`]/g, "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function cleanNumericText(value: FormDataEntryValue | null, maxLength = 12) {
  if (typeof value !== "string") return "";

  return value.replace(/[^\d]/g, "").slice(0, maxLength);
}
