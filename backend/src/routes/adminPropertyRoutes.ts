import { Router } from "express";
import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { executeSql, queryRows } from "../db/pool";
import { requireAuth, requireOneOfRoles, requireRole } from "../middleware/auth";
import { ApiError } from "../utils/errors";
import { sanitizeEmail, sanitizePlainText, sanitizeSlug, sanitizeStringArray } from "../utils/sanitize";

export const PROPERTY_TYPES = ["VILLA", "CONDO", "APARTMENT", "TOWNHOUSE", "COMMERCIAL_BUILDING", "RESORT", "LAND", "HOUSE", "MULTI_FAMILY", "SINGLE_DETACHED_HOUSE", "SEMI_DETACHED_HOUSE"] as const;
export const VIEW_TYPES = ["BEACH", "RURAL", "MOUNTAIN", "LAKE", "WATERFALL", "CITY"] as const;
export const NEARBY_TYPES = ["HOSPITAL", "SCHOOL", "AIRPORT", "SHOPPING_MALL", "BEACH", "TRANSPORTATION", "CITY"] as const;
export const SPECIAL_CATEGORIES = ["DISTRESS_PROPERTY", "FORECLOSURE", "PRE_FORECLOSURE", "FIXER_UPPER", "URGENT_SALE", "FEATURED", "NEW_LISTING"] as const;
export const LISTING_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED", "DELETED"] as const;

const textArray = z.array(z.string().min(1).max(240)).max(100).default([]);
const faqSchema = z.object({ id: z.number().int().positive().optional(), question: z.string().min(1).max(240), answer: z.string().min(1).max(5000), isActive: z.boolean().default(true) });
const nearbySchema = z.object({ id: z.number().int().positive().optional(), locationType: z.enum(NEARBY_TYPES), name: z.string().min(1).max(180), distanceLabel: z.string().min(1).max(80), distanceMeters: z.number().nonnegative().nullable().optional(), sortOrder: z.number().int().nonnegative().default(0) });
const seniorSchema = z.object({ roomSize: z.number().nonnegative().nullable().optional(), buildingSize: z.number().nonnegative().nullable().optional(), caregiverIncluded: z.boolean().nullable().optional(), caregiverNotes: z.string().max(5000).nullable().optional(), seniorCareService: z.string().max(160).nullable().optional(), serviceDuration: z.string().max(80).nullable().optional(), serviceDeposit: z.number().nonnegative().nullable().optional(), monthlyServiceFee: z.number().nonnegative().nullable().optional(), servicesIncluded: textArray, seniorPropertyFeatures: textArray, communityAmenities: textArray });

