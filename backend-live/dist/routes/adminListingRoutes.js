"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminListingRoutes = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const zod_1 = require("zod");
const listing_1 = require("../constants/listing");
const pool_1 = require("../db/pool");
const auth_1 = require("../middleware/auth");
const imageService_1 = require("../services/imageService");
const errors_1 = require("../utils/errors");
const sanitize_1 = require("../utils/sanitize");
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { files: 12, fileSize: 8 * 1024 * 1024 },
});
const listingFaqSchema = zod_1.z.object({
    question: zod_1.z.string().min(1).max(240),
    answer: zod_1.z.string().min(1).max(5000),
});
const imageSeoSchema = zod_1.z.object({
    id: zod_1.z.number().int().positive(),
    altText: zod_1.z.string().max(180).nullable().optional(),
    caption: zod_1.z.string().max(240).nullable().optional(),
});
const listingSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(180),
    slug: zod_1.z.string().max(180).optional(),
    seoTitle: zod_1.z.string().max(180).nullable().optional(),
    metaDescription: zod_1.z.string().max(320).nullable().optional(),
    seoKeywords: zod_1.z.array(zod_1.z.string()).max(30).optional(),
    canonicalUrl: zod_1.z.string().max(500).nullable().optional(),
    indexStatus: zod_1.z.enum(["index", "noindex"]).default("index"),
    followStatus: zod_1.z.enum(["follow", "nofollow"]).default("follow"),
    ogTitle: zod_1.z.string().max(180).nullable().optional(),
    ogDescription: zod_1.z.string().max(320).nullable().optional(),
    ogImage: zod_1.z.string().max(500).nullable().optional(),
    twitterTitle: zod_1.z.string().max(180).nullable().optional(),
    twitterDescription: zod_1.z.string().max(320).nullable().optional(),
    twitterImage: zod_1.z.string().max(500).nullable().optional(),
    schemaType: zod_1.z.string().max(80).default("RealEstateListing"),
    section: zod_1.z.enum(listing_1.LISTING_SECTIONS),
    category: zod_1.z.enum(listing_1.LISTING_CATEGORIES),
    status: zod_1.z.enum(listing_1.LISTING_STATUSES).default("DRAFT"),
    priceAmount: zod_1.z.number().int().nonnegative().nullable().optional(),
    currencyCode: zod_1.z.string().min(1).max(12).default("THB"),
    buyPrice: zod_1.z.number().int().nonnegative().nullable().optional(),
    rentMonthlyPrice: zod_1.z.number().int().nonnegative().nullable().optional(),
    depositAmount: zod_1.z.number().int().nonnegative().nullable().optional(),
    priceUnitLabel: zod_1.z.string().max(80).nullable().optional(),
    propertyType: zod_1.z.string().max(120).nullable().optional(),
    description: zod_1.z.string().max(10000).nullable().optional(),
    highlights: zod_1.z.array(zod_1.z.string()).max(100).optional(),
    amenities: zod_1.z.array(zod_1.z.string()).max(100).optional(),
    features: zod_1.z.array(zod_1.z.string()).max(100).optional(),
    propertyDetails: zod_1.z.array(zod_1.z.string()).max(120).optional(),
    furnishingStatus: zod_1.z.string().max(80).nullable().optional(),
    hasAirConditioner: zod_1.z.boolean().nullable().optional(),
    hasKitchen: zod_1.z.boolean().nullable().optional(),
    bedrooms: zod_1.z.number().int().min(0).max(30).nullable().optional(),
    bathrooms: zod_1.z.number().int().min(0).max(30).nullable().optional(),
    landSize: zod_1.z.number().nonnegative().nullable().optional(),
    interiorSizeSqm: zod_1.z.number().nonnegative().nullable().optional(),
    builtYear: zod_1.z.number().int().min(1800).max(2100).nullable().optional(),
    streetAddress: zod_1.z.string().max(240).nullable().optional(),
    district: zod_1.z.string().max(120).nullable().optional(),
    subdistrict: zod_1.z.string().max(120).nullable().optional(),
    city: zod_1.z.string().max(120).nullable().optional(),
    province: zod_1.z.string().max(120).nullable().optional(),
    postalCode: zod_1.z.string().max(20).nullable().optional(),
    country: zod_1.z.string().max(120).default("Thailand"),
    latitude: zod_1.z.number().min(-90).max(90).nullable().optional(),
    longitude: zod_1.z.number().min(-180).max(180).nullable().optional(),
    mapSearchLabel: zod_1.z.string().max(255).nullable().optional(),
    faqs: zod_1.z.array(listingFaqSchema).max(50).optional(),
    imageSeo: zod_1.z.array(imageSeoSchema).max(12).optional(),
});
const listingUpdateSchema = listingSchema.partial();
const listingFaqListSchema = zod_1.z.object({
    items: zod_1.z.array(listingFaqSchema).max(50),
});
const imageReorderSchema = zod_1.z.object({
    imageIds: zod_1.z.array(zod_1.z.number().int().positive()).min(1).max(12),
});
const imageSeoListSchema = zod_1.z.object({
    items: zod_1.z.array(imageSeoSchema).max(12),
});
const listingIdSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive(),
});
function sanitizeMaybeText(value, maxLength) {
    if (!value) {
        return null;
    }
    return (0, sanitize_1.sanitizePlainText)(value, maxLength);
}
function sanitizeMaybeUrl(value) {
    if (!value) {
        return null;
    }
    const clean = (0, sanitize_1.sanitizeHttpUrl)(value, 500);
    if (!clean) {
        throw new errors_1.ApiError(400, "Invalid URL");
    }
    return clean;
}
function sanitizeMaybeImageRef(value) {
    if (!value) {
        return null;
    }
    const clean = (0, sanitize_1.sanitizeImageReference)(value, 500);
    if (!clean) {
        throw new errors_1.ApiError(400, "Invalid image URL");
    }
    return clean;
}
function sanitizeFaqs(items) {
    return items.map((item) => ({
        question: (0, sanitize_1.sanitizePlainText)(item.question, 240),
        answer: (0, sanitize_1.sanitizePlainText)(item.answer, 5000),
    }));
}
function cleanListingInput(data) {
    const title = (0, sanitize_1.sanitizePlainText)(data.title, 180);
    const slug = (0, sanitize_1.sanitizeSlug)(data.slug ?? title);
    if (!slug) {
        throw new errors_1.ApiError(400, "Unable to generate slug");
    }
    return {
        title,
        slug,
        seoTitle: sanitizeMaybeText(data.seoTitle, 180),
        metaDescription: sanitizeMaybeText(data.metaDescription, 320),
        seoKeywords: JSON.stringify((0, sanitize_1.sanitizeStringArray)(data.seoKeywords ?? [], 30, 80)),
        canonicalUrl: sanitizeMaybeUrl(data.canonicalUrl),
        indexStatus: data.indexStatus,
        followStatus: data.followStatus,
        ogTitle: sanitizeMaybeText(data.ogTitle, 180),
        ogDescription: sanitizeMaybeText(data.ogDescription, 320),
        ogImage: sanitizeMaybeImageRef(data.ogImage),
        twitterTitle: sanitizeMaybeText(data.twitterTitle, 180),
        twitterDescription: sanitizeMaybeText(data.twitterDescription, 320),
        twitterImage: sanitizeMaybeImageRef(data.twitterImage),
        schemaType: (0, sanitize_1.sanitizePlainText)(data.schemaType, 80) || "RealEstateListing",
        section: data.section,
        category: data.category,
        status: data.status,
        priceAmount: data.priceAmount ?? null,
        currencyCode: (0, sanitize_1.sanitizePlainText)(data.currencyCode.toUpperCase(), 12),
        buyPrice: data.buyPrice ?? null,
        rentMonthlyPrice: data.rentMonthlyPrice ?? null,
        depositAmount: data.depositAmount ?? null,
        priceUnitLabel: sanitizeMaybeText(data.priceUnitLabel, 80),
        propertyType: sanitizeMaybeText(data.propertyType, 120),
        description: sanitizeMaybeText(data.description, 10000),
        highlights: JSON.stringify((0, sanitize_1.sanitizeStringArray)(data.highlights ?? [], 100, 180)),
        amenities: JSON.stringify((0, sanitize_1.sanitizeStringArray)(data.amenities ?? [], 100, 180)),
        features: JSON.stringify((0, sanitize_1.sanitizeStringArray)(data.features ?? [], 100, 180)),
        propertyDetails: JSON.stringify((0, sanitize_1.sanitizeStringArray)(data.propertyDetails ?? [], 120, 240)),
        furnishingStatus: sanitizeMaybeText(data.furnishingStatus, 80),
        hasAirConditioner: data.hasAirConditioner === null || data.hasAirConditioner === undefined ? null : data.hasAirConditioner ? 1 : 0,
        hasKitchen: data.hasKitchen === null || data.hasKitchen === undefined ? null : data.hasKitchen ? 1 : 0,
        bedrooms: data.bedrooms ?? null,
        bathrooms: data.bathrooms ?? null,
        landSize: data.landSize ?? null,
        interiorSizeSqm: data.interiorSizeSqm ?? null,
        builtYear: data.builtYear ?? null,
        streetAddress: sanitizeMaybeText(data.streetAddress, 240),
        district: sanitizeMaybeText(data.district, 120),
        subdistrict: sanitizeMaybeText(data.subdistrict, 120),
        city: sanitizeMaybeText(data.city, 120),
        province: sanitizeMaybeText(data.province, 120),
        postalCode: sanitizeMaybeText(data.postalCode, 20),
        country: (0, sanitize_1.sanitizePlainText)(data.country, 120),
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        mapSearchLabel: sanitizeMaybeText(data.mapSearchLabel, 255),
        faqs: sanitizeFaqs(data.faqs ?? []),
        imageSeo: data.imageSeo ?? [],
    };
}
async function updateImageSeo(listingId, items) {
    for (const item of items) {
        await (0, pool_1.executeSql)("UPDATE listing_images SET alt_text = ?, caption = ? WHERE id = ? AND listing_id = ?", [sanitizeMaybeText(item.altText, 180), sanitizeMaybeText(item.caption, 240), item.id, listingId]);
    }
}
async function replaceListingFaqs(listingId, faqs) {
    await (0, pool_1.executeSql)("DELETE FROM listing_faqs WHERE listing_id = ?", [listingId]);
    if (!faqs.length) {
        return;
    }
    for (let index = 0; index < faqs.length; index += 1) {
        const faq = faqs[index];
        await (0, pool_1.executeSql)(`INSERT INTO listing_faqs (listing_id, question, answer, sort_order, is_active)
       VALUES (?, ?, ?, ?, 1)`, [listingId, faq.question, faq.answer, index]);
    }
}
async function ensureListingExists(listingId) {
    const rows = await (0, pool_1.queryRows)("SELECT id FROM listings WHERE id = ? LIMIT 1", [listingId]);
    if (!rows.length) {
        throw new errors_1.ApiError(404, "Listing not found");
    }
}
function parseListingIdOrThrow(value) {
    const parsed = listingIdSchema.shape.id.safeParse(value);
    if (!parsed.success) {
        throw new errors_1.ApiError(400, "Invalid listing id");
    }
    return parsed.data;
}
exports.adminListingRoutes = (0, express_1.Router)();
exports.adminListingRoutes.use(auth_1.requireAuth, (0, auth_1.requireOneOfRoles)(["HEAD_ADMIN", "ADMIN", "EMPLOYEE"]));
exports.adminListingRoutes.get("/test", (request, response) => {
    response.json({
        ok: true,
        message: "Protected admin route is working",
        user: request.user,
    });
});
exports.adminListingRoutes.get("/listings", async (_request, response, next) => {
    try {
        const rows = await (0, pool_1.queryRows)(`SELECT id, title, section, category, status, price_amount, currency_code, city, province, updated_at
       FROM listings
       ORDER BY updated_at DESC`);
        response.json({ total: rows.length, items: rows });
    }
    catch (error) {
        next(error);
    }
});
exports.adminListingRoutes.get("/listings/:id", async (request, response, next) => {
    try {
        const listingId = parseListingIdOrThrow(request.params.id);
        const listingRows = await (0, pool_1.queryRows)("SELECT * FROM listings WHERE id = ? LIMIT 1", [listingId]);
        const listing = listingRows[0];
        if (!listing) {
            throw new errors_1.ApiError(404, "Listing not found");
        }
        const images = await (0, pool_1.queryRows)(`SELECT id, original_name, alt_text, caption, card_url, banner_url, detail_url, mobile_url, gallery_url, sort_order, is_cover
       FROM listing_images
       WHERE listing_id = ?
       ORDER BY is_cover DESC, sort_order ASC`, [listingId]);
        const faqs = await (0, pool_1.queryRows)(`SELECT id, question, answer, sort_order, is_active
       FROM listing_faqs
       WHERE listing_id = ?
       ORDER BY sort_order ASC, id ASC`, [listingId]);
        response.json({ listing, images, faqs });
    }
    catch (error) {
        next(error);
    }
});
exports.adminListingRoutes.post("/listings", async (request, response, next) => {
    try {
        const parsed = listingSchema.safeParse(request.body);
        if (!parsed.success) {
            throw new errors_1.ApiError(400, "Invalid listing payload", parsed.error.flatten());
        }
        const clean = cleanListingInput(parsed.data);
        const result = await (0, pool_1.executeSql)(`INSERT INTO listings (
        title, slug, seo_title, meta_description, seo_keywords, canonical_url, index_status, follow_status,
        og_title, og_description, og_image, twitter_title, twitter_description, twitter_image, schema_type,
        section, category, status, property_type,
        price_amount, currency_code, buy_price, rent_monthly_price, deposit_amount, price_unit_label,
        description, highlights, amenities, features, property_details,
        furnishing_status, has_air_conditioner, has_kitchen,
        bedrooms, bathrooms, land_size, interior_size_sqm, built_year,
        street_address, district, subdistrict, city, province, postal_code, country,
        latitude, longitude, map_search_label, created_by
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?
      )`, [
            clean.title,
            clean.slug,
            clean.seoTitle,
            clean.metaDescription,
            clean.seoKeywords,
            clean.canonicalUrl,
            clean.indexStatus,
            clean.followStatus,
            clean.ogTitle,
            clean.ogDescription,
            clean.ogImage,
            clean.twitterTitle,
            clean.twitterDescription,
            clean.twitterImage,
            clean.schemaType,
            clean.section,
            clean.category,
            clean.status,
            clean.propertyType,
            clean.priceAmount,
            clean.currencyCode,
            clean.buyPrice,
            clean.rentMonthlyPrice,
            clean.depositAmount,
            clean.priceUnitLabel,
            clean.description,
            clean.highlights,
            clean.amenities,
            clean.features,
            clean.propertyDetails,
            clean.furnishingStatus,
            clean.hasAirConditioner,
            clean.hasKitchen,
            clean.bedrooms,
            clean.bathrooms,
            clean.landSize,
            clean.interiorSizeSqm,
            clean.builtYear,
            clean.streetAddress,
            clean.district,
            clean.subdistrict,
            clean.city,
            clean.province,
            clean.postalCode,
            clean.country,
            clean.latitude,
            clean.longitude,
            clean.mapSearchLabel,
            request.user.id,
        ]);
        const listingId = Number(result.insertId);
        await replaceListingFaqs(listingId, clean.faqs);
        await updateImageSeo(listingId, clean.imageSeo);
        response.status(201).json({ id: listingId });
    }
    catch (error) {
        next(error);
    }
});
exports.adminListingRoutes.patch("/listings/:id", async (request, response, next) => {
    try {
        const listingId = parseListingIdOrThrow(request.params.id);
        const updates = listingUpdateSchema.safeParse(request.body);
        if (!updates.success) {
            throw new errors_1.ApiError(400, "Invalid listing update payload", updates.error.flatten());
        }
        const input = updates.data;
        if (!Object.keys(input).length) {
            throw new errors_1.ApiError(400, "No update fields provided");
        }
        const sets = [];
        const values = [];
        const setField = (field, value) => {
            sets.push(`${field} = ?`);
            values.push(value);
        };
        if (input.title !== undefined) {
            setField("title", (0, sanitize_1.sanitizePlainText)(input.title, 180));
        }
        if (input.slug !== undefined) {
            const slug = (0, sanitize_1.sanitizeSlug)(input.slug);
            if (!slug) {
                throw new errors_1.ApiError(400, "Invalid slug");
            }
            setField("slug", slug);
        }
        if (input.seoTitle !== undefined) {
            setField("seo_title", sanitizeMaybeText(input.seoTitle, 180));
        }
        if (input.metaDescription !== undefined) {
            setField("meta_description", sanitizeMaybeText(input.metaDescription, 320));
        }
        if (input.seoKeywords !== undefined) {
            setField("seo_keywords", JSON.stringify((0, sanitize_1.sanitizeStringArray)(input.seoKeywords, 30, 80)));
        }
        if (input.canonicalUrl !== undefined) {
            setField("canonical_url", sanitizeMaybeUrl(input.canonicalUrl));
        }
        if (input.indexStatus !== undefined) {
            setField("index_status", input.indexStatus);
        }
        if (input.followStatus !== undefined) {
            setField("follow_status", input.followStatus);
        }
        if (input.ogTitle !== undefined) {
            setField("og_title", sanitizeMaybeText(input.ogTitle, 180));
        }
        if (input.ogDescription !== undefined) {
            setField("og_description", sanitizeMaybeText(input.ogDescription, 320));
        }
        if (input.ogImage !== undefined) {
            setField("og_image", sanitizeMaybeImageRef(input.ogImage));
        }
        if (input.twitterTitle !== undefined) {
            setField("twitter_title", sanitizeMaybeText(input.twitterTitle, 180));
        }
        if (input.twitterDescription !== undefined) {
            setField("twitter_description", sanitizeMaybeText(input.twitterDescription, 320));
        }
        if (input.twitterImage !== undefined) {
            setField("twitter_image", sanitizeMaybeImageRef(input.twitterImage));
        }
        if (input.schemaType !== undefined) {
            setField("schema_type", (0, sanitize_1.sanitizePlainText)(input.schemaType, 80) || "RealEstateListing");
        }
        if (input.section !== undefined) {
            setField("section", input.section);
        }
        if (input.category !== undefined) {
            setField("category", input.category);
        }
        if (input.status !== undefined) {
            setField("status", input.status);
        }
        if (input.propertyType !== undefined) {
            setField("property_type", sanitizeMaybeText(input.propertyType, 120));
        }
        if (input.priceAmount !== undefined) {
            setField("price_amount", input.priceAmount);
        }
        if (input.currencyCode !== undefined) {
            setField("currency_code", (0, sanitize_1.sanitizePlainText)(input.currencyCode.toUpperCase(), 12));
        }
        if (input.buyPrice !== undefined) {
            setField("buy_price", input.buyPrice);
        }
        if (input.rentMonthlyPrice !== undefined) {
            setField("rent_monthly_price", input.rentMonthlyPrice);
        }
        if (input.depositAmount !== undefined) {
            setField("deposit_amount", input.depositAmount);
        }
        if (input.priceUnitLabel !== undefined) {
            setField("price_unit_label", sanitizeMaybeText(input.priceUnitLabel, 80));
        }
        if (input.description !== undefined) {
            setField("description", sanitizeMaybeText(input.description, 10000));
        }
        if (input.highlights !== undefined) {
            setField("highlights", JSON.stringify((0, sanitize_1.sanitizeStringArray)(input.highlights, 100, 180)));
        }
        if (input.amenities !== undefined) {
            setField("amenities", JSON.stringify((0, sanitize_1.sanitizeStringArray)(input.amenities, 100, 180)));
        }
        if (input.features !== undefined) {
            setField("features", JSON.stringify((0, sanitize_1.sanitizeStringArray)(input.features, 100, 180)));
        }
        if (input.propertyDetails !== undefined) {
            setField("property_details", JSON.stringify((0, sanitize_1.sanitizeStringArray)(input.propertyDetails, 120, 240)));
        }
        if (input.furnishingStatus !== undefined) {
            setField("furnishing_status", sanitizeMaybeText(input.furnishingStatus, 80));
        }
        if (input.hasAirConditioner !== undefined) {
            setField("has_air_conditioner", input.hasAirConditioner === null ? null : input.hasAirConditioner ? 1 : 0);
        }
        if (input.hasKitchen !== undefined) {
            setField("has_kitchen", input.hasKitchen === null ? null : input.hasKitchen ? 1 : 0);
        }
        if (input.bedrooms !== undefined) {
            setField("bedrooms", input.bedrooms);
        }
        if (input.bathrooms !== undefined) {
            setField("bathrooms", input.bathrooms);
        }
        if (input.landSize !== undefined) {
            setField("land_size", input.landSize);
        }
        if (input.interiorSizeSqm !== undefined) {
            setField("interior_size_sqm", input.interiorSizeSqm);
        }
        if (input.builtYear !== undefined) {
            setField("built_year", input.builtYear);
        }
        if (input.streetAddress !== undefined) {
            setField("street_address", sanitizeMaybeText(input.streetAddress, 240));
        }
        if (input.district !== undefined) {
            setField("district", sanitizeMaybeText(input.district, 120));
        }
        if (input.subdistrict !== undefined) {
            setField("subdistrict", sanitizeMaybeText(input.subdistrict, 120));
        }
        if (input.city !== undefined) {
            setField("city", sanitizeMaybeText(input.city, 120));
        }
        if (input.province !== undefined) {
            setField("province", sanitizeMaybeText(input.province, 120));
        }
        if (input.postalCode !== undefined) {
            setField("postal_code", sanitizeMaybeText(input.postalCode, 20));
        }
        if (input.country !== undefined) {
            setField("country", (0, sanitize_1.sanitizePlainText)(input.country, 120));
        }
        if (input.latitude !== undefined) {
            setField("latitude", input.latitude);
        }
        if (input.longitude !== undefined) {
            setField("longitude", input.longitude);
        }
        if (input.mapSearchLabel !== undefined) {
            setField("map_search_label", sanitizeMaybeText(input.mapSearchLabel, 255));
        }
        if (sets.length) {
            values.push(listingId);
            await (0, pool_1.executeSql)(`UPDATE listings SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
        }
        if (input.faqs !== undefined) {
            await replaceListingFaqs(listingId, sanitizeFaqs(input.faqs));
        }
        if (input.imageSeo !== undefined) {
            await updateImageSeo(listingId, input.imageSeo);
        }
        response.json({ ok: true });
    }
    catch (error) {
        next(error);
    }
});
exports.adminListingRoutes.put("/listings/:id/images/seo", async (request, response, next) => {
    try {
        const listingId = parseListingIdOrThrow(request.params.id);
        await ensureListingExists(listingId);
        const parsed = imageSeoListSchema.safeParse(request.body);
        if (!parsed.success) {
            throw new errors_1.ApiError(400, "Invalid image SEO payload", parsed.error.flatten());
        }
        await updateImageSeo(listingId, parsed.data.items);
        response.json({ ok: true });
    }
    catch (error) {
        next(error);
    }
});
exports.adminListingRoutes.delete("/listings/:id", async (request, response, next) => {
    try {
        const listingId = parseListingIdOrThrow(request.params.id);
        await (0, pool_1.executeSql)("UPDATE listings SET status = 'DELETED', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [listingId]);
        response.json({ ok: true });
    }
    catch (error) {
        next(error);
    }
});
exports.adminListingRoutes.post("/listings/:id/images", upload.array("images", 12), async (request, response, next) => {
    try {
        const listingId = parseListingIdOrThrow(request.params.id);
        const files = request.files;
        const created = await (0, imageService_1.saveListingImages)(listingId, files ?? []);
        response.status(201).json({ total: created.length, items: created });
    }
    catch (error) {
        next(error);
    }
});
exports.adminListingRoutes.patch("/listings/:id/images/reorder", async (request, response, next) => {
    try {
        const listingId = parseListingIdOrThrow(request.params.id);
        await ensureListingExists(listingId);
        const parsed = imageReorderSchema.safeParse(request.body);
        if (!parsed.success) {
            throw new errors_1.ApiError(400, "Invalid image reorder payload", parsed.error.flatten());
        }
        const imageIds = [...new Set(parsed.data.imageIds)];
        const images = await (0, pool_1.queryRows)("SELECT id FROM listing_images WHERE listing_id = ?", [listingId]);
        const imageIdSet = new Set(images.map((item) => item.id));
        if (imageIds.some((id) => !imageIdSet.has(id)) || imageIds.length !== imageIdSet.size) {
            throw new errors_1.ApiError(400, "Reorder list must include every image for this listing exactly once");
        }
        for (let index = 0; index < imageIds.length; index += 1) {
            const imageId = imageIds[index];
            await (0, pool_1.executeSql)("UPDATE listing_images SET sort_order = ?, is_cover = ? WHERE id = ? AND listing_id = ?", [index, index === 0 ? 1 : 0, imageId, listingId]);
        }
        response.json({ ok: true });
    }
    catch (error) {
        next(error);
    }
});
exports.adminListingRoutes.patch("/listings/:id/images/:imageId/cover", async (request, response, next) => {
    try {
        const listingId = parseListingIdOrThrow(request.params.id);
        const imageId = parseListingIdOrThrow(request.params.imageId);
        const imageRows = await (0, pool_1.queryRows)("SELECT id FROM listing_images WHERE id = ? AND listing_id = ? LIMIT 1", [imageId, listingId]);
        if (!imageRows.length) {
            throw new errors_1.ApiError(404, "Image not found");
        }
        await (0, pool_1.executeSql)("UPDATE listing_images SET is_cover = 0 WHERE listing_id = ?", [listingId]);
        await (0, pool_1.executeSql)("UPDATE listing_images SET is_cover = 1 WHERE id = ? AND listing_id = ?", [imageId, listingId]);
        response.json({ ok: true });
    }
    catch (error) {
        next(error);
    }
});
exports.adminListingRoutes.delete("/listings/:id/images/:imageId", async (request, response, next) => {
    try {
        const listingId = parseListingIdOrThrow(request.params.id);
        const imageId = parseListingIdOrThrow(request.params.imageId);
        const rows = await (0, pool_1.queryRows)(`SELECT id, card_url, banner_url, detail_url, mobile_url, gallery_url
       FROM listing_images
       WHERE id = ? AND listing_id = ?
       LIMIT 1`, [imageId, listingId]);
        const image = rows[0];
        if (!image) {
            throw new errors_1.ApiError(404, "Image not found");
        }
        await (0, pool_1.executeSql)("DELETE FROM listing_images WHERE id = ? AND listing_id = ?", [imageId, listingId]);
        await (0, imageService_1.deleteListingImageFiles)([image.card_url, image.banner_url, image.detail_url, image.mobile_url, image.gallery_url]);
        const remaining = await (0, pool_1.queryRows)("SELECT id FROM listing_images WHERE listing_id = ? ORDER BY sort_order ASC, id ASC", [listingId]);
        for (let index = 0; index < remaining.length; index += 1) {
            const row = remaining[index];
            await (0, pool_1.executeSql)("UPDATE listing_images SET sort_order = ?, is_cover = ? WHERE id = ?", [index, index === 0 ? 1 : 0, row.id]);
        }
        response.json({ ok: true });
    }
    catch (error) {
        next(error);
    }
});
exports.adminListingRoutes.get("/listings/:id/faqs", async (request, response, next) => {
    try {
        const listingId = parseListingIdOrThrow(request.params.id);
        await ensureListingExists(listingId);
        const rows = await (0, pool_1.queryRows)(`SELECT id, question, answer, sort_order, is_active
       FROM listing_faqs
       WHERE listing_id = ?
       ORDER BY sort_order ASC, id ASC`, [listingId]);
        response.json({ total: rows.length, items: rows });
    }
    catch (error) {
        next(error);
    }
});
exports.adminListingRoutes.put("/listings/:id/faqs", async (request, response, next) => {
    try {
        const listingId = parseListingIdOrThrow(request.params.id);
        await ensureListingExists(listingId);
        const parsed = listingFaqListSchema.safeParse(request.body);
        if (!parsed.success) {
            throw new errors_1.ApiError(400, "Invalid FAQ payload", parsed.error.flatten());
        }
        await replaceListingFaqs(listingId, sanitizeFaqs(parsed.data.items));
        response.json({ ok: true });
    }
    catch (error) {
        next(error);
    }
});
