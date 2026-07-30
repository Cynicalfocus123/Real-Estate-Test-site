import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createApp } from "../src/app";
import { migrationFiles } from "../src/db/migrate";
import { splitSqlStatements } from "../src/db/migrate";
import { adminPropertyListQuerySchema, buildAdminPropertyFilters, propertyDisplayPrice, propertyPayloadSchema } from "../src/routes/adminPropertyRoutes";
import { resetMailTransportForTests, sendRegistrationNotification, sendResetEmail, sendVerificationEmail, setAdminNotificationEmailForTests, setMailTransportForTests, type MailMessage } from "../src/services/mailService";
import { requireOneOfRoles } from "../src/middleware/auth";
import { requireSameOrigin } from "../src/middleware/csrf";

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

test("migrations are ordered", async () => {
  const files = await migrationFiles();
  assert.deepEqual(files, [...files].sort());
  assert.ok(files.every((name) => /^\d+_[a-z0-9-]+\.sql$/i.test(name)));
});

test("migration SQL is split safely without multi-statements", () => {
  const statements = splitSqlStatements("CREATE TABLE example (value VARCHAR(20)); INSERT INTO example VALUES ('a; b'); -- comment;\nUPDATE example SET value='done';");
  assert.deepEqual(statements, ["CREATE TABLE example (value VARCHAR(20))", "INSERT INTO example VALUES ('a; b')", "-- comment;\nUPDATE example SET value='done'"]);
});

test("verification, resend, and reset emails use an injected mail transport", async () => {
  const delivered: MailMessage[] = [];
  setMailTransportForTests({ send: async (message) => { delivered.push(message); } });
  try {
    await sendVerificationEmail("new@example.test", "verification-token");
    await sendVerificationEmail("new@example.test", "resend-token");
    await sendResetEmail("new@example.test", "reset-token");
    assert.equal(delivered.length, 3);
    assert.match(delivered[0].text, /verify-email\?token=verification-token/);
    assert.match(delivered[1].text, /verify-email\?token=resend-token/);
    assert.match(delivered[2].text, /reset-password\?token=reset-token/);
  } finally { resetMailTransportForTests(); }
});

test("registration mail and optional admin notification use the injected transport without secrets", async () => {
  const delivered: MailMessage[] = [];
  setMailTransportForTests({ send: async (message) => { delivered.push(message); } });
  setAdminNotificationEmailForTests("operations@example.test");
  try {
    await sendVerificationEmail("new@example.test", "verification-token");
    await sendRegistrationNotification({ firstName: "New", lastName: "Customer", email: "new@example.test", registeredAt: "2026-07-29T00:00:00.000Z", status: "PENDING_VERIFICATION" });
    assert.match(delivered[0].text, /verify-email\?token=verification-token/);
    assert.equal(delivered.length, 2);
    assert.equal(delivered[1].to, "operations@example.test");
    assert.match(delivered[1].text, /Customer: New Customer/);
    assert.match(delivered[1].text, /Admin: https:\/\/buyhomeforless\.com\/admin/);
    assert.doesNotMatch(delivered.map((message) => message.text).join("\n"), /password|session|hash/i);
  } finally { resetMailTransportForTests(); }
});

test("admin authorization and same-origin CSRF checks both reject unsafe writes", () => {
  const forbidden: unknown[] = [];
  requireOneOfRoles(["HEAD_ADMIN"])({ user: { id: 2, email: "staff@example.test", fullName: "Staff", role: "EMPLOYEE", status: "ACTIVE" } } as any, {} as any, (error?: unknown) => forbidden.push(error));
  assert.equal((forbidden[0] as { statusCode?: number }).statusCode, 403);
  requireSameOrigin({ method: "POST", header: () => "https://attacker.example" } as any, {} as any, (error?: unknown) => forbidden.push(error));
  assert.equal((forbidden[1] as { statusCode?: number }).statusCode, 403);
});

test("property authoring validates transaction, channel and nearby options", () => {
  const valid = propertyPayloadSchema.parse({ title: "Authoring test", transactionMode: "SALE", listingChannel: "STANDARD" });
  assert.equal(valid.transactionMode, "SALE");
  assert.throws(() => propertyPayloadSchema.parse({ title: "Bad", transactionMode: "SELL", listingChannel: "STANDARD" }));
  assert.throws(() => propertyPayloadSchema.parse({ title: "Bad nearby", transactionMode: "RENT", listingChannel: "STANDARD", nearbyLocations: [{ locationType: "MADE_UP", name: "X", distanceLabel: "1 km" }] }));
});

test("property DTO supports no-image publishing, senior details, and a stable camelCase round trip", () => {
  const property = propertyPayloadSchema.parse({
    title: "Optional media home",
    transactionMode: "SALE",
    listingChannel: "SENIOR_HOME",
    status: "PUBLISHED",
    propertyCondition: "Renovated",
    conditionLabel: "Move-in ready",
    seniorDetails: { servicesIncluded: ["Care"], seniorPropertyFeatures: ["Lift"], communityAmenities: [] },
    seo: { canonicalUrl: "https://buyhomeforless.com/properties/optional-media-home" },
  });
  assert.equal(property.status, "PUBLISHED");
  assert.equal(property.propertyCondition, "Renovated");
  assert.equal(property.seniorDetails?.servicesIncluded[0], "Care");
  assert.equal("images" in property, false);
});

test("property price labels select sale, rent, or the optional-price fallback", () => {
  assert.equal(propertyDisplayPrice({ transactionMode: "SALE", buyPrice: 1500000, currencyCode: "THB" }), "THB 1,500,000");
  assert.equal(propertyDisplayPrice({ transactionMode: "RENT", rentMonthlyPrice: 18000, currencyCode: "THB" }), "THB 18,000");
  assert.equal(propertyDisplayPrice({ transactionMode: "SALE", buyPrice: null, priceAmount: null, currencyCode: "THB" }), "Price on request");
});

test("admin property filters validate and apply normalized property type", () => {
  const query = adminPropertyListQuerySchema.parse({ propertyType: "VILLA" });
  const filters = buildAdminPropertyFilters(query);
  assert.ok(filters.where.includes("l.normalized_property_type=?"));
  assert.ok(filters.p.includes("VILLA"));
  assert.throws(() => adminPropertyListQuerySchema.parse({ propertyType: "NOT_A_PROPERTY" }));
});
