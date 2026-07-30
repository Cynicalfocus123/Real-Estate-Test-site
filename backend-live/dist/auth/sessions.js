"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionLifetimeMs = exports.STAFF_COOKIE = exports.CUSTOMER_COOKIE = void 0;
exports.tokenHash = tokenHash;
exports.randomToken = randomToken;
exports.expiryDate = expiryDate;
exports.readCookie = readCookie;
exports.setSessionCookie = setSessionCookie;
exports.clearSessionCookie = clearSessionCookie;
exports.createSession = createSession;
exports.revokeSessions = revokeSessions;
exports.noStore = noStore;
const node_crypto_1 = __importDefault(require("node:crypto"));
const env_1 = require("../config/env");
exports.CUSTOMER_COOKIE = "bhfl_customer_session";
exports.STAFF_COOKIE = "bhfl_staff_session";
const SESSION_DAYS = 14;
function tokenHash(token) { return node_crypto_1.default.createHash("sha256").update(token).digest("hex"); }
function randomToken() { return node_crypto_1.default.randomBytes(32).toString("base64url"); }
function expiryDate() { return new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000); }
function readCookie(header, name) {
    return header?.split(";").map((entry) => entry.trim()).find((entry) => entry.startsWith(`${name}=`))?.slice(name.length + 1) || null;
}
function setSessionCookie(response, cookieName, token) {
    response.cookie(cookieName, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", expires: expiryDate() });
}
function clearSessionCookie(response, cookieName) {
    response.clearCookie(cookieName, { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
}
async function createSession(connection, kind, accountId) {
    const token = randomToken();
    const table = kind === "customer" ? "customer_sessions" : "staff_sessions";
    const idColumn = kind === "customer" ? "customer_id" : "user_id";
    await connection.execute(`INSERT INTO ${table} (${idColumn}, token_hash, expires_at) VALUES (?, ?, ?)`, [accountId, tokenHash(token), expiryDate()]);
    return token;
}
async function revokeSessions(connection, kind, accountId, exceptHash) {
    const table = kind === "customer" ? "customer_sessions" : "staff_sessions";
    const idColumn = kind === "customer" ? "customer_id" : "user_id";
    const suffix = exceptHash ? " AND token_hash <> ?" : "";
    await connection.execute(`UPDATE ${table} SET revoked_at = CURRENT_TIMESTAMP WHERE ${idColumn} = ? AND revoked_at IS NULL${suffix}`, exceptHash ? [accountId, exceptHash] : [accountId]);
}
function noStore(response) { response.setHeader("Cache-Control", "no-store"); }
exports.sessionLifetimeMs = SESSION_DAYS * 24 * 60 * 60 * 1000;
void env_1.env;
