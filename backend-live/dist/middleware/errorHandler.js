"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
function notFoundHandler(_request, response) {
    response.status(404).json({ error: "Route not found" });
}
function errorHandler(error, request, response, _next) {
    if ((0, errors_1.isApiError)(error)) {
        response.status(error.statusCode).json({
            error: error.message,
            details: error.details,
        });
        return;
    }
    if (error instanceof zod_1.ZodError) {
        response.status(400).json({
            error: "Validation failed",
            details: error.flatten(),
        });
        return;
    }
    if (typeof error === "object" && error && "code" in error && error.code === "ER_DUP_ENTRY") {
        response.status(409).json({ error: "Duplicate value conflict" });
        return;
    }
    // Keep internal details out of API responses and logs.
    console.error(JSON.stringify({ event: "request_error", requestId: response.getHeader("x-request-id"), method: request.method, path: request.path, errorType: error instanceof Error ? error.name : "unknown" }));
    response.status(500).json({ error: "Internal server error" });
}
