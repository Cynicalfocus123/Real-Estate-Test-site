"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapRoutes = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const sanitize_1 = require("../utils/sanitize");
const geocodeQuerySchema = zod_1.z.object({
    query: zod_1.z.string().min(2).max(240),
});
exports.mapRoutes = (0, express_1.Router)();
exports.mapRoutes.get("/geocode", async (request, response, next) => {
    try {
        const parsed = geocodeQuerySchema.safeParse({
            query: request.query.query,
        });
        if (!parsed.success) {
            throw new errors_1.ApiError(400, "Invalid geocode query", parsed.error.flatten());
        }
        const url = new URL(env_1.env.OSMAND_SEARCH_URL);
        url.searchParams.set("format", "jsonv2");
        url.searchParams.set("addressdetails", "1");
        url.searchParams.set("limit", "8");
        url.searchParams.set("q", (0, sanitize_1.sanitizePlainText)(parsed.data.query, 240));
        if (env_1.env.OSMAND_LANGUAGE) {
            url.searchParams.set("accept-language", env_1.env.OSMAND_LANGUAGE);
        }
        if (env_1.env.OSMAND_COUNTRY_CODE) {
            url.searchParams.set("countrycodes", env_1.env.OSMAND_COUNTRY_CODE);
        }
        if (env_1.env.OSMAND_EMAIL) {
            url.searchParams.set("email", env_1.env.OSMAND_EMAIL);
        }
        const upstream = await fetch(url.toString(), {
            headers: {
                "User-Agent": env_1.env.GEOCODER_USER_AGENT,
                Accept: "application/json",
            },
        });
        if (!upstream.ok) {
            throw new errors_1.ApiError(502, "Map geocode lookup failed");
        }
        const raw = (await upstream.json());
        const items = raw
            .map((row) => {
            const lat = Number(row.lat);
            const lng = Number(row.lon);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                return null;
            }
            const address = row.address ?? {};
            return {
                label: (0, sanitize_1.sanitizePlainText)(row.display_name ?? "", 255),
                latitude: lat,
                longitude: lng,
                city: (0, sanitize_1.sanitizePlainText)(address.city ?? address.town ?? address.village ?? "", 120) || null,
                province: (0, sanitize_1.sanitizePlainText)(address.state ?? address.region ?? address.county ?? "", 120) || null,
                district: (0, sanitize_1.sanitizePlainText)(address.county ?? address.state_district ?? "", 120) || null,
                postalCode: (0, sanitize_1.sanitizePlainText)(address.postcode ?? "", 20) || null,
                country: (0, sanitize_1.sanitizePlainText)(address.country ?? "", 120) || null,
            };
        })
            .filter((item) => Boolean(item));
        response.json({ total: items.length, items });
    }
    catch (error) {
        next(error);
    }
});
