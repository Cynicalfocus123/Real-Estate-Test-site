import type { NextFunction, Request, Response } from "express";
import type { RowDataPacket } from "mysql2/promise";
import { CUSTOMER_COOKIE, readCookie, tokenHash } from "../auth/sessions";
import { queryRows } from "../db/pool";
import { ApiError } from "../utils/errors";

export async function requireCustomer(request: Request, _response: Response, next: NextFunction) {
  try {
    const token = readCookie(request.header("cookie"), CUSTOMER_COOKIE); if (!token) return next(new ApiError(401, "Authentication required"));
    const rows = await queryRows<(RowDataPacket & { id:number; email:string; first_name:string; last_name:string; status:"PENDING_VERIFICATION"|"ACTIVE"|"DISABLED"|"DELETED" })[]>(
      `SELECT c.id,c.email,c.first_name,c.last_name,c.status FROM customer_sessions s JOIN customer_accounts c ON c.id=s.customer_id
       WHERE s.token_hash=? AND s.revoked_at IS NULL AND s.expires_at>CURRENT_TIMESTAMP LIMIT 1`, [tokenHash(token)]);
    const customer=rows[0]; if (!customer || customer.status !== "ACTIVE") return next(new ApiError(401,"Authentication required"));
    request.customer={id:customer.id,email:customer.email,firstName:customer.first_name,lastName:customer.last_name,status:customer.status}; return next();
  } catch { return next(new ApiError(401,"Authentication required")); }
}
