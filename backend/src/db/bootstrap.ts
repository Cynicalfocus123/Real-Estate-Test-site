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

async function columnExists(tableName: string, columnName: string) {
  const rows = await queryRows<(RowDataPacket & { count: number })[]>(
    `SELECT COUNT(*) AS count
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [env.DB_NAME, tableName, columnName],
  );
  return (rows[0]?.count ?? 0) > 0;
}

async function addColumnIfMissing(tableName: string, columnName: string, definition: string) {
  if (await columnExists(tableName, columnName)) {
    return;
  }
  await executeSql(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
}

export async function ensureListingSeoSchema() {
  await addColumnIfMissing("listings", "seo_title", "VARCHAR(180) NULL AFTER slug");
  await addColumnIfMissing("listings", "meta_description", "VARCHAR(320) NULL AFTER seo_title");
  await addColumnIfMissing("listings", "seo_keywords", "JSON NULL AFTER meta_description");
  await addColumnIfMissing("listings", "canonical_url", "VARCHAR(500) NULL AFTER seo_keywords");
  await addColumnIfMissing("listings", "index_status", "ENUM('index', 'noindex') NOT NULL DEFAULT 'index' AFTER canonical_url");
  await addColumnIfMissing("listings", "follow_status", "ENUM('follow', 'nofollow') NOT NULL DEFAULT 'follow' AFTER index_status");
  await addColumnIfMissing("listings", "og_title", "VARCHAR(180) NULL AFTER follow_status");
  await addColumnIfMissing("listings", "og_description", "VARCHAR(320) NULL AFTER og_title");
  await addColumnIfMissing("listings", "og_image", "VARCHAR(500) NULL AFTER og_description");
  await addColumnIfMissing("listings", "twitter_title", "VARCHAR(180) NULL AFTER og_image");
  await addColumnIfMissing("listings", "twitter_description", "VARCHAR(320) NULL AFTER twitter_title");
  await addColumnIfMissing("listings", "twitter_image", "VARCHAR(500) NULL AFTER twitter_description");
  await addColumnIfMissing("listings", "schema_type", "VARCHAR(80) NOT NULL DEFAULT 'RealEstateListing' AFTER twitter_image");
  await addColumnIfMissing("listing_images", "alt_text", "VARCHAR(180) NULL AFTER card_url");
  await addColumnIfMissing("listing_images", "caption", "VARCHAR(240) NULL AFTER alt_text");
  // Future Google Search Console hooks: sitemap, robots, canonical, and JSON-LD rendering should consume these columns.
}
