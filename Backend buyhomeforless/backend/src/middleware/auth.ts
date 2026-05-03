import type { NextFunction, Request, Response } from "express";
import type { RowDataPacket } from "mysql2/promise";
import { verifyAuthToken } from "../auth/jwt";
import { queryRows } from "../db/pool";
import type { AdminRole } from "../db/types";
import { ApiError } from "../utils/errors";

function parseBearerToken(request: Request) {
  const header = request.headers.authorization;
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }
  return token;
}

async function attachUserFromToken(request: Request, token: string) {
  const payload = verifyAuthToken(token);
  const rows = await queryRows<
    (RowDataPacket & {
      id: number;
      email: string;
      full_name: string;
      role: AdminRole;
      status: "ACTIVE" | "DISABLED";
    })[]
  >("SELECT id, email, full_name, role, status FROM users WHERE id = ? LIMIT 1", [payload.sub]);
  const user = rows[0];
  if (!user || user.status !== "ACTIVE") {
    throw new ApiError(401, "Invalid token user");
  }
  request.user = {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    status: user.status,
  };
}

export async function optionalAuth(request: Request, _response: Response, next: NextFunction) {
  try {
    const token = parseBearerToken(request);
    if (token) {
      await attachUserFromToken(request, token);
    }
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
}

export async function requireAuth(request: Request, _response: Response, next: NextFunction) {
  const token = parseBearerToken(request);
  if (!token) {
    next(new ApiError(401, "Authentication required"));
    return;
  }
  try {
    await attachUserFromToken(request, token);
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
}

export function requireRole(role: AdminRole) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.user) {
      next(new ApiError(401, "Authentication required"));
      return;
    }
    if (request.user.role !== role) {
      next(new ApiError(403, "Forbidden"));
      return;
    }
    next();
  };
}

export function requireOneOfRoles(roles: AdminRole[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.user) {
      next(new ApiError(401, "Authentication required"));
      return;
    }
    if (!roles.includes(request.user.role)) {
      next(new ApiError(403, "Forbidden"));
      return;
    }
    next();
  };
}
