import fs from "node:fs/promises";
import path from "node:path";
import type { RowDataPacket } from "mysql2/promise";
import sharp from "sharp";
import { env } from "../config/env";
import { executeSql, queryRows } from "../db/pool";
import { ApiError } from "../utils/errors";
import { sanitizePlainText } from "../utils/sanitize";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function safeBaseName(input: string) {
  const clean = sanitizePlainText(input, 80).replace(/[^a-zA-Z0-9._-]/g, "-");
  return clean || "listing-image";
}

function publicUrl(relativePath: string) {
  return `${env.PUBLIC_UPLOAD_BASE_URL.replace(/\/+$/, "")}/${relativePath.replace(/\\/g, "/")}`;
}

async function writeVariant(buffer: Buffer, target: string, width: number, height: number) {
  await sharp(buffer)
    .rotate()
    .resize(width, height, { fit: "cover", position: "centre" })
    .webp({ quality: 84 })
    .toFile(target);
}

export async function saveListingImages(listingId: number, files: Express.Multer.File[]) {
  if (!files.length) {
    throw new ApiError(400, "At least one image is required");
  }
  const listingRows = await queryRows<(RowDataPacket & { id: number })[]>(
    "SELECT id FROM listings WHERE id = ? AND status <> 'DELETED' LIMIT 1",
    [listingId],
  );
  if (!listingRows.length) {
    throw new ApiError(404, "Listing not found");
  }

  const countRows = await queryRows<(RowDataPacket & { count: number })[]>(
    "SELECT COUNT(*) AS count FROM listing_images WHERE listing_id = ?",
    [listingId],
  );
  const existingCount = countRows[0]?.count ?? 0;
  if (existingCount + files.length > 12) {
    throw new ApiError(400, "A listing can only have up to 12 images");
  }

  const listingDir = path.join(env.UPLOAD_DIR_ABSOLUTE, "listings", String(listingId));
  await fs.mkdir(listingDir, { recursive: true });

  const created: unknown[] = [];
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new ApiError(400, `Unsupported image type: ${file.mimetype}`);
    }
    const base = safeBaseName(path.parse(file.originalname).name);
    const stamp = `${Date.now()}-${i + 1}`;

    const cardName = `${base}-${stamp}-card.webp`;
    const bannerName = `${base}-${stamp}-banner.webp`;
    const detailName = `${base}-${stamp}-detail.webp`;
    const mobileName = `${base}-${stamp}-mobile.webp`;
    const galleryName = `${base}-${stamp}-gallery.webp`;

    await writeVariant(file.buffer, path.join(listingDir, cardName), 640, 420);
    await writeVariant(file.buffer, path.join(listingDir, bannerName), 1600, 500);
    await writeVariant(file.buffer, path.join(listingDir, detailName), 1280, 860);
    await writeVariant(file.buffer, path.join(listingDir, mobileName), 720, 540);
    await writeVariant(file.buffer, path.join(listingDir, galleryName), 1600, 1200);

    const relativeBase = path.join("listings", String(listingId));
    const cardUrl = publicUrl(path.join(relativeBase, cardName));
    const bannerUrl = publicUrl(path.join(relativeBase, bannerName));
    const detailUrl = publicUrl(path.join(relativeBase, detailName));
    const mobileUrl = publicUrl(path.join(relativeBase, mobileName));
    const galleryUrl = publicUrl(path.join(relativeBase, galleryName));
    const sortOrder = existingCount + i;
    const isCover = sortOrder === 0;

    await executeSql(
      `INSERT INTO listing_images
      (listing_id, original_name, mime_type, card_url, banner_url, detail_url, mobile_url, gallery_url, sort_order, is_cover)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        listingId,
        safeBaseName(file.originalname),
        file.mimetype,
        cardUrl,
        bannerUrl,
        detailUrl,
        mobileUrl,
        galleryUrl,
        sortOrder,
        isCover ? 1 : 0,
      ],
    );

    created.push({
      cardUrl,
      bannerUrl,
      detailUrl,
      mobileUrl,
      galleryUrl,
      sortOrder,
      isCover,
    });
  }
  return created;
}
