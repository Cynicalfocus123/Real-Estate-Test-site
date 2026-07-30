"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminPropertyRoutes = exports.adminPropertyListQuerySchema = exports.propertyPayloadSchema = exports.LISTING_STATUSES = exports.SPECIAL_CATEGORIES = exports.NEARBY_TYPES = exports.VIEW_TYPES = exports.PROPERTY_TYPES = void 0;
exports.propertyDisplayPrice = propertyDisplayPrice;
exports.buildAdminPropertyFilters = buildAdminPropertyFilters;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const zod_1 = require("zod");
const pool_1 = require("../db/pool");
const auth_1 = require("../middleware/auth");
const csrf_1 = require("../middleware/csrf");
const imageService_1 = require("../services/imageService");
const errors_1 = require("../utils/errors");
const sanitize_1 = require("../utils/sanitize");
exports.PROPERTY_TYPES = ["VILLA", "CONDO", "APARTMENT", "TOWNHOUSE", "COMMERCIAL_BUILDING", "RESORT", "LAND", "HOUSE", "MULTI_FAMILY", "SINGLE_DETACHED_HOUSE", "SEMI_DETACHED_HOUSE"];
exports.VIEW_TYPES = ["BEACH", "RURAL", "MOUNTAIN", "LAKE", "WATERFALL", "CITY"];
exports.NEARBY_TYPES = ["HOSPITAL", "SCHOOL", "AIRPORT", "SHOPPING_MALL", "BEACH", "TRANSPORTATION", "CITY"];
exports.SPECIAL_CATEGORIES = ["DISTRESS_PROPERTY", "FORECLOSURE", "PRE_FORECLOSURE", "FIXER_UPPER", "URGENT_SALE", "FEATURED", "NEW_LISTING"];
exports.LISTING_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED", "DELETED"];
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { files: 12, fileSize: 8 * 1024 * 1024 } });
const array = zod_1.z.array(zod_1.z.string().min(1).max(240)).max(100).default([]);
const faq = zod_1.z.object({ id: zod_1.z.number().int().positive().optional(), question: zod_1.z.string().min(1).max(240), answer: zod_1.z.string().min(1).max(5000), isActive: zod_1.z.boolean().default(true) });
const nearby = zod_1.z.object({ id: zod_1.z.number().int().positive().optional(), locationType: zod_1.z.enum(exports.NEARBY_TYPES), name: zod_1.z.string().min(1).max(180), distanceLabel: zod_1.z.string().min(1).max(80), distanceMeters: zod_1.z.number().nonnegative().nullable().optional(), sortOrder: zod_1.z.number().int().nonnegative().default(0) });
const senior = zod_1.z.object({ roomSize: zod_1.z.number().nonnegative().nullable().optional(), buildingSize: zod_1.z.number().nonnegative().nullable().optional(), caregiverIncluded: zod_1.z.boolean().nullable().optional(), caregiverNotes: zod_1.z.string().max(5000).nullable().optional(), seniorCareService: zod_1.z.string().max(160).nullable().optional(), serviceDuration: zod_1.z.string().max(80).nullable().optional(), serviceDeposit: zod_1.z.number().nonnegative().nullable().optional(), monthlyServiceFee: zod_1.z.number().nonnegative().nullable().optional(), servicesIncluded: array, seniorPropertyFeatures: array, communityAmenities: array });
const seo = zod_1.z.object({ seoTitle: zod_1.z.string().max(180).nullable().optional(), metaDescription: zod_1.z.string().max(320).nullable().optional(), canonicalUrl: zod_1.z.string().max(500).nullable().optional(), indexStatus: zod_1.z.enum(["index", "noindex"]).default("index"), followStatus: zod_1.z.enum(["follow", "nofollow"]).default("follow"), ogTitle: zod_1.z.string().max(180).nullable().optional(), ogDescription: zod_1.z.string().max(320).nullable().optional(), ogImage: zod_1.z.string().max(500).nullable().optional(), twitterTitle: zod_1.z.string().max(180).nullable().optional(), twitterDescription: zod_1.z.string().max(320).nullable().optional(), twitterImage: zod_1.z.string().max(500).nullable().optional(), schemaType: zod_1.z.string().max(80).default("RealEstateListing") });
exports.propertyPayloadSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(180), slug: zod_1.z.string().max(180).optional(), transactionMode: zod_1.z.enum(["SALE", "RENT"]), listingChannel: zod_1.z.enum(["STANDARD", "SENIOR_HOME"]), publicStatusLabel: zod_1.z.string().max(120).nullable().optional(), normalizedPropertyType: zod_1.z.enum(exports.PROPERTY_TYPES).nullable().optional(), specialCategory: zod_1.z.enum(exports.SPECIAL_CATEGORIES).nullable().optional(), propertyCondition: zod_1.z.string().max(80).nullable().optional(), conditionLabel: zod_1.z.string().max(120).nullable().optional(), viewType: zod_1.z.enum(exports.VIEW_TYPES).nullable().optional(), status: zod_1.z.enum(exports.LISTING_STATUSES).default("DRAFT"),
    priceAmount: zod_1.z.number().nonnegative().nullable().optional(), buyPrice: zod_1.z.number().nonnegative().nullable().optional(), rentMonthlyPrice: zod_1.z.number().nonnegative().nullable().optional(), depositAmount: zod_1.z.number().nonnegative().nullable().optional(), depositMonths: zod_1.z.number().nonnegative().nullable().optional(), downPaymentAmount: zod_1.z.number().nonnegative().nullable().optional(), mortgageTerm: zod_1.z.string().max(80).nullable().optional(), mortgageInterestRate: zod_1.z.number().nonnegative().nullable().optional(), estimatedMonthlyMortgage: zod_1.z.number().nonnegative().nullable().optional(), currencyCode: zod_1.z.string().min(3).max(12).default("THB"), priceUnitLabel: zod_1.z.string().max(80).nullable().optional(), description: zod_1.z.string().max(10000).nullable().optional(), highlights: array, amenities: array, features: array, propertyDetails: array,
    furnishingStatus: zod_1.z.string().max(80).nullable().optional(), hasAirConditioner: zod_1.z.boolean().nullable().optional(), hasKitchen: zod_1.z.boolean().nullable().optional(), bedrooms: zod_1.z.number().int().min(0).max(100).nullable().optional(), bathrooms: zod_1.z.number().int().min(0).max(100).nullable().optional(), landSize: zod_1.z.number().nonnegative().nullable().optional(), interiorSizeSqm: zod_1.z.number().nonnegative().nullable().optional(), builtYear: zod_1.z.number().int().min(1800).max(2200).nullable().optional(), floorCount: zod_1.z.number().int().min(0).max(300).nullable().optional(), garageSpaces: zod_1.z.number().int().min(0).max(100).nullable().optional(),
    country: zod_1.z.string().max(120).default("Thailand"), province: zod_1.z.string().max(120).nullable().optional(), amphoe: zod_1.z.string().max(120).nullable().optional(), district: zod_1.z.string().max(120).nullable().optional(), tambon: zod_1.z.string().max(120).nullable().optional(), city: zod_1.z.string().max(120).nullable().optional(), village: zod_1.z.string().max(160).nullable().optional(), soi: zod_1.z.string().max(160).nullable().optional(), streetAddress: zod_1.z.string().max(240).nullable().optional(), postalCode: zod_1.z.string().max(20).nullable().optional(), latitude: zod_1.z.number().min(-90).max(90).nullable().optional(), longitude: zod_1.z.number().min(-180).max(180).nullable().optional(), mapSearchLabel: zod_1.z.string().max(255).nullable().optional(), agentId: zod_1.z.number().int().positive().nullable().optional(), faqs: zod_1.z.array(faq).max(50).default([]), nearbyLocations: zod_1.z.array(nearby).max(50).default([]), seniorDetails: senior.nullable().optional(), seo: seo.default({}),
});
const num = (value) => value === null || value === undefined ? null : Number(value);
const bool = (value) => value === null || value === undefined ? null : Boolean(value);
const json = (value) => { try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
}
catch {
    return [];
} };
const text = (value, max) => value ? (0, sanitize_1.sanitizePlainText)(value, max) : null;
function safeCanonical(value) { if (!value)
    return null; const result = (0, sanitize_1.sanitizeHttpUrl)(value, 500); if (!result || !result.startsWith("https://buyhomeforless.com/"))
    throw new errors_1.ApiError(400, "Canonical URL must use the approved public origin"); return result; }
