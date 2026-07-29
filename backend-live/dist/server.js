"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("node:fs/promises"));
const app_1 = require("./app");
const env_1 = require("./config/env");
const pool_1 = require("./db/pool");
async function start() {
    await promises_1.default.mkdir(env_1.env.UPLOAD_DIR_ABSOLUTE, { recursive: true });
    await pool_1.dbPool.query("SELECT 1");
    const server = app_1.app.listen(env_1.env.PORT, "0.0.0.0", () => console.log(`Buy Home For Less API listening on port ${env_1.env.PORT}`));
    const shutdown = async () => { server.close(); await pool_1.dbPool.end(); };
    process.once("SIGTERM", shutdown);
    process.once("SIGINT", shutdown);
}
start().catch(() => { process.exitCode = 1; });
