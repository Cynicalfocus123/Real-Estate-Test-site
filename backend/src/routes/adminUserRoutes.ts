import { Router } from "express";
import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { executeSql, queryRows, withTransaction } from "../db/pool";
import { revokeSessions } from "../auth/sessions";
import { requireAuth, requireOneOfRoles, requireRole } from "../middleware/auth";
import { requireSameOrigin } from "../middleware/csrf";
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
adminUserRoutes.use(requireAuth, requireOneOfRoles(["HEAD_ADMIN", "ADMIN", "EMPLOYEE"]), requireSameOrigin);

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
    const values: (string | number)[] = [];

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
    await withTransaction(async (connection) => {
      await connection.execute(`UPDATE users SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND role <> 'HEAD_ADMIN'`, values);
      if (data.status === "DISABLED" || data.password) await revokeSessions(connection, "staff", employeeId);
    });
    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

adminUserRoutes.get("/customers", async (request, response, next) => {
  try {
    const query = z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(25), status: z.enum(["PENDING_VERIFICATION", "ACTIVE", "DISABLED", "DELETED"]).optional(), q: z.string().max(190).optional() }).parse(request.query);
    const filters: string[] = []; const values: (string | number)[] = [];
    if (query.status) { filters.push("c.status = ?"); values.push(query.status); }
    if (query.q?.trim()) { filters.push("(c.email LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)"); const term = `%${sanitizePlainText(query.q, 190)}%`; values.push(term, term, term); }
    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const rows = await queryRows<(RowDataPacket & { id:number; email:string; first_name:string; last_name:string; status:string; email_verified_at:string|null; created_at:string; last_login_at:string|null; favorite_count:number })[]>(`SELECT c.id,c.email,c.first_name,c.last_name,c.status,c.email_verified_at,c.created_at,c.last_login_at,COUNT(f.listing_id) AS favorite_count FROM customer_accounts c LEFT JOIN customer_favorites f ON f.customer_id=c.id ${where} GROUP BY c.id ORDER BY c.created_at DESC LIMIT ? OFFSET ?`, [...values, query.pageSize, (query.page - 1) * query.pageSize]);
    const count = await queryRows<(RowDataPacket & { total:number })[]>(`SELECT COUNT(*) AS total FROM customer_accounts c ${where}`, values);
    response.json({ items: rows.map((row) => ({ id:row.id,email:row.email,firstName:row.first_name,lastName:row.last_name,status:row.status,emailVerifiedAt:row.email_verified_at,createdAt:row.created_at,lastLoginAt:row.last_login_at,favoriteCount:Number(row.favorite_count) })), pagination:{page:query.page,pageSize:query.pageSize,total:Number(count[0]?.total ?? 0)} });
  } catch (error) { next(error); }
});

adminUserRoutes.patch("/customers/:id", requireOneOfRoles(["HEAD_ADMIN", "ADMIN"]), async (request, response, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(request.params.id); const data = z.object({ firstName:z.string().min(1).max(80).optional(), lastName:z.string().min(1).max(80).optional(), phone:z.string().max(40).nullable().optional(), status:z.enum(["ACTIVE","DISABLED"]).optional() }).strict().parse(request.body);
    const sets:string[]=[]; const values:(string|number|null)[]=[]; if(data.firstName!==undefined){sets.push("first_name=?");values.push(sanitizePlainText(data.firstName,80));} if(data.lastName!==undefined){sets.push("last_name=?");values.push(sanitizePlainText(data.lastName,80));} if(data.phone!==undefined){sets.push("phone=?");values.push(data.phone===null?null:sanitizePlainText(data.phone,40));} if(data.status!==undefined){sets.push("status=?");values.push(data.status);} if(!sets.length) throw new ApiError(400,"No customer changes supplied");
    await withTransaction(async(connection)=>{await connection.execute(`UPDATE customer_accounts SET ${sets.join(",")},updated_at=CURRENT_TIMESTAMP WHERE id=?`,[...values,id]);if(data.status==="DISABLED")await revokeSessions(connection,"customer",id);}); response.json({ok:true});
  } catch (error) { next(error); }
});

adminUserRoutes.post("/customers/:id/revoke-sessions", requireOneOfRoles(["HEAD_ADMIN", "ADMIN"]), async (request,response,next)=>{try{const id=z.coerce.number().int().positive().parse(request.params.id);await withTransaction(connection=>revokeSessions(connection,"customer",id));response.json({ok:true});}catch(error){next(error);}});
adminUserRoutes.delete("/customers/:id", requireRole("HEAD_ADMIN"), async (request,response,next)=>{try{const id=z.coerce.number().int().positive().parse(request.params.id);await executeSql("UPDATE customer_accounts SET status='DELETED',email=CONCAT('deleted-',id,'-',email),password_hash='' WHERE id=?",[id]);response.json({ok:true});}catch(error){next(error);}});

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