function safeImageRef(value) { if (!value)
    return null; const result = (0, sanitize_1.sanitizeHttpUrl)(value, 500); if (!result || !result.startsWith("https://buyhomeforless.com/uploads/"))
    throw new errors_1.ApiError(400, "Image URL must use the approved upload origin"); return result; }
function propertyDisplayPrice(property) { const amount = property.transactionMode === "RENT" ? property.rentMonthlyPrice : property.buyPrice ?? property.priceAmount; return amount === null || amount === undefined ? "Price on request" : `${property.currencyCode ?? "THB"} ${Number(amount).toLocaleString()}`; }
function summary(row) { return { id: Number(row.id), title: String(row.title), slug: String(row.slug), transactionMode: row.transaction_mode, listingChannel: row.listing_channel, publicStatusLabel: row.public_status_label, status: row.status, normalizedPropertyType: row.normalized_property_type, specialCategory: row.special_category, province: row.province, city: row.city, priceAmount: num(row.price_amount), buyPrice: num(row.buy_price), rentMonthlyPrice: num(row.rent_monthly_price), currencyCode: String(row.currency_code), thumbnailUrl: row.thumbnail_url ?? null, updatedAt: row.updated_at, displayPrice: propertyDisplayPrice({ transactionMode: row.transaction_mode, buyPrice: num(row.buy_price), rentMonthlyPrice: num(row.rent_monthly_price), priceAmount: num(row.price_amount), currencyCode: String(row.currency_code) }) }; }
async function details(id) { const rows = await (0, pool_1.queryRows)("SELECT l.*, (SELECT card_url FROM listing_images WHERE listing_id=l.id ORDER BY is_cover DESC,sort_order,id LIMIT 1) thumbnail_url FROM listings l WHERE l.id=? LIMIT 1", [id]); const row = rows[0]; if (!row)
    throw new errors_1.ApiError(404, "Property not found"); const [images, faqs, places, seniorRows, agents] = await Promise.all([(0, pool_1.queryRows)("SELECT id,original_name,card_url,detail_url,gallery_url,alt_text,caption,sort_order,is_cover FROM listing_images WHERE listing_id=? ORDER BY sort_order,id", [id]), (0, pool_1.queryRows)("SELECT id,question,answer,is_active,sort_order FROM listing_faqs WHERE listing_id=? ORDER BY sort_order,id", [id]), (0, pool_1.queryRows)("SELECT id,location_type,name,distance_label,distance_meters,sort_order FROM listing_nearby_locations WHERE listing_id=? ORDER BY sort_order,id", [id]), (0, pool_1.queryRows)("SELECT * FROM senior_details WHERE listing_id=?", [id]), (0, pool_1.queryRows)("SELECT a.* FROM agents a JOIN listing_agent_assignments x ON x.agent_id=a.id WHERE x.listing_id=?", [id])]); const s = seniorRows[0]; const agent = agents[0]; return { ...summary(row), description: row.description, propertyCondition: row.property_condition, conditionLabel: row.condition_label, viewType: row.view_type, priceUnitLabel: row.price_unit_label, depositAmount: num(row.deposit_amount), depositMonths: num(row.deposit_months), downPaymentAmount: num(row.down_payment_amount), mortgageTerm: row.mortgage_term, mortgageInterestRate: num(row.mortgage_interest_rate), estimatedMonthlyMortgage: num(row.estimated_monthly_mortgage), highlights: json(row.highlights), amenities: json(row.amenities), features: json(row.features), propertyDetails: json(row.property_details), furnishingStatus: row.furnishing_status, hasAirConditioner: bool(row.has_air_conditioner), hasKitchen: bool(row.has_kitchen), bedrooms: num(row.bedrooms), bathrooms: num(row.bathrooms), landSize: num(row.land_size), interiorSizeSqm: num(row.interior_size_sqm), builtYear: num(row.built_year), floorCount: num(row.floor_count), garageSpaces: num(row.garage_spaces), location: { country: row.country, province: row.province, amphoe: row.amphoe, district: row.district, tambon: row.tambon, city: row.city, village: row.village, soi: row.soi, streetAddress: row.street_address, postalCode: row.postal_code, latitude: num(row.latitude), longitude: num(row.longitude), mapSearchLabel: row.map_search_label }, seo: { slug: row.slug, seoTitle: row.seo_title, metaDescription: row.meta_description, canonicalUrl: row.canonical_url, indexStatus: row.index_status, followStatus: row.follow_status, ogTitle: row.og_title, ogDescription: row.og_description, ogImage: row.og_image, twitterTitle: row.twitter_title, twitterDescription: row.twitter_description, twitterImage: row.twitter_image, schemaType: row.schema_type }, images: images.map((x) => ({ id: Number(x.id), originalName: x.original_name, cardUrl: x.card_url, detailUrl: x.detail_url, galleryUrl: x.gallery_url, altText: x.alt_text, caption: x.caption, sortOrder: num(x.sort_order), isCover: Boolean(x.is_cover) })), faqs: faqs.map((x) => ({ id: Number(x.id), question: x.question, answer: x.answer, isActive: Boolean(x.is_active), sortOrder: num(x.sort_order) })), nearbyLocations: places.map((x) => ({ id: Number(x.id), locationType: x.location_type, name: x.name, distanceLabel: x.distance_label, distanceMeters: num(x.distance_meters), sortOrder: num(x.sort_order) })), seniorDetails: s ? { roomSize: num(s.room_size), buildingSize: num(s.building_size), caregiverIncluded: bool(s.caregiver_included), caregiverNotes: s.caregiver_notes, seniorCareService: s.senior_care_service, serviceDuration: s.service_duration, serviceDeposit: num(s.service_deposit), monthlyServiceFee: num(s.monthly_service_fee), servicesIncluded: json(s.services_included), seniorPropertyFeatures: json(s.senior_property_features), communityAmenities: json(s.community_amenities) } : null, agent: agent ? { id: Number(agent.id), name: agent.name, phone: agent.phone, email: agent.email, agency: agent.agency, isActive: Boolean(agent.is_active), isVerified: bool(agent.is_verified) } : null }; }