export const propertyPayloadSchema = z.object({
  title: z.string().min(1).max(180),
  slug: z.string().max(180).optional(),
  transactionMode: z.enum(["SALE", "RENT"]),
  listingChannel: z.enum(["STANDARD", "SENIOR_HOME"]),
  publicStatusLabel: z.string().max(120).nullable().optional(),
  normalizedPropertyType: z.enum(PROPERTY_TYPES).nullable().optional(),
  specialCategory: z.enum(SPECIAL_CATEGORIES).nullable().optional(),
  propertyCondition: z.string().max(80).nullable().optional(),
  conditionLabel: z.string().max(120).nullable().optional(),
  viewType: z.enum(VIEW_TYPES).nullable().optional(),
  status: z.enum(LISTING_STATUSES).default("DRAFT"),
  priceAmount: z.number().nonnegative().nullable().optional(),
  buyPrice: z.number().nonnegative().nullable().optional(),
  rentMonthlyPrice: z.number().nonnegative().nullable().optional(),
  depositAmount: z.number().nonnegative().nullable().optional(),
  depositMonths: z.number().nonnegative().nullable().optional(),
  downPaymentAmount: z.number().nonnegative().nullable().optional(),
  mortgageTerm: z.string().max(80).nullable().optional(),
  mortgageInterestRate: z.number().nonnegative().nullable().optional(),
  estimatedMonthlyMortgage: z.number().nonnegative().nullable().optional(),
  currencyCode: z.string().min(3).max(12).default("THB"),
  priceUnitLabel: z.string().max(80).nullable().optional(),
  description: z.string().max(10000).nullable().optional(),
  highlights: textArray,
  amenities: textArray,
  features: textArray,
  propertyDetails: textArray,
  furnishingStatus: z.string().max(80).nullable().optional(),
  hasAirConditioner: z.boolean().nullable().optional(),
  hasKitchen: z.boolean().nullable().optional(),
  bedrooms: z.number().int().min(0).max(100).nullable().optional(),
  bathrooms: z.number().int().min(0).max(100).nullable().optional(),
  landSize: z.number().nonnegative().nullable().optional(),
  interiorSizeSqm: z.number().nonnegative().nullable().optional(),
  builtYear: z.number().int().min(1800).max(2200).nullable().optional(),
  floorCount: z.number().int().min(0).max(300).nullable().optional(),
  garageSpaces: z.number().int().min(0).max(100).nullable().optional(),
  country: z.string().max(120).default("Thailand"),
  province: z.string().max(120).nullable().optional(),
  amphoe: z.string().max(120).nullable().optional(),
  district: z.string().max(120).nullable().optional(),
  tambon: z.string().max(120).nullable().optional(),
  city: z.string().max(120).nullable().optional(),
  village: z.string().max(160).nullable().optional(),
  soi: z.string().max(160).nullable().optional(),
  streetAddress: z.string().max(240).nullable().optional(),
  postalCode: z.string().max(20).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  mapSearchLabel: z.string().max(255).nullable().optional(),
  agentId: z.number().int().positive().nullable().optional(),
  faqs: z.array(faqSchema).max(50).default([]),
  nearbyLocations: z.array(nearbySchema).max(50).default([]),
  seniorDetails: seniorSchema.nullable().optional(),
});

type PropertyPayload = z.infer<typeof propertyPayloadSchema>;
type Row = RowDataPacket & Record<string, unknown>;

function jsonValue(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value !== "string") return [];
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []; } catch { return []; }
}

function nullableText(value: string | null | undefined, max: number) { return value ? sanitizePlainText(value, max) : null; }

function oldSection(data: PropertyPayload) { return data.transactionMode === "RENT" ? "RENT" : "BUY"; }
function oldCategory(data: PropertyPayload) { return data.specialCategory ?? "NEW_LISTING"; }

function toSummary(row: Row) {
  return {
    id: Number(row.id), title: row.title, slug: row.slug, transactionMode: row.transaction_mode, listingChannel: row.listing_channel,
    publicStatusLabel: row.public_status_label, status: row.status, normalizedPropertyType: row.normalized_property_type,
    specialCategory: row.special_category, province: row.province, city: row.city, priceAmount: row.price_amount === null ? null : Number(row.price_amount),
    currencyCode: row.currency_code, thumbnailUrl: row.thumbnail_url, updatedAt: row.updated_at,
  };
}

