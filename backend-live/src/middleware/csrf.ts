import type { NextFunction, Request, Response } from "express";
import { frontendOrigins } from "../config/env";
import { ApiError } from "../utils/errors";

export function requireSameOrigin(request: Request, _response: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return next();
  const origin = request.header("origin");
  if (!origin || !frontendOrigins.has(origin)) return next(new ApiError(403, "Request origin is not allowed"));
  return next();
}
