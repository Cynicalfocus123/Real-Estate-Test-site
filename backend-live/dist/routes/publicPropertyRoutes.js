"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicPropertyRoutes = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const pool_1 = require("../db/pool");
const errors_1 = require("../utils/errors");
const sanitize_1 = require("../utils/sanitize");
const env_1 = require("../config/env");
const modes = ["SALE", "RENT"];
const channels = ["STANDARD", "SENIOR_HOME"];
const sortValues = ["recommended", "newest", "price-low", "price-high", "size-low", "size-high"];
const querySchema = zod_1.z.object({ q: zod_1.z.string().max(120).optional(), transactionMode: zod_1.z.enum(modes).optional(), listingChannel: zod_1.z.enum(channels).optional(), province: zod_1.z.string().max(120).optional(), district: zod_1.z.string().max(120).optional(), propertyType: zod_1.z.string().max(80).optional(), specialCategory: zod_1.z.string().max(80).optional(), viewType: zod_1.z.string().max(40).optional(), minPrice: zod_1.z.coerce.number().nonnegative().optional(), maxPrice: zod_1.z.coerce.number().nonnegative().optional(), bedrooms: zod_1.z.coerce.number().int().min(0).max(100).optional(), bathrooms: zod_1.z.coerce.number().int().min(0).max(100).optional(), minLandSize: zod_1.z.coerce.number().nonnegative().optional(), maxLandSize: zod_1.z.coerce.number().nonnegative().optional(), amenities: zod_1.z.preprocess((value) => typeof value === "string" ? value.split(",").filter(Boolean) : value, zod_1.z.array(zod_1.z.string().max(120)).max(20).optional()), ids: zod_1.z.preprocess((value) => typeof value === "string" ? value.split(",") : value, zod_1.z.array(zod_1.z.coerce.number().int().positive()).max(20).optional()), sort: zod_1.z.enum(sortValues).default("recommended"), page: zod_1.z.coerce.number().int().min(1).default(1), pageSize: zod_1.z.coerce.number().int().min(1).max(48).default(24) });
const num = (value) => value === null || value === undefined ? null : Number(value);
const json = (value) => { try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
}
catch {
    return [];
} };
function displayedPrice(row) { const value = row.transaction_mode === "RENT" ? num(row.rent_monthly_price) : num(row.buy_price) ?? num(row.price_amount); return { priceValue: value, displayedPrice: value === null ? "Price on request" : `${row.currency_code ?? "THB"} ${value.toLocaleString()}` }; }
function summary(row) { return { id: Number(row.id), slug: String(row.slug), title: String(row.title), transactionMode: row.transaction_mode, listingChannel: row.listing_channel, publicStatusLabel: row.public_status_label ?? null, normalizedPropertyType: row.normalized_property_type ?? null, specialCategory: row.special_category ?? null, propertyCondition: row.property_condition ?? null, conditionLabel: row.condition_label ?? null, viewType: row.view_type ?? null, ...displayedPrice(row), currencyCode: row.currency_code, bedrooms: num(row.bedrooms), bathrooms: num(row.bathrooms), landSize: num(row.land_size), interiorSizeSqm: num(row.interior_size_sqm), builtYear: num(row.built_year), city: row.city ?? null, province: row.province ?? null, primaryImage: row.primary_image ?? null, imageAltText: row.image_alt_text ?? null, updatedAt: row.updated_at }; }
async function publicSummaryRows(whereSql, params, order = "l.updated_at DESC", limit, offset) { const suffix = limit === undefined ? "" : " LIMIT ? OFFSET ?"; return (0, pool_1.queryRows)(`SELECT l.*, (SELECT card_url FROM listing_images WHERE listing_id=l.id ORDER BY is_cover DESC,sort_order,id LIMIT 1) primary_image, (SELECT alt_text FROM listing_images WHERE listing_id=l.id ORDER BY is_cover DESC,sort_order,id LIMIT 1) image_alt_text FROM listings l ${whereSql} ORDER BY ${order}${suffix}`, limit === undefined ? params : [...params, limit, offset ?? 0]); }
async function relatedFor(row) { return publicSummaryRows("WHERE l.status='PUBLISHED' AND l.id<>? AND l.transaction_mode=?", [row.id, row.transaction_mode], "(l.province <=> ?) DESC, l.updated_at DESC", 8, 0).catch(() => []); }
exports.publicPropertyRoutes = (0, express_1.Router)();
const xmlEscape = (value) => value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[character] ?? character));
exports.publicPropertyRoutes.get("/sitemap.xml", async (_request, response, next) => { try {
    const rows = await (0, pool_1.queryRows)("SELECT slug,canonical_url,updated_at FROM listings WHERE status='PUBLISHED' AND index_status='index' ORDER BY updated_at DESC LIMIT 50000");
    const origin = env_1.env.PUBLIC_SITE_ORIGIN.replace(/\/+$/, "");
    const urls = rows.map((row) => `<url><loc>${xmlEscape(row.canonical_url || `${origin}/property/${encodeURIComponent(row.slug)}`)}</loc><lastmod>${new Date(row.updated_at).toISOString().slice(0, 10)}</lastmod></url>`).join("");
    response.type("application/xml").set("Cache-Control", "public, max-age=300, stale-while-revalidate=900").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
}
catch (error) {
    next(error);
} });
exports.publicPropertyRoutes.get("/properties", async (request, response, next) => { try {
    const q = querySchema.parse(request.query);
    const where = ["l.status='PUBLISHED'"], params = [];
    if (q.q) {
        const like = `%${(0, sanitize_1.sanitizePlainText)(q.q, 120)}%`;
        where.push("(l.title LIKE ? OR l.description LIKE ? OR l.city LIKE ? OR l.province LIKE ?)");
        params.push(like, like, like, like);
    }
    if (q.transactionMode) {
        where.push("l.transaction_mode=?");
        params.push(q.transactionMode);
    }
    if (q.listingChannel) {
        where.push("l.listing_channel=?");
        params.push(q.listingChannel);
    }
    for (const [key, column] of [["province", "l.province"], ["district", "l.district"], ["propertyType", "l.normalized_property_type"], ["specialCategory", "l.special_category"], ["viewType", "l.view_type"]]) {
        const value = q[key];
        if (value) {
            where.push(`${column}=?`);
            params.push((0, sanitize_1.sanitizePlainText)(value, 120));
        }
    }
    const price = "CASE WHEN l.transaction_mode='RENT' THEN l.rent_monthly_price ELSE COALESCE(l.buy_price,l.price_amount) END";
    if (q.minPrice !== undefined) {
        where.push(`${price}>=?`);
        params.push(q.minPrice);
    }
    if (q.maxPrice !== undefined) {
        where.push(`${price}<=?`);
        params.push(q.maxPrice);
    }
    if (q.bedrooms !== undefined) {
        where.push("l.bedrooms>=?");
        params.push(q.bedrooms);
    }
    if (q.bathrooms !== undefined) {
        where.push("l.bathrooms>=?");
        params.push(q.bathrooms);
    }
    if (q.minLandSize !== undefined) {
        where.push("l.land_size>=?");
        params.push(q.minLandSize);
    }
    if (q.maxLandSize !== undefined) {
        where.push("l.land_size<=?");
        params.push(q.maxLandSize);
    }
    for (const amenity of q.amenities ?? []) {
        where.push("JSON_CONTAINS(l.amenities, JSON_QUOTE(?))");
        params.push((0, sanitize_1.sanitizePlainText)(amenity, 120));
    }
    if (q.ids?.length) {
        where.push(`l.id IN (${q.ids.map(() => "?").join(",")})`);
        params.push(...q.ids);
    }
    const whereSql = `WHERE ${where.join(" AND ")}`;
    const order = q.sort === "price-low" ? `${price} IS NULL, ${price} ASC` : q.sort === "price-high" ? `${price} IS NULL, ${price} DESC` : q.sort === "size-low" ? "l.interior_size_sqm IS NULL,l.interior_size_sqm ASC" : q.sort === "size-high" ? "l.interior_size_sqm IS NULL,l.interior_size_sqm DESC" : q.sort === "recommended" ? "(l.special_category='FEATURED') DESC,l.updated_at DESC" : "l.updated_at DESC";
    const totalRows = await (0, pool_1.queryRows)(`SELECT COUNT(*) total FROM listings l ${whereSql}`, params);
    const total = Number(totalRows[0]?.total ?? 0);
    const items = (await publicSummaryRows(whereSql, params, order, q.pageSize, (q.page - 1) * q.pageSize)).map(summary);
    response.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300").json({ items, pagination: { page: q.page, pageSize: q.pageSize, total, totalPages: Math.max(1, Math.ceil(total / q.pageSize)), hasNextPage: q.page * q.pageSize < total, hasPreviousPage: q.page > 1 } });
}
catch (error) {
    next(error);
} });
exports.publicPropertyRoutes.get("/properties/:slug", async (request, response, next) => { try {
    const slug = zod_1.z.string().min(1).max(190).regex(/^[a-z0-9-]+$/).parse(request.params.slug);
    const rows = await publicSummaryRows("WHERE l.status='PUBLISHED' AND l.slug=?", [slug]);
    const row = rows[0];
    if (!row)
        throw new errors_1.ApiError(404, "Property not found");
    const [images, faqs, nearby, agentRows, seniorRows] = await Promise.all([(0, pool_1.queryRows)("SELECT id,card_url,detail_url,gallery_url,alt_text,caption,sort_order,is_cover FROM listing_images WHERE listing_id=? ORDER BY is_cover DESC,sort_order,id", [row.id]), (0, pool_1.queryRows)("SELECT question,answer,sort_order FROM listing_faqs WHERE listing_id=? AND is_active=1 ORDER BY sort_order,id", [row.id]), (0, pool_1.queryRows)("SELECT location_type,name,distance_label,distance_meters,sort_order FROM listing_nearby_locations WHERE listing_id=? ORDER BY sort_order,id", [row.id]), (0, pool_1.queryRows)("SELECT a.id,a.name,a.phone,a.email,a.agency FROM agents a JOIN listing_agent_assignments x ON x.agent_id=a.id WHERE x.listing_id=? AND a.is_active=1", [row.id]), (0, pool_1.queryRows)("SELECT * FROM senior_details WHERE listing_id=?", [row.id])]);
    const s = seniorRows[0];
    const related = (await relatedFor(row)).map(summary);
    response.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300").json({ ...summary(row), description: row.description ?? null, highlights: json(row.highlights), amenities: json(row.amenities), features: json(row.features), propertyDetails: json(row.property_details), furnishingStatus: row.furnishing_status ?? null, hasAirConditioner: row.has_air_conditioner === null ? null : Boolean(row.has_air_conditioner), hasKitchen: row.has_kitchen === null ? null : Boolean(row.has_kitchen), floorCount: num(row.floor_count), garageSpaces: num(row.garage_spaces), pricing: { buyPrice: num(row.buy_price), rentMonthlyPrice: num(row.rent_monthly_price), depositAmount: num(row.deposit_amount), depositMonths: num(row.deposit_months), downPaymentAmount: num(row.down_payment_amount), mortgageTerm: row.mortgage_term ?? null, mortgageInterestRate: num(row.mortgage_interest_rate), estimatedMonthlyMortgage: num(row.estimated_monthly_mortgage) }, address: { streetAddress: row.street_address ?? null, village: row.village ?? null, soi: row.soi ?? null, tambon: row.tambon ?? null, amphoe: row.amphoe ?? null, district: row.district ?? null, city: row.city ?? null, province: row.province ?? null, postalCode: row.postal_code ?? null, country: row.country ?? null, latitude: num(row.latitude), longitude: num(row.longitude), mapSearchLabel: row.map_search_label ?? null }, galleryImages: images.map(x => ({ id: Number(x.id), url: x.gallery_url ?? x.detail_url ?? x.card_url, altText: x.alt_text ?? null, caption: x.caption ?? null, sortOrder: num(x.sort_order), isCover: Boolean(x.is_cover) })), faqs: faqs.map(x => ({ question: x.question, answer: x.answer, sortOrder: num(x.sort_order) })), nearbyLocations: nearby.map(x => ({ locationType: x.location_type, name: x.name, distanceLabel: x.distance_label, distanceMeters: num(x.distance_meters), sortOrder: num(x.sort_order) })), agent: agentRows[0] ? { id: Number(agentRows[0].id), name: agentRows[0].name, phone: agentRows[0].phone, email: agentRows[0].email, agency: agentRows[0].agency ?? null } : null, seniorDetails: s ? { roomSize: num(s.room_size), buildingSize: num(s.building_size), caregiverIncluded: s.caregiver_included === null ? null : Boolean(s.caregiver_included), caregiverNotes: s.caregiver_notes ?? null, seniorCareService: s.senior_care_service ?? null, serviceDuration: s.service_duration ?? null, serviceDeposit: num(s.service_deposit), monthlyServiceFee: num(s.monthly_service_fee), servicesIncluded: json(s.services_included), seniorPropertyFeatures: json(s.senior_property_features), communityAmenities: json(s.community_amenities) } : null, seo: { title: row.seo_title ?? null, metaDescription: row.meta_description ?? null, canonicalUrl: row.canonical_url ?? null, indexStatus: row.index_status, followStatus: row.follow_status, ogTitle: row.og_title ?? null, ogDescription: row.og_description ?? null, ogImage: row.og_image ?? null, twitterTitle: row.twitter_title ?? null, twitterDescription: row.twitter_description ?? null, twitterImage: row.twitter_image ?? null, schemaType: row.schema_type ?? null }, relatedProperties: related });
}
catch (error) {
    next(error);
} });
