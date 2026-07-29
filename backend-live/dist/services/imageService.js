"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveListingImages = saveListingImages;
exports.deleteListingImageFiles = deleteListingImageFiles;
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const sharp_1 = __importDefault(require("sharp"));
const env_1 = require("../config/env");
const pool_1 = require("../db/pool");
const errors_1 = require("../utils/errors");
const sanitize_1 = require("../utils/sanitize");
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
function safeBaseName(input) {
    const clean = (0, sanitize_1.sanitizePlainText)(input, 80).replace(/[^a-zA-Z0-9._-]/g, "-");
    return clean || "listing-image";
}
function publicUrl(relativePath) {
    return `${env_1.env.PUBLIC_UPLOAD_BASE_URL.replace(/\/+$/, "")}/${relativePath.replace(/\\/g, "/")}`;
}
async function writeVariant(buffer, target, width, height) {
    await (0, sharp_1.default)(buffer)
        .rotate()
        .resize(width, height, { fit: "cover", position: "centre" })
        .webp({ quality: 84 })
        .toFile(target);
}
async function saveListingImages(listingId, files) {
    if (!files.length) {
        throw new errors_1.ApiError(400, "At least one image is required");
    }
    const listingRows = await (0, pool_1.queryRows)("SELECT id FROM listings WHERE id = ? AND status <> 'DELETED' LIMIT 1", [listingId]);
    if (!listingRows.length) {
        throw new errors_1.ApiError(404, "Listing not found");
    }
    const countRows = await (0, pool_1.queryRows)("SELECT COUNT(*) AS count FROM listing_images WHERE listing_id = ?", [listingId]);
    const existingCount = countRows[0]?.count ?? 0;
    if (existingCount + files.length > 12) {
        throw new errors_1.ApiError(400, "A listing can only have up to 12 images");
    }
    const listingDir = node_path_1.default.join(env_1.env.UPLOAD_DIR_ABSOLUTE, "listings", String(listingId));
    await promises_1.default.mkdir(listingDir, { recursive: true });
    const created = [];
    for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
            throw new errors_1.ApiError(400, `Unsupported image type: ${file.mimetype}`);
        }
        const base = safeBaseName(node_path_1.default.parse(file.originalname).name);
        const stamp = `${Date.now()}-${i + 1}`;
        const cardName = `${base}-${stamp}-card.webp`;
        const bannerName = `${base}-${stamp}-banner.webp`;
        const detailName = `${base}-${stamp}-detail.webp`;
        const mobileName = `${base}-${stamp}-mobile.webp`;
        const galleryName = `${base}-${stamp}-gallery.webp`;
        await writeVariant(file.buffer, node_path_1.default.join(listingDir, cardName), 640, 420);
        await writeVariant(file.buffer, node_path_1.default.join(listingDir, bannerName), 1600, 500);
        await writeVariant(file.buffer, node_path_1.default.join(listingDir, detailName), 1280, 860);
        await writeVariant(file.buffer, node_path_1.default.join(listingDir, mobileName), 720, 540);
        await writeVariant(file.buffer, node_path_1.default.join(listingDir, galleryName), 1600, 1200);
        const relativeBase = node_path_1.default.join("listings", String(listingId));
        const cardUrl = publicUrl(node_path_1.default.join(relativeBase, cardName));
        const bannerUrl = publicUrl(node_path_1.default.join(relativeBase, bannerName));
        const detailUrl = publicUrl(node_path_1.default.join(relativeBase, detailName));
        const mobileUrl = publicUrl(node_path_1.default.join(relativeBase, mobileName));
        const galleryUrl = publicUrl(node_path_1.default.join(relativeBase, galleryName));
        const sortOrder = existingCount + i;
        const isCover = sortOrder === 0;
        const insertResult = await (0, pool_1.executeSql)(`INSERT INTO listing_images
      (listing_id, original_name, mime_type, card_url, banner_url, detail_url, mobile_url, gallery_url, sort_order, is_cover)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
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
        ]);
        created.push({
            id: Number(insertResult.insertId),
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
function getLocalFilePathFromPublicUrl(url) {
    const base = env_1.env.PUBLIC_UPLOAD_BASE_URL.replace(/\/+$/, "");
    if (!url.startsWith(base)) {
        return null;
    }
    const relative = url.slice(base.length).replace(/^\/+/, "");
    if (!relative) {
        return null;
    }
    return node_path_1.default.resolve(env_1.env.UPLOAD_DIR_ABSOLUTE, relative);
}
async function deleteListingImageFiles(imageUrls) {
    await Promise.all(imageUrls.map(async (url) => {
        const localPath = getLocalFilePathFromPublicUrl(url);
        if (!localPath) {
            return;
        }
        try {
            await promises_1.default.unlink(localPath);
        }
        catch (error) {
            const maybeNodeError = error;
            if (maybeNodeError.code !== "ENOENT") {
                throw error;
            }
        }
    }));
}
