import { Router } from "express";
import multer from "multer";
import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { executeSql, queryRows } from "../db/pool";
import { requireAuth, requireOneOfRoles } from "../middleware/auth";
import { ApiError } from "../utils/errors";
import { saveListingImages } from "../services/imageService";
import { sanitizePlainText, sanitizeSlug, sanitizeStringArray } from "../utils/sanitize";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 12, fileSize: 8 * 1024 * 1024 },
});

const listingSchema = z.object({
  title: z.string().min(1).max(180),
  slug: z.string().max(180).optional(),
  section: z.enum(["BUY", "RENT", "SENIOR_HOME", "SELL"]),
  category: z.enum([
    "NORMAL",
    "FORECLOSURE",
    "URGENT_SALE",
    "FEATURED",
    "NEW_LISTING",
    "DISTRESS",
    "PRE_FORECLOSURE",
    "FIXER_UPPER",
  ]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "DELETED"]).default("DRAFT"),
  propertyType: z.string().max(120).optional(),
  price: z.number().int().nonnegative().nullable().optional(),
  rentPrice: z.number().int().nonnegative().nullable().optional(),
  depositAmount: z.number().int().nonnegative().nullable().optional(),
  depositText: z.string().max(120).nullable().optional(),
  bedrooms: z.number().int().min(0).max(20).nullable().optional(),
  bathrooms: z.number().int().min(0).max(20).nullable().optional(),
  sqm: z.number().nonnegative().nullable().optional(),
  landSize: z.number().nonnegative().nullable().optional(),
  builtYear: z.number().int().min(1800).max(2100).nullable().optional(),
  province: z.string().max(120).nullable().optional(),
  city: z.string().max(120).nullable().optional(),
  district: z.string().max(120).nullable().optional(),
  subdistrict: z.string().max(120).nullable().optional(),
  streetAddress: z.string().max(240).nullable().optional(),
  postalCode: z.string().max(20).nullable().optional(),
  country: z.string().max(120).default("Thailand"),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  description: z.string().max(10000).optional(),
  features: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
});

const listingUpdateSchema = listingSchema.partial();

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
    propertyType: data.propertyType ? sanitizePlainText(data.propertyType, 120) : null,
    price: data.price ?? null,
    rentPrice: data.rentPrice ?? null,
    depositAmount: data.depositAmount ?? null,
    depositText: data.depositText ? sanitizePlainText(data.depositText, 120) : null,
    bedrooms: data.bedrooms ?? null,
    bathrooms: data.bathrooms ?? null,
    sqm: data.sqm ?? null,
    landSize: data.landSize ?? null,
    builtYear: data.builtYear ?? null,
    province: data.province ? sanitizePlainText(data.province, 120) : null,
    city: data.city ? sanitizePlainText(data.city, 120) : null,
    district: data.district ? sanitizePlainText(data.district, 120) : null,
    subdistrict: data.subdistrict ? sanitizePlainText(data.subdistrict, 120) : null,
    streetAddress: data.streetAddress ? sanitizePlainText(data.streetAddress, 240) : null,
    postalCode: data.postalCode ? sanitizePlainText(data.postalCode, 20) : null,
    country: sanitizePlainText(data.country, 120),
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    description: data.description ? sanitizePlainText(data.description, 10000) : "",
    features: JSON.stringify(sanitizeStringArray(data.features ?? [], 100, 120)),
    amenities: JSON.stringify(sanitizeStringArray(data.amenities ?? [], 100, 120)),
  };
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
        updated_at: string;
      })[]
    >("SELECT id, title, section, category, status, updated_at FROM listings ORDER BY updated_at DESC");
    response.json({ total: rows.length, items: rows });
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
        title, slug, section, category, status, property_type, price, rent_price, deposit_amount, deposit_text,
        bedrooms, bathrooms, sqm, land_size, built_year, province, city, district, subdistrict, street_address,
        postal_code, country, latitude, longitude, description, features, amenities, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clean.title,
        clean.slug,
        clean.section,
        clean.category,
        clean.status,
        clean.propertyType,
        clean.price,
        clean.rentPrice,
        clean.depositAmount,
        clean.depositText,
        clean.bedrooms,
        clean.bathrooms,
        clean.sqm,
        clean.landSize,
        clean.builtYear,
        clean.province,
        clean.city,
        clean.district,
        clean.subdistrict,
        clean.streetAddress,
        clean.postalCode,
        clean.country,
        clean.latitude,
        clean.longitude,
        clean.description,
        clean.features,
        clean.amenities,
        request.user!.id,
      ],
    );
    response.status(201).json({ id: result.insertId });
  } catch (error) {
    next(error);
  }
});

