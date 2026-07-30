"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthRoutes = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_1 = require("express");
const zod_1 = require("zod");
const sessions_1 = require("../auth/sessions");
const pool_1 = require("../db/pool");
const auth_1 = require("../middleware/auth");
const csrf_1 = require("../middleware/csrf");
const errors_1 = require("../utils/errors");
const sanitize_1 = require("../utils/sanitize");
const credentials = zod_1.z.object({ email: zod_1.z.string().email().max(190), password: zod_1.z.string().min(8).max(128) });
const bootstrap = credentials.extend({ fullName: zod_1.z.string().min(1).max(80) });
const changePassword = zod_1.z.object({ currentPassword: zod_1.z.string().min(1).max(128), newPassword: zod_1.z.string().min(12).max(128).regex(/[a-z]/).regex(/[A-Z]/).regex(/\d/).regex(/[^A-Za-z0-9]/) });
const userDto = (u) => ({ id: u.id, email: u.email, fullName: u.full_name, role: u.role });
exports.adminAuthRoutes = (0, express_1.Router)();
exports.adminAuthRoutes.use(csrf_1.requireSameOrigin);
exports.adminAuthRoutes.get("/bootstrap-status", async (_req, res, next) => { try {
    const rows = await (0, pool_1.queryRows)("SELECT COUNT(*) AS count FROM users WHERE role='HEAD_ADMIN' AND status='ACTIVE'");
    (0, sessions_1.noStore)(res);
    res.json({ headAdminExists: Number(rows[0]?.count ?? 0) > 0 });
}
catch (e) {
    next(e);
} });
exports.adminAuthRoutes.post("/bootstrap", async (req, res, next) => { try {
    const data = bootstrap.parse(req.body);
    const created = await (0, pool_1.withTransaction)(async (connection) => { const [found] = await connection.query("SELECT COUNT(*) AS count FROM users WHERE role='HEAD_ADMIN' FOR UPDATE"); if (Number(found[0]?.count ?? 0))
        throw new errors_1.ApiError(403, "Bootstrap is unavailable"); const hash = await bcryptjs_1.default.hash(data.password, 12); const [result] = await connection.execute("INSERT INTO users (email,password_hash,full_name,role,status) VALUES (?,?,?,'HEAD_ADMIN','ACTIVE')", [(0, sanitize_1.sanitizeEmail)(data.email), hash, (0, sanitize_1.sanitizePlainText)(data.fullName, 80)]); const raw = await (0, sessions_1.createSession)(connection, "staff", Number(result.insertId)); return { id: Number(result.insertId), raw }; });
    const rows = await (0, pool_1.queryRows)("SELECT id,email,full_name,role,status,password_hash FROM users WHERE id=?", [created.id]);
    (0, sessions_1.setSessionCookie)(res, sessions_1.STAFF_COOKIE, created.raw);
    (0, sessions_1.noStore)(res);
    res.status(201).json({ user: userDto(rows[0]) });
}
catch (e) {
    next(e);
} });
exports.adminAuthRoutes.post("/login", async (req, res, next) => { try {
    const data = credentials.parse(req.body);
    const users = await (0, pool_1.queryRows)("SELECT id,email,full_name,role,status,password_hash FROM users WHERE email=? LIMIT 1", [(0, sanitize_1.sanitizeEmail)(data.email)]);
    const user = users[0];
    const valid = await bcryptjs_1.default.compare(data.password, user?.password_hash ?? "$2a$12$Y3ww9pI95C8S7hWchm4xyu8Zy5ZcHMwY8S9wLPPpkBLeVqgZ8SpcK");
    if (!user || user.status !== "ACTIVE" || !valid)
        throw new errors_1.ApiError(401, "Invalid email or password");
    const raw = await (0, pool_1.withTransaction)((connection) => (0, sessions_1.createSession)(connection, "staff", user.id));
    (0, sessions_1.setSessionCookie)(res, sessions_1.STAFF_COOKIE, raw);
    (0, sessions_1.noStore)(res);
    res.json({ user: userDto(user) });
}
catch (e) {
    next(e);
} });
exports.adminAuthRoutes.get("/session", auth_1.requireAuth, (req, res) => { (0, sessions_1.noStore)(res); res.json({ user: req.user }); });
exports.adminAuthRoutes.post("/logout", auth_1.requireAuth, async (req, res, next) => { try {
    const raw = (0, sessions_1.readCookie)(req.header("cookie"), sessions_1.STAFF_COOKIE);
    await (0, pool_1.withTransaction)((connection) => connection.execute("UPDATE staff_sessions SET revoked_at=CURRENT_TIMESTAMP WHERE token_hash=?", [(0, sessions_1.tokenHash)(raw ?? "")]).then(() => undefined));
    (0, sessions_1.clearSessionCookie)(res, sessions_1.STAFF_COOKIE);
    (0, sessions_1.noStore)(res);
    res.json({ ok: true });
}
catch (e) {
    next(e);
} });
exports.adminAuthRoutes.post("/logout-all", auth_1.requireAuth, async (req, res, next) => { try {
    await (0, pool_1.withTransaction)((connection) => (0, sessions_1.revokeSessions)(connection, "staff", req.user.id));
    (0, sessions_1.clearSessionCookie)(res, sessions_1.STAFF_COOKIE);
    (0, sessions_1.noStore)(res);
    res.json({ ok: true });
}
catch (e) {
    next(e);
} });
exports.adminAuthRoutes.post("/change-password", auth_1.requireAuth, async (req, res, next) => { try {
    const data = changePassword.parse(req.body);
    await (0, pool_1.withTransaction)(async (connection) => { const [rows] = await connection.query("SELECT id,email,full_name,role,status,password_hash FROM users WHERE id=? FOR UPDATE", [req.user.id]); const user = rows[0]; if (!user || !(await bcryptjs_1.default.compare(data.currentPassword, user.password_hash)))
        throw new errors_1.ApiError(401, "Current password is incorrect"); if (await bcryptjs_1.default.compare(data.newPassword, user.password_hash))
        throw new errors_1.ApiError(400, "Choose a different password"); await connection.execute("UPDATE users SET password_hash=?,updated_at=CURRENT_TIMESTAMP WHERE id=?", [await bcryptjs_1.default.hash(data.newPassword, 12), user.id]); await (0, sessions_1.revokeSessions)(connection, "staff", user.id); const raw = await (0, sessions_1.createSession)(connection, "staff", user.id); (0, sessions_1.setSessionCookie)(res, sessions_1.STAFF_COOKIE, raw); });
    (0, sessions_1.noStore)(res);
    res.json({ ok: true });
}
catch (e) {
    next(e);
} });
