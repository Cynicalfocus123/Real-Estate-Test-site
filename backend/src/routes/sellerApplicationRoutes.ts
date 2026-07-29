import { Router } from "express";
import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { SELLER_APPLICATION_STATUSES } from "../constants/listing";
import { executeSql, queryRows } from "../db/pool";
import { requireAuth, requireOneOfRoles } from "../middleware/auth";
import { ApiError } from "../utils/errors";
import { sanitizeEmail, sanitizePlainText } from "../utils/sanitize";

const submitSchema = z.object({
  fullName: z.string().min(1).max(120),
  phone: z.string().min(4).max(40),
  email: z.string().email(),
  propertyType: z.string().max(120).nullable().optional(),
  location: z.string().min(1).max(255),
  province: z.string().max(120).nullable().optional(),
  district: z.string().max(120).nullable().optional(),
  timeline: z.string().max(120).nullable().optional(),
  propertyDetails: z.array(z.string().max(240)).max(50).optional(),
  message: z.string().max(5000).nullable().optional(),
});

const statusUpdateSchema = z.object({
  status: z.enum(SELLER_APPLICATION_STATUSES),
});

export const sellerApplicationPublicRoutes = Router();
export const sellerApplicationAdminRoutes = Router();

sellerApplicationPublicRoutes.post("/", async (request, response, next) => {
  try {
    const parsed = submitSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid seller application payload", parsed.error.flatten());
    }
    const data = parsed.data;
    const result = await executeSql(
      `INSERT INTO seller_applications
      (full_name, phone, email, property_type, location, province, district, timeline, property_details, message, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW')`,
      [
        sanitizePlainText(data.fullName, 120),
        sanitizePlainText(data.phone, 40),
        sanitizeEmail(data.email),
        data.propertyType ? sanitizePlainText(data.propertyType, 120) : null,
        sanitizePlainText(data.location, 255),
        data.province ? sanitizePlainText(data.province, 120) : null,
        data.district ? sanitizePlainText(data.district, 120) : null,
        data.timeline ? sanitizePlainText(data.timeline, 120) : null,
        JSON.stringify((data.propertyDetails ?? []).map((item) => sanitizePlainText(item, 240))),
        data.message ? sanitizePlainText(data.message, 5000) : null,
      ],
    );
    response.status(201).json({ id: Number(result.insertId), status: "NEW" });
  } catch (error) {
    next(error);
  }
});

sellerApplicationAdminRoutes.use(requireAuth, requireOneOfRoles(["HEAD_ADMIN", "ADMIN", "EMPLOYEE"]));

sellerApplicationAdminRoutes.get("/seller-applications", async (request, response, next) => {
  try {
    const query = z.object({ q: z.string().max(120).optional(), status: z.enum(SELLER_APPLICATION_STATUSES).optional(), page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) }).parse(request.query);
    const where: string[] = ["1=1"]; const params: unknown[] = [];
    if (query.q) { where.push("(full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR location LIKE ? OR province LIKE ? OR district LIKE ?)"); const q = `%${query.q}%`; params.push(q, q, q, q, q, q); }
    if (query.status) { where.push("status = ?"); params.push(query.status); }
    const countRows = await queryRows<(RowDataPacket & { total: number })[]>(`SELECT COUNT(*) AS total FROM seller_applications WHERE ${where.join(" AND ")}`, params);
    const offset = (query.page - 1) * query.pageSize;
    const rows = await queryRows<
      (RowDataPacket & {
        id: number;
        full_name: string;
        phone: string;
        email: string;
        property_type: string | null;
        location: string;
        province: string | null;
        district: string | null;
        timeline: string | null;
        property_details: string | null;
        message: string | null;
        status: string;
        created_at: string;
      })[]
    >(
      `SELECT id, full_name, phone, email, property_type, location, province, district, timeline, property_details, message, status, created_at
       FROM seller_applications
       WHERE ${where.join(" AND ")} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, query.pageSize, offset],
    );
    response.json({ pagination: { page: query.page, pageSize: query.pageSize, total: Number(countRows[0]?.total ?? 0), totalPages: Math.ceil(Number(countRows[0]?.total ?? 0) / query.pageSize) }, items: rows.map((row) => ({ id: Number(row.id), fullName: row.full_name, phone: row.phone, email: row.email, propertyType: row.property_type, location: row.location, province: row.province, district: row.district, timeline: row.timeline, propertyDetails: row.property_details ? JSON.parse(row.property_details) : [], message: row.message, status: row.status, createdAt: row.created_at })) });
  } catch (error) {
    next(error);
  }
});

sellerApplicationAdminRoutes.patch("/seller-applications/:id/status", async (request, response, next) => {
  try {
    const applicationId = Number.parseInt(request.params.id, 10);
    if (!Number.isFinite(applicationId) || applicationId <= 0) {
      throw new ApiError(400, "Invalid seller application id");
    }
    const parsed = statusUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid status payload", parsed.error.flatten());
    }

    await executeSql(
      "UPDATE seller_applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [parsed.data.status, applicationId],
    );
    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
