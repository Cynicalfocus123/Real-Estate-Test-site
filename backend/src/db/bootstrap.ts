import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2/promise";
import { env } from "../config/env";
import { executeSql, queryRows } from "./pool";

type HeadAdminCountRow = RowDataPacket & { count: number };

export async function ensureHeadAdmin() {
  if (!env.HEAD_ADMIN_EMAIL || !env.HEAD_ADMIN_PASSWORD) {
    return;
  }

  const rows = await queryRows<HeadAdminCountRow[]>(
    "SELECT COUNT(*) AS count FROM users WHERE role = 'HEAD_ADMIN'",
  );
  if (rows[0]?.count > 0) {
    return;
  }

  const passwordHash = await bcrypt.hash(env.HEAD_ADMIN_PASSWORD, 12);
  await executeSql(
    `INSERT INTO users (email, password_hash, full_name, role, status)
     VALUES (?, ?, ?, 'HEAD_ADMIN', 'ACTIVE')`,
    [env.HEAD_ADMIN_EMAIL.toLowerCase(), passwordHash, env.HEAD_ADMIN_NAME ?? "Head Admin"],
  );
}
