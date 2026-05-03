import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { ApiError } from "../utils/errors";
import { sanitizePlainText } from "../utils/sanitize";

const geocodeQuerySchema = z.object({
  query: z.string().min(2).max(240),
});

export const mapRoutes = Router();

mapRoutes.get("/geocode", async (request, response, next) => {
  try {
    const parsed = geocodeQuerySchema.safeParse({
      query: request.query.query,
    });
    if (!parsed.success) {
      throw new ApiError(400, "Invalid geocode query", parsed.error.flatten());
    }

    const url = new URL(env.OSMAND_SEARCH_URL);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "8");
    url.searchParams.set("q", sanitizePlainText(parsed.data.query, 240));
    if (env.OSMAND_LANGUAGE) {
      url.searchParams.set("accept-language", env.OSMAND_LANGUAGE);
    }
    if (env.OSMAND_COUNTRY_CODE) {
      url.searchParams.set("countrycodes", env.OSMAND_COUNTRY_CODE);
    }
    if (env.OSMAND_EMAIL) {
      url.searchParams.set("email", env.OSMAND_EMAIL);
    }

    const upstream = await fetch(url.toString(), {
      headers: {
        "User-Agent": env.GEOCODER_USER_AGENT,
        Accept: "application/json",
      },
    });
    if (!upstream.ok) {
      throw new ApiError(502, "Map geocode lookup failed");
    }

    const raw = (await upstream.json()) as Array<{
      display_name?: string;
      lat?: string;
      lon?: string;
      address?: Record<string, string | undefined>;
    }>;

    const items = raw
      .map((row) => {
        const lat = Number(row.lat);
        const lng = Number(row.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          return null;
        }
        const address = row.address ?? {};
        return {
          label: sanitizePlainText(row.display_name ?? "", 255),
          latitude: lat,
          longitude: lng,
          city: sanitizePlainText(address.city ?? address.town ?? address.village ?? "", 120) || null,
          province:
            sanitizePlainText(address.state ?? address.region ?? address.county ?? "", 120) || null,
          district: sanitizePlainText(address.county ?? address.state_district ?? "", 120) || null,
          postalCode: sanitizePlainText(address.postcode ?? "", 20) || null,
          country: sanitizePlainText(address.country ?? "", 120) || null,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    response.json({ total: items.length, items });
  } catch (error) {
    next(error);
  }
});
