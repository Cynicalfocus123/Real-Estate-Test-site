import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createApp } from "../src/app";
import { verifyAuthToken } from "../src/auth/jwt";
import { migrationFiles } from "../src/db/migrate";

test("health is safe", async () => {
  const response = await request(createApp({ dependencyCheck: async () => true })).get("/health");
  assert.equal(response.status, 200);
  assert.deepEqual(Object.keys(response.body).sort(), ["service", "status", "version"]);
});

test("readiness reports dependency failure without details", async () => {
  const response = await request(createApp({ dependencyCheck: async () => false })).get("/ready");
  assert.equal(response.status, 503);
  assert.deepEqual(response.body, { status: "unavailable" });
});

test("approved origin gets CORS and unknown routes are safe", async () => {
  const app = createApp({ dependencyCheck: async () => true });
  const cors = await request(app).get("/health").set("Origin", "https://buyhomeforless.com");
  assert.equal(cors.headers["access-control-allow-origin"], "https://buyhomeforless.com");
  const notFound = await request(app).get("/private-nope");
  assert.equal(notFound.status, 404);
  assert.deepEqual(notFound.body, { error: "Route not found" });
});

test("invalid JWTs are rejected and migrations are ordered", async () => {
  assert.throws(() => verifyAuthToken("not-a-token"));
  const files = await migrationFiles();
  assert.deepEqual(files, [...files].sort());
  assert.ok(files.every((name) => /^\d+_[a-z0-9-]+\.sql$/i.test(name)));
});
