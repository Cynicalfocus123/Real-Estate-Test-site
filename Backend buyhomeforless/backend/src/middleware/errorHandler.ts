import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { isApiError } from "../utils/errors";

export function notFoundHandler(_request: Request, response: Response) {
  response.status(404).json({ error: "Route not found" });
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (isApiError(error)) {
    response.status(error.statusCode).json({
      error: error.message,
      details: error.details,
    });
    return;
  }
  if (error instanceof ZodError) {
    response.status(400).json({
      error: "Validation failed",
      details: error.flatten(),
    });
    return;
  }
  if (typeof error === "object" && error && "code" in error && (error as { code?: string }).code === "ER_DUP_ENTRY") {
    response.status(409).json({ error: "Duplicate value conflict" });
    return;
  }

  // Keep internal details out of API responses.
  console.error(error);
  response.status(500).json({ error: "Internal server error" });
}
