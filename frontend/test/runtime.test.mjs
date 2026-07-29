import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("production frontend configuration has the canonical origin and no legacy base", () => {
  const source = fs.readFileSync(new URL("../src/config/runtime.ts", import.meta.url), "utf8");
  assert.match(source, /canonicalApi = `\$\{canonicalOrigin\}\/api\/v1`/);
  assert.match(source, /canonicalMedia = `\$\{canonicalOrigin\}\/uploads`/);
  assert.doesNotMatch(source, /localhost|127\.0\.0\.1|Real-Estate-Test-site/);
});

test("admin entry uses the configured API and has no mock fallback", () => {
  const api = fs.readFileSync(new URL("../src/admin/api/adminApi.ts", import.meta.url), "utf8");
  const app = fs.readFileSync(new URL("../src/admin/AdminApp.tsx", import.meta.url), "utf8");
  assert.match(api, /apiBaseUrl/);
  assert.doesNotMatch(api, /\/api\/admin|localhost|mock/i);
  assert.doesNotMatch(app, /mock data|demo records/i);
});

test("public property consumers use the REST service and not the hard-coded catalogue", () => {
  const files = ["App.tsx", "components/PropertyListingsPage.tsx", "components/PropertyDetailPage.tsx", "pages/FavoritesPage.tsx"];
  for (const file of files) {
    const source = fs.readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /from\s+["'][^"']*data\/propertyListings["']/);
  }
  const service = fs.readFileSync(new URL("../src/services/publicPropertyService.ts", import.meta.url), "utf8");
  assert.match(service, /apiBaseUrl/);
  assert.match(service, /AbortSignal/);
});

test("public property UI does not call third-party browser geocoders", () => {
  const source = ["SearchPanel.tsx", "PropertyListingsPage.tsx", "PropertyDetailPage.tsx"]
    .map((file) => fs.readFileSync(new URL(`../src/components/${file}`, import.meta.url), "utf8"))
    .join("\n");
  assert.doesNotMatch(source, /photon\.komoot|nominatim\.openstreetmap/i);
  assert.match(source, /apiBaseUrl/);
});
