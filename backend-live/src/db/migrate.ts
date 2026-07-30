import fs from "node:fs/promises";
import path from "node:path";
import type { RowDataPacket } from "mysql2/promise";
import { dbPool } from "./pool";

const migrationsDirectory = path.resolve(process.cwd(), "migrations");

/** Splits ordinary MySQL migration files without enabling multi-statements on the connection. */
export function splitSqlStatements(sql: string) {
  if (/^\s*DELIMITER\s+/im.test(sql)) throw new Error("DELIMITER directives are not supported in application migrations");
  const statements: string[] = [];
  let start = 0;
  let quote: "'" | '"' | "`" | null = null;
  let lineComment = false;
  let blockComment = false;
  for (let index = 0; index < sql.length; index += 1) {
    const current = sql[index];
    const next = sql[index + 1];
    if (lineComment) { if (current === "\n") lineComment = false; continue; }
    if (blockComment) { if (current === "*" && next === "/") { blockComment = false; index += 1; } continue; }
    if (quote) {
      if (current === "\\") { index += 1; continue; }
      if (current === quote) quote = null;
      continue;
    }
    if (current === "-" && next === "-" && /\s/.test(sql[index + 2] ?? "")) { lineComment = true; index += 1; continue; }
    if (current === "#") { lineComment = true; continue; }
    if (current === "/" && next === "*") { blockComment = true; index += 1; continue; }
    if (current === "'" || current === '"' || current === "`") { quote = current; continue; }
    if (current === ";") {
      const statement = sql.slice(start, index).trim();
      if (statement) statements.push(statement);
      start = index + 1;
    }
  }
  if (quote || blockComment) throw new Error("Migration contains an unterminated SQL literal or comment");
  const finalStatement = sql.slice(start).trim();
  if (finalStatement) statements.push(finalStatement);
  return statements;
}

export async function migrationFiles() {
  return (await fs.readdir(migrationsDirectory)).filter((name) => /^\d+_[a-z0-9-]+\.sql$/i.test(name)).sort();
}

export async function migrationStatus() {
  await dbPool.query("CREATE TABLE IF NOT EXISTS schema_migrations (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, migration_name VARCHAR(190) NOT NULL UNIQUE, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
  const [rows] = await dbPool.query<(RowDataPacket & { migration_name: string })[]>("SELECT migration_name FROM schema_migrations ORDER BY migration_name");
  const applied = new Set(rows.map((row) => row.migration_name));
  return (await migrationFiles()).map((name) => ({ name, applied: applied.has(name) }));
}

export async function runMigrations() {
  const status = await migrationStatus();
  for (const migration of status.filter((item) => !item.applied)) {
    const sql = await fs.readFile(path.join(migrationsDirectory, migration.name), "utf8");
    const connection = await dbPool.getConnection();
    try {
      await connection.beginTransaction();
      for (const statement of splitSqlStatements(sql)) await connection.query(statement);
      await connection.query("INSERT INTO schema_migrations (migration_name) VALUES (?)", [migration.name]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw new Error(`Migration ${migration.name} failed`, { cause: error });
    } finally { connection.release(); }
  }
  return migrationStatus();
}

if (require.main === module) {
  const command = process.argv[2] ?? "status";
  const task = command === "up" ? runMigrations() : migrationStatus();
  task.then((status) => { for (const item of status) console.log(`${item.applied ? "applied" : "pending"} ${item.name}`); }).catch(() => { process.exitCode = 1; });
}
