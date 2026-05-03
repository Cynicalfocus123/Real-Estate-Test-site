import mysql from "mysql2/promise";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { env } from "../config/env";

export const dbPool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  charset: "utf8mb4",
});

export async function queryRows<T extends RowDataPacket[]>(sql: string, params: unknown[] = []) {
  const [rows] = await dbPool.query<T>(sql, params);
  return rows;
}

export async function executeSql(sql: string, params: unknown[] = []) {
  const [result] = await dbPool.query<ResultSetHeader>(sql, params);
  return result;
}
