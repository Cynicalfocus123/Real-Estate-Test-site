"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbPool = void 0;
exports.queryRows = queryRows;
exports.executeSql = executeSql;
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("../config/env");
exports.dbPool = promise_1.default.createPool({
    host: env_1.env.DB_HOST,
    port: env_1.env.DB_PORT,
    user: env_1.env.DB_USER,
    password: env_1.env.DB_PASSWORD,
    database: env_1.env.DB_NAME,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    charset: "utf8mb4",
});
async function queryRows(sql, params = []) {
    const [rows] = await exports.dbPool.query(sql, params);
    return rows;
}
async function executeSql(sql, params = []) {
    const [result] = await exports.dbPool.query(sql, params);
    return result;
}
