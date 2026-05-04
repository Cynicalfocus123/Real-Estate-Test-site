import { Router } from "express";
import multer from "multer";
import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { LISTING_CATEGORIES, LISTING_SECTIONS, LISTING_STATUSES } from "../constants/listing";
import { executeSql, queryRows } from "../db/pool";
import { requireAuth, requireOneOfRoles } from "../middleware/auth";
import { deleteListingImageFiles, saveListingImages } from "../services/imageService";
import { ApiError } from "../utils/errors";
import { sanitizePlainText, sanitizeSlug, sanitizeStringArray } from "../utils/sanitize";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 12, fileSize: 8 * 1024 * 1024 },
});

const listingFaqSchema = z.object({
  question: z.string().min(1).max(240),
  answer: z.string().min(1).max(5000),
});

const listingSchema = z.object({
  title: z.string().min(1).max(180),
  slug: z.string().max(180).optional(),
  section: z.enum(LISTING_SECTIONS),
  category: z.enum(LISTING_CATEGORIES),
  status: z.enum(LISTING_STATUSES).default("DRAFT"),
  priceAmount: z.number().int().nonnegative().nullable().optional(),
  currencyCode: z.string().min(1).max(12).default("THB"),
  buyPrice: z.number().int().nonnegative().nullable().optional(),
  rentMonthlyPrice: z.number().int().nonnegative().nullable().optional(),
  depositAmount: z.number().int().nonnegative().nullable().optional(),
  priceUnitLabel: z.string().max(80).nullable().optional(),
  propertyType: z.string().max(120).nullable().optional(),
  description: z.string().max(10000).nullable().optional(),
  highlights: z.array(z.string()).max(100).optional(),
  amenities: z.array(z.string()).max(100).optional(),
  features: z.array(z.string()).max(100).optional(),
  propertyDetails: z.array(z.string()).max(120).optional(),
  furnishingStatus: z.string().max(80).nullable().optional(),
  hasAirConditioner: z.boolean().nullable().optional(),
  hasKitchen: z.boolean().nullable().optional(),
  bedrooms: z.number().int().min(0).max(30).nullable().optional(),
  bathrooms: z.number().int().min(0).max(30).nullable().optional(),
  landSize: z.number().nonnegative().nullable().optional(),
  interiorSizeSqm: z.number().nonnegative().nullable().optional(),
  builtYear: z.number().int().min(1800).max(2100).nullable().optional(),
  streetAddress: z.string().max(240).nullable().optional(),
  district: z.string().max(120).nullable().optional(),
  subdistrict: z.string().max(120).nullable().optional(),
  city: z.string().max(120).nullable().optional(),
  province: z.string().max(120).nullable().optional(),
  postalCode: z.string().max(20).nullable().optional(),
  country: z.string().max(120).default("Thailand"),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  mapSearchLabel: z.string().max(255).nullable().optional(),
  faqs: z.array(listingFaqSchema).max(50).optional(),
});

const listingUpdateSchema = listingSchema.partial();

const listingFaqListSchema = z.object({
  items: z.array(listingFaqSchema).max(50),
});

const imageReorderSchema = z.object({
  imageIds: z.array(z.number().int().positive()).min(1).max(12),
});

const listingIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

function sanitizeMaybeText(value: string | null | undefined, maxLength: number) {
  if (!value) {
    return null;
  }
  return sanitizePlainText(value, maxLength);
}

function sanitizeFaqs(items: z.infer<typeof listingFaqSchema>[]) {
  return items.map((item) => ({
    question: sanitizePlainText(item.question, 240),
    answer: sanitizePlainText(item.answer, 5000),
  }));
}

