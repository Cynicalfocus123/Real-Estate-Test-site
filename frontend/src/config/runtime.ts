const canonicalOrigin = "https://buyhomeforless.com";
const canonicalApi = `${canonicalOrigin}/api/v1`;
const canonicalMedia = `${canonicalOrigin}/uploads`;

function requiredUrl(name: string, value: unknown, expectedOrigin?: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${name} is required`);
  let parsed: URL;
  try { parsed = new URL(value); } catch { throw new Error(`${name} must be a valid URL`); }
  if (parsed.protocol !== "https:") throw new Error(`${name} must use HTTPS`);
  if (parsed.username || parsed.password || parsed.port) throw new Error(`${name} contains unsafe URL components`);
  if (expectedOrigin && parsed.origin !== expectedOrigin) throw new Error(`${name} must use the approved production origin`);
  return value.replace(/\/+$/, "");
}

export const siteOrigin = requiredUrl("VITE_PUBLIC_SITE_URL", import.meta.env.VITE_PUBLIC_SITE_URL ?? canonicalOrigin, canonicalOrigin);
export const apiBaseUrl = requiredUrl("VITE_API_BASE_URL", import.meta.env.VITE_API_BASE_URL ?? canonicalApi, canonicalOrigin);
export const mediaBaseUrl = requiredUrl("VITE_PUBLIC_UPLOAD_BASE_URL", import.meta.env.VITE_PUBLIC_UPLOAD_BASE_URL ?? canonicalMedia, canonicalOrigin);
export const applicationBaseUrl = requiredUrl("VITE_PUBLIC_BASE_URL", import.meta.env.VITE_PUBLIC_BASE_URL ?? `${canonicalOrigin}/`, canonicalOrigin) + "/";

if (apiBaseUrl !== canonicalApi || mediaBaseUrl !== canonicalMedia) throw new Error("Frontend production URLs do not match the approved contract");

export const runtime = { siteOrigin, apiBaseUrl, mediaBaseUrl, applicationBaseUrl } as const;
