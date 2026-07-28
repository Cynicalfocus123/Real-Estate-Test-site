import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("production frontend configuration has the canonical origin and no legacy base", () => {
  const source = fs.readFileSync(new URL("../src/config/runtime.ts", import.meta.url), "utf8");
  assert.match(source, /canonicalApi = `\$\{canonicalOrigin\}\/api\/v1`/);
  assert.match(source, /canonicalMedia = `\$\{canonicalOrigin\}\/uploads`/);
  assert.doesNotMatch(source, /localhost|127\.0\.0\.1|Real-Estate-Test-site/);
});
