"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCustomer = requireCustomer;
const sessions_1 = require("../auth/sessions");
const pool_1 = require("../db/pool");
const errors_1 = require("../utils/errors");
async function requireCustomer(request, _response, next) {
    try {
        const token = (0, sessions_1.readCookie)(request.header("cookie"), sessions_1.CUSTOMER_COOKIE);
        if (!token)
            return next(new errors_1.ApiError(401, "Authentication required"));
        const rows = await (0, pool_1.queryRows)(`SELECT c.id,c.email,c.first_name,c.last_name,c.status FROM customer_sessions s JOIN customer_accounts c ON c.id=s.customer_id
       WHERE s.token_hash=? AND s.revoked_at IS NULL AND s.expires_at>CURRENT_TIMESTAMP LIMIT 1`, [(0, sessions_1.tokenHash)(token)]);
        const customer = rows[0];
        if (!customer || customer.status !== "ACTIVE")
            return next(new errors_1.ApiError(401, "Authentication required"));
        request.customer = { id: customer.id, email: customer.email, firstName: customer.first_name, lastName: customer.last_name, status: customer.status };
        return next();
    }
    catch {
        return next(new errors_1.ApiError(401, "Authentication required"));
    }
}
