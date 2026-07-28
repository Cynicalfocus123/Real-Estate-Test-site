import crypto from "node:crypto";
import cors from "cors";
import express, { type RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env";
import { dbPool } from "./db/pool";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { adminListingRoutes } from "./routes/adminListingRoutes";
import { adminDashboardRoutes } from "./routes/adminDashboardRoutes";
import { adminDemoRoutes } from "./routes/adminDemoRoutes";
import { adminUserRoutes } from "./routes/adminUserRoutes";
import { authRoutes } from "./routes/authRoutes";
import { listingRoutes } from "./routes/listingRoutes";
import { mapRoutes } from "./routes/mapRoutes";
import { sellerApplicationAdminRoutes, sellerApplicationPublicRoutes } from "./routes/sellerApplicationRoutes";

export type AppDependencies = { dependencyCheck?: () => Promise<boolean> };

export function createApp(dependencies: AppDependencies = {}) {
  const app = express();
  const dependencyCheck = dependencies.dependencyCheck ?? (async () => { await dbPool.query("SELECT 1"); return true; });
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use((request, response, next) => { const id = request.header("x-request-id") || crypto.randomUUID(); response.setHeader("x-request-id", id); next(); });
  app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], baseUri: ["'self'"], objectSrc: ["'none'"], frameAncestors: ["'self'"], scriptSrc: ["'self'"], imgSrc: ["'self'", "data:", "https:", "blob:"], connectSrc: ["'self'", "https://buyhomeforless.com"] } }, crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true, methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false }));
  const loginLimiter: RequestHandler = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
  const uploadLimiter: RequestHandler = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
  app.use("/uploads", express.static(env.UPLOAD_DIR_ABSOLUTE, { fallthrough: false }));
  app.get("/health", (_request, response) => response.json({ status: "ok", service: "buy-home-for-less-backend", version: "0.3.0" }));
  app.get("/ready", async (_request, response) => { try { if (!(await dependencyCheck())) throw new Error("unavailable"); response.json({ status: "ready" }); } catch { response.status(503).json({ status: "unavailable" }); } });
  app.get("/", (_request, response) => response.json({ status: "ok", service: "buy-home-for-less-backend" }));
  app.use("/admin-demo", adminDemoRoutes);
  app.use("/api/v1/auth/login", loginLimiter);
  app.use("/api/v1/admin/listings", uploadLimiter);
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/map", mapRoutes);
  app.use("/api/v1/seller-applications", sellerApplicationPublicRoutes);
  app.use("/api/v1/listings", listingRoutes);
  app.use("/api/v1/admin", adminListingRoutes);
  app.use("/api/v1/admin", adminDashboardRoutes);
  app.use("/api/v1/admin", sellerApplicationAdminRoutes);
  app.use("/api/v1/admin", adminUserRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

export const app = createApp();
