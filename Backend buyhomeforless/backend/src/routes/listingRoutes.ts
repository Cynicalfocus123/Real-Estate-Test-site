import { Router } from "express";
import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { LISTING_CATEGORIES, LISTING_SECTIONS } from "../constants/listing";
import { queryRows } from "../db/pool";
import { ApiError } from "../utils/errors";
import { sanitizePlainText } from "../utils/sanitize";

const querySchema = z.object({
  section: z.enum(LISTING_SECTIONS).optional(),
  category: z.enum(LISTING_CATEGORIES).optional(),
  search: z.string().max(120).optional(),
  city: z.string().max(120).optional(),
  province: z.string().max(120).optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(24),
});

export const listingRoutes = Router();

listingRoutes.get("/", async (request, response, next) => {
  try {
    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid listing query", parsed.error.flatten());
    }
    const data = parsed.data;

    const where: string[] = ["l.status = 'PUBLISHED'"];
    const params: unknown[] = [];
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
      params.push(`%${sanitizePlainText(data.city, 120)}%`);
    }
    if (data.province) {
      where.push("l.province LIKE ?");
      params.push(`%${sanitizePlainText(data.province, 120)}%`);
    }
    if (data.search) {
      const safeSearch = `%${sanitizePlainText(data.search, 120)}%`;
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

    const countRows = await queryRows<(RowDataPacket & { count: number })[]>(
      `SELECT COUNT(*) AS count FROM listings l ${whereSql}`,
      params,
    );
    const total = countRows[0]?.count ?? 0;

    const rows = await queryRows<
      (RowDataPacket & {
        id: number;
        title: string;
        slug: string;
        section: string;
        category: string;
        status: string;
        city: string | null;
        province: string | null;
        price_amount: number | null;
        currency_code: string;
        buy_price: number | null;
        rent_monthly_price: number | null;
        deposit_amount: number | null;
        bedrooms: number | null;
        bathrooms: number | null;
        interior_size_sqm: number | null;
        card_url: string | null;
      })[]
    >(
      `SELECT l.id, l.title, l.slug, l.section, l.category, l.status, l.city, l.province,
              l.price_amount, l.currency_code, l.buy_price, l.rent_monthly_price, l.deposit_amount,
              l.bedrooms, l.bathrooms, l.interior_size_sqm,
              (SELECT li.card_url FROM listing_images li WHERE li.listing_id = l.id ORDER BY li.is_cover DESC, li.sort_order ASC LIMIT 1) AS card_url
       FROM listings l
       ${whereSql}
       ORDER BY l.updated_at DESC
       LIMIT ? OFFSET ?`,
      [...params, data.pageSize, offset],
    );

    response.json({
      total,
      page: data.page,
      pageSize: data.pageSize,
      hasNextPage: data.page * data.pageSize < total,
      items: rows,
    });
  } catch (error) {
    next(error);
  }
});

listingRoutes.get("/:id", async (request, response, next) => {
  try {
    const listingId = Number.parseInt(request.params.id, 10);
    if (!Number.isFinite(listingId) || listingId <= 0) {
      throw new ApiError(400, "Invalid listing id");
    }

    const listingRows = await queryRows<(RowDataPacket & { id: number; status: string })[]>(
      "SELECT * FROM listings WHERE id = ? AND status = 'PUBLISHED' LIMIT 1",
      [listingId],
    );
    const listing = listingRows[0];
    if (!listing) {
      throw new ApiError(404, "Listing not found");
    }

    const images = await queryRows<
      (RowDataPacket & {
        id: number;
        card_url: string;
        banner_url: string;
        detail_url: string;
        mobile_url: string;
        gallery_url: string;
        sort_order: number;
        is_cover: number;
      })[]
    >(
      `SELECT id, card_url, banner_url, detail_url, mobile_url, gallery_url, sort_order, is_cover
       FROM listing_images WHERE listing_id = ? ORDER BY is_cover DESC, sort_order ASC`,
      [listingId],
    );

    const faqs = await queryRows<
      (RowDataPacket & {
        id: number;
        question: string;
        answer: string;
        sort_order: number;
      })[]
    >(
      `SELECT id, question, answer, sort_order
       FROM listing_faqs
       WHERE listing_id = ? AND is_active = 1
       ORDER BY sort_order ASC, id ASC`,
      [listingId],
    );

    response.json({ listing, images, faqs });
  } catch (error) {
    next(error);
  }
});
