"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = optionalAuth;
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
exports.requireOneOfRoles = requireOneOfRoles;
const sessions_1 = require("../auth/sessions");
const pool_1 = require("../db/pool");
const errors_1 = require("../utils/errors");
async function attachStaff(request) {
    const raw = (0, sessions_1.readCookie)(request.header("cookie"), sessions_1.STAFF_COOKIE);
    if (!raw)
        return false;
    const rows = await (0, pool_1.queryRows)(`SELECT u.id, u.email, u.full_name, u.role, u.status FROM staff_sessions s JOIN users u ON u.id=s.user_id
     WHERE s.token_hash=? AND s.revoked_at IS NULL AND s.expires_at>CURRENT_TIMESTAMP LIMIT 1`, [(0, sessions_1.tokenHash)(raw)]);
    const user = rows[0];
    if (!user || user.status !== "ACTIVE")
        return false;
    request.user = { id: user.id, email: user.email, fullName: user.full_name, role: user.role, status: user.status };
    return true;
}
async function optionalAuth(request, _response, next) { try {
    await attachStaff(request);
    next();
}
catch {
    next(new errors_1.ApiError(401, "Authentication required"));
} }
async function requireAuth(request, _response, next) { try {
    if (!(await attachStaff(request)))
        return next(new errors_1.ApiError(401, "Authentication required"));
    return next();
}
catch {
    return next(new errors_1.ApiError(401, "Authentication required"));
} }
function requireRole(role) { return (request, _response, next) => !request.user ? next(new errors_1.ApiError(401, "Authentication required")) : request.user.role !== role ? next(new errors_1.ApiError(403, "Forbidden")) : next(); }
function requireOneOfRoles(roles) { return (request, _response, next) => !request.user ? next(new errors_1.ApiError(401, "Authentication required")) : !roles.includes(request.user.role) ? next(new errors_1.ApiError(403, "Forbidden")) : next(); }
