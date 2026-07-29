"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAuthToken = signAuthToken;
exports.verifyAuthToken = verifyAuthToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function signAuthToken(user) {
    const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
    };
    const secret = env_1.env.JWT_SECRET;
    const options = {
        expiresIn: env_1.env.JWT_EXPIRES_IN,
    };
    return jsonwebtoken_1.default.sign(payload, secret, options);
}
function verifyAuthToken(token) {
    const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
    if (!decoded || typeof decoded !== "object") {
        throw new Error("Invalid token payload");
    }
    const payload = decoded;
    if (!payload.sub || !payload.email || !payload.role) {
        throw new Error("Invalid token payload");
    }
    return {
        sub: typeof payload.sub === "string" ? Number(payload.sub) : payload.sub,
        email: payload.email,
        role: payload.role,
    };
}
