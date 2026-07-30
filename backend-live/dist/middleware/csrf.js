"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSameOrigin = requireSameOrigin;
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
function requireSameOrigin(request, _response, next) {
    if (["GET", "HEAD", "OPTIONS"].includes(request.method))
        return next();
    const origin = request.header("origin");
    if (!origin || !env_1.frontendOrigins.has(origin))
        return next(new errors_1.ApiError(403, "Request origin is not allowed"));
    return next();
}
