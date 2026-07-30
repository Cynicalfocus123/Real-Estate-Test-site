"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRoutes = exports.customerAuthRoutes = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_1 = require("express");
const zod_1 = require("zod");
const env_1 = require("../config/env");
const sessions_1 = require("../auth/sessions");
const pool_1 = require("../db/pool");
const customerAuth_1 = require("../middleware/customerAuth");
const csrf_1 = require("../middleware/csrf");
const mailService_1 = require("../services/mailService");
const errors_1 = require("../utils/errors");
const sanitize_1 = require("../utils/sanitize");
const password = zod_1.z.string().min(12, "Password is too short").max(128).regex(/[a-z]/, "Password is too weak").regex(/[A-Z]/, "Password is too weak").regex(/\d/, "Password is too weak").regex(/[^A-Za-z0-9]/, "Password is too weak");
const registration = zod_1.z.object({ email: zod_1.z.string().email().max(190), password, firstName: zod_1.z.string().min(1).max(80), lastName: zod_1.z.string().min(1).max(80), phone: zod_1.z.string().max(40).optional() }).strict();
const credentials = zod_1.z.object({ email: zod_1.z.string().email().max(190), password: zod_1.z.string().min(1).max(128) }).strict();
const tokenPayload = zod_1.z.object({ token: zod_1.z.string().min(32).max(256) }).strict();
const profile = zod_1.z.object({ firstName: zod_1.z.string().min(1).max(80).optional(), lastName: zod_1.z.string().min(1).max(80).optional(), phone: zod_1.z.string().max(40).nullable().optional(), address: zod_1.z.string().max(240).nullable().optional(), subdistrict: zod_1.z.string().max(120).nullable().optional(), district: zod_1.z.string().max(120).nullable().optional(), province: zod_1.z.string().max(120).nullable().optional(), postalCode: zod_1.z.string().max(20).nullable().optional() }).strict();
const preferences = zod_1.z.object({ notificationFrequency: zod_1.z.enum(["realtime", "daily", "none"]), marketingPreference: zod_1.z.boolean() }).strict();
const actionToken = zod_1.z.object({ token: zod_1.z.string().min(32).max(256) }).strict();
const reset = zod_1.z.object({ token: zod_1.z.string().min(32).max(256), password }).strict();
const changePassword = zod_1.z.object({ currentPassword: zod_1.z.string().min(1).max(128), newPassword: password }).strict();
const changeEmail = zod_1.z.object({ currentPassword: zod_1.z.string().min(1).max(128), newEmail: zod_1.z.string().email().max(190) }).strict();
const deleteAccount = zod_1.z.object({ currentPassword: zod_1.z.string().min(1).max(128), confirmation: zod_1.z.literal("DELETE") }).strict();
const safeCustomer = (c) => ({ id: c.id, email: c.email, firstName: c.first_name, lastName: c.last_name, phone: c.phone, address: c.address, subdistrict: c.subdistrict, district: c.district, province: c.province, postalCode: c.postal_code, status: c.status, emailVerifiedAt: c.email_verified_at, lastLoginAt: c.last_login_at, notificationFrequency: c.notification_frequency, marketingPreference: Boolean(c.marketing_preference) });
async function issueToken(connection, customerId, purpose, pendingEmail) { const raw = (0, sessions_1.randomToken)(); await connection.execute("UPDATE customer_action_tokens SET used_at=CURRENT_TIMESTAMP WHERE customer_id=? AND purpose=? AND used_at IS NULL", [customerId, purpose]); await connection.execute("INSERT INTO customer_action_tokens (customer_id,purpose,token_hash,pending_email,expires_at) VALUES (?,?,?,?,DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 MINUTE))", [customerId, purpose, (0, sessions_1.tokenHash)(raw), pendingEmail ?? null]); return raw; }
async function consumeToken(connection, raw, purpose) { const [rows] = await connection.query("SELECT id,customer_id,pending_email FROM customer_action_tokens WHERE token_hash=? AND purpose=? AND used_at IS NULL AND expires_at>CURRENT_TIMESTAMP FOR UPDATE", [(0, sessions_1.tokenHash)(raw), purpose]); const row = rows[0]; if (!row)
    throw new errors_1.ApiError(400, "This link is invalid or expired"); await connection.execute("UPDATE customer_action_tokens SET used_at=CURRENT_TIMESTAMP WHERE id=?", [row.id]); return row; }
