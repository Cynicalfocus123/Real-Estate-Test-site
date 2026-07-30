import mysql from "mysql2/promise";
import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { env } from "../config/env";

export const dbPool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 50,
  connectTimeout: env.DB_CONNECT_TIMEOUT_MS,
  charset: "utf8mb4",
});

export async function queryRows<T extends RowDataPacket[]>(sql: string, params: unknown[] = []) {
  const [rows] = await dbPool.query<T>({ sql, timeout: env.DB_QUERY_TIMEOUT_MS }, params);
  return rows;
}

export async function executeSql(sql: string, params: unknown[] = []) {
  const [result] = await dbPool.query<ResultSetHeader>({ sql, timeout: env.DB_QUERY_TIMEOUT_MS }, params);
  return result;
}

/** Keeps related authoring writes atomic without making filesystem work part of the DB transaction. */
export async function withTransaction<T>(work: (connection: PoolConnection) => Promise<T>) {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
