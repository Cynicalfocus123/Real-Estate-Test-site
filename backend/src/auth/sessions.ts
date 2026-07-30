import crypto from "node:crypto";
import type { Response } from "express";
import type { PoolConnection } from "mysql2/promise";
import { env } from "../config/env";

export const CUSTOMER_COOKIE = "bhfl_customer_session";
export const STAFF_COOKIE = "bhfl_staff_session";
const SESSION_DAYS = 14;

export function tokenHash(token: string) { return crypto.createHash("sha256").update(token).digest("hex"); }
export function randomToken() { return crypto.randomBytes(32).toString("base64url"); }
export function expiryDate() { return new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000); }
export function readCookie(header: string | undefined, name: string) {
  return header?.split(";").map((entry) => entry.trim()).find((entry) => entry.startsWith(`${name}=`))?.slice(name.length + 1) || null;
}
export function setSessionCookie(response: Response, cookieName: string, token: string) {
  response.cookie(cookieName, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", expires: expiryDate() });
}
export function clearSessionCookie(response: Response, cookieName: string) {
  response.clearCookie(cookieName, { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
}
export async function createSession(connection: PoolConnection, kind: "customer" | "staff", accountId: number) {
  const token = randomToken(); const table = kind === "customer" ? "customer_sessions" : "staff_sessions"; const idColumn = kind === "customer" ? "customer_id" : "user_id";
  await connection.execute(`INSERT INTO ${table} (${idColumn}, token_hash, expires_at) VALUES (?, ?, ?)`, [accountId, tokenHash(token), expiryDate()]);
  return token;
}
export async function revokeSessions(connection: PoolConnection, kind: "customer" | "staff", accountId: number, exceptHash?: string) {
  const table = kind === "customer" ? "customer_sessions" : "staff_sessions"; const idColumn = kind === "customer" ? "customer_id" : "user_id";
  const suffix = exceptHash ? " AND token_hash <> ?" : "";
  await connection.execute(`UPDATE ${table} SET revoked_at = CURRENT_TIMESTAMP WHERE ${idColumn} = ? AND revoked_at IS NULL${suffix}`, exceptHash ? [accountId, exceptHash] : [accountId]);
}
export function noStore(response: Response) { response.setHeader("Cache-Control", "no-store"); }
export const sessionLifetimeMs = SESSION_DAYS * 24 * 60 * 60 * 1000;
void env;
