import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("frontend Apache rules preserve admin, API, uploads, and real files before SPA fallback", async () => {
  const rules = await readFile(new URL("../public/.htaccess", import.meta.url), "utf8");
  assert.match(rules, /\^admin\/\?\$ admin\.html \[END\]/);
  assert.match(rules, /\^\(\?:api\/v1\|uploads\)\(\?:\/\|\$\) - \[END\]/);
  assert.match(rules, /REQUEST_FILENAME} -f/);
  assert.match(rules, /REQUEST_FILENAME} -d/);
  assert.match(rules, /\^ index\.html \[END\]/);
});
