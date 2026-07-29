"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = optionalAuth;
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
exports.requireOneOfRoles = requireOneOfRoles;
const jwt_1 = require("../auth/jwt");
const pool_1 = require("../db/pool");
const errors_1 = require("../utils/errors");
function parseBearerToken(request) {
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
async function attachUserFromToken(request, token) {
    const payload = (0, jwt_1.verifyAuthToken)(token);
    const rows = await (0, pool_1.queryRows)("SELECT id, email, full_name, role, status FROM users WHERE id = ? LIMIT 1", [payload.sub]);
    const user = rows[0];
    if (!user || user.status !== "ACTIVE") {
        throw new errors_1.ApiError(401, "Invalid token user");
    }
    request.user = {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        status: user.status,
    };
}
async function optionalAuth(request, _response, next) {
    try {
        const token = parseBearerToken(request);
        if (token) {
            await attachUserFromToken(request, token);
        }
        next();
    }
    catch {
        next(new errors_1.ApiError(401, "Invalid or expired token"));
    }
}
async function requireAuth(request, _response, next) {
    const token = parseBearerToken(request);
    if (!token) {
        next(new errors_1.ApiError(401, "Authentication required"));
        return;
    }
    try {
        await attachUserFromToken(request, token);
        next();
    }
    catch {
        next(new errors_1.ApiError(401, "Invalid or expired token"));
    }
}
function requireRole(role) {
    return (request, _response, next) => {
        if (!request.user) {
            next(new errors_1.ApiError(401, "Authentication required"));
            return;
        }
        if (request.user.role !== role) {
            next(new errors_1.ApiError(403, "Forbidden"));
            return;
        }
        next();
    };
}
function requireOneOfRoles(roles) {
    return (request, _response, next) => {
        if (!request.user) {
            next(new errors_1.ApiError(401, "Authentication required"));
            return;
        }
        if (!roles.includes(request.user.role)) {
            next(new errors_1.ApiError(403, "Forbidden"));
            return;
        }
        next();
    };
}
