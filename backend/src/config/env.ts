import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const canonicalOrigin = "https://buyhomeforless.com";
const canonicalApi = `${canonicalOrigin}/api/v1`;
const canonicalUploads = `${canonicalOrigin}/uploads`;
const forbiddenValuePattern = new RegExp([["your", "_"].join(""), ["change", "-me"].join(""), ["local", "host"].join(""), ["127", "\\.", "0", "\\.", "0", "\\.", "1"].join("")].join("|"), "i");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  PUBLIC_SITE_ORIGIN: z.string().url().default(canonicalOrigin),
  FRONTEND_ORIGIN: z.string().url().default(canonicalOrigin),
  PUBLIC_API_BASE_URL: z.string().url().default(canonicalApi),
  PUBLIC_UPLOAD_BASE_URL: z.string().url().default(canonicalUploads),
  DB_HOST: z.string().min(1).default("db"),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  DB_USER: z.string().min(1).default("root"),
  DB_PASSWORD: z.string().default(""),
  DB_NAME: z.string().min(1).default("buyhomeforless"),
  DB_CONNECT_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(60_000).default(10_000),
  DB_QUERY_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(120_000).default(20_000),
  UPLOAD_DIR: z.string().min(1).default("uploads"),
  OSMAND_SEARCH_URL: z.string().url().default("https://nominatim.openstreetmap.org/search"),
  OSMAND_LANGUAGE: z.string().min(1).default("en,th"),
  OSMAND_COUNTRY_CODE: z.string().min(2).max(10).default("th"),
  OSMAND_EMAIL: z.string().email().optional(),
  GEOCODER_USER_AGENT: z.string().min(4).default("buy-home-for-less-backend/1.0"),
  OUTBOUND_REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(60_000).default(8_000),
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65_535).default(587),
  SMTP_SECURE: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASSWORD: z.string().min(1).optional(),
  SMTP_FROM: z.string().email().optional(),
  ADMIN_NOTIFICATION_EMAIL: z.string().email().optional(),
});

function validateProduction(data: z.infer<typeof envSchema>) {
  const errors: string[] = [];
  if (data.PUBLIC_SITE_ORIGIN !== canonicalOrigin || data.FRONTEND_ORIGIN !== canonicalOrigin) errors.push("PUBLIC_SITE_ORIGIN and FRONTEND_ORIGIN must be https://buyhomeforless.com");
  if (data.PUBLIC_API_BASE_URL !== canonicalApi) errors.push("PUBLIC_API_BASE_URL must be https://buyhomeforless.com/api/v1");
  if (data.PUBLIC_UPLOAD_BASE_URL !== canonicalUploads) errors.push("PUBLIC_UPLOAD_BASE_URL must be https://buyhomeforless.com/uploads");
  for (const [name, value] of [["PUBLIC_SITE_ORIGIN", data.PUBLIC_SITE_ORIGIN], ["FRONTEND_ORIGIN", data.FRONTEND_ORIGIN], ["PUBLIC_API_BASE_URL", data.PUBLIC_API_BASE_URL], ["PUBLIC_UPLOAD_BASE_URL", data.PUBLIC_UPLOAD_BASE_URL]] as const) {
    if (!value.startsWith("https://")) errors.push(`${name} must use HTTPS`);
    if (/[{}<>]/.test(value) || forbiddenValuePattern.test(value)) errors.push(`${name} contains a placeholder or development host`);
  }
  for (const name of ["DB_HOST", "DB_USER", "DB_NAME"]) if (!data[name as "DB_HOST" | "DB_USER" | "DB_NAME"].trim()) errors.push(`${name} is required in production`);
  if (errors.length) throw new Error(`Invalid production environment: ${errors.join("; ")}`);
}

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) throw new Error(`Invalid environment: ${parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`);
if (parsed.data.NODE_ENV === "production") {
  const required = ["PUBLIC_SITE_ORIGIN", "FRONTEND_ORIGIN", "PUBLIC_API_BASE_URL", "PUBLIC_UPLOAD_BASE_URL", "DB_HOST", "DB_USER", "DB_NAME"];
  const missing = required.filter((name) => !process.env[name]?.trim());
  if (missing.length) throw new Error(`Invalid production environment: missing ${missing.join(", ")}`);
}
if (parsed.data.NODE_ENV === "production") validateProduction(parsed.data);

const envData = parsed.data;
export const env = { ...envData, UPLOAD_DIR_ABSOLUTE: path.resolve(process.cwd(), envData.UPLOAD_DIR) } as const;
export { canonicalOrigin, canonicalApi, canonicalUploads };
