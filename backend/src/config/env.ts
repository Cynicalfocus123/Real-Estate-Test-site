import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:5173"),
  DB_HOST: z.string().min(1).default("127.0.0.1"),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  DB_USER: z.string().min(1).default("root"),
  DB_PASSWORD: z.string().default(""),
  DB_NAME: z.string().min(1).default("buyhomeforless"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters").default("dev-only-change-this-secret-123456"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  HEAD_ADMIN_EMAIL: z.string().email().optional(),
  HEAD_ADMIN_PASSWORD: z.string().min(8).optional(),
  HEAD_ADMIN_NAME: z.string().min(1).max(80).optional(),
  UPLOAD_DIR: z.string().min(1).default("uploads"),
  PUBLIC_UPLOAD_BASE_URL: z.string().url().default("http://localhost:5000/uploads"),
  OSMAND_SEARCH_URL: z.string().url().default("https://nominatim.openstreetmap.org/search"),
  OSMAND_LANGUAGE: z.string().min(1).default("en,th"),
  OSMAND_COUNTRY_CODE: z.string().min(2).max(10).default("th"),
  OSMAND_EMAIL: z.string().email().optional(),
  GEOCODER_USER_AGENT: z.string().min(4).default("buy-home-for-less-admin-demo/1.0"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  throw new Error(`Invalid environment:\n${issues.join("\n")}`);
}

const envData = parsed.data;

export const env = {
  ...envData,
  UPLOAD_DIR_ABSOLUTE: path.resolve(process.cwd(), envData.UPLOAD_DIR),
} as const;
