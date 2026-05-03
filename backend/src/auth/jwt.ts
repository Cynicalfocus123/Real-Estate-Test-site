import jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import type { AdminRole } from "../db/types";

type AuthTokenPayload = {
  sub: number;
  email: string;
  role: AdminRole;
};

export function signAuthToken(user: { id: number; email: string; role: AdminRole }): string {
  const payload: AuthTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
  const secret: Secret = env.JWT_SECRET;
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, secret, options);
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (!decoded || typeof decoded !== "object") {
    throw new Error("Invalid token payload");
  }
  const payload = decoded as jwt.JwtPayload & {
    sub?: string | number;
    email?: string;
    role?: AdminRole;
  };
  if (!payload.sub || !payload.email || !payload.role) {
    throw new Error("Invalid token payload");
  }
  return {
    sub: typeof payload.sub === "string" ? Number(payload.sub) : payload.sub,
    email: payload.email,
    role: payload.role,
  };
}
