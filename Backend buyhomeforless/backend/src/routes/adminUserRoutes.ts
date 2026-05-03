import { Router } from "express";
import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { executeSql, queryRows } from "../db/pool";
import { requireAuth, requireOneOfRoles, requireRole } from "../middleware/auth";
import { ApiError } from "../utils/errors";
import { sanitizeEmail, sanitizePlainText } from "../utils/sanitize";

const employeeCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  fullName: z.string().min(1).max(80),
  role: z.enum(["ADMIN", "EMPLOYEE"]),
});

const employeeUpdateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).max(128).optional(),
  fullName: z.string().min(1).max(80).optional(),
  role: z.enum(["ADMIN", "EMPLOYEE"]).optional(),
  status: z.enum(["ACTIVE", "DISABLED"]).optional(),
});

const accountSettingsSchema = z
  .object({
    currentPassword: z.string().min(1),
    fullName: z.string().min(1).max(80).optional(),
    newEmail: z.string().email().optional(),
    newPassword: z.string().min(8).max(128).optional(),
  })
  .refine((value) => Boolean(value.fullName || value.newEmail || value.newPassword), {
    message: "Provide at least one field to update",
    path: ["fullName"],
  });

const headAdminCredentialSchema = z
  .object({
    currentPassword: z.string().min(1),
    newEmail: z.string().email().optional(),
    newPassword: z.string().min(8).max(128).optional(),
  })
  .refine((value) => Boolean(value.newEmail || value.newPassword), {
    message: "Provide newEmail or newPassword",
    path: ["newEmail"],
  });

async function verifyCurrentPassword(userId: number, currentPassword: string) {
  const rows = await queryRows<
    (RowDataPacket & { id: number; password_hash: string; role: "HEAD_ADMIN" | "ADMIN" | "EMPLOYEE" })[]
  >("SELECT id, password_hash, role FROM users WHERE id = ? LIMIT 1", [userId]);

  const user = rows[0];
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    throw new ApiError(401, "Current password is incorrect");
  }

  return user;
}

export const adminUserRoutes = Router();
adminUserRoutes.use(requireAuth, requireOneOfRoles(["HEAD_ADMIN", "ADMIN", "EMPLOYEE"]));

adminUserRoutes.get("/registered-users", async (_request, response, next) => {
  try {
    const rows = await queryRows<
      (RowDataPacket & {
        id: number;
        full_name: string;
        email: string;
        role: "HEAD_ADMIN" | "ADMIN" | "EMPLOYEE";
        status: "ACTIVE" | "DISABLED";
        created_at: string;
      })[]
    >(
      `SELECT id, full_name, email, role, status, created_at
       FROM users
       ORDER BY created_at DESC`,
    );

    response.json({ total: rows.length, items: rows });
  } catch (error) {
    next(error);
  }
});

adminUserRoutes.get("/employees", async (_request, response, next) => {
  try {
    const rows = await queryRows<
      (RowDataPacket & {
        id: number;
        email: string;
        full_name: string;
        role: "HEAD_ADMIN" | "ADMIN" | "EMPLOYEE";
        status: "ACTIVE" | "DISABLED";
        created_at: string;
      })[]
    >(
      `SELECT id, email, full_name, role, status, created_at
       FROM users
       WHERE role IN ('HEAD_ADMIN', 'ADMIN', 'EMPLOYEE')
       ORDER BY FIELD(role, 'HEAD_ADMIN', 'ADMIN', 'EMPLOYEE'), id ASC`,
    );
    response.json({ total: rows.length, items: rows });
  } catch (error) {
    next(error);
  }
});

adminUserRoutes.post("/employees", requireRole("HEAD_ADMIN"), async (request, response, next) => {
  try {
    const parsed = employeeCreateSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid employee payload", parsed.error.flatten());
    }
    const email = sanitizeEmail(parsed.data.email);
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await executeSql(
      `INSERT INTO users (email, password_hash, full_name, role, status)
       VALUES (?, ?, ?, ?, 'ACTIVE')`,
      [email, passwordHash, sanitizePlainText(parsed.data.fullName, 80), parsed.data.role],
    );
    response.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
});

adminUserRoutes.patch("/employees/:id", requireRole("HEAD_ADMIN"), async (request, response, next) => {
  try {
    const employeeId = Number.parseInt(request.params.id, 10);
    if (!Number.isFinite(employeeId) || employeeId <= 0) {
      throw new ApiError(400, "Invalid employee id");
    }

    const parsed = employeeUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid employee update payload", parsed.error.flatten());
    }

    const data = parsed.data;
    const sets: string[] = [];
    const values: unknown[] = [];

    if (data.email) {
      sets.push("email = ?");
      values.push(sanitizeEmail(data.email));
    }
    if (data.fullName) {
      sets.push("full_name = ?");
      values.push(sanitizePlainText(data.fullName, 80));
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
      values.push(await bcrypt.hash(data.password, 12));
    }

    if (!sets.length) {
      throw new ApiError(400, "No update fields provided");
    }

    values.push(employeeId);
    await executeSql(`UPDATE users SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND role <> 'HEAD_ADMIN'`, values);
    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

adminUserRoutes.delete("/employees/:id", requireRole("HEAD_ADMIN"), async (request, response, next) => {
  try {
    const employeeId = Number.parseInt(request.params.id, 10);
    if (!Number.isFinite(employeeId) || employeeId <= 0) {
      throw new ApiError(400, "Invalid employee id");
    }
    await executeSql("DELETE FROM users WHERE id = ? AND role <> 'HEAD_ADMIN'", [employeeId]);
    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

adminUserRoutes.patch("/account-settings", async (request, response, next) => {
  try {
    const parsed = accountSettingsSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid account settings payload", parsed.error.flatten());
    }

    const current = await verifyCurrentPassword(request.user!.id, parsed.data.currentPassword);

    const sets: string[] = [];
    const values: unknown[] = [];

    if (parsed.data.fullName) {
      sets.push("full_name = ?");
      values.push(sanitizePlainText(parsed.data.fullName, 80));
    }
    if (parsed.data.newEmail) {
      sets.push("email = ?");
      values.push(sanitizeEmail(parsed.data.newEmail));
    }
    if (parsed.data.newPassword) {
      sets.push("password_hash = ?");
      values.push(await bcrypt.hash(parsed.data.newPassword, 12));
    }

    values.push(current.id);
    await executeSql(`UPDATE users SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

adminUserRoutes.patch("/head-admin/credentials", requireRole("HEAD_ADMIN"), async (request, response, next) => {
  try {
    const parsed = headAdminCredentialSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid credentials payload", parsed.error.flatten());
    }

    const current = await verifyCurrentPassword(request.user!.id, parsed.data.currentPassword);
    if (current.role !== "HEAD_ADMIN") {
      throw new ApiError(403, "Forbidden");
    }

    const sets: string[] = [];
    const values: unknown[] = [];

    if (parsed.data.newEmail) {
      sets.push("email = ?");
      values.push(sanitizeEmail(parsed.data.newEmail));
    }
    if (parsed.data.newPassword) {
      sets.push("password_hash = ?");
      values.push(await bcrypt.hash(parsed.data.newPassword, 12));
    }

    values.push(request.user!.id);
    await executeSql(`UPDATE users SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