function toDetail(row: Row, images: Row[], faqs: Row[], nearby: Row[], senior: Row | undefined, agent: Row | undefined) {
  return {
    ...toSummary(row), description: row.description, condition: row.property_condition, conditionLabel: row.condition_label, viewType: row.view_type,
    normalizedPropertyType: row.normalized_property_type, priceUnitLabel: row.price_unit_label, buyPrice: row.buy_price, rentMonthlyPrice: row.rent_monthly_price,
    depositAmount: row.deposit_amount, depositMonths: row.deposit_months, downPaymentAmount: row.down_payment_amount, mortgageTerm: row.mortgage_term,
    mortgageInterestRate: row.mortgage_interest_rate, estimatedMonthlyMortgage: row.estimated_monthly_mortgage, highlights: jsonValue(row.highlights),
    amenities: jsonValue(row.amenities), features: jsonValue(row.features), propertyDetails: jsonValue(row.property_details), furnishingStatus: row.furnishing_status,
    hasAirConditioner: Boolean(row.has_air_conditioner), hasKitchen: Boolean(row.has_kitchen), bedrooms: row.bedrooms, bathrooms: row.bathrooms,
    landSize: row.land_size, interiorSizeSqm: row.interior_size_sqm, builtYear: row.built_year, floorCount: row.floor_count, garageSpaces: row.garage_spaces,
    location: { country: row.country, province: row.province, amphoe: row.amphoe, district: row.district, tambon: row.tambon, city: row.city, village: row.village, soi: row.soi, streetAddress: row.street_address, postalCode: row.postal_code, latitude: row.latitude, longitude: row.longitude, mapSearchLabel: row.map_search_label },
    seo: { slug: row.slug, seoTitle: row.seo_title, metaDescription: row.meta_description, canonicalUrl: row.canonical_url, indexStatus: row.index_status, followStatus: row.follow_status, ogTitle: row.og_title, ogDescription: row.og_description, ogImage: row.og_image, twitterTitle: row.twitter_title, twitterDescription: row.twitter_description, twitterImage: row.twitter_image },
    images: images.map((image) => ({ id: Number(image.id), originalName: image.original_name, cardUrl: image.card_url, detailUrl: image.detail_url, galleryUrl: image.gallery_url, altText: image.alt_text, caption: image.caption, sortOrder: image.sort_order, isCover: Boolean(image.is_cover) })),
    faqs: faqs.map((faq) => ({ id: Number(faq.id), question: faq.question, answer: faq.answer, isActive: Boolean(faq.is_active), sortOrder: faq.sort_order })),
    nearbyLocations: nearby.map((item) => ({ id: Number(item.id), locationType: item.location_type, name: item.name, distanceLabel: item.distance_label, distanceMeters: item.distance_meters, sortOrder: item.sort_order })),
    seniorDetails: senior ? { roomSize: senior.room_size, buildingSize: senior.building_size, caregiverIncluded: senior.caregiver_included === null ? null : Boolean(senior.caregiver_included), caregiverNotes: senior.caregiver_notes, seniorCareService: senior.senior_care_service, serviceDuration: senior.service_duration, serviceDeposit: senior.service_deposit, monthlyServiceFee: senior.monthly_service_fee, servicesIncluded: jsonValue(senior.services_included), seniorPropertyFeatures: jsonValue(senior.senior_property_features), communityAmenities: jsonValue(senior.community_amenities) } : null,
    agent: agent ? { id: Number(agent.id), name: agent.name, phone: agent.phone, email: agent.email, agency: agent.agency, isActive: Boolean(agent.is_active), isVerified: agent.is_verified === null ? null : Boolean(agent.is_verified) } : null,
  };
}

async function fetchDetail(id: number) {
  const rows = await queryRows<Row[]>(`SELECT l.*, (SELECT card_url FROM listing_images WHERE listing_id = l.id ORDER BY is_cover DESC, sort_order ASC, id ASC LIMIT 1) AS thumbnail_url FROM listings l WHERE l.id = ? LIMIT 1`, [id]);
  const row = rows[0];
  if (!row) throw new ApiError(404, "Property not found");
  const [images, faqs, nearby, seniorRows, agentRows] = await Promise.all([
    queryRows<Row[]>("SELECT id, original_name, card_url, detail_url, gallery_url, alt_text, caption, sort_order, is_cover FROM listing_images WHERE listing_id = ? ORDER BY sort_order ASC, id ASC", [id]),
    queryRows<Row[]>("SELECT id, question, answer, is_active, sort_order FROM listing_faqs WHERE listing_id = ? ORDER BY sort_order ASC, id ASC", [id]),
    queryRows<Row[]>("SELECT id, location_type, name, distance_label, distance_meters, sort_order FROM listing_nearby_locations WHERE listing_id = ? ORDER BY sort_order ASC, id ASC", [id]),
    queryRows<Row[]>("SELECT * FROM senior_details WHERE listing_id = ? LIMIT 1", [id]),
    queryRows<Row[]>("SELECT a.* FROM agents a JOIN listing_agent_assignments la ON la.agent_id = a.id WHERE la.listing_id = ? AND la.is_primary = 1 LIMIT 1", [id]),
  ]);
  return toDetail(row, images, faqs, nearby, seniorRows[0], agentRows[0]);
}

