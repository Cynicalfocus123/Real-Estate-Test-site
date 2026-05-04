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
      (full_name, phone, email, property_type, location, message, status)
      VALUES (?, ?, ?, ?, ?, ?, 'NEW')`,
      [
        sanitizePlainText(data.fullName, 120),
        sanitizePlainText(data.phone, 40),
        sanitizeEmail(data.email),
        data.propertyType ? sanitizePlainText(data.propertyType, 120) : null,
        sanitizePlainText(data.location, 255),
        data.message ? sanitizePlainText(data.message, 5000) : null,
      ],
    );
    response.status(201).json({ id: Number(result.insertId), status: "NEW" });
  } catch (error) {
    next(error);
  }
});

sellerApplicationAdminRoutes.use(requireAuth, requireOneOfRoles(["HEAD_ADMIN", "ADMIN", "EMPLOYEE"]));

sellerApplicationAdminRoutes.get("/seller-applications", async (_request, response, next) => {
  try {
    const rows = await queryRows<
      (RowDataPacket & {
        id: number;
        full_name: string;
        phone: string;
        email: string;
        property_type: string | null;
        location: string;
        message: string | null;
        status: string;
        created_at: string;
      })[]
    >(
      `SELECT id, full_name, phone, email, property_type, location, message, status, created_at
       FROM seller_applications
       ORDER BY created_at DESC`,
    );
    response.json({ total: rows.length, items: rows });
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