adminListingRoutes.patch("/listings/:id", async (request, response, next) => {
  try {
    const listingId = Number.parseInt(request.params.id, 10);
    if (!Number.isFinite(listingId) || listingId <= 0) {
      throw new ApiError(400, "Invalid listing id");
    }
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

    if (input.title !== undefined) {
      sets.push("title=?");
      values.push(sanitizePlainText(input.title, 180));
    }
    if (input.slug !== undefined) {
      const slug = sanitizeSlug(input.slug);
      if (!slug) {
        throw new ApiError(400, "Invalid slug");
      }
      sets.push("slug=?");
      values.push(slug);
    }
    if (input.section !== undefined) {
      sets.push("section=?");
      values.push(input.section);
    }
    if (input.category !== undefined) {
      sets.push("category=?");
      values.push(input.category);
    }
    if (input.status !== undefined) {
      sets.push("status=?");
      values.push(input.status);
    }
    if (input.propertyType !== undefined) {
      sets.push("property_type=?");
      values.push(input.propertyType ? sanitizePlainText(input.propertyType, 120) : null);
    }
    if (input.price !== undefined) {
      sets.push("price=?");
      values.push(input.price);
    }
    if (input.rentPrice !== undefined) {
      sets.push("rent_price=?");
      values.push(input.rentPrice);
    }
    if (input.depositAmount !== undefined) {
      sets.push("deposit_amount=?");
      values.push(input.depositAmount);
    }
    if (input.depositText !== undefined) {
      sets.push("deposit_text=?");
      values.push(input.depositText ? sanitizePlainText(input.depositText, 120) : null);
    }
    if (input.bedrooms !== undefined) {
      sets.push("bedrooms=?");
      values.push(input.bedrooms);
    }
    if (input.bathrooms !== undefined) {
      sets.push("bathrooms=?");
      values.push(input.bathrooms);
    }
    if (input.sqm !== undefined) {
      sets.push("sqm=?");
      values.push(input.sqm);
    }
    if (input.landSize !== undefined) {
      sets.push("land_size=?");
      values.push(input.landSize);
    }
    if (input.builtYear !== undefined) {
      sets.push("built_year=?");
      values.push(input.builtYear);
    }
    if (input.province !== undefined) {
      sets.push("province=?");
      values.push(input.province ? sanitizePlainText(input.province, 120) : null);
    }
    if (input.city !== undefined) {
      sets.push("city=?");
      values.push(input.city ? sanitizePlainText(input.city, 120) : null);
    }
    if (input.district !== undefined) {
      sets.push("district=?");
      values.push(input.district ? sanitizePlainText(input.district, 120) : null);
    }
    if (input.subdistrict !== undefined) {
      sets.push("subdistrict=?");
      values.push(input.subdistrict ? sanitizePlainText(input.subdistrict, 120) : null);
    }
    if (input.streetAddress !== undefined) {
      sets.push("street_address=?");
      values.push(input.streetAddress ? sanitizePlainText(input.streetAddress, 240) : null);
    }
    if (input.postalCode !== undefined) {
      sets.push("postal_code=?");
      values.push(input.postalCode ? sanitizePlainText(input.postalCode, 20) : null);
    }
    if (input.country !== undefined) {
      sets.push("country=?");
      values.push(sanitizePlainText(input.country, 120));
    }
    if (input.latitude !== undefined) {
      sets.push("latitude=?");
      values.push(input.latitude);
    }
    if (input.longitude !== undefined) {
      sets.push("longitude=?");
      values.push(input.longitude);
    }
    if (input.description !== undefined) {
      sets.push("description=?");
      values.push(input.description ? sanitizePlainText(input.description, 10000) : "");
    }
    if (input.features !== undefined) {
      sets.push("features=?");
      values.push(JSON.stringify(sanitizeStringArray(input.features, 100, 120)));
    }
    if (input.amenities !== undefined) {
      sets.push("amenities=?");
      values.push(JSON.stringify(sanitizeStringArray(input.amenities, 100, 120)));
    }

    if (!sets.length) {
      throw new ApiError(400, "No valid update fields provided");
    }

    values.push(listingId);
    await executeSql(`UPDATE listings SET ${sets.join(", ")}, updated_at=CURRENT_TIMESTAMP WHERE id=?`, values);
    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

adminListingRoutes.delete("/listings/:id", async (request, response, next) => {
  try {
    const listingId = Number.parseInt(request.params.id, 10);
    if (!Number.isFinite(listingId) || listingId <= 0) {
      throw new ApiError(400, "Invalid listing id");
    }
    await executeSql("UPDATE listings SET status='DELETED', updated_at=CURRENT_TIMESTAMP WHERE id=?", [listingId]);
    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

adminListingRoutes.post("/listings/:id/images", upload.array("images", 12), async (request, response, next) => {
  try {
    const listingId = Number.parseInt(request.params.id, 10);
    if (!Number.isFinite(listingId) || listingId <= 0) {
      throw new ApiError(400, "Invalid listing id");
    }
    const files = request.files as Express.Multer.File[] | undefined;
    const created = await saveListingImages(listingId, files ?? []);
    response.status(201).json({ total: created.length, items: created });
  } catch (error) {
    next(error);
  }
});
