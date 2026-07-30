import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createApp } from "../src/app";
import { migrationFiles } from "../src/db/migrate";
import { propertyDisplayPrice, propertyPayloadSchema } from "../src/routes/adminPropertyRoutes";

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
