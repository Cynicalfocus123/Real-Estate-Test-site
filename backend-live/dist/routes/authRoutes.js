"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const jwt_1 = require("../auth/jwt");
const auth_1 = require("../middleware/auth");
const pool_1 = require("../db/pool");
const sanitize_1 = require("../utils/sanitize");
const errors_1 = require("../utils/errors");
exports.authRoutes = (0, express_1.Router)();
exports.authRoutes.use(auth_1.optionalAuth);
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(128),
    fullName: zod_1.z.string().min(1).max(80),
    role: zod_1.z.enum(["ADMIN", "EMPLOYEE"]).optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
exports.authRoutes.get("/bootstrap-status", async (_request, response, next) => {
    try {
        const rows = await (0, pool_1.queryRows)("SELECT COUNT(*) AS count FROM users WHERE role = 'HEAD_ADMIN'");
        response.json({
            headAdminExists: (rows[0]?.count ?? 0) > 0,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.authRoutes.post("/register", async (request, response, next) => {
    try {
        const parsed = registerSchema.safeParse(request.body);
        if (!parsed.success) {
            throw new errors_1.ApiError(400, "Invalid register payload", parsed.error.flatten());
        }
        const rows = await (0, pool_1.queryRows)("SELECT COUNT(*) AS count FROM users WHERE role = 'HEAD_ADMIN'");
        const headAdminExists = rows[0]?.count > 0;
        const email = (0, sanitize_1.sanitizeEmail)(parsed.data.email);
        const fullName = (0, sanitize_1.sanitizePlainText)(parsed.data.fullName, 80);
        const requestedRole = parsed.data.role ?? "EMPLOYEE";
        if (headAdminExists) {
            if (!request.user || request.user.role !== "HEAD_ADMIN") {
                throw new errors_1.ApiError(403, "Only head admin can register new users after bootstrap");
            }
        }
        const roleToCreate = headAdminExists ? requestedRole : "HEAD_ADMIN";
        const passwordHash = await bcryptjs_1.default.hash(parsed.data.password, 12);
        await (0, pool_1.executeSql)("INSERT INTO users (email, password_hash, full_name, role, status) VALUES (?, ?, ?, ?, 'ACTIVE')", [email, passwordHash, fullName, roleToCreate]);
        const created = await (0, pool_1.queryRows)("SELECT id, email, full_name, role FROM users WHERE email = ? LIMIT 1", [email]);
        const user = created[0];
        const token = (0, jwt_1.signAuthToken)({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        response.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: user.role,
            },
            token,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.authRoutes.post("/login", async (request, response, next) => {
    try {
        const parsed = loginSchema.safeParse(request.body);
        if (!parsed.success) {
            throw new errors_1.ApiError(400, "Invalid login payload", parsed.error.flatten());
        }
        const email = (0, sanitize_1.sanitizeEmail)(parsed.data.email);
        const users = await (0, pool_1.queryRows)("SELECT id, email, full_name, role, status, password_hash FROM users WHERE email = ? LIMIT 1", [email]);
        const user = users[0];
        if (!user || user.status !== "ACTIVE") {
            throw new errors_1.ApiError(401, "Invalid email or password");
        }
        const isMatch = await bcryptjs_1.default.compare(parsed.data.password, user.password_hash);
        if (!isMatch) {
            throw new errors_1.ApiError(401, "Invalid email or password");
        }
        const token = (0, jwt_1.signAuthToken)({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        response.json({
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: user.role,
            },
            token,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.authRoutes.get("/me", auth_1.requireAuth, (request, response) => {
    response.json({ user: request.user });
});