function cleanListingInput(data: z.infer<typeof listingSchema>) {
  const title = sanitizePlainText(data.title, 180);
  const slug = sanitizeSlug(data.slug ?? title);
  if (!slug) {
    throw new ApiError(400, "Unable to generate slug");
  }

  return {
    title,
    slug,
    section: data.section,
    category: data.category,
    status: data.status,
    priceAmount: data.priceAmount ?? null,
    currencyCode: sanitizePlainText(data.currencyCode.toUpperCase(), 12),
    buyPrice: data.buyPrice ?? null,
    rentMonthlyPrice: data.rentMonthlyPrice ?? null,
    depositAmount: data.depositAmount ?? null,
    priceUnitLabel: sanitizeMaybeText(data.priceUnitLabel, 80),
    propertyType: sanitizeMaybeText(data.propertyType, 120),
    description: sanitizeMaybeText(data.description, 10000),
    highlights: JSON.stringify(sanitizeStringArray(data.highlights ?? [], 100, 180)),
    amenities: JSON.stringify(sanitizeStringArray(data.amenities ?? [], 100, 180)),
    features: JSON.stringify(sanitizeStringArray(data.features ?? [], 100, 180)),
    propertyDetails: JSON.stringify(sanitizeStringArray(data.propertyDetails ?? [], 120, 240)),
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
    country: sanitizePlainText(data.country, 120),
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    mapSearchLabel: sanitizeMaybeText(data.mapSearchLabel, 255),
    faqs: sanitizeFaqs(data.faqs ?? []),
  };
}

async function replaceListingFaqs(listingId: number, faqs: ReturnType<typeof sanitizeFaqs>) {
  await executeSql("DELETE FROM listing_faqs WHERE listing_id = ?", [listingId]);
  if (!faqs.length) {
    return;
  }
  for (let index = 0; index < faqs.length; index += 1) {
    const faq = faqs[index];
    await executeSql(
      `INSERT INTO listing_faqs (listing_id, question, answer, sort_order, is_active)
       VALUES (?, ?, ?, ?, 1)`,
      [listingId, faq.question, faq.answer, index],
    );
  }
}

async function ensureListingExists(listingId: number) {
  const rows = await queryRows<(RowDataPacket & { id: number })[]>("SELECT id FROM listings WHERE id = ? LIMIT 1", [listingId]);
  if (!rows.length) {
    throw new ApiError(404, "Listing not found");
  }
}

function parseListingIdOrThrow(value: string) {
  const parsed = listingIdSchema.shape.id.safeParse(value);
  if (!parsed.success) {
    throw new ApiError(400, "Invalid listing id");
  }
  return parsed.data;
}

export const adminListingRoutes = Router();
adminListingRoutes.use(requireAuth, requireOneOfRoles(["HEAD_ADMIN", "ADMIN", "EMPLOYEE"]));

adminListingRoutes.get("/test", (request, response) => {
  response.json({
    ok: true,
    message: "Protected admin route is working",
    user: request.user,
  });
});

adminListingRoutes.get("/listings", async (_request, response, next) => {
  try {
    const rows = await queryRows<
      (RowDataPacket & {
        id: number;
        title: string;
        section: string;
        category: string;
        status: string;
        price_amount: number | null;
        currency_code: string;
        city: string | null;
        province: string | null;
        updated_at: string;
      })[]
    >(
      `SELECT id, title, section, category, status, price_amount, currency_code, city, province, updated_at
       FROM listings
       ORDER BY updated_at DESC`,
    );
    response.json({ total: rows.length, items: rows });
  } catch (error) {
    next(error);
  }
});

adminListingRoutes.get("/listings/:id", async (request, response, next) => {
  try {
    const listingId = parseListingIdOrThrow(request.params.id);

    const listingRows = await queryRows<(RowDataPacket & { id: number })[]>("SELECT * FROM listings WHERE id = ? LIMIT 1", [listingId]);
    const listing = listingRows[0];
    if (!listing) {
      throw new ApiError(404, "Listing not found");
    }

    const images = await queryRows<
      (RowDataPacket & {
        id: number;
        original_name: string;
        card_url: string;
        banner_url: string;
        detail_url: string;
        mobile_url: string;
        gallery_url: string;
        sort_order: number;
        is_cover: number;
      })[]
    >(
      `SELECT id, original_name, card_url, banner_url, detail_url, mobile_url, gallery_url, sort_order, is_cover
       FROM listing_images
       WHERE listing_id = ?
       ORDER BY is_cover DESC, sort_order ASC`,
      [listingId],
    );

    const faqs = await queryRows<
      (RowDataPacket & {
        id: number;
        question: string;
        answer: string;
        sort_order: number;
        is_active: number;
      })[]
    >(
      `SELECT id, question, answer, sort_order, is_active
       FROM listing_faqs
       WHERE listing_id = ?
       ORDER BY sort_order ASC, id ASC`,
      [listingId],
    );

    response.json({ listing, images, faqs });
  } catch (error) {
    next(error);
  }
});

