"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUserRoutes = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const pool_1 = require("../db/pool");
const sessions_1 = require("../auth/sessions");
const auth_1 = require("../middleware/auth");
const csrf_1 = require("../middleware/csrf");
const errors_1 = require("../utils/errors");
const sanitize_1 = require("../utils/sanitize");
const employeeCreateSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(128),
    fullName: zod_1.z.string().min(1).max(80),
    role: zod_1.z.enum(["ADMIN", "EMPLOYEE"]),
});
const employeeUpdateSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    password: zod_1.z.string().min(8).max(128).optional(),
    fullName: zod_1.z.string().min(1).max(80).optional(),
    role: zod_1.z.enum(["ADMIN", "EMPLOYEE"]).optional(),
    status: zod_1.z.enum(["ACTIVE", "DISABLED"]).optional(),
});
const accountSettingsSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().min(1),
    fullName: zod_1.z.string().min(1).max(80).optional(),
    newEmail: zod_1.z.string().email().optional(),
    newPassword: zod_1.z.string().min(8).max(128).optional(),
})
    .refine((value) => Boolean(value.fullName || value.newEmail || value.newPassword), {
    message: "Provide at least one field to update",
    path: ["fullName"],
});
const headAdminCredentialSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().min(1),
    newEmail: zod_1.z.string().email().optional(),
    newPassword: zod_1.z.string().min(8).max(128).optional(),
})
    .refine((value) => Boolean(value.newEmail || value.newPassword), {
    message: "Provide newEmail or newPassword",
    path: ["newEmail"],
});
async function verifyCurrentPassword(userId, currentPassword) {
    const rows = await (0, pool_1.queryRows)("SELECT id, password_hash, role FROM users WHERE id = ? LIMIT 1", [userId]);
    const user = rows[0];
    if (!user) {
        throw new errors_1.ApiError(404, "User not found");
    }
    const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password_hash);
    if (!isMatch) {
        throw new errors_1.ApiError(401, "Current password is incorrect");
    }
    return user;
}
exports.adminUserRoutes = (0, express_1.Router)();
exports.adminUserRoutes.use(auth_1.requireAuth, (0, auth_1.requireOneOfRoles)(["HEAD_ADMIN", "ADMIN", "EMPLOYEE"]), csrf_1.requireSameOrigin);
exports.adminUserRoutes.get("/registered-users", async (_request, response, next) => {
    try {
        const rows = await (0, pool_1.queryRows)(`SELECT id, full_name, email, role, status, created_at
       FROM users
       ORDER BY created_at DESC`);
        response.json({ total: rows.length, items: rows });
    }
    catch (error) {
        next(error);
    }
});
exports.adminUserRoutes.get("/employees", async (_request, response, next) => {
    try {
        const rows = await (0, pool_1.queryRows)(`SELECT id, email, full_name, role, status, created_at
       FROM users
       WHERE role IN ('HEAD_ADMIN', 'ADMIN', 'EMPLOYEE')
       ORDER BY FIELD(role, 'HEAD_ADMIN', 'ADMIN', 'EMPLOYEE'), id ASC`);
        response.json({ total: rows.length, items: rows });
    }
    catch (error) {
        next(error);
    }
});
exports.adminUserRoutes.post("/employees", (0, auth_1.requireRole)("HEAD_ADMIN"), async (request, response, next) => {
    try {
        const parsed = employeeCreateSchema.safeParse(request.body);
        if (!parsed.success) {
            throw new errors_1.ApiError(400, "Invalid employee payload", parsed.error.flatten());
        }
        const email = (0, sanitize_1.sanitizeEmail)(parsed.data.email);
        const passwordHash = await bcryptjs_1.default.hash(parsed.data.password, 12);
        await (0, pool_1.executeSql)(`INSERT INTO users (email, password_hash, full_name, role, status)
       VALUES (?, ?, ?, ?, 'ACTIVE')`, [email, passwordHash, (0, sanitize_1.sanitizePlainText)(parsed.data.fullName, 80), parsed.data.role]);
        response.status(201).json({ ok: true });
    }
    catch (error) {
        next(error);
    }
});
exports.adminUserRoutes.patch("/employees/:id", (0, auth_1.requireRole)("HEAD_ADMIN"), async (request, response, next) => {
    try {
        const employeeId = Number.parseInt(request.params.id, 10);
        if (!Number.isFinite(employeeId) || employeeId <= 0) {
            throw new errors_1.ApiError(400, "Invalid employee id");
        }
        const parsed = employeeUpdateSchema.safeParse(request.body);
        if (!parsed.success) {
            throw new errors_1.ApiError(400, "Invalid employee update payload", parsed.error.flatten());
        }
        const data = parsed.data;
        const sets = [];
        const values = [];
        if (data.email) {
            sets.push("email = ?");
            values.push((0, sanitize_1.sanitizeEmail)(data.email));
        }
        if (data.fullName) {
            sets.push("full_name = ?");
            values.push((0, sanitize_1.sanitizePlainText)(data.fullName, 80));
        }
        if (data.role) {
            sets.push("role = ?");
            values.push(data.role);
        }
        if (data.status) {
            sets.push("status = ?");
            values.push(data.status);
        }
        if (data.password) {
            sets.push("password_hash = ?");
            values.push(await bcryptjs_1.default.hash(data.password, 12));
        }
        if (!sets.length) {
            throw new errors_1.ApiError(400, "No update fields provided");
        }
        values.push(employeeId);
        await (0, pool_1.withTransaction)(async (connection) => {
            await connection.execute(`UPDATE users SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND role <> 'HEAD_ADMIN'`, values);
            if (data.status === "DISABLED" || data.password)
                await (0, sessions_1.revokeSessions)(connection, "staff", employeeId);
        });
        response.json({ ok: true });
    }
    catch (error) {
        next(error);
    }
});
exports.adminUserRoutes.get("/customers", async (request, response, next) => {
    try {
        const query = zod_1.z.object({ page: zod_1.z.coerce.number().int().min(1).default(1), pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(25), status: zod_1.z.enum(["PENDING_VERIFICATION", "ACTIVE", "DISABLED", "DELETED"]).optional(), q: zod_1.z.string().max(190).optional() }).parse(request.query);
        const filters = [];
        const values = [];
        if (query.status) {
            filters.push("c.status = ?");
            values.push(query.status);
        }
        if (query.q?.trim()) {
            filters.push("(c.email LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)");
            const term = `%${(0, sanitize_1.sanitizePlainText)(query.q, 190)}%`;
            values.push(term, term, term);
        }
        const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
        const rows = await (0, pool_1.queryRows)(`SELECT c.id,c.email,c.first_name,c.last_name,c.status,c.email_verified_at,c.created_at,c.last_login_at,COUNT(f.listing_id) AS favorite_count FROM customer_accounts c LEFT JOIN customer_favorites f ON f.customer_id=c.id ${where} GROUP BY c.id ORDER BY c.created_at DESC LIMIT ? OFFSET ?`, [...values, query.pageSize, (query.page - 1) * query.pageSize]);
        const count = await (0, pool_1.queryRows)(`SELECT COUNT(*) AS total FROM customer_accounts c ${where}`, values);
        response.json({ items: rows.map((row) => ({ id: row.id, email: row.email, firstName: row.first_name, lastName: row.last_name, status: row.status, emailVerifiedAt: row.email_verified_at, createdAt: row.created_at, lastLoginAt: row.last_login_at, favoriteCount: Number(row.favorite_count) })), pagination: { page: query.page, pageSize: query.pageSize, total: Number(count[0]?.total ?? 0) } });
    }
    catch (error) {
        next(error);
    }
});
exports.adminUserRoutes.patch("/customers/:id", (0, auth_1.requireOneOfRoles)(["HEAD_ADMIN", "ADMIN"]), async (request, response, next) => {
    try {
        const id = zod_1.z.coerce.number().int().positive().parse(request.params.id);
        const data = zod_1.z.object({ firstName: zod_1.z.string().min(1).max(80).optional(), lastName: zod_1.z.string().min(1).max(80).optional(), phone: zod_1.z.string().max(40).nullable().optional(), status: zod_1.z.enum(["ACTIVE", "DISABLED"]).optional() }).strict().parse(request.body);
        const sets = [];
        const values = [];
        if (data.firstName !== undefined) {
            sets.push("first_name=?");
            values.push((0, sanitize_1.sanitizePlainText)(data.firstName, 80));
        }
        if (data.lastName !== undefined) {
            sets.push("last_name=?");
            values.push((0, sanitize_1.sanitizePlainText)(data.lastName, 80));
        }
        if (data.phone !== undefined) {
            sets.push("phone=?");
            values.push(data.phone === null ? null : (0, sanitize_1.sanitizePlainText)(data.phone, 40));
        }
        if (data.status !== undefined) {
            sets.push("status=?");
            values.push(data.status);
        }
        if (!sets.length)
            throw new errors_1.ApiError(400, "No customer changes supplied");
        await (0, pool_1.withTransaction)(async (connection) => { await connection.execute(`UPDATE customer_accounts SET ${sets.join(",")},updated_at=CURRENT_TIMESTAMP WHERE id=?`, [...values, id]); if (data.status === "DISABLED")
            await (0, sessions_1.revokeSessions)(connection, "customer", id); });
        response.json({ ok: true });
    }
    catch (error) {
        next(error);
    }
});
exports.adminUserRoutes.post("/customers/:id/revoke-sessions", (0, auth_1.requireOneOfRoles)(["HEAD_ADMIN", "ADMIN"]), async (request, response, next) => { try {
    const id = zod_1.z.coerce.number().int().positive().parse(request.params.id);
    await (0, pool_1.withTransaction)(connection => (0, sessions_1.revokeSessions)(connection, "customer", id));
    response.json({ ok: true });
}
catch (error) {
    next(error);
} });
exports.adminUserRoutes.delete("/customers/:id", (0, auth_1.requireRole)("HEAD_ADMIN"), async (request, response, next) => { try {
    const id = zod_1.z.coerce.number().int().positive().parse(request.params.id);
    await (0, pool_1.executeSql)("UPDATE customer_accounts SET status='DELETED',email=CONCAT('deleted-',id,'-',email),password_hash='' WHERE id=?", [id]);
    response.json({ ok: true });
}
catch (error) {
    next(error);
} });
exports.adminUserRoutes.delete("/employees/:id", (0, auth_1.requireRole)("HEAD_ADMIN"), async (request, response, next) => {
    try {
        const employeeId = Number.parseInt(request.params.id, 10);
        if (!Number.isFinite(employeeId) || employeeId <= 0) {
            throw new errors_1.ApiError(400, "Invalid employee id");
        }
        await (0, pool_1.executeSql)("DELETE FROM users WHERE id = ? AND role <> 'HEAD_ADMIN'", [employeeId]);
        response.json({ ok: true });
    }
    catch (error) {
        next(error);
    }
});
exports.adminUserRoutes.patch("/account-settings", async (request, response, next) => {
    try {
        const parsed = accountSettingsSchema.safeParse(request.body);
        if (!parsed.success) {
            throw new errors_1.ApiError(400, "Invalid account settings payload", parsed.error.flatten());
        }
        const current = await verifyCurrentPassword(request.user.id, parsed.data.currentPassword);
        const sets = [];
        const values = [];
        if (parsed.data.fullName) {
            sets.push("full_name = ?");
            values.push((0, sanitize_1.sanitizePlainText)(parsed.data.fullName, 80));
        }
        if (parsed.data.newEmail) {
            sets.push("email = ?");
            values.push((0, sanitize_1.sanitizeEmail)(parsed.data.newEmail));
        }
        if (parsed.data.newPassword) {
            sets.push("password_hash = ?");
            values.push(await bcryptjs_1.default.hash(parsed.data.newPassword, 12));
        }
        values.push(current.id);
        await (0, pool_1.executeSql)(`UPDATE users SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
        response.json({ ok: true });
    }
    catch (error) {
        next(error);
    }
});
exports.adminUserRoutes.patch("/head-admin/credentials", (0, auth_1.requireRole)("HEAD_ADMIN"), async (request, response, next) => {
    try {
        const parsed = headAdminCredentialSchema.safeParse(request.body);
        if (!parsed.success) {
            throw new errors_1.ApiError(400, "Invalid credentials payload", parsed.error.flatten());
        }
        const current = await verifyCurrentPassword(request.user.id, parsed.data.currentPassword);
        if (current.role !== "HEAD_ADMIN") {
            throw new errors_1.ApiError(403, "Forbidden");
        }
        const sets = [];
        const values = [];
        if (parsed.data.newEmail) {
            sets.push("email = ?");
            values.push((0, sanitize_1.sanitizeEmail)(parsed.data.newEmail));
        }
        if (parsed.data.newPassword) {
            sets.push("password_hash = ?");
            values.push(await bcryptjs_1.default.hash(parsed.data.newPassword, 12));
        }
        values.push(request.user.id);
        await (0, pool_1.executeSql)(`UPDATE users SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
        response.json({ ok: true });
    }
    catch (error) {
        next(error);
    }
});
