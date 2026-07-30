"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbPool = void 0;
exports.queryRows = queryRows;
exports.executeSql = executeSql;
exports.withTransaction = withTransaction;
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
    queueLimit: 50,
    connectTimeout: env_1.env.DB_CONNECT_TIMEOUT_MS,
    charset: "utf8mb4",
});
async function queryRows(sql, params = []) {
    const [rows] = await exports.dbPool.query({ sql, timeout: env_1.env.DB_QUERY_TIMEOUT_MS }, params);
    return rows;
}
async function executeSql(sql, params = []) {
    const [result] = await exports.dbPool.query({ sql, timeout: env_1.env.DB_QUERY_TIMEOUT_MS }, params);
    return result;
}
/** Keeps related authoring writes atomic without making filesystem work part of the DB transaction. */
async function withTransaction(work) {
    const connection = await exports.dbPool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await work(connection);
        await connection.commit();
        return result;
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
}
