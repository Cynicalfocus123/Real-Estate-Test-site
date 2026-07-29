"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrationFiles = migrationFiles;
exports.migrationStatus = migrationStatus;
exports.runMigrations = runMigrations;
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const pool_1 = require("./pool");
const migrationsDirectory = node_path_1.default.resolve(process.cwd(), "migrations");
async function migrationFiles() {
    return (await promises_1.default.readdir(migrationsDirectory)).filter((name) => /^\d+_[a-z0-9-]+\.sql$/i.test(name)).sort();
}
async function migrationStatus() {
    await pool_1.dbPool.query("CREATE TABLE IF NOT EXISTS schema_migrations (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, migration_name VARCHAR(190) NOT NULL UNIQUE, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    const [rows] = await pool_1.dbPool.query("SELECT migration_name FROM schema_migrations ORDER BY migration_name");
    const applied = new Set(rows.map((row) => row.migration_name));
    return (await migrationFiles()).map((name) => ({ name, applied: applied.has(name) }));
}
async function runMigrations() {
    const status = await migrationStatus();
    for (const migration of status.filter((item) => !item.applied)) {
        const sql = await promises_1.default.readFile(node_path_1.default.join(migrationsDirectory, migration.name), "utf8");
        const connection = await pool_1.dbPool.getConnection();
        try {
            await connection.beginTransaction();
            await connection.query(sql);
            await connection.query("INSERT INTO schema_migrations (migration_name) VALUES (?)", [migration.name]);
            await connection.commit();
        }
        catch (error) {
            await connection.rollback();
            throw new Error(`Migration ${migration.name} failed`, { cause: error });
        }
        finally {
            connection.release();
        }
    }
    return migrationStatus();
}
if (require.main === module) {
    const command = process.argv[2] ?? "status";
    const task = command === "up" ? runMigrations() : migrationStatus();
    task.then((status) => { for (const item of status)
        console.log(`${item.applied ? "applied" : "pending"} ${item.name}`); }).catch(() => { process.exitCode = 1; });
}