async function replaceRelations(id: number, data: PropertyPayload) {
  await executeSql("DELETE FROM listing_nearby_locations WHERE listing_id = ?", [id]);
  for (let index = 0; index < data.nearbyLocations.length; index += 1) {
    const item = data.nearbyLocations[index];
    await executeSql("INSERT INTO listing_nearby_locations (listing_id, location_type, name, distance_label, distance_meters, sort_order) VALUES (?, ?, ?, ?, ?, ?)", [id, item.locationType, sanitizePlainText(item.name, 180), sanitizePlainText(item.distanceLabel, 80), item.distanceMeters ?? null, index]);
  }
  await executeSql("DELETE FROM listing_faqs WHERE listing_id = ?", [id]);
  for (let index = 0; index < data.faqs.length; index += 1) {
    const faq = data.faqs[index];
    await executeSql("INSERT INTO listing_faqs (listing_id, question, answer, sort_order, is_active) VALUES (?, ?, ?, ?, ?)", [id, sanitizePlainText(faq.question, 240), sanitizePlainText(faq.answer, 5000), index, faq.isActive ? 1 : 0]);
  }
  if (data.agentId) {
    await executeSql("INSERT INTO listing_agent_assignments (listing_id, agent_id, is_primary) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE agent_id = VALUES(agent_id), is_primary = 1", [id, data.agentId]);
  } else {
    await executeSql("DELETE FROM listing_agent_assignments WHERE listing_id = ?", [id]);
  }
  if (data.listingChannel === "SENIOR_HOME" && data.seniorDetails) {
    const senior = data.seniorDetails;
    await executeSql(`INSERT INTO senior_details (listing_id, room_size, building_size, caregiver_included, caregiver_notes, senior_care_service, service_duration, service_deposit, monthly_service_fee, services_included, senior_property_features, community_amenities) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE room_size=VALUES(room_size), building_size=VALUES(building_size), caregiver_included=VALUES(caregiver_included), caregiver_notes=VALUES(caregiver_notes), senior_care_service=VALUES(senior_care_service), service_duration=VALUES(service_duration), service_deposit=VALUES(service_deposit), monthly_service_fee=VALUES(monthly_service_fee), services_included=VALUES(services_included), senior_property_features=VALUES(senior_property_features), community_amenities=VALUES(community_amenities)`, [id, senior.roomSize ?? null, senior.buildingSize ?? null, senior.caregiverIncluded === null ? null : senior.caregiverIncluded ? 1 : 0, nullableText(senior.caregiverNotes, 5000), nullableText(senior.seniorCareService, 160), nullableText(senior.serviceDuration, 80), senior.serviceDeposit ?? null, senior.monthlyServiceFee ?? null, JSON.stringify(sanitizeStringArray(senior.servicesIncluded, 100, 240)), JSON.stringify(sanitizeStringArray(senior.seniorPropertyFeatures, 100, 240)), JSON.stringify(sanitizeStringArray(senior.communityAmenities, 100, 240))]);
  } else if (data.listingChannel !== "SENIOR_HOME") {
    await executeSql("DELETE FROM senior_details WHERE listing_id = ?", [id]);
  }
}

export const adminPropertyRoutes = Router();
adminPropertyRoutes.use(requireAuth, requireOneOfRoles(["HEAD_ADMIN", "ADMIN", "EMPLOYEE"]));

