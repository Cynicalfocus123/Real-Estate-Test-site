import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(24),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_ORIGIN: z.string().url(),
  UPLOAD_DIR: z.string().min(1).default("./uploads"),
  PUBLIC_UPLOAD_BASE_URL: z.string().url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
  throw new Error(`Invalid backend env configuration: ${issues}`);
}

const rawEnv = parsed.data;

export const env = {
  ...rawEnv,
  UPLOAD_DIR: path.resolve(process.cwd(), rawEnv.UPLOAD_DIR),
};

