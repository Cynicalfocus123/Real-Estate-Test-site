import fs from "node:fs/promises";
import { app } from "./app";
import { env } from "./config/env";
import { dbPool } from "./db/pool";

async function start() {
  await fs.mkdir(env.UPLOAD_DIR_ABSOLUTE, { recursive: true });
  await dbPool.query("SELECT 1");
  const server = app.listen(env.PORT, "0.0.0.0", () => console.log(`Buy Home For Less API listening on port ${env.PORT}`));
  const shutdown = async () => { server.close(); await dbPool.end(); };
  process.once("SIGTERM", shutdown); process.once("SIGINT", shutdown);
}

start().catch(() => { process.exitCode = 1; });
