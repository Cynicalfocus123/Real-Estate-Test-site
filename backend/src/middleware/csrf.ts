import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/errors";

export function requireSameOrigin(request: Request, _response: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return next();
  const origin = request.header("origin");
  if (origin !== env.PUBLIC_SITE_ORIGIN) return next(new ApiError(403, "Request origin is not allowed"));
  return next();
}
