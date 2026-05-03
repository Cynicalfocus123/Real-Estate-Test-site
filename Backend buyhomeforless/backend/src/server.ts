import fs from "node:fs/promises";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env";
import { ensureHeadAdmin } from "./db/bootstrap";
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

async function buildServer() {
  await fs.mkdir(env.UPLOAD_DIR_ABSOLUTE, { recursive: true });
  await dbPool.query("SELECT 1");
  await ensureHeadAdmin();

  const app = express();
  app.disable("x-powered-by");
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN,
      credentials: true,
    }),
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.use("/uploads", express.static(env.UPLOAD_DIR_ABSOLUTE, { fallthrough: false }));

  app.get("/health", (_request, response) => {
    response.json({
      ok: true,
      service: "buy-home-for-less-backend",
      version: "0.2.0",
      database: env.DB_NAME,
      now: new Date().toISOString(),
    });
  });

  app.get("/", (_request, response) => {
    response.json({
      ok: true,
      service: "buy-home-for-less-backend",
      links: {
        health: "/health",
        adminDemo: "/admin-demo",
        authRegister: "/api/auth/register",
        authLogin: "/api/auth/login",
      },
    });
  });

  app.use("/admin-demo", adminDemoRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/map", mapRoutes);
  app.use("/api/seller-applications", sellerApplicationPublicRoutes);
  app.use("/api/listings", listingRoutes);
  app.use("/api/admin", adminListingRoutes);
  app.use("/api/admin", adminDashboardRoutes);
  app.use("/api/admin", sellerApplicationAdminRoutes);
  app.use("/api/admin", adminUserRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

buildServer()
  .then((app) => {
    app.listen(env.PORT, () => {
      console.log(`Backend running on http://localhost:${env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start backend", error);
    process.exit(1);
  });