async function relations(connection, id, data) { await connection.query("DELETE FROM listing_faqs WHERE listing_id=?", [id]); for (const [index, item] of data.faqs.entries())
    await connection.query("INSERT INTO listing_faqs (listing_id,question,answer,sort_order,is_active) VALUES (?,?,?,?,?)", [id, text(item.question, 240), text(item.answer, 5000), index, item.isActive ? 1 : 0]); await connection.query("DELETE FROM listing_nearby_locations WHERE listing_id=?", [id]); for (const [index, item] of data.nearbyLocations.entries())
    await connection.query("INSERT INTO listing_nearby_locations (listing_id,location_type,name,distance_label,distance_meters,sort_order) VALUES (?,?,?,?,?,?)", [id, item.locationType, text(item.name, 180), text(item.distanceLabel, 80), item.distanceMeters ?? null, index]); if (data.agentId) {
    const [available] = await connection.query("SELECT id FROM agents WHERE id=? AND is_active=1", [data.agentId]);
    if (!available.length)
        throw new errors_1.ApiError(400, "Selected agent is unavailable");
    await connection.query("INSERT INTO listing_agent_assignments (listing_id,agent_id,is_primary) VALUES (?,?,1) ON DUPLICATE KEY UPDATE agent_id=VALUES(agent_id),is_primary=1", [id, data.agentId]);
}
else
    await connection.query("DELETE FROM listing_agent_assignments WHERE listing_id=?", [id]); if (data.seniorDetails) {
    const x = data.seniorDetails;
    await connection.query("INSERT INTO senior_details (listing_id,room_size,building_size,caregiver_included,caregiver_notes,senior_care_service,service_duration,service_deposit,monthly_service_fee,services_included,senior_property_features,community_amenities) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE room_size=VALUES(room_size),building_size=VALUES(building_size),caregiver_included=VALUES(caregiver_included),caregiver_notes=VALUES(caregiver_notes),senior_care_service=VALUES(senior_care_service),service_duration=VALUES(service_duration),service_deposit=VALUES(service_deposit),monthly_service_fee=VALUES(monthly_service_fee),services_included=VALUES(services_included),senior_property_features=VALUES(senior_property_features),community_amenities=VALUES(community_amenities)", [id, x.roomSize ?? null, x.buildingSize ?? null, x.caregiverIncluded === null || x.caregiverIncluded === undefined ? null : x.caregiverIncluded ? 1 : 0, text(x.caregiverNotes, 5000), text(x.seniorCareService, 160), text(x.serviceDuration, 80), x.serviceDeposit ?? null, x.monthlyServiceFee ?? null, JSON.stringify((0, sanitize_1.sanitizeStringArray)(x.servicesIncluded, 100, 240)), JSON.stringify((0, sanitize_1.sanitizeStringArray)(x.seniorPropertyFeatures, 100, 240)), JSON.stringify((0, sanitize_1.sanitizeStringArray)(x.communityAmenities, 100, 240))]);
} }
function values(data) { const x = data.seo; return [text(data.title, 180), (0, sanitize_1.sanitizeSlug)(data.slug ?? data.title), data.transactionMode === "RENT" ? "RENT" : "BUY", data.transactionMode, data.listingChannel, text(data.publicStatusLabel, 120), data.normalizedPropertyType ?? null, data.specialCategory ?? null, text(data.propertyCondition, 80), text(data.conditionLabel, 120), data.viewType ?? null, data.status, data.specialCategory ?? "NEW_LISTING", data.priceAmount ?? null, data.buyPrice ?? null, data.rentMonthlyPrice ?? null, data.depositAmount ?? null, data.depositMonths ?? null, data.downPaymentAmount ?? null, text(data.mortgageTerm, 80), data.mortgageInterestRate ?? null, data.estimatedMonthlyMortgage ?? null, text(data.currencyCode.toUpperCase(), 12), text(data.priceUnitLabel, 80), text(data.description, 10000), JSON.stringify((0, sanitize_1.sanitizeStringArray)(data.highlights, 100, 240)), JSON.stringify((0, sanitize_1.sanitizeStringArray)(data.amenities, 100, 240)), JSON.stringify((0, sanitize_1.sanitizeStringArray)(data.features, 100, 240)), JSON.stringify((0, sanitize_1.sanitizeStringArray)(data.propertyDetails, 100, 240)), text(data.furnishingStatus, 80), data.hasAirConditioner === null || data.hasAirConditioner === undefined ? null : data.hasAirConditioner ? 1 : 0, data.hasKitchen === null || data.hasKitchen === undefined ? null : data.hasKitchen ? 1 : 0, data.bedrooms ?? null, data.bathrooms ?? null, data.landSize ?? null, data.interiorSizeSqm ?? null, data.builtYear ?? null, data.floorCount ?? null, data.garageSpaces ?? null, text(data.streetAddress, 240), text(data.village, 160), text(data.soi, 160), text(data.tambon, 120), text(data.amphoe, 120), text(data.district, 120), text(data.city, 120), text(data.province, 120), text(data.postalCode, 20), text(data.country, 120) ?? "Thailand", data.latitude ?? null, data.longitude ?? null, text(data.mapSearchLabel, 255), text(x.seoTitle, 180), text(x.metaDescription, 320), safeCanonical(x.canonicalUrl), x.indexStatus, x.followStatus, text(x.ogTitle, 180), text(x.ogDescription, 320), safeImageRef(x.ogImage), text(x.twitterTitle, 180), text(x.twitterDescription, 320), safeImageRef(x.twitterImage), text(x.schemaType, 80) ?? "RealEstateListing"]; }
const columns = "title=?,slug=?,section=?,transaction_mode=?,listing_channel=?,public_status_label=?,normalized_property_type=?,special_category=?,property_condition=?,condition_label=?,view_type=?,status=?,category=?,price_amount=?,buy_price=?,rent_monthly_price=?,deposit_amount=?,deposit_months=?,down_payment_amount=?,mortgage_term=?,mortgage_interest_rate=?,estimated_monthly_mortgage=?,currency_code=?,price_unit_label=?,description=?,highlights=?,amenities=?,features=?,property_details=?,furnishing_status=?,has_air_conditioner=?,has_kitchen=?,bedrooms=?,bathrooms=?,land_size=?,interior_size_sqm=?,built_year=?,floor_count=?,garage_spaces=?,street_address=?,village=?,soi=?,tambon=?,amphoe=?,district=?,city=?,province=?,postal_code=?,country=?,latitude=?,longitude=?,map_search_label=?,seo_title=?,meta_description=?,canonical_url=?,index_status=?,follow_status=?,og_title=?,og_description=?,og_image=?,twitter_title=?,twitter_description=?,twitter_image=?,schema_type=?,updated_at=CURRENT_TIMESTAMP";
async function uniqueSlug(connection, slug, except) { const [rows] = await connection.query(`SELECT id FROM listings WHERE slug=?${except ? " AND id<>?" : ""} LIMIT 1`, except ? [slug, except] : [slug]); if (rows.length)
    throw new errors_1.ApiError(409, "This slug is already in use"); }
