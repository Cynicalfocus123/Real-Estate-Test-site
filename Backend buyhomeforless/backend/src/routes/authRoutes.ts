import { Router } from "express";
import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { signAuthToken } from "../auth/jwt";
import { optionalAuth, requireAuth } from "../middleware/auth";
import { executeSql, queryRows } from "../db/pool";
import { sanitizeEmail, sanitizePlainText } from "../utils/sanitize";
import { ApiError } from "../utils/errors";

export const authRoutes = Router();
authRoutes.use(optionalAuth);

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  fullName: z.string().min(1).max(80),
  role: z.enum(["ADMIN", "EMPLOYEE"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRoutes.post("/register", async (request, response, next) => {
  try {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid register payload", parsed.error.flatten());
    }

    const rows = await queryRows<(RowDataPacket & { count: number })[]>(
      "SELECT COUNT(*) AS count FROM users WHERE role = 'HEAD_ADMIN'",
    );
    const headAdminExists = rows[0]?.count > 0;
    const email = sanitizeEmail(parsed.data.email);
    const fullName = sanitizePlainText(parsed.data.fullName, 80);
    const requestedRole = parsed.data.role ?? "EMPLOYEE";

    if (headAdminExists) {
      if (!request.user || request.user.role !== "HEAD_ADMIN") {
        throw new ApiError(403, "Only head admin can register new users after bootstrap");
      }
    }

    const roleToCreate = headAdminExists ? requestedRole : "HEAD_ADMIN";
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    await executeSql(
      "INSERT INTO users (email, password_hash, full_name, role, status) VALUES (?, ?, ?, ?, 'ACTIVE')",
      [email, passwordHash, fullName, roleToCreate],
    );

    const created = await queryRows<
      (RowDataPacket & { id: number; email: string; full_name: string; role: "HEAD_ADMIN" | "ADMIN" | "EMPLOYEE" })[]
    >("SELECT id, email, full_name, role FROM users WHERE email = ? LIMIT 1", [email]);
    const user = created[0];
    const token = signAuthToken({
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
  } catch (error) {
    next(error);
  }
});

authRoutes.post("/login", async (request, response, next) => {
  try {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid login payload", parsed.error.flatten());
    }

    const email = sanitizeEmail(parsed.data.email);
    const users = await queryRows<
      (RowDataPacket & {
        id: number;
        email: string;
        full_name: string;
        role: "HEAD_ADMIN" | "ADMIN" | "EMPLOYEE";
        status: "ACTIVE" | "DISABLED";
        password_hash: string;
      })[]
    >("SELECT id, email, full_name, role, status, password_hash FROM users WHERE email = ? LIMIT 1", [email]);
    const user = users[0];
    if (!user || user.status !== "ACTIVE") {
      throw new ApiError(401, "Invalid email or password");
    }

    const isMatch = await bcrypt.compare(parsed.data.password, user.password_hash);
    if (!isMatch) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = signAuthToken({
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
  } catch (error) {
    next(error);
  }
});

authRoutes.get("/me", requireAuth, (request, response) => {
  response.json({ user: request.user });
});
