"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerApplicationAdminRoutes = exports.sellerApplicationPublicRoutes = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const listing_1 = require("../constants/listing");
const pool_1 = require("../db/pool");
const auth_1 = require("../middleware/auth");
const csrf_1 = require("../middleware/csrf");
const errors_1 = require("../utils/errors");
const sanitize_1 = require("../utils/sanitize");
const submitSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1).max(120),
    phone: zod_1.z.string().min(4).max(40),
    email: zod_1.z.string().email(),
    propertyType: zod_1.z.string().max(120).nullable().optional(),
    location: zod_1.z.string().min(1).max(255),
    province: zod_1.z.string().max(120).nullable().optional(),
    district: zod_1.z.string().max(120).nullable().optional(),
    timeline: zod_1.z.string().max(120).nullable().optional(),
    propertyDetails: zod_1.z.array(zod_1.z.string().max(240)).max(50).optional(),
    message: zod_1.z.string().max(5000).nullable().optional(),
});
const statusUpdateSchema = zod_1.z.object({
    status: zod_1.z.enum(listing_1.SELLER_APPLICATION_STATUSES),
});
exports.sellerApplicationPublicRoutes = (0, express_1.Router)();
exports.sellerApplicationAdminRoutes = (0, express_1.Router)();
exports.sellerApplicationPublicRoutes.post("/", async (request, response, next) => {
    try {
        const parsed = submitSchema.safeParse(request.body);
        if (!parsed.success) {
            throw new errors_1.ApiError(400, "Invalid seller application payload", parsed.error.flatten());
        }
        const data = parsed.data;
        const result = await (0, pool_1.executeSql)(`INSERT INTO seller_applications
      (full_name, phone, email, property_type, location, province, district, timeline, property_details, message, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW')`, [
            (0, sanitize_1.sanitizePlainText)(data.fullName, 120),
            (0, sanitize_1.sanitizePlainText)(data.phone, 40),
            (0, sanitize_1.sanitizeEmail)(data.email),
            data.propertyType ? (0, sanitize_1.sanitizePlainText)(data.propertyType, 120) : null,
            (0, sanitize_1.sanitizePlainText)(data.location, 255),
            data.province ? (0, sanitize_1.sanitizePlainText)(data.province, 120) : null,
            data.district ? (0, sanitize_1.sanitizePlainText)(data.district, 120) : null,
            data.timeline ? (0, sanitize_1.sanitizePlainText)(data.timeline, 120) : null,
            JSON.stringify((data.propertyDetails ?? []).map((item) => (0, sanitize_1.sanitizePlainText)(item, 240))),
            data.message ? (0, sanitize_1.sanitizePlainText)(data.message, 5000) : null,
        ]);
        response.status(201).json({ id: Number(result.insertId), status: "NEW" });
    }
    catch (error) {
        next(error);
    }
});
exports.sellerApplicationAdminRoutes.use(auth_1.requireAuth, (0, auth_1.requireOneOfRoles)(["HEAD_ADMIN", "ADMIN", "EMPLOYEE"]), csrf_1.requireSameOrigin);
exports.sellerApplicationAdminRoutes.get("/seller-applications", async (request, response, next) => {
    try {
        const query = zod_1.z.object({ q: zod_1.z.string().max(120).optional(), status: zod_1.z.enum(listing_1.SELLER_APPLICATION_STATUSES).optional(), page: zod_1.z.coerce.number().int().min(1).default(1), pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20) }).parse(request.query);
        const where = ["1=1"];
        const params = [];
        if (query.q) {
            where.push("(full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR location LIKE ? OR province LIKE ? OR district LIKE ?)");
            const q = `%${query.q}%`;
            params.push(q, q, q, q, q, q);
        }
        if (query.status) {
            where.push("status = ?");
            params.push(query.status);
        }
        const countRows = await (0, pool_1.queryRows)(`SELECT COUNT(*) AS total FROM seller_applications WHERE ${where.join(" AND ")}`, params);
        const offset = (query.page - 1) * query.pageSize;
        const rows = await (0, pool_1.queryRows)(`SELECT id, full_name, phone, email, property_type, location, province, district, timeline, property_details, message, status, created_at
       FROM seller_applications
       WHERE ${where.join(" AND ")} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, query.pageSize, offset]);
        response.json({ pagination: { page: query.page, pageSize: query.pageSize, total: Number(countRows[0]?.total ?? 0), totalPages: Math.ceil(Number(countRows[0]?.total ?? 0) / query.pageSize) }, items: rows.map((row) => ({ id: Number(row.id), fullName: row.full_name, phone: row.phone, email: row.email, propertyType: row.property_type, location: row.location, province: row.province, district: row.district, timeline: row.timeline, propertyDetails: row.property_details ? JSON.parse(row.property_details) : [], message: row.message, status: row.status, createdAt: row.created_at })) });
    }
    catch (error) {
        next(error);
    }
});
exports.sellerApplicationAdminRoutes.patch("/seller-applications/:id/status", async (request, response, next) => {
    try {
        const applicationId = Number.parseInt(request.params.id, 10);
        if (!Number.isFinite(applicationId) || applicationId <= 0) {
            throw new errors_1.ApiError(400, "Invalid seller application id");
        }
        const parsed = statusUpdateSchema.safeParse(request.body);
        if (!parsed.success) {
            throw new errors_1.ApiError(400, "Invalid status payload", parsed.error.flatten());
        }
        await (0, pool_1.executeSql)("UPDATE seller_applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [parsed.data.status, applicationId]);
        response.json({ ok: true });
    }
    catch (error) {
        next(error);
    }
});