exports.adminPropertyListQuerySchema = zod_1.z.object({ q: zod_1.z.string().max(120).optional(), status: zod_1.z.enum(exports.LISTING_STATUSES).optional(), transactionMode: zod_1.z.enum(["SALE", "RENT"]).optional(), listingChannel: zod_1.z.enum(["STANDARD", "SENIOR_HOME"]).optional(), propertyType: zod_1.z.enum(exports.PROPERTY_TYPES).optional(), page: zod_1.z.coerce.number().int().min(1).default(1), pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20) });
function buildAdminPropertyFilters(q) { const where = ["1=1"], p = []; if (q.q) {
    where.push("(l.title LIKE ? OR l.slug LIKE ? OR l.province LIKE ? OR l.city LIKE ?)");
    const s = `%${q.q}%`;
    p.push(s, s, s, s);
} if (q.status) {
    where.push("l.status=?");
    p.push(q.status);
}
else
    where.push("l.status<>'DELETED'"); if (q.transactionMode) {
    where.push("l.transaction_mode=?");
    p.push(q.transactionMode);
} if (q.listingChannel) {
    where.push("l.listing_channel=?");
    p.push(q.listingChannel);
} if (q.propertyType) {
    where.push("l.normalized_property_type=?");
    p.push(q.propertyType);
} return { where, p }; }
exports.adminPropertyRoutes = (0, express_1.Router)();
exports.adminPropertyRoutes.use(auth_1.requireAuth, (0, auth_1.requireOneOfRoles)(["HEAD_ADMIN", "ADMIN", "EMPLOYEE"]), csrf_1.requireSameOrigin);
exports.adminPropertyRoutes.get("/properties", async (req, res, next) => { try {
    const q = exports.adminPropertyListQuerySchema.parse(req.query);
    const { where, p } = buildAdminPropertyFilters(q);
    const count = await (0, pool_1.queryRows)(`SELECT COUNT(*) total FROM listings l WHERE ${where.join(" AND ")}`, p), rows = await (0, pool_1.queryRows)(`SELECT l.*, (SELECT card_url FROM listing_images WHERE listing_id=l.id ORDER BY is_cover DESC,sort_order,id LIMIT 1) thumbnail_url FROM listings l WHERE ${where.join(" AND ")} ORDER BY l.updated_at DESC LIMIT ? OFFSET ?`, [...p, q.pageSize, (q.page - 1) * q.pageSize]);
    res.json({ items: rows.map(summary), pagination: { page: q.page, pageSize: q.pageSize, total: num(count[0]?.total) ?? 0, totalPages: Math.max(1, Math.ceil((num(count[0]?.total) ?? 0) / q.pageSize)) } });
}
catch (e) {
    next(e);
} });
exports.adminPropertyRoutes.get("/properties/:id", async (req, res, next) => { try {
    res.json(await details(zod_1.z.coerce.number().int().positive().parse(req.params.id)));
}
catch (e) {
    next(e);
} });
exports.adminPropertyRoutes.post("/properties", async (req, res, next) => { try {
    const data = exports.propertyPayloadSchema.parse(req.body);
    const id = await (0, pool_1.withTransaction)(async (c) => { const slug = (0, sanitize_1.sanitizeSlug)(data.slug ?? data.title); if (!slug)
        throw new errors_1.ApiError(400, "Unable to generate slug"); await uniqueSlug(c, slug); const [result] = await c.query(`INSERT INTO listings (${columns.replace(/=\?/g, "").replace(/,updated_at=CURRENT_TIMESTAMP/, "")},created_by) VALUES (${Array(64).fill("?").join(",")},?)`, [...values({ ...data, slug }), req.user.id]); const id = Number(result.insertId); await relations(c, id, data); return id; });
    res.status(201).json({ id, property: await details(id) });
}
catch (e) {
    next(e);
} });
exports.adminPropertyRoutes.patch("/properties/:id", async (req, res, next) => { try {
    const id = zod_1.z.coerce.number().int().positive().parse(req.params.id);
    const existing = await details(id);
    const existingLocation = (existing.location ?? {});
    const existingSeo = (existing.seo ?? {});
    const incoming = req.body;
    const data = exports.propertyPayloadSchema.parse({ ...existing, ...existingLocation, agentId: existing.agent?.id ?? null, ...incoming, seo: { ...existingSeo, ...incoming.seo } });
    await (0, pool_1.withTransaction)(async (c) => { const slug = (0, sanitize_1.sanitizeSlug)(data.slug ?? data.title); if (!slug)
        throw new errors_1.ApiError(400, "Unable to generate slug"); await uniqueSlug(c, slug, id); const [result] = await c.query(`UPDATE listings SET ${columns} WHERE id=?`, [...values({ ...data, slug }), id]); if (!result.affectedRows)
        throw new errors_1.ApiError(404, "Property not found"); await relations(c, id, data); });
    res.json({ id, property: await details(id) });
}
catch (e) {
    next(e);
} });
exports.adminPropertyRoutes.delete("/properties/:id", async (req, res, next) => { try {
    const id = zod_1.z.coerce.number().int().positive().parse(req.params.id);
    const r = await (0, pool_1.executeSql)("UPDATE listings SET status='DELETED',updated_at=CURRENT_TIMESTAMP WHERE id=?", [id]);
    if (!r.affectedRows)
        throw new errors_1.ApiError(404, "Property not found");
    res.json({ id, status: "DELETED" });
}
catch (e) {
    next(e);
} });
exports.adminPropertyRoutes.post("/properties/:id/restore", async (req, res, next) => { try {
    const id = zod_1.z.coerce.number().int().positive().parse(req.params.id);
    const r = await (0, pool_1.executeSql)("UPDATE listings SET status='DRAFT',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='DELETED'", [id]);
    if (!r.affectedRows)
        throw new errors_1.ApiError(404, "Deleted property not found");
    res.json({ id, status: "DRAFT" });
}
catch (e) {
    next(e);
} });
exports.adminPropertyRoutes.post("/properties/:id/images", upload.array("images", 12), async (req, res, next) => { try {
    const id = zod_1.z.coerce.number().int().positive().parse(req.params.id);
    res.status(201).json({ items: await (0, imageService_1.saveListingImages)(id, req.files ?? []) });
}
catch (e) {
    next(e);
} });
exports.adminPropertyRoutes.patch("/properties/:id/images/:imageId", async (req, res, next) => { try {
    const id = zod_1.z.coerce.number().int().positive().parse(req.params.id), image = zod_1.z.coerce.number().int().positive().parse(req.params.imageId), data = zod_1.z.object({ altText: zod_1.z.string().max(180).nullable().optional(), caption: zod_1.z.string().max(240).nullable().optional() }).parse(req.body), r = await (0, pool_1.executeSql)("UPDATE listing_images SET alt_text=?,caption=? WHERE id=? AND listing_id=?", [text(data.altText, 180), text(data.caption, 240), image, id]);
    if (!r.affectedRows)
        throw new errors_1.ApiError(404, "Image not found");
    res.json({ id: image });
}
catch (e) {
    next(e);
} });
exports.adminPropertyRoutes.patch("/properties/:id/images/reorder", async (req, res, next) => { try {
    const id = zod_1.z.coerce.number().int().positive().parse(req.params.id), ids = zod_1.z.object({ imageIds: zod_1.z.array(zod_1.z.number().int().positive()).max(12) }).parse(req.body).imageIds;
    const rows = await (0, pool_1.queryRows)("SELECT id FROM listing_images WHERE listing_id=? ORDER BY sort_order,id", [id]);
    if (ids.length !== rows.length || new Set(ids).size !== ids.length || ids.some(x => !rows.some(r => Number(r.id) === x)))
        throw new errors_1.ApiError(400, "Image order must contain every property image once");
    await (0, pool_1.withTransaction)(async (c) => { for (const [n, image] of ids.entries())
        await c.query("UPDATE listing_images SET sort_order=? WHERE id=? AND listing_id=?", [n, image, id]); });
    res.json({ ok: true });
}
catch (e) {
    next(e);
} });
exports.adminPropertyRoutes.patch("/properties/:id/images/:imageId/cover", async (req, res, next) => { try {
    const id = zod_1.z.coerce.number().int().positive().parse(req.params.id), image = zod_1.z.coerce.number().int().positive().parse(req.params.imageId);
    await (0, pool_1.withTransaction)(async (c) => { const [found] = await c.query("SELECT id FROM listing_images WHERE id=? AND listing_id=?", [image, id]); if (!found.length)
        throw new errors_1.ApiError(404, "Image not found"); await c.query("UPDATE listing_images SET is_cover=0 WHERE listing_id=?", [id]); await c.query("UPDATE listing_images SET is_cover=1 WHERE id=?", [image]); });
    res.json({ ok: true });
}
catch (e) {
    next(e);
} });
exports.adminPropertyRoutes.delete("/properties/:id/images/cover", async (req, res, next) => { try {
    await (0, pool_1.executeSql)("UPDATE listing_images SET is_cover=0 WHERE listing_id=?", [zod_1.z.coerce.number().int().positive().parse(req.params.id)]);
    res.json({ ok: true });
}
catch (e) {
    next(e);
} });
exports.adminPropertyRoutes.delete("/properties/:id/images/:imageId", async (req, res, next) => { try {
    const id = zod_1.z.coerce.number().int().positive().parse(req.params.id), image = zod_1.z.coerce.number().int().positive().parse(req.params.imageId);
    const rows = await (0, pool_1.queryRows)("SELECT card_url,banner_url,detail_url,mobile_url,gallery_url FROM listing_images WHERE id=? AND listing_id=?", [image, id]);
    if (!rows[0])
        throw new errors_1.ApiError(404, "Image not found");
    await (0, pool_1.executeSql)("DELETE FROM listing_images WHERE id=? AND listing_id=?", [image, id]);
    await (0, imageService_1.deleteListingImageFiles)([String(rows[0].card_url), String(rows[0].banner_url), String(rows[0].detail_url), String(rows[0].mobile_url), String(rows[0].gallery_url)]);
    res.json({ ok: true });
}
catch (e) {
    next(e);
} });
exports.adminPropertyRoutes.get("/agents", async (_q, res, next) => { try {
    const rows = await (0, pool_1.queryRows)("SELECT id,name,phone,email,agency,is_active,is_verified FROM agents ORDER BY is_active DESC,name");
    res.json({ items: rows.map(x => ({ id: Number(x.id), name: x.name, phone: x.phone, email: x.email, agency: x.agency, isActive: Boolean(x.is_active), isVerified: bool(x.is_verified) })) });
}
catch (e) {
    next(e);
} });
exports.adminPropertyRoutes.post("/agents", (0, auth_1.requireOneOfRoles)(["HEAD_ADMIN", "ADMIN"]), async (req, res, next) => { try {
    const x = zod_1.z.object({ name: zod_1.z.string().min(1).max(120), phone: zod_1.z.string().min(4).max(40), email: zod_1.z.string().email(), agency: zod_1.z.string().max(160).nullable().optional() }).parse(req.body), r = await (0, pool_1.executeSql)("INSERT INTO agents (name,phone,email,agency) VALUES (?,?,?,?)", [text(x.name, 120), text(x.phone, 40), (0, sanitize_1.sanitizeEmail)(x.email), text(x.agency, 160)]);
    res.status(201).json({ id: Number(r.insertId) });
}
catch (e) {
    next(e);
} });
exports.adminPropertyRoutes.patch("/agents/:id", (0, auth_1.requireRole)("HEAD_ADMIN"), async (req, res, next) => { try {
    const id = zod_1.z.coerce.number().int().positive().parse(req.params.id), x = zod_1.z.object({ name: zod_1.z.string().min(1).max(120).optional(), phone: zod_1.z.string().min(4).max(40).optional(), email: zod_1.z.string().email().optional(), agency: zod_1.z.string().max(160).nullable().optional(), isActive: zod_1.z.boolean().optional(), isVerified: zod_1.z.boolean().nullable().optional() }).parse(req.body), sets = [], p = [];
    for (const [key, column, max] of [["name", "name", 120], ["phone", "phone", 40], ["agency", "agency", 160]])
        if (x[key] !== undefined) {
            sets.push(`${column}=?`);
            p.push(text(x[key], max));
        }
    if (x.email) {
        sets.push("email=?");
        p.push((0, sanitize_1.sanitizeEmail)(x.email));
    }
    if (x.isActive !== undefined) {
        sets.push("is_active=?");
        p.push(x.isActive ? 1 : 0);
    }
    if (x.isVerified !== undefined) {
        sets.push("is_verified=?");
        p.push(x.isVerified === null ? null : x.isVerified ? 1 : 0);
    }
    if (!sets.length)
        throw new errors_1.ApiError(400, "No agent changes supplied");
    const r = await (0, pool_1.executeSql)(`UPDATE agents SET ${sets.join(",")},updated_at=CURRENT_TIMESTAMP WHERE id=?`, [...p, id]);
    if (!r.affectedRows)
        throw new errors_1.ApiError(404, "Agent not found");
    res.json({ id });
}
catch (e) {
    next(e);
} });
exports.adminPropertyRoutes.delete("/agents/:id", (0, auth_1.requireRole)("HEAD_ADMIN"), async (req, res, next) => { try {
    const id = zod_1.z.coerce.number().int().positive().parse(req.params.id);
    const r = await (0, pool_1.executeSql)("DELETE FROM agents WHERE id=?", [id]);
    if (!r.affectedRows)
        throw new errors_1.ApiError(404, "Agent not found");
    res.json({ id });
}
catch (e) {
    next(e);
} });
