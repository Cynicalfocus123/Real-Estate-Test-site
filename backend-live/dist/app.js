"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
exports.createApp = createApp;
const node_crypto_1 = __importDefault(require("node:crypto"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env");
const pool_1 = require("./db/pool");
const errorHandler_1 = require("./middleware/errorHandler");
const adminPropertyRoutes_1 = require("./routes/adminPropertyRoutes");
const adminDashboardRoutes_1 = require("./routes/adminDashboardRoutes");
const adminUserRoutes_1 = require("./routes/adminUserRoutes");
const adminAuthRoutes_1 = require("./routes/adminAuthRoutes");
const customerAuthRoutes_1 = require("./routes/customerAuthRoutes");
const publicPropertyRoutes_1 = require("./routes/publicPropertyRoutes");
const mapRoutes_1 = require("./routes/mapRoutes");
const sellerApplicationRoutes_1 = require("./routes/sellerApplicationRoutes");
function createApp(dependencies = {}) {
    const app = (0, express_1.default)();
    const dependencyCheck = dependencies.dependencyCheck ?? (async () => { await pool_1.dbPool.query("SELECT 1"); return true; });
    app.disable("x-powered-by");
    app.set("trust proxy", 1);
    app.use((request, response, next) => { const id = request.header("x-request-id") || node_crypto_1.default.randomUUID(); response.setHeader("x-request-id", id); next(); });
    app.use((0, helmet_1.default)({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], baseUri: ["'self'"], objectSrc: ["'none'"], frameAncestors: ["'self'"], scriptSrc: ["'self'"], imgSrc: ["'self'", "data:", "https:", "blob:"], connectSrc: ["'self'", "https://www.buyhomeforless.com", "https://buyhomeforless.com"] } }, crossOriginResourcePolicy: { policy: "cross-origin" } }));
    app.use((0, cors_1.default)({ origin: (origin, callback) => callback(null, !origin || env_1.frontendOrigins.has(origin) ? origin ?? false : false), credentials: true, methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] }));
    app.use(express_1.default.json({ limit: "1mb" }));
    app.use(express_1.default.urlencoded({ extended: false, limit: "1mb" }));
    app.use((0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false }));
    const customerRegistrationLimiter = (0, express_rate_limit_1.default)({ windowMs: 60 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });
    const customerLoginLimiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 12, standardHeaders: true, legacyHeaders: false });
    const adminLoginLimiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });
    const bootstrapLimiter = (0, express_rate_limit_1.default)({ windowMs: 60 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });
    const recoveryLimiter = (0, express_rate_limit_1.default)({ windowMs: 60 * 60 * 1000, max: 8, standardHeaders: true, legacyHeaders: false });
    const uploadLimiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
    app.use("/uploads", express_1.default.static(env_1.env.UPLOAD_DIR_ABSOLUTE, { fallthrough: false }));
    app.get("/health", (_request, response) => response.json({ status: "ok", service: "buy-home-for-less-backend", version: "0.3.0" }));
    app.get("/ready", async (_request, response) => { try {
        if (!(await dependencyCheck()))
            throw new Error("unavailable");
        response.json({ status: "ready" });
    }
    catch {
        response.status(503).json({ status: "unavailable" });
    } });
    app.get("/", (_request, response) => response.json({ status: "ok", service: "buy-home-for-less-backend" }));
    app.use("/api/v1/customer-auth/register", customerRegistrationLimiter);
    app.use("/api/v1/customer-auth/login", customerLoginLimiter);
    app.use("/api/v1/admin-auth/login", adminLoginLimiter);
    app.use("/api/v1/admin-auth/bootstrap", bootstrapLimiter);
    app.use("/api/v1/customer-auth/resend-verification", recoveryLimiter);
    app.use("/api/v1/customer-auth/forgot-password", recoveryLimiter);
    app.use("/api/v1/customer-auth/reset-password", recoveryLimiter);
    app.use("/api/v1/admin/properties", uploadLimiter);
    app.use("/api/v1/customer-auth", customerAuthRoutes_1.customerAuthRoutes);
    app.use("/api/v1/customer", customerAuthRoutes_1.customerRoutes);
    app.use("/api/v1/admin-auth", adminAuthRoutes_1.adminAuthRoutes);
    app.use("/api/v1/map", mapRoutes_1.mapRoutes);
    app.use("/api/v1/seller-applications", sellerApplicationRoutes_1.sellerApplicationPublicRoutes);
    app.use("/api/v1", publicPropertyRoutes_1.publicPropertyRoutes);
    app.use("/api/v1/admin", adminPropertyRoutes_1.adminPropertyRoutes);
    app.use("/api/v1/admin", adminDashboardRoutes_1.adminDashboardRoutes);
    app.use("/api/v1/admin", sellerApplicationRoutes_1.sellerApplicationAdminRoutes);
    app.use("/api/v1/admin", adminUserRoutes_1.adminUserRoutes);
    app.use(errorHandler_1.notFoundHandler);
    app.use(errorHandler_1.errorHandler);
    return app;
}
exports.app = createApp();