adminPropertyRoutes.get("/properties", async (request, response, next) => {
  try {
    const query = z.object({ q: z.string().max(120).optional(), transactionMode: z.enum(["SALE", "RENT"]).optional(), listingChannel: z.enum(["STANDARD", "SENIOR_HOME"]).optional(), status: z.enum(LISTING_STATUSES).optional(), propertyType: z.enum(PROPERTY_TYPES).optional(), province: z.string().max(120).optional(), specialCategory: z.enum(SPECIAL_CATEGORIES).optional(), page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20), sort: z.enum(["newest", "oldest", "updated"]).default("updated") }).parse(request.query);
    const where: string[] = ["1=1"]; const params: unknown[] = [];
    if (query.q) { where.push("(l.title LIKE ? OR l.slug LIKE ? OR l.province LIKE ? OR l.city LIKE ? OR l.district LIKE ?)"); const q = `%${query.q}%`; params.push(q, q, q, q, q); }
    if (query.transactionMode) { where.push("l.transaction_mode = ?"); params.push(query.transactionMode); }
    if (query.listingChannel) { where.push("l.listing_channel = ?"); params.push(query.listingChannel); }
    if (query.status) { where.push("l.status = ?"); params.push(query.status); }
    if (query.propertyType) { where.push("l.normalized_property_type = ?"); params.push(query.propertyType); }
    if (query.province) { where.push("l.province = ?"); params.push(query.province); }
    if (query.specialCategory) { where.push("l.special_category = ?"); params.push(query.specialCategory); }
    const order = query.sort === "oldest" ? "l.created_at ASC" : query.sort === "newest" ? "l.created_at DESC" : "l.updated_at DESC";
    const countRows = await queryRows<(Row & { total: number })[]>(`SELECT COUNT(*) AS total FROM listings l WHERE ${where.join(" AND ")}`, params);
    const offset = (query.page - 1) * query.pageSize;
    const rows = await queryRows<Row[]>(`SELECT l.id, l.title, l.slug, l.transaction_mode, l.listing_channel, l.public_status_label, l.status, l.normalized_property_type, l.special_category, l.province, l.city, l.price_amount, l.currency_code, l.updated_at, (SELECT card_url FROM listing_images WHERE listing_id = l.id ORDER BY is_cover DESC, sort_order ASC, id ASC LIMIT 1) AS thumbnail_url FROM listings l WHERE ${where.join(" AND ")} ORDER BY ${order} LIMIT ? OFFSET ?`, [...params, query.pageSize, offset]);
    response.json({ items: rows.map(toSummary), pagination: { page: query.page, pageSize: query.pageSize, total: Number(countRows[0]?.total ?? 0), totalPages: Math.ceil(Number(countRows[0]?.total ?? 0) / query.pageSize) } });
  } catch (error) { next(error); }
});

adminPropertyRoutes.get("/properties/:id", async (request, response, next) => { try { const id = Number(request.params.id); if (!Number.isInteger(id) || id <= 0) throw new ApiError(400, "Invalid property id"); response.json(await fetchDetail(id)); } catch (error) { next(error); } });

