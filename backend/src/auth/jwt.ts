import jwt from "jsonwebtoken";
import type { UserRole } from "@prisma/client";
import { env } from "../config/env";

type TokenPayload = {
  userId: string;
  role: UserRole;
};

export function signAuthToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "7d",
    issuer: "buy-home-for-less",
    audience: "buy-home-for-less-web",
  });
}

export function verifyAuthToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: "buy-home-for-less",
      audience: "buy-home-for-less-web",
    });

    if (!decoded || typeof decoded !== "object") return null;
    const userId = typeof decoded.userId === "string" ? decoded.userId : null;
    const role = decoded.role === "ADMIN" ? "ADMIN" : decoded.role === "USER" ? "USER" : null;
    if (!userId || !role) return null;
    return { userId, role };
  } catch {
    return null;
  }
}

export function extractBearerToken(authorizationHeader?: string): string | null {
  if (!authorizationHeader) return null;
  const [scheme, value] = authorizationHeader.split(" ");
  if (!scheme || !value) return null;
  if (scheme.toLowerCase() !== "bearer") return null;
  return value.trim() || null;
}

