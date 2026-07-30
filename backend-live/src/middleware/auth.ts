import type { NextFunction, Request, Response } from "express";
import type { RowDataPacket } from "mysql2/promise";
import { readCookie, STAFF_COOKIE, tokenHash } from "../auth/sessions";
import { queryRows } from "../db/pool";
import type { AdminRole } from "../db/types";
import { ApiError } from "../utils/errors";

async function attachStaff(request: Request) {
  const raw = readCookie(request.header("cookie"), STAFF_COOKIE); if (!raw) return false;
  const rows = await queryRows<(RowDataPacket & { id: number; email: string; full_name: string; role: AdminRole; status: "ACTIVE" | "DISABLED" })[]>(
    `SELECT u.id, u.email, u.full_name, u.role, u.status FROM staff_sessions s JOIN users u ON u.id=s.user_id
     WHERE s.token_hash=? AND s.revoked_at IS NULL AND s.expires_at>CURRENT_TIMESTAMP LIMIT 1`, [tokenHash(raw)]);
  const user = rows[0]; if (!user || user.status !== "ACTIVE") return false;
  request.user = { id: user.id, email: user.email, fullName: user.full_name, role: user.role, status: user.status }; return true;
}
export async function optionalAuth(request: Request, _response: Response, next: NextFunction) { try { await attachStaff(request); next(); } catch { next(new ApiError(401, "Authentication required")); } }
export async function requireAuth(request: Request, _response: Response, next: NextFunction) { try { if (!(await attachStaff(request))) return next(new ApiError(401, "Authentication required")); return next(); } catch { return next(new ApiError(401, "Authentication required")); } }
export function requireRole(role: AdminRole) { return (request: Request, _response: Response, next: NextFunction) => !request.user ? next(new ApiError(401, "Authentication required")) : request.user.role !== role ? next(new ApiError(403, "Forbidden")) : next(); }
export function requireOneOfRoles(roles: AdminRole[]) { return (request: Request, _response: Response, next: NextFunction) => !request.user ? next(new ApiError(401, "Authentication required")) : !roles.includes(request.user.role) ? next(new ApiError(403, "Forbidden")) : next(); }