adminPropertyRoutes.post("/properties", async (request, response, next) => {
  try {
    const data = propertyPayloadSchema.parse(request.body); const title = sanitizePlainText(data.title, 180); const slug = sanitizeSlug(data.slug ?? title); if (!slug) throw new ApiError(400, "Unable to generate slug");
    const result = await executeSql(`INSERT INTO listings (title, slug, section, transaction_mode, listing_channel, public_status_label, normalized_property_type, special_category, property_condition, condition_label, view_type, status, category, price_amount, buy_price, rent_monthly_price, deposit_amount, deposit_months, down_payment_amount, mortgage_term, mortgage_interest_rate, estimated_monthly_mortgage, currency_code, price_unit_label, description, highlights, amenities, features, property_details, furnishing_status, has_air_conditioner, has_kitchen, bedrooms, bathrooms, land_size, interior_size_sqm, built_year, floor_count, garage_spaces, street_address, village, soi, tambon, amphoe, district, city, province, postal_code, country, latitude, longitude, map_search_label, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [title, slug, oldSection(data), data.transactionMode, data.listingChannel, nullableText(data.publicStatusLabel, 120), data.normalizedPropertyType ?? null, data.specialCategory ?? null, nullableText(data.propertyCondition, 80), nullableText(data.conditionLabel, 120), data.viewType ?? null, data.status, oldCategory(data), data.priceAmount ?? null, data.buyPrice ?? null, data.rentMonthlyPrice ?? null, data.depositAmount ?? null, data.depositMonths ?? null, data.downPaymentAmount ?? null, nullableText(data.mortgageTerm, 80), data.mortgageInterestRate ?? null, data.estimatedMonthlyMortgage ?? null, sanitizePlainText(data.currencyCode.toUpperCase(), 12), nullableText(data.priceUnitLabel, 80), nullableText(data.description, 10000), JSON.stringify(data.highlights), JSON.stringify(data.amenities), JSON.stringify(data.features), JSON.stringify(data.propertyDetails), nullableText(data.furnishingStatus, 80), data.hasAirConditioner === null || data.hasAirConditioner === undefined ? null : data.hasAirConditioner ? 1 : 0, data.hasKitchen === null || data.hasKitchen === undefined ? null : data.hasKitchen ? 1 : 0, data.bedrooms ?? null, data.bathrooms ?? null, data.landSize ?? null, data.interiorSizeSqm ?? null, data.builtYear ?? null, data.floorCount ?? null, data.garageSpaces ?? null, nullableText(data.streetAddress, 240), nullableText(data.village, 160), nullableText(data.soi, 160), nullableText(data.tambon, 120), nullableText(data.amphoe, 120), nullableText(data.district, 120), nullableText(data.city, 120), nullableText(data.province, 120), nullableText(data.postalCode, 20), nullableText(data.country, 120) ?? "Thailand", data.latitude ?? null, data.longitude ?? null, nullableText(data.mapSearchLabel, 255), request.user!.id]);
    const id = Number(result.insertId); await replaceRelations(id, data); response.status(201).json({ id, property: await fetchDetail(id) });
  } catch (error) { next(error); }
});

adminPropertyRoutes.patch("/properties/:id", async (request, response, next) => {
  try {
    const id = Number(request.params.id); if (!Number.isInteger(id) || id <= 0) throw new ApiError(400, "Invalid property id");
    const data = propertyPayloadSchema.parse(request.body); const sets = ["title = ?", "slug = ?", "section = ?", "transaction_mode = ?", "listing_channel = ?", "public_status_label = ?", "normalized_property_type = ?", "special_category = ?", "property_condition = ?", "condition_label = ?", "view_type = ?", "status = ?", "category = ?", "price_amount = ?", "buy_price = ?", "rent_monthly_price = ?", "deposit_amount = ?", "deposit_months = ?", "down_payment_amount = ?", "mortgage_term = ?", "mortgage_interest_rate = ?", "estimated_monthly_mortgage = ?", "currency_code = ?", "price_unit_label = ?", "description = ?", "highlights = ?", "amenities = ?", "features = ?", "property_details = ?", "furnishing_status = ?", "has_air_conditioner = ?", "has_kitchen = ?", "bedrooms = ?", "bathrooms = ?", "land_size = ?", "interior_size_sqm = ?", "built_year = ?", "floor_count = ?", "garage_spaces = ?", "street_address = ?", "village = ?", "soi = ?", "tambon = ?", "amphoe = ?", "district = ?", "city = ?", "province = ?", "postal_code = ?", "country = ?", "latitude = ?", "longitude = ?", "map_search_label = ?", "updated_at = CURRENT_TIMESTAMP"];
    const values: unknown[] = [sanitizePlainText(data.title, 180), sanitizeSlug(data.slug ?? data.title), oldSection(data), data.transactionMode, data.listingChannel, nullableText(data.publicStatusLabel, 120), data.normalizedPropertyType ?? null, data.specialCategory ?? null, nullableText(data.propertyCondition, 80), nullableText(data.conditionLabel, 120), data.viewType ?? null, data.status, oldCategory(data), data.priceAmount ?? null, data.buyPrice ?? null, data.rentMonthlyPrice ?? null, data.depositAmount ?? null, data.depositMonths ?? null, data.downPaymentAmount ?? null, nullableText(data.mortgageTerm, 80), data.mortgageInterestRate ?? null, data.estimatedMonthlyMortgage ?? null, sanitizePlainText(data.currencyCode.toUpperCase(), 12), nullableText(data.priceUnitLabel, 80), nullableText(data.description, 10000), JSON.stringify(data.highlights), JSON.stringify(data.amenities), JSON.stringify(data.features), JSON.stringify(data.propertyDetails), nullableText(data.furnishingStatus, 80), data.hasAirConditioner === null || data.hasAirConditioner === undefined ? null : data.hasAirConditioner ? 1 : 0, data.hasKitchen === null || data.hasKitchen === undefined ? null : data.hasKitchen ? 1 : 0, data.bedrooms ?? null, data.bathrooms ?? null, data.landSize ?? null, data.interiorSizeSqm ?? null, data.builtYear ?? null, data.floorCount ?? null, data.garageSpaces ?? null, nullableText(data.streetAddress, 240), nullableText(data.village, 160), nullableText(data.soi, 160), nullableText(data.tambon, 120), nullableText(data.amphoe, 120), nullableText(data.district, 120), nullableText(data.city, 120), nullableText(data.province, 120), nullableText(data.postalCode, 20), nullableText(data.country, 120) ?? "Thailand", data.latitude ?? null, data.longitude ?? null, nullableText(data.mapSearchLabel, 255), id];
    const result = await executeSql(`UPDATE listings SET ${sets.join(", ")} WHERE id = ?`, values); if (!result.affectedRows) throw new ApiError(404, "Property not found"); await replaceRelations(id, data); response.json({ id, property: await fetchDetail(id) });
  } catch (error) { next(error); }
});

adminPropertyRoutes.delete("/properties/:id", async (request, response, next) => { try { const id = Number(request.params.id); if (!Number.isInteger(id) || id <= 0) throw new ApiError(400, "Invalid property id"); const result = await executeSql("UPDATE listings SET status = 'DELETED', public_status_label = 'Deleted', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]); if (!result.affectedRows) throw new ApiError(404, "Property not found"); response.json({ id, status: "DELETED" }); } catch (error) { next(error); } });

adminPropertyRoutes.get("/agents", async (_request, response, next) => { try { const rows = await queryRows<Row[]>("SELECT id, name, phone, email, agency, is_active, is_verified FROM agents ORDER BY is_active DESC, name ASC"); response.json({ items: rows.map((row) => ({ id: Number(row.id), name: row.name, phone: row.phone, email: row.email, agency: row.agency, isActive: Boolean(row.is_active), isVerified: row.is_verified === null ? null : Boolean(row.is_verified) })) }); } catch (error) { next(error); } });

adminPropertyRoutes.post("/agents", requireOneOfRoles(["HEAD_ADMIN", "ADMIN"]), async (request, response, next) => { try { const data = z.object({ name: z.string().min(1).max(120), phone: z.string().min(4).max(40), email: z.string().email(), agency: z.string().max(160).nullable().optional() }).parse(request.body); const result = await executeSql("INSERT INTO agents (name, phone, email, agency) VALUES (?, ?, ?, ?)", [sanitizePlainText(data.name, 120), sanitizePlainText(data.phone, 40), sanitizeEmail(data.email), nullableText(data.agency, 160)]); response.status(201).json({ id: Number(result.insertId) }); } catch (error) { next(error); } });

adminPropertyRoutes.patch("/agents/:id", requireRole("HEAD_ADMIN"), async (request, response, next) => { try { const id = Number(request.params.id); const data = z.object({ name: z.string().min(1).max(120).optional(), phone: z.string().min(4).max(40).optional(), email: z.string().email().optional(), agency: z.string().max(160).nullable().optional(), isActive: z.boolean().optional(), isVerified: z.boolean().nullable().optional() }).parse(request.body); const sets: string[] = []; const values: unknown[] = []; if (data.name) { sets.push("name = ?"); values.push(sanitizePlainText(data.name, 120)); } if (data.phone) { sets.push("phone = ?"); values.push(sanitizePlainText(data.phone, 40)); } if (data.email) { sets.push("email = ?"); values.push(sanitizeEmail(data.email)); } if (data.agency !== undefined) { sets.push("agency = ?"); values.push(nullableText(data.agency, 160)); } if (data.isActive !== undefined) { sets.push("is_active = ?"); values.push(data.isActive ? 1 : 0); } if (data.isVerified !== undefined) { sets.push("is_verified = ?"); values.push(data.isVerified === null ? null : data.isVerified ? 1 : 0); } if (!sets.length) throw new ApiError(400, "No update fields provided"); values.push(id); const result = await executeSql(`UPDATE agents SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values); if (!result.affectedRows) throw new ApiError(404, "Agent not found"); response.json({ id }); } catch (error) { next(error); } });
