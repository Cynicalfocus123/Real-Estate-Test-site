"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listingRoutes = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const listing_1 = require("../constants/listing");
const pool_1 = require("../db/pool");
const errors_1 = require("../utils/errors");
const sanitize_1 = require("../utils/sanitize");
const querySchema = zod_1.z.object({
    section: zod_1.z.enum(listing_1.LISTING_SECTIONS).optional(),
    category: zod_1.z.enum(listing_1.LISTING_CATEGORIES).optional(),
    search: zod_1.z.string().max(120).optional(),
    city: zod_1.z.string().max(120).optional(),
    province: zod_1.z.string().max(120).optional(),
    minPrice: zod_1.z.coerce.number().int().nonnegative().optional(),
    maxPrice: zod_1.z.coerce.number().int().nonnegative().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(24),
});
exports.listingRoutes = (0, express_1.Router)();
exports.listingRoutes.get("/", async (request, response, next) => {
    try {
        const parsed = querySchema.safeParse(request.query);
        if (!parsed.success) {
            throw new errors_1.ApiError(400, "Invalid listing query", parsed.error.flatten());
        }
        const data = parsed.data;
        const where = ["l.status = 'PUBLISHED'"];
        const params = [];
        if (data.section) {
            where.push("l.section = ?");
            params.push(data.section);
        }
        if (data.category) {
            where.push("l.category = ?");
            params.push(data.category);
        }
        if (data.city) {
            where.push("l.city LIKE ?");
            params.push(`%${(0, sanitize_1.sanitizePlainText)(data.city, 120)}%`);
        }
        if (data.province) {
            where.push("l.province LIKE ?");
            params.push(`%${(0, sanitize_1.sanitizePlainText)(data.province, 120)}%`);
        }
        if (data.search) {
            const safeSearch = `%${(0, sanitize_1.sanitizePlainText)(data.search, 120)}%`;
            where.push("(l.title LIKE ? OR l.description LIKE ?)");
            params.push(safeSearch, safeSearch);
        }
        if (data.minPrice !== undefined) {
            where.push("COALESCE(l.price_amount, l.buy_price, l.rent_monthly_price, 0) >= ?");
            params.push(data.minPrice);
        }
        if (data.maxPrice !== undefined) {
            where.push("COALESCE(l.price_amount, l.buy_price, l.rent_monthly_price, 0) <= ?");
            params.push(data.maxPrice);
        }
        const whereSql = `WHERE ${where.join(" AND ")}`;
        const offset = (data.page - 1) * data.pageSize;
        const countRows = await (0, pool_1.queryRows)(`SELECT COUNT(*) AS count FROM listings l ${whereSql}`, params);
        const total = countRows[0]?.count ?? 0;
        const rows = await (0, pool_1.queryRows)(`SELECT l.id, l.title, l.slug, l.section, l.category, l.status, l.city, l.province,
              l.price_amount, l.currency_code, l.buy_price, l.rent_monthly_price, l.deposit_amount,
              l.bedrooms, l.bathrooms, l.interior_size_sqm,
              (SELECT li.card_url FROM listing_images li WHERE li.listing_id = l.id ORDER BY li.is_cover DESC, li.sort_order ASC LIMIT 1) AS card_url
       FROM listings l
       ${whereSql}
       ORDER BY l.updated_at DESC
       LIMIT ? OFFSET ?`, [...params, data.pageSize, offset]);
        response.json({
            total,
            page: data.page,
            pageSize: data.pageSize,
            hasNextPage: data.page * data.pageSize < total,
            items: rows,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.listingRoutes.get("/:id", async (request, response, next) => {
    try {
        const listingId = Number.parseInt(request.params.id, 10);
        if (!Number.isFinite(listingId) || listingId <= 0) {
            throw new errors_1.ApiError(400, "Invalid listing id");
        }
        const listingRows = await (0, pool_1.queryRows)("SELECT * FROM listings WHERE id = ? AND status = 'PUBLISHED' LIMIT 1", [listingId]);
        const listing = listingRows[0];
        if (!listing) {
            throw new errors_1.ApiError(404, "Listing not found");
        }
        const images = await (0, pool_1.queryRows)(`SELECT id, card_url, alt_text, caption, banner_url, detail_url, mobile_url, gallery_url, sort_order, is_cover
       FROM listing_images WHERE listing_id = ? ORDER BY is_cover DESC, sort_order ASC`, [listingId]);
        const faqs = await (0, pool_1.queryRows)(`SELECT id, question, answer, sort_order
       FROM listing_faqs
       WHERE listing_id = ? AND is_active = 1
       ORDER BY sort_order ASC, id ASC`, [listingId]);
        response.json({ listing, images, faqs });
    }
    catch (error) {
        next(error);
    }
});
