"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminPropertyRoutes = exports.propertyPayloadSchema = exports.LISTING_STATUSES = exports.SPECIAL_CATEGORIES = exports.NEARBY_TYPES = exports.VIEW_TYPES = exports.PROPERTY_TYPES = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const pool_1 = require("../db/pool");
const auth_1 = require("../middleware/auth");
const errors_1 = require("../utils/errors");
const sanitize_1 = require("../utils/sanitize");
exports.PROPERTY_TYPES = ["VILLA", "CONDO", "APARTMENT", "TOWNHOUSE", "COMMERCIAL_BUILDING", "RESORT", "LAND", "HOUSE", "MULTI_FAMILY", "SINGLE_DETACHED_HOUSE", "SEMI_DETACHED_HOUSE"];
exports.VIEW_TYPES = ["BEACH", "RURAL", "MOUNTAIN", "LAKE", "WATERFALL", "CITY"];
exports.NEARBY_TYPES = ["HOSPITAL", "SCHOOL", "AIRPORT", "SHOPPING_MALL", "BEACH", "TRANSPORTATION", "CITY"];
exports.SPECIAL_CATEGORIES = ["DISTRESS_PROPERTY", "FORECLOSURE", "PRE_FORECLOSURE", "FIXER_UPPER", "URGENT_SALE", "FEATURED", "NEW_LISTING"];
exports.LISTING_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED", "DELETED"];
const textArray = zod_1.z.array(zod_1.z.string().min(1).max(240)).max(100).default([]);
const faqSchema = zod_1.z.object({ id: zod_1.z.number().int().positive().optional(), question: zod_1.z.string().min(1).max(240), answer: zod_1.z.string().min(1).max(5000), isActive: zod_1.z.boolean().default(true) });
const nearbySchema = zod_1.z.object({ id: zod_1.z.number().int().positive().optional(), locationType: zod_1.z.enum(exports.NEARBY_TYPES), name: zod_1.z.string().min(1).max(180), distanceLabel: zod_1.z.string().min(1).max(80), distanceMeters: zod_1.z.number().nonnegative().nullable().optional(), sortOrder: zod_1.z.number().int().nonnegative().default(0) });
const seniorSchema = zod_1.z.object({ roomSize: zod_1.z.number().nonnegative().nullable().optional(), buildingSize: zod_1.z.number().nonnegative().nullable().optional(), caregiverIncluded: zod_1.z.boolean().nullable().optional(), caregiverNotes: zod_1.z.string().max(5000).nullable().optional(), seniorCareService: zod_1.z.string().max(160).nullable().optional(), serviceDuration: zod_1.z.string().max(80).nullable().optional(), serviceDeposit: zod_1.z.number().nonnegative().nullable().optional(), monthlyServiceFee: zod_1.z.number().nonnegative().nullable().optional(), servicesIncluded: textArray, seniorPropertyFeatures: textArray, communityAmenities: textArray });
exports.propertyPayloadSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(180),
    slug: zod_1.z.string().max(180).optional(),
    transactionMode: zod_1.z.enum(["SALE", "RENT"]),
    listingChannel: zod_1.z.enum(["STANDARD", "SENIOR_HOME"]),
    publicStatusLabel: zod_1.z.string().max(120).nullable().optional(),
    normalizedPropertyType: zod_1.z.enum(exports.PROPERTY_TYPES).nullable().optional(),
    specialCategory: zod_1.z.enum(exports.SPECIAL_CATEGORIES).nullable().optional(),
    propertyCondition: zod_1.z.string().max(80).nullable().optional(),
    conditionLabel: zod_1.z.string().max(120).nullable().optional(),
    viewType: zod_1.z.enum(exports.VIEW_TYPES).nullable().optional(),
    status: zod_1.z.enum(exports.LISTING_STATUSES).default("DRAFT"),
    priceAmount: zod_1.z.number().nonnegative().nullable().optional(),
    buyPrice: zod_1.z.number().nonnegative().nullable().optional(),
    rentMonthlyPrice: zod_1.z.number().nonnegative().nullable().optional(),
    depositAmount: zod_1.z.number().nonnegative().nullable().optional(),
    depositMonths: zod_1.z.number().nonnegative().nullable().optional(),
    downPaymentAmount: zod_1.z.number().nonnegative().nullable().optional(),
    mortgageTerm: zod_1.z.string().max(80).nullable().optional(),
    mortgageInterestRate: zod_1.z.number().nonnegative().nullable().optional(),
    estimatedMonthlyMortgage: zod_1.z.number().nonnegative().nullable().optional(),
    currencyCode: zod_1.z.string().min(3).max(12).default("THB"),
    priceUnitLabel: zod_1.z.string().max(80).nullable().optional(),
    description: zod_1.z.string().max(10000).nullable().optional(),
    highlights: textArray,
    amenities: textArray,
    features: textArray,
    propertyDetails: textArray,
    furnishingStatus: zod_1.z.string().max(80).nullable().optional(),
    hasAirConditioner: zod_1.z.boolean().nullable().optional(),
    hasKitchen: zod_1.z.boolean().nullable().optional(),
    bedrooms: zod_1.z.number().int().min(0).max(100).nullable().optional(),
    bathrooms: zod_1.z.number().int().min(0).max(100).nullable().optional(),
    landSize: zod_1.z.number().nonnegative().nullable().optional(),
    interiorSizeSqm: zod_1.z.number().nonnegative().nullable().optional(),
    builtYear: zod_1.z.number().int().min(1800).max(2200).nullable().optional(),
    floorCount: zod_1.z.number().int().min(0).max(300).nullable().optional(),
    garageSpaces: zod_1.z.number().int().min(0).max(100).nullable().optional(),
    country: zod_1.z.string().max(120).default("Thailand"),
    province: zod_1.z.string().max(120).nullable().optional(),
    amphoe: zod_1.z.string().max(120).nullable().optional(),
    district: zod_1.z.string().max(120).nullable().optional(),
    tambon: zod_1.z.string().max(120).nullable().optional(),
    city: zod_1.z.string().max(120).nullable().optional(),
    village: zod_1.z.string().max(160).nullable().optional(),
    soi: zod_1.z.string().max(160).nullable().optional(),
    streetAddress: zod_1.z.string().max(240).nullable().optional(),
    postalCode: zod_1.z.string().max(20).nullable().optional(),
    latitude: zod_1.z.number().min(-90).max(90).nullable().optional(),
    longitude: zod_1.z.number().min(-180).max(180).nullable().optional(),
    mapSearchLabel: zod_1.z.string().max(255).nullable().optional(),
    agentId: zod_1.z.number().int().positive().nullable().optional(),
    faqs: zod_1.z.array(faqSchema).max(50).default([]),
    nearbyLocations: zod_1.z.array(nearbySchema).max(50).default([]),
    seniorDetails: seniorSchema.nullable().optional(),
});
function jsonValue(value) {
    if (Array.isArray(value))
        return value.filter((item) => typeof item === "string");
    if (typeof value !== "string")
        return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
    }
    catch {
        return [];
    }
}
function nullableText(value, max) { return value ? (0, sanitize_1.sanitizePlainText)(value, max) : null; }
function oldSection(data) { return data.transactionMode === "RENT" ? "RENT" : "BUY"; }
function oldCategory(data) { return data.specialCategory ?? "NEW_LISTING"; }
function toSummary(row) {
    return {
        id: Number(row.id), title: row.title, slug: row.slug, transactionMode: row.transaction_mode, listingChannel: row.listing_channel,
        publicStatusLabel: row.public_status_label, status: row.status, normalizedPropertyType: row.normalized_property_type,
        specialCategory: row.special_category, province: row.province, city: row.city, priceAmount: row.price_amount === null ? null : Number(row.price_amount),
        currencyCode: row.currency_code, thumbnailUrl: row.thumbnail_url, updatedAt: row.updated_at,
    };
}
function toDetail(row, images, faqs, nearby, senior, agent) {
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
async function fetchDetail(id) {
    const rows = await (0, pool_1.queryRows)(`SELECT l.*, (SELECT card_url FROM listing_images WHERE listing_id = l.id ORDER BY is_cover DESC, sort_order ASC, id ASC LIMIT 1) AS thumbnail_url FROM listings l WHERE l.id = ? LIMIT 1`, [id]);
    const row = rows[0];
    if (!row)
        throw new errors_1.ApiError(404, "Property not found");
    const [images, faqs, nearby, seniorRows, agentRows] = await Promise.all([
        (0, pool_1.queryRows)("SELECT id, original_name, card_url, detail_url, gallery_url, alt_text, caption, sort_order, is_cover FROM listing_images WHERE listing_id = ? ORDER BY sort_order ASC, id ASC", [id]),
        (0, pool_1.queryRows)("SELECT id, question, answer, is_active, sort_order FROM listing_faqs WHERE listing_id = ? ORDER BY sort_order ASC, id ASC", [id]),
        (0, pool_1.queryRows)("SELECT id, location_type, name, distance_label, distance_meters, sort_order FROM listing_nearby_locations WHERE listing_id = ? ORDER BY sort_order ASC, id ASC", [id]),
        (0, pool_1.queryRows)("SELECT * FROM senior_details WHERE listing_id = ? LIMIT 1", [id]),
        (0, pool_1.queryRows)("SELECT a.* FROM agents a JOIN listing_agent_assignments la ON la.agent_id = a.id WHERE la.listing_id = ? AND la.is_primary = 1 LIMIT 1", [id]),
    ]);
    return toDetail(row, images, faqs, nearby, seniorRows[0], agentRows[0]);
}
async function replaceRelations(id, data) {
    await (0, pool_1.executeSql)("DELETE FROM listing_nearby_locations WHERE listing_id = ?", [id]);
    for (let index = 0; index < data.nearbyLocations.length; index += 1) {
        const item = data.nearbyLocations[index];
        await (0, pool_1.executeSql)("INSERT INTO listing_nearby_locations (listing_id, location_type, name, distance_label, distance_meters, sort_order) VALUES (?, ?, ?, ?, ?, ?)", [id, item.locationType, (0, sanitize_1.sanitizePlainText)(item.name, 180), (0, sanitize_1.sanitizePlainText)(item.distanceLabel, 80), item.distanceMeters ?? null, index]);
    }
    await (0, pool_1.executeSql)("DELETE FROM listing_faqs WHERE listing_id = ?", [id]);
    for (let index = 0; index < data.faqs.length; index += 1) {
        const faq = data.faqs[index];
        await (0, pool_1.executeSql)("INSERT INTO listing_faqs (listing_id, question, answer, sort_order, is_active) VALUES (?, ?, ?, ?, ?)", [id, (0, sanitize_1.sanitizePlainText)(faq.question, 240), (0, sanitize_1.sanitizePlainText)(faq.answer, 5000), index, faq.isActive ? 1 : 0]);
    }
    if (data.agentId) {
        await (0, pool_1.executeSql)("INSERT INTO listing_agent_assignments (listing_id, agent_id, is_primary) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE agent_id = VALUES(agent_id), is_primary = 1", [id, data.agentId]);
    }
    else {
        await (0, pool_1.executeSql)("DELETE FROM listing_agent_assignments WHERE listing_id = ?", [id]);
    }
    if (data.listingChannel === "SENIOR_HOME" && data.seniorDetails) {
        const senior = data.seniorDetails;
        await (0, pool_1.executeSql)(`INSERT INTO senior_details (listing_id, room_size, building_size, caregiver_included, caregiver_notes, senior_care_service, service_duration, service_deposit, monthly_service_fee, services_included, senior_property_features, community_amenities) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE room_size=VALUES(room_size), building_size=VALUES(building_size), caregiver_included=VALUES(caregiver_included), caregiver_notes=VALUES(caregiver_notes), senior_care_service=VALUES(senior_care_service), service_duration=VALUES(service_duration), service_deposit=VALUES(service_deposit), monthly_service_fee=VALUES(monthly_service_fee), services_included=VALUES(services_included), senior_property_features=VALUES(senior_property_features), community_amenities=VALUES(community_amenities)`, [id, senior.roomSize ?? null, senior.buildingSize ?? null, senior.caregiverIncluded === null ? null : senior.caregiverIncluded ? 1 : 0, nullableText(senior.caregiverNotes, 5000), nullableText(senior.seniorCareService, 160), nullableText(senior.serviceDuration, 80), senior.serviceDeposit ?? null, senior.monthlyServiceFee ?? null, JSON.stringify((0, sanitize_1.sanitizeStringArray)(senior.servicesIncluded, 100, 240)), JSON.stringify((0, sanitize_1.sanitizeStringArray)(senior.seniorPropertyFeatures, 100, 240)), JSON.stringify((0, sanitize_1.sanitizeStringArray)(senior.communityAmenities, 100, 240))]);
    }
    else if (data.listingChannel !== "SENIOR_HOME") {
        await (0, pool_1.executeSql)("DELETE FROM senior_details WHERE listing_id = ?", [id]);
    }
}
exports.adminPropertyRoutes = (0, express_1.Router)();
exports.adminPropertyRoutes.use(auth_1.requireAuth, (0, auth_1.requireOneOfRoles)(["HEAD_ADMIN", "ADMIN", "EMPLOYEE"]));
exports.adminPropertyRoutes.get("/properties", async (request, response, next) => {
    try {
        const query = zod_1.z.object({ q: zod_1.z.string().max(120).optional(), transactionMode: zod_1.z.enum(["SALE", "RENT"]).optional(), listingChannel: zod_1.z.enum(["STANDARD", "SENIOR_HOME"]).optional(), status: zod_1.z.enum(exports.LISTING_STATUSES).optional(), propertyType: zod_1.z.enum(exports.PROPERTY_TYPES).optional(), province: zod_1.z.string().max(120).optional(), specialCategory: zod_1.z.enum(exports.SPECIAL_CATEGORIES).optional(), page: zod_1.z.coerce.number().int().min(1).default(1), pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20), sort: zod_1.z.enum(["newest", "oldest", "updated"]).default("updated") }).parse(request.query);
        const where = ["1=1"];
        const params = [];
        if (query.q) {
            where.push("(l.title LIKE ? OR l.slug LIKE ? OR l.province LIKE ? OR l.city LIKE ? OR l.district LIKE ?)");
            const q = `%${query.q}%`;
            params.push(q, q, q, q, q);
        }
        if (query.transactionMode) {
            where.push("l.transaction_mode = ?");
            params.push(query.transactionMode);
        }
        if (query.listingChannel) {
            where.push("l.listing_channel = ?");
            params.push(query.listingChannel);
        }
        if (query.status) {
            where.push("l.status = ?");
            params.push(query.status);
        }
        if (query.propertyType) {
            where.push("l.normalized_property_type = ?");
            params.push(query.propertyType);
        }
        if (query.province) {
            where.push("l.province = ?");
            params.push(query.province);
        }
        if (query.specialCategory) {
            where.push("l.special_category = ?");
            params.push(query.specialCategory);
        }
        const order = query.sort === "oldest" ? "l.created_at ASC" : query.sort === "newest" ? "l.created_at DESC" : "l.updated_at DESC";
        const countRows = await (0, pool_1.queryRows)(`SELECT COUNT(*) AS total FROM listings l WHERE ${where.join(" AND ")}`, params);
        const offset = (query.page - 1) * query.pageSize;
        const rows = await (0, pool_1.queryRows)(`SELECT l.id, l.title, l.slug, l.transaction_mode, l.listing_channel, l.public_status_label, l.status, l.normalized_property_type, l.special_category, l.province, l.city, l.price_amount, l.currency_code, l.updated_at, (SELECT card_url FROM listing_images WHERE listing_id = l.id ORDER BY is_cover DESC, sort_order ASC, id ASC LIMIT 1) AS thumbnail_url FROM listings l WHERE ${where.join(" AND ")} ORDER BY ${order} LIMIT ? OFFSET ?`, [...params, query.pageSize, offset]);
        response.json({ items: rows.map(toSummary), pagination: { page: query.page, pageSize: query.pageSize, total: Number(countRows[0]?.total ?? 0), totalPages: Math.ceil(Number(countRows[0]?.total ?? 0) / query.pageSize) } });
    }
    catch (error) {
        next(error);
    }
});
exports.adminPropertyRoutes.get("/properties/:id", async (request, response, next) => { try {
    const id = Number(request.params.id);
    if (!Number.isInteger(id) || id <= 0)
        throw new errors_1.ApiError(400, "Invalid property id");
    response.json(await fetchDetail(id));
}
catch (error) {
    next(error);
} });
exports.adminPropertyRoutes.post("/properties", async (request, response, next) => {
    try {
        const data = exports.propertyPayloadSchema.parse(request.body);
        const title = (0, sanitize_1.sanitizePlainText)(data.title, 180);
        const slug = (0, sanitize_1.sanitizeSlug)(data.slug ?? title);
        if (!slug)
            throw new errors_1.ApiError(400, "Unable to generate slug");
        const result = await (0, pool_1.executeSql)(`INSERT INTO listings (title, slug, section, transaction_mode, listing_channel, public_status_label, normalized_property_type, special_category, property_condition, condition_label, view_type, status, category, price_amount, buy_price, rent_monthly_price, deposit_amount, deposit_months, down_payment_amount, mortgage_term, mortgage_interest_rate, estimated_monthly_mortgage, currency_code, price_unit_label, description, highlights, amenities, features, property_details, furnishing_status, has_air_conditioner, has_kitchen, bedrooms, bathrooms, land_size, interior_size_sqm, built_year, floor_count, garage_spaces, street_address, village, soi, tambon, amphoe, district, city, province, postal_code, country, latitude, longitude, map_search_label, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [title, slug, oldSection(data), data.transactionMode, data.listingChannel, nullableText(data.publicStatusLabel, 120), data.normalizedPropertyType ?? null, data.specialCategory ?? null, nullableText(data.propertyCondition, 80), nullableText(data.conditionLabel, 120), data.viewType ?? null, data.status, oldCategory(data), data.priceAmount ?? null, data.buyPrice ?? null, data.rentMonthlyPrice ?? null, data.depositAmount ?? null, data.depositMonths ?? null, data.downPaymentAmount ?? null, nullableText(data.mortgageTerm, 80), data.mortgageInterestRate ?? null, data.estimatedMonthlyMortgage ?? null, (0, sanitize_1.sanitizePlainText)(data.currencyCode.toUpperCase(), 12), nullableText(data.priceUnitLabel, 80), nullableText(data.description, 10000), JSON.stringify(data.highlights), JSON.stringify(data.amenities), JSON.stringify(data.features), JSON.stringify(data.propertyDetails), nullableText(data.furnishingStatus, 80), data.hasAirConditioner === null || data.hasAirConditioner === undefined ? null : data.hasAirConditioner ? 1 : 0, data.hasKitchen === null || data.hasKitchen === undefined ? null : data.hasKitchen ? 1 : 0, data.bedrooms ?? null, data.bathrooms ?? null, data.landSize ?? null, data.interiorSizeSqm ?? null, data.builtYear ?? null, data.floorCount ?? null, data.garageSpaces ?? null, nullableText(data.streetAddress, 240), nullableText(data.village, 160), nullableText(data.soi, 160), nullableText(data.tambon, 120), nullableText(data.amphoe, 120), nullableText(data.district, 120), nullableText(data.city, 120), nullableText(data.province, 120), nullableText(data.postalCode, 20), nullableText(data.country, 120) ?? "Thailand", data.latitude ?? null, data.longitude ?? null, nullableText(data.mapSearchLabel, 255), request.user.id]);
        const id = Number(result.insertId);
        await replaceRelations(id, data);
        response.status(201).json({ id, property: await fetchDetail(id) });
    }
    catch (error) {
        next(error);
    }
});
exports.adminPropertyRoutes.patch("/properties/:id", async (request, response, next) => {
    try {
        const id = Number(request.params.id);
        if (!Number.isInteger(id) || id <= 0)
            throw new errors_1.ApiError(400, "Invalid property id");
        const data = exports.propertyPayloadSchema.parse(request.body);
        const sets = ["title = ?", "slug = ?", "section = ?", "transaction_mode = ?", "listing_channel = ?", "public_status_label = ?", "normalized_property_type = ?", "special_category = ?", "property_condition = ?", "condition_label = ?", "view_type = ?", "status = ?", "category = ?", "price_amount = ?", "buy_price = ?", "rent_monthly_price = ?", "deposit_amount = ?", "deposit_months = ?", "down_payment_amount = ?", "mortgage_term = ?", "mortgage_interest_rate = ?", "estimated_monthly_mortgage = ?", "currency_code = ?", "price_unit_label = ?", "description = ?", "highlights = ?", "amenities = ?", "features = ?", "property_details = ?", "furnishing_status = ?", "has_air_conditioner = ?", "has_kitchen = ?", "bedrooms = ?", "bathrooms = ?", "land_size = ?", "interior_size_sqm = ?", "built_year = ?", "floor_count = ?", "garage_spaces = ?", "street_address = ?", "village = ?", "soi = ?", "tambon = ?", "amphoe = ?", "district = ?", "city = ?", "province = ?", "postal_code = ?", "country = ?", "latitude = ?", "longitude = ?", "map_search_label = ?", "updated_at = CURRENT_TIMESTAMP"];
        const values = [(0, sanitize_1.sanitizePlainText)(data.title, 180), (0, sanitize_1.sanitizeSlug)(data.slug ?? data.title), oldSection(data), data.transactionMode, data.listingChannel, nullableText(data.publicStatusLabel, 120), data.normalizedPropertyType ?? null, data.specialCategory ?? null, nullableText(data.propertyCondition, 80), nullableText(data.conditionLabel, 120), data.viewType ?? null, data.status, oldCategory(data), data.priceAmount ?? null, data.buyPrice ?? null, data.rentMonthlyPrice ?? null, data.depositAmount ?? null, data.depositMonths ?? null, data.downPaymentAmount ?? null, nullableText(data.mortgageTerm, 80), data.mortgageInterestRate ?? null, data.estimatedMonthlyMortgage ?? null, (0, sanitize_1.sanitizePlainText)(data.currencyCode.toUpperCase(), 12), nullableText(data.priceUnitLabel, 80), nullableText(data.description, 10000), JSON.stringify(data.highlights), JSON.stringify(data.amenities), JSON.stringify(data.features), JSON.stringify(data.propertyDetails), nullableText(data.furnishingStatus, 80), data.hasAirConditioner === null || data.hasAirConditioner === undefined ? null : data.hasAirConditioner ? 1 : 0, data.hasKitchen === null || data.hasKitchen === undefined ? null : data.hasKitchen ? 1 : 0, data.bedrooms ?? null, data.bathrooms ?? null, data.landSize ?? null, data.interiorSizeSqm ?? null, data.builtYear ?? null, data.floorCount ?? null, data.garageSpaces ?? null, nullableText(data.streetAddress, 240), nullableText(data.village, 160), nullableText(data.soi, 160), nullableText(data.tambon, 120), nullableText(data.amphoe, 120), nullableText(data.district, 120), nullableText(data.city, 120), nullableText(data.province, 120), nullableText(data.postalCode, 20), nullableText(data.country, 120) ?? "Thailand", data.latitude ?? null, data.longitude ?? null, nullableText(data.mapSearchLabel, 255), id];
        const result = await (0, pool_1.executeSql)(`UPDATE listings SET ${sets.join(", ")} WHERE id = ?`, values);
        if (!result.affectedRows)
            throw new errors_1.ApiError(404, "Property not found");
        await replaceRelations(id, data);
        response.json({ id, property: await fetchDetail(id) });
    }
    catch (error) {
        next(error);
    }
});
exports.adminPropertyRoutes.delete("/properties/:id", async (request, response, next) => { try {
    const id = Number(request.params.id);
    if (!Number.isInteger(id) || id <= 0)
        throw new errors_1.ApiError(400, "Invalid property id");
    const result = await (0, pool_1.executeSql)("UPDATE listings SET status = 'DELETED', public_status_label = 'Deleted', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
    if (!result.affectedRows)
        throw new errors_1.ApiError(404, "Property not found");
    response.json({ id, status: "DELETED" });
}
catch (error) {
    next(error);
} });
exports.adminPropertyRoutes.get("/agents", async (_request, response, next) => { try {
    const rows = await (0, pool_1.queryRows)("SELECT id, name, phone, email, agency, is_active, is_verified FROM agents ORDER BY is_active DESC, name ASC");
    response.json({ items: rows.map((row) => ({ id: Number(row.id), name: row.name, phone: row.phone, email: row.email, agency: row.agency, isActive: Boolean(row.is_active), isVerified: row.is_verified === null ? null : Boolean(row.is_verified) })) });
}
catch (error) {
    next(error);
} });
exports.adminPropertyRoutes.post("/agents", (0, auth_1.requireOneOfRoles)(["HEAD_ADMIN", "ADMIN"]), async (request, response, next) => { try {
    const data = zod_1.z.object({ name: zod_1.z.string().min(1).max(120), phone: zod_1.z.string().min(4).max(40), email: zod_1.z.string().email(), agency: zod_1.z.string().max(160).nullable().optional() }).parse(request.body);
    const result = await (0, pool_1.executeSql)("INSERT INTO agents (name, phone, email, agency) VALUES (?, ?, ?, ?)", [(0, sanitize_1.sanitizePlainText)(data.name, 120), (0, sanitize_1.sanitizePlainText)(data.phone, 40), (0, sanitize_1.sanitizeEmail)(data.email), nullableText(data.agency, 160)]);
    response.status(201).json({ id: Number(result.insertId) });
}
catch (error) {
    next(error);
} });
exports.adminPropertyRoutes.patch("/agents/:id", (0, auth_1.requireRole)("HEAD_ADMIN"), async (request, response, next) => { try {
    const id = Number(request.params.id);
    const data = zod_1.z.object({ name: zod_1.z.string().min(1).max(120).optional(), phone: zod_1.z.string().min(4).max(40).optional(), email: zod_1.z.string().email().optional(), agency: zod_1.z.string().max(160).nullable().optional(), isActive: zod_1.z.boolean().optional(), isVerified: zod_1.z.boolean().nullable().optional() }).parse(request.body);
    const sets = [];
    const values = [];
    if (data.name) {
        sets.push("name = ?");
        values.push((0, sanitize_1.sanitizePlainText)(data.name, 120));
    }
    if (data.phone) {
        sets.push("phone = ?");
        values.push((0, sanitize_1.sanitizePlainText)(data.phone, 40));
    }
    if (data.email) {
        sets.push("email = ?");
        values.push((0, sanitize_1.sanitizeEmail)(data.email));
    }
    if (data.agency !== undefined) {
        sets.push("agency = ?");
        values.push(nullableText(data.agency, 160));
    }
    if (data.isActive !== undefined) {
        sets.push("is_active = ?");
        values.push(data.isActive ? 1 : 0);
    }
    if (data.isVerified !== undefined) {
        sets.push("is_verified = ?");
        values.push(data.isVerified === null ? null : data.isVerified ? 1 : 0);
    }
    if (!sets.length)
        throw new errors_1.ApiError(400, "No update fields provided");
    values.push(id);
    const result = await (0, pool_1.executeSql)(`UPDATE agents SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    if (!result.affectedRows)
        throw new errors_1.ApiError(404, "Agent not found");
    response.json({ id });
}
catch (error) {
    next(error);
} });