adminListingRoutes.post("/listings", async (request, response, next) => {
  try {
    const parsed = listingSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid listing payload", parsed.error.flatten());
    }
    const clean = cleanListingInput(parsed.data);

    const result = await executeSql(
      `INSERT INTO listings (
        title, slug, section, category, status, property_type,
        price_amount, currency_code, buy_price, rent_monthly_price, deposit_amount, price_unit_label,
        description, highlights, amenities, features, property_details,
        furnishing_status, has_air_conditioner, has_kitchen,
        bedrooms, bathrooms, land_size, interior_size_sqm, built_year,
        street_address, district, subdistrict, city, province, postal_code, country,
        latitude, longitude, map_search_label, created_by
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?
      )`,
      [
        clean.title,
        clean.slug,
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
        request.user!.id,
      ],
    );

    const listingId = Number(result.insertId);
    await replaceListingFaqs(listingId, clean.faqs);

    response.status(201).json({ id: listingId });
  } catch (error) {
    next(error);
  }
});

adminListingRoutes.patch("/listings/:id", async (request, response, next) => {
  try {
    const listingId = parseListingIdOrThrow(request.params.id);
    const updates = listingUpdateSchema.safeParse(request.body);
    if (!updates.success) {
      throw new ApiError(400, "Invalid listing update payload", updates.error.flatten());
    }

    const input = updates.data;
    if (!Object.keys(input).length) {
      throw new ApiError(400, "No update fields provided");
    }

    const sets: string[] = [];
    const values: unknown[] = [];

    const setField = (field: string, value: unknown) => {
      sets.push(`${field} = ?`);
      values.push(value);
    };

    if (input.title !== undefined) {
      setField("title", sanitizePlainText(input.title, 180));
    }
    if (input.slug !== undefined) {
      const slug = sanitizeSlug(input.slug);
      if (!slug) {
        throw new ApiError(400, "Invalid slug");
      }
      setField("slug", slug);
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
      setField("currency_code", sanitizePlainText(input.currencyCode.toUpperCase(), 12));
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
      setField("highlights", JSON.stringify(sanitizeStringArray(input.highlights, 100, 180)));
    }
    if (input.amenities !== undefined) {
      setField("amenities", JSON.stringify(sanitizeStringArray(input.amenities, 100, 180)));
    }
    if (input.features !== undefined) {
      setField("features", JSON.stringify(sanitizeStringArray(input.features, 100, 180)));
    }
    if (input.propertyDetails !== undefined) {
      setField("property_details", JSON.stringify(sanitizeStringArray(input.propertyDetails, 120, 240)));
    }
    if (input.furnishingStatus !== undefined) {
      setField("furnishing_status", sanitizeMaybeText(input.furnishingStatus, 80));
    }
    if (input.hasAirConditioner !== undefined) {
      setField(
        "has_air_conditioner",
        input.hasAirConditioner === null ? null : input.hasAirConditioner ? 1 : 0,
      );
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
      setField("country", sanitizePlainText(input.country, 120));
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
      await executeSql(`UPDATE listings SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    }

    if (input.faqs !== undefined) {
      await replaceListingFaqs(listingId, sanitizeFaqs(input.faqs));
    }

    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

adminListingRoutes.delete("/listings/:id", async (request, response, next) => {
  try {
    const listingId = parseListingIdOrThrow(request.params.id);
    await executeSql("UPDATE listings SET status = 'DELETED', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [listingId]);
    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

adminListingRoutes.post("/listings/:id/images", upload.array("images", 12), async (request, response, next) => {
  try {
    const listingId = parseListingIdOrThrow(request.params.id);
    const files = request.files as Express.Multer.File[] | undefined;
    const created = await saveListingImages(listingId, files ?? []);
    response.status(201).json({ total: created.length, items: created });
  } catch (error) {
    next(error);
  }
});

adminListingRoutes.patch("/listings/:id/images/reorder", async (request, response, next) => {
  try {
    const listingId = parseListingIdOrThrow(request.params.id);
    await ensureListingExists(listingId);

    const parsed = imageReorderSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid image reorder payload", parsed.error.flatten());
    }

    const imageIds = [...new Set(parsed.data.imageIds)];
    const images = await queryRows<(RowDataPacket & { id: number })[]>(
      "SELECT id FROM listing_images WHERE listing_id = ?",
      [listingId],
    );
    const imageIdSet = new Set(images.map((item) => item.id));
    if (imageIds.some((id) => !imageIdSet.has(id)) || imageIds.length !== imageIdSet.size) {
      throw new ApiError(400, "Reorder list must include every image for this listing exactly once");
    }

    for (let index = 0; index < imageIds.length; index += 1) {
      const imageId = imageIds[index];
      await executeSql("UPDATE listing_images SET sort_order = ?, is_cover = ? WHERE id = ? AND listing_id = ?", [index, index === 0 ? 1 : 0, imageId, listingId]);
    }

    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

adminListingRoutes.patch("/listings/:id/images/:imageId/cover", async (request, response, next) => {
  try {
    const listingId = parseListingIdOrThrow(request.params.id);
    const imageId = parseListingIdOrThrow(request.params.imageId);

    const imageRows = await queryRows<(RowDataPacket & { id: number })[]>(
      "SELECT id FROM listing_images WHERE id = ? AND listing_id = ? LIMIT 1",
      [imageId, listingId],
    );
    if (!imageRows.length) {
      throw new ApiError(404, "Image not found");
    }

    await executeSql("UPDATE listing_images SET is_cover = 0 WHERE listing_id = ?", [listingId]);
    await executeSql("UPDATE listing_images SET is_cover = 1 WHERE id = ? AND listing_id = ?", [imageId, listingId]);

    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

adminListingRoutes.delete("/listings/:id/images/:imageId", async (request, response, next) => {
  try {
    const listingId = parseListingIdOrThrow(request.params.id);
    const imageId = parseListingIdOrThrow(request.params.imageId);

    const rows = await queryRows<
      (RowDataPacket & {
        id: number;
        card_url: string;
        banner_url: string;
        detail_url: string;
        mobile_url: string;
        gallery_url: string;
      })[]
    >(
      `SELECT id, card_url, banner_url, detail_url, mobile_url, gallery_url
       FROM listing_images
       WHERE id = ? AND listing_id = ?
       LIMIT 1`,
      [imageId, listingId],
    );

    const image = rows[0];
    if (!image) {
      throw new ApiError(404, "Image not found");
    }

    await executeSql("DELETE FROM listing_images WHERE id = ? AND listing_id = ?", [imageId, listingId]);
    await deleteListingImageFiles([image.card_url, image.banner_url, image.detail_url, image.mobile_url, image.gallery_url]);

    const remaining = await queryRows<(RowDataPacket & { id: number })[]>(
      "SELECT id FROM listing_images WHERE listing_id = ? ORDER BY sort_order ASC, id ASC",
      [listingId],
    );
    for (let index = 0; index < remaining.length; index += 1) {
      const row = remaining[index];
      await executeSql("UPDATE listing_images SET sort_order = ?, is_cover = ? WHERE id = ?", [index, index === 0 ? 1 : 0, row.id]);
    }

    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

adminListingRoutes.get("/listings/:id/faqs", async (request, response, next) => {
  try {
    const listingId = parseListingIdOrThrow(request.params.id);
    await ensureListingExists(listingId);

    const rows = await queryRows<
      (RowDataPacket & {
        id: number;
        question: string;
        answer: string;
        sort_order: number;
        is_active: number;
      })[]
    >(
      `SELECT id, question, answer, sort_order, is_active
       FROM listing_faqs
       WHERE listing_id = ?
       ORDER BY sort_order ASC, id ASC`,
      [listingId],
    );

    response.json({ total: rows.length, items: rows });
  } catch (error) {
    next(error);
  }
});

adminListingRoutes.put("/listings/:id/faqs", async (request, response, next) => {
  try {
    const listingId = parseListingIdOrThrow(request.params.id);
    await ensureListingExists(listingId);

    const parsed = listingFaqListSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid FAQ payload", parsed.error.flatten());
    }

    await replaceListingFaqs(listingId, sanitizeFaqs(parsed.data.items));
    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