function requireCustomerMail() { if (env_1.env.NODE_ENV === "production" && !(0, mailService_1.isMailConfigured)())
    throw new errors_1.ApiError(503, "Email service is temporarily unavailable. Please try again later."); }
async function tryMail(send) { try {
    await send();
    return true;
}
catch {
    return false;
} }
exports.customerAuthRoutes = (0, express_1.Router)();
exports.customerAuthRoutes.use(csrf_1.requireSameOrigin);
exports.customerAuthRoutes.post("/register", async (req, res, next) => { try {
    requireCustomerMail();
    const data = registration.parse(req.body);
    const email = (0, sanitize_1.sanitizeEmail)(data.email);
    const firstName = (0, sanitize_1.sanitizePlainText)(data.firstName, 80);
    const lastName = (0, sanitize_1.sanitizePlainText)(data.lastName, 80);
    const c = await (0, pool_1.withTransaction)(async (connection) => { const hash = await bcryptjs_1.default.hash(data.password, 12); const [result] = await connection.execute("INSERT INTO customer_accounts (email,password_hash,first_name,last_name,phone,status) VALUES (?,?,?,?,?,'PENDING_VERIFICATION')", [email, hash, firstName, lastName, data.phone ? (0, sanitize_1.sanitizePlainText)(data.phone, 40) : null]); const id = Number(result.insertId); const raw = await issueToken(connection, id, "EMAIL_VERIFICATION"); return { id, raw }; });
    if (!await tryMail(() => (0, mailService_1.sendVerificationEmail)(email, c.raw))) {
        await (0, pool_1.withTransaction)(connection => connection.execute("DELETE FROM customer_accounts WHERE id=? AND status='PENDING_VERIFICATION'", [c.id]).then(() => undefined));
        throw new errors_1.ApiError(503, "Email service is temporarily unavailable. Please try again later.");
    }
    void tryMail(() => (0, mailService_1.sendRegistrationNotification)({ firstName, lastName, email, registeredAt: new Date().toISOString(), status: "PENDING_VERIFICATION" }));
    (0, sessions_1.noStore)(res);
    res.status(201).json({ verificationRequired: true });
}
catch (e) {
    next(e);
} });
exports.customerAuthRoutes.post("/login", async (req, res, next) => { try {
    const data = credentials.parse(req.body);
    const rows = await (0, pool_1.queryRows)("SELECT * FROM customer_accounts WHERE email=? LIMIT 1", [(0, sanitize_1.sanitizeEmail)(data.email)]);
    const c = rows[0];
    const valid = await bcryptjs_1.default.compare(data.password, c?.password_hash ?? "$2a$12$Y3ww9pI95C8S7hWchm4xyu8Zy5ZcHMwY8S9wLPPpkBLeVqgZ8SpcK");
    if (!c || c.status !== "ACTIVE" || !valid)
        throw new errors_1.ApiError(401, "Invalid email or password");
    const raw = await (0, pool_1.withTransaction)(async (connection) => { await connection.execute("UPDATE customer_accounts SET last_login_at=CURRENT_TIMESTAMP WHERE id=?", [c.id]); return (0, sessions_1.createSession)(connection, "customer", c.id); });
    (0, sessions_1.setSessionCookie)(res, sessions_1.CUSTOMER_COOKIE, raw);
    (0, sessions_1.noStore)(res);
    res.json({ customer: safeCustomer(c) });
}
catch (e) {
    next(e);
} });
exports.customerAuthRoutes.post("/logout", customerAuth_1.requireCustomer, async (req, res, next) => { try {
    const raw = (0, sessions_1.readCookie)(req.header("cookie"), sessions_1.CUSTOMER_COOKIE);
    await (0, pool_1.withTransaction)(connection => connection.execute("UPDATE customer_sessions SET revoked_at=CURRENT_TIMESTAMP WHERE token_hash=?", [(0, sessions_1.tokenHash)(raw ?? "")]).then(() => undefined));
    (0, sessions_1.clearSessionCookie)(res, sessions_1.CUSTOMER_COOKIE);
    (0, sessions_1.noStore)(res);
    res.json({ ok: true });
}
catch (e) {
    next(e);
} });
exports.customerAuthRoutes.post("/logout-all", customerAuth_1.requireCustomer, async (req, res, next) => { try {
    await (0, pool_1.withTransaction)(c => (0, sessions_1.revokeSessions)(c, "customer", req.customer.id));
    (0, sessions_1.clearSessionCookie)(res, sessions_1.CUSTOMER_COOKIE);
    (0, sessions_1.noStore)(res);
    res.json({ ok: true });
}
catch (e) {
    next(e);
} });
exports.customerAuthRoutes.get("/session", async (req, res, next) => { try {
    const token = (0, sessions_1.readCookie)(req.header("cookie"), sessions_1.CUSTOMER_COOKIE);
    if (!token)
        throw new errors_1.ApiError(401, "Authentication required");
    const rows = await (0, pool_1.queryRows)(`SELECT c.* FROM customer_sessions s JOIN customer_accounts c ON c.id=s.customer_id WHERE s.token_hash=? AND s.revoked_at IS NULL AND s.expires_at>CURRENT_TIMESTAMP LIMIT 1`, [(0, sessions_1.tokenHash)(token)]);
    const c = rows[0];
    if (!c || c.status !== "ACTIVE")
        throw new errors_1.ApiError(401, "Authentication required");
    (0, sessions_1.noStore)(res);
    res.json({ customer: safeCustomer(c) });
}
catch (e) {
    next(e);
} });
exports.customerAuthRoutes.post("/verify-email", async (req, res, next) => { try {
    const data = actionToken.parse(req.body);
    await (0, pool_1.withTransaction)(async (c) => { const t = await consumeToken(c, data.token, "EMAIL_VERIFICATION"); await c.execute("UPDATE customer_accounts SET status='ACTIVE',email_verified_at=CURRENT_TIMESTAMP WHERE id=? AND status='PENDING_VERIFICATION'", [t.customer_id]); });
    (0, sessions_1.noStore)(res);
    res.json({ ok: true });
}
catch (e) {
    next(e);
} });
exports.customerAuthRoutes.post("/resend-verification", async (req, res, next) => { try {
    const data = zod_1.z.object({ email: zod_1.z.string().email().max(190) }).strict().parse(req.body);
    const rows = await (0, pool_1.queryRows)("SELECT * FROM customer_accounts WHERE email=? AND status='PENDING_VERIFICATION' LIMIT 1", [(0, sanitize_1.sanitizeEmail)(data.email)]);
    const c = rows[0];
    let delivered = (0, mailService_1.isMailConfigured)();
    if (c && delivered) {
        const raw = await (0, pool_1.withTransaction)(conn => issueToken(conn, c.id, "EMAIL_VERIFICATION"));
        delivered = await tryMail(() => (0, mailService_1.sendVerificationEmail)(c.email, raw));
    }
    (0, sessions_1.noStore)(res);
    res.json({ ok: true, deliveryAvailable: delivered });
}
catch (e) {
    next(e);
} });
exports.customerAuthRoutes.post("/forgot-password", async (req, res, next) => { try {
    const data = zod_1.z.object({ email: zod_1.z.string().email().max(190) }).strict().parse(req.body);
    const rows = await (0, pool_1.queryRows)("SELECT * FROM customer_accounts WHERE email=? AND status='ACTIVE' LIMIT 1", [(0, sanitize_1.sanitizeEmail)(data.email)]);
    const c = rows[0];
    let delivered = (0, mailService_1.isMailConfigured)();
    if (c && delivered) {
        const raw = await (0, pool_1.withTransaction)(conn => issueToken(conn, c.id, "PASSWORD_RESET"));
        delivered = await tryMail(() => (0, mailService_1.sendResetEmail)(c.email, raw));
    }
    (0, sessions_1.noStore)(res);
    res.json({ ok: true, deliveryAvailable: delivered });
}
catch (e) {
    next(e);
} });
exports.customerAuthRoutes.post("/reset-password", async (req, res, next) => { try {
    const data = reset.parse(req.body);
    await (0, pool_1.withTransaction)(async (c) => { const t = await consumeToken(c, data.token, "PASSWORD_RESET"); await c.execute("UPDATE customer_accounts SET password_hash=?,updated_at=CURRENT_TIMESTAMP WHERE id=?", [await bcryptjs_1.default.hash(data.password, 12), t.customer_id]); await (0, sessions_1.revokeSessions)(c, "customer", t.customer_id); });
    (0, sessions_1.clearSessionCookie)(res, sessions_1.CUSTOMER_COOKIE);
    (0, sessions_1.noStore)(res);
    res.json({ ok: true });
}
catch (e) {
    next(e);
} });
exports.customerAuthRoutes.post("/change-password", customerAuth_1.requireCustomer, async (req, res, next) => { try {
    const data = changePassword.parse(req.body);
    const raw = await (0, pool_1.withTransaction)(async (c) => { const [rows] = await c.query("SELECT * FROM customer_accounts WHERE id=? FOR UPDATE", [req.customer.id]); const user = rows[0]; if (!user || !(await bcryptjs_1.default.compare(data.currentPassword, user.password_hash)))
        throw new errors_1.ApiError(401, "Current password is incorrect"); if (await bcryptjs_1.default.compare(data.newPassword, user.password_hash))
        throw new errors_1.ApiError(400, "Choose a different password"); await c.execute("UPDATE customer_accounts SET password_hash=? WHERE id=?", [await bcryptjs_1.default.hash(data.newPassword, 12), user.id]); await (0, sessions_1.revokeSessions)(c, "customer", user.id); return (0, sessions_1.createSession)(c, "customer", user.id); });
    (0, sessions_1.setSessionCookie)(res, sessions_1.CUSTOMER_COOKIE, raw);
    (0, sessions_1.noStore)(res);
    res.json({ ok: true });
}
catch (e) {
    next(e);
} });
exports.customerAuthRoutes.post("/change-email", customerAuth_1.requireCustomer, async (req, res, next) => { try {
    const data = changeEmail.parse(req.body);
    const newEmail = (0, sanitize_1.sanitizeEmail)(data.newEmail);
    const token = await (0, pool_1.withTransaction)(async (c) => { const [rows] = await c.query("SELECT * FROM customer_accounts WHERE id=? FOR UPDATE", [req.customer.id]); const user = rows[0]; if (!user || !(await bcryptjs_1.default.compare(data.currentPassword, user.password_hash)))
        throw new errors_1.ApiError(401, "Current password is incorrect"); if (user.email === newEmail)
        throw new errors_1.ApiError(400, "Choose a different email address"); const [existing] = await c.query("SELECT id FROM customer_accounts WHERE email=? LIMIT 1 FOR UPDATE", [newEmail]); if (existing.length)
        throw new errors_1.ApiError(400, "That email address is unavailable"); return issueToken(c, user.id, "EMAIL_CHANGE", newEmail); });
    await tryMail(() => (0, mailService_1.sendEmailChangeEmail)(newEmail, token));
    (0, sessions_1.noStore)(res);
    res.json({ ok: true });
}
catch (e) {
    next(e);
} });
exports.customerAuthRoutes.post("/confirm-email-change", async (req, res, next) => { try {
    const data = actionToken.parse(req.body);
    await (0, pool_1.withTransaction)(async (c) => { const token = await consumeToken(c, data.token, "EMAIL_CHANGE"); if (!token.pending_email)
        throw new errors_1.ApiError(400, "This link is invalid or expired"); await c.execute("UPDATE customer_accounts SET email=?,email_verified_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?", [token.pending_email, token.customer_id]); await (0, sessions_1.revokeSessions)(c, "customer", token.customer_id); });
    (0, sessions_1.clearSessionCookie)(res, sessions_1.CUSTOMER_COOKIE);
    (0, sessions_1.noStore)(res);
    res.json({ ok: true });
}
catch (e) {
    next(e);
} });
exports.customerRoutes = (0, express_1.Router)();
exports.customerRoutes.use(csrf_1.requireSameOrigin, customerAuth_1.requireCustomer);
exports.customerRoutes.get("/profile", async (req, res, next) => { try {
    const rows = await (0, pool_1.queryRows)("SELECT * FROM customer_accounts WHERE id=?", [req.customer.id]);
    (0, sessions_1.noStore)(res);
    res.json({ customer: safeCustomer(rows[0]) });
}
catch (e) {
    next(e);
} });
exports.customerRoutes.patch("/profile", async (req, res, next) => { try {
    const data = profile.parse(req.body);
    const map = { firstName: "first_name", lastName: "last_name", phone: "phone", address: "address", subdistrict: "subdistrict", district: "district", province: "province", postalCode: "postal_code" };
    const sets = [], values = [];
    for (const [key, column] of Object.entries(map)) {
        if (data[key] !== undefined) {
            sets.push(`${column}=?`);
            const value = data[key];
            values.push(value === null ? null : (0, sanitize_1.sanitizePlainText)(String(value), column === "address" ? 240 : column === "phone" ? 40 : column === "postal_code" ? 20 : 120));
        }
    }
    if (!sets.length)
        throw new errors_1.ApiError(400, "No profile changes supplied");
    await (0, pool_1.withTransaction)(c => c.execute(`UPDATE customer_accounts SET ${sets.join(",")},updated_at=CURRENT_TIMESTAMP WHERE id=?`, [...values, req.customer.id]).then(() => undefined));
    const rows = await (0, pool_1.queryRows)("SELECT * FROM customer_accounts WHERE id=?", [req.customer.id]);
    (0, sessions_1.noStore)(res);
    res.json({ customer: safeCustomer(rows[0]) });
}
catch (e) {
    next(e);
} });
exports.customerRoutes.patch("/preferences", async (req, res, next) => { try {
    const data = preferences.parse(req.body);
    await (0, pool_1.withTransaction)(c => c.execute("UPDATE customer_accounts SET notification_frequency=?,marketing_preference=? WHERE id=?", [data.notificationFrequency, data.marketingPreference ? 1 : 0, req.customer.id]).then(() => undefined));
    (0, sessions_1.noStore)(res);
    res.json({ ok: true });
}
catch (e) {
    next(e);
} });
exports.customerRoutes.delete("/account", async (req, res, next) => { try {
    const data = deleteAccount.parse(req.body);
    await (0, pool_1.withTransaction)(async (c) => { const [rows] = await c.query("SELECT * FROM customer_accounts WHERE id=? FOR UPDATE", [req.customer.id]); if (!rows[0] || !(await bcryptjs_1.default.compare(data.currentPassword, rows[0].password_hash)))
        throw new errors_1.ApiError(401, "Current password is incorrect"); await (0, sessions_1.revokeSessions)(c, "customer", req.customer.id); await c.execute("UPDATE customer_accounts SET status='DELETED',email=CONCAT('deleted-',id,'-',email),password_hash='',updated_at=CURRENT_TIMESTAMP WHERE id=?", [req.customer.id]); });
    (0, sessions_1.clearSessionCookie)(res, sessions_1.CUSTOMER_COOKIE);
    (0, sessions_1.noStore)(res);
    res.json({ ok: true });
}
catch (e) {
    next(e);
} });
exports.customerRoutes.get("/favorites", async (req, res, next) => { try {
    const rows = await (0, pool_1.queryRows)(`SELECT f.listing_id FROM customer_favorites f JOIN listings l ON l.id=f.listing_id WHERE f.customer_id=? AND l.status='PUBLISHED' ORDER BY f.created_at DESC`, [req.customer.id]);
    (0, sessions_1.noStore)(res);
    res.json({ propertyIds: rows.map(r => String(r.listing_id)) });
}
catch (e) {
    next(e);
} });
exports.customerRoutes.put("/favorites/:propertyId", async (req, res, next) => { try {
    const id = zod_1.z.coerce.number().int().positive().parse(req.params.propertyId);
    await (0, pool_1.withTransaction)(async (c) => { const [listing] = await c.query("SELECT id FROM listings WHERE id=? AND status='PUBLISHED' LIMIT 1", [id]); if (!listing[0])
        throw new errors_1.ApiError(404, "Property not found"); await c.execute("INSERT IGNORE INTO customer_favorites (customer_id,listing_id) VALUES (?,?)", [req.customer.id, id]); });
    (0, sessions_1.noStore)(res);
    res.json({ ok: true });
}
catch (e) {
    next(e);
} });
exports.customerRoutes.delete("/favorites/:propertyId", async (req, res, next) => { try {
    const id = zod_1.z.coerce.number().int().positive().parse(req.params.propertyId);
    await (0, pool_1.withTransaction)(c => c.execute("DELETE FROM customer_favorites WHERE customer_id=? AND listing_id=?", [req.customer.id, id]).then(() => undefined));
    (0, sessions_1.noStore)(res);
    res.json({ ok: true });
}
catch (e) {
    next(e);
} });
