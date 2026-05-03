import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import { z } from "zod";
import { env } from "../config/env";
import { AppError, assertCondition } from "../utils/errors";
import { sanitizeNullableText, sanitizeText } from "../utils/sanitize";

const uploadImageInputSchema = z.object({
  filename: z.string().min(1).max(120),
  mimeType: z.string().min(1).max(60),
  base64Data: z.string().min(1),
  altText: z.string().max(160).optional(),
  isCover: z.boolean().optional(),
});

const uploadImagesSchema = z.array(uploadImageInputSchema).min(1).max(12);

const allowedMimeTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"]);

const imageVariants = {
  thumbnail: { width: 320, height: 220 },
  card: { width: 640, height: 420 },
  gallery: { width: 1280, height: 960 },
  hero: { width: 1600, height: 900 },
} as const;

function toSafeDir(pathInput: string) {
  return path.resolve(pathInput);
}

function assertInsideUploadDir(targetPath: string) {
  const uploadDir = toSafeDir(env.UPLOAD_DIR);
  const resolvedTarget = path.resolve(targetPath);
  assertCondition(
    resolvedTarget.startsWith(uploadDir + path.sep) || resolvedTarget === uploadDir,
    "Unsafe upload path.",
    "UNSAFE_PATH",
    400,
  );
}

function decodeBase64Image(base64Data: string): Buffer {
  const normalized = base64Data.includes(",") ? base64Data.split(",").pop() ?? "" : base64Data;
  const buffer = Buffer.from(normalized, "base64");
  if (!buffer.length) {
    throw new AppError("Invalid image data.", "INVALID_IMAGE", 400);
  }
  if (buffer.length > 15 * 1024 * 1024) {
    throw new AppError("Image exceeds 15MB limit.", "IMAGE_TOO_LARGE", 400);
  }
  return buffer;
}

function removeUnsafePathChars(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 80);
}

function toPublicUploadUrl(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${env.PUBLIC_UPLOAD_BASE_URL.replace(/\/+$/, "")}/${normalized}`;
}

async function ensurePropertyUploadDir(propertyId: string): Promise<string> {
  const safePropertyId = sanitizeText(propertyId, 120).replace(/[^a-zA-Z0-9_-]/g, "");
  const dirPath = path.resolve(env.UPLOAD_DIR, "properties", safePropertyId);
  assertInsideUploadDir(dirPath);
  await fs.mkdir(dirPath, { recursive: true });
  return dirPath;
}

function mapImage(image: {
  id: string;
  propertyId: string;
  url: string;
  thumbnailUrl: string;
  cardUrl: string;
  galleryUrl: string;
  heroUrl: string;
  altText: string | null;
  width: number;
  height: number;
  sortOrder: number;
  isCover: boolean;
  createdAt: Date;
}) {
  return {
    ...image,
    createdAt: image.createdAt.toISOString(),
  };
}

export async function uploadPropertyImages(
  prisma: PrismaClient,
  args: { propertyId: string; files: unknown },
) {
  const propertyId = sanitizeText(args.propertyId, 120);
  const files = uploadImagesSchema.parse(args.files);

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  });
  if (!property) throw new AppError("Property not found.", "NOT_FOUND", 404);

  const existingCount = await prisma.propertyImage.count({ where: { propertyId } });
  if (existingCount + files.length > 12) {
    throw new AppError("Each property supports at most 12 images.", "MAX_IMAGES_REACHED", 400);
  }

  const uploadDir = await ensurePropertyUploadDir(propertyId);
  const currentMaxOrder = await prisma.propertyImage.aggregate({
    where: { propertyId },
    _max: { sortOrder: true },
  });
  let nextOrder = (currentMaxOrder._max.sortOrder ?? -1) + 1;

  const createdImages: Awaited<ReturnType<typeof prisma.propertyImage.create>>[] = [];
  for (const file of files) {
    const mimeType = file.mimeType.toLowerCase();
    if (!allowedMimeTypes.has(mimeType)) {
      throw new AppError(`Unsupported image type ${mimeType}.`, "UNSUPPORTED_FILE_TYPE", 400);
    }

    const rawBuffer = decodeBase64Image(file.base64Data);
    const image = sharp(rawBuffer, { failOn: "error" }).rotate();
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height) {
      throw new AppError("Could not read image dimensions.", "INVALID_IMAGE", 400);
    }

    const safeName = removeUnsafePathChars(file.filename) || "property-image";
    const imageId = crypto.randomUUID();
    const baseName = `${imageId}-${safeName}`;

    const thumbnailFilename = `${baseName}-thumb.webp`;
    const cardFilename = `${baseName}-card.webp`;
    const galleryFilename = `${baseName}-gallery.webp`;
    const heroFilename = `${baseName}-hero.webp`;

    const thumbnailPath = path.resolve(uploadDir, thumbnailFilename);
    const cardPath = path.resolve(uploadDir, cardFilename);
    const galleryPath = path.resolve(uploadDir, galleryFilename);
    const heroPath = path.resolve(uploadDir, heroFilename);
    [thumbnailPath, cardPath, galleryPath, heroPath].forEach(assertInsideUploadDir);

    const transformed = image.clone();
    await Promise.all([
      transformed
        .clone()
        .resize(imageVariants.thumbnail.width, imageVariants.thumbnail.height, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(thumbnailPath),
      transformed
        .clone()
        .resize(imageVariants.card.width, imageVariants.card.height, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(cardPath),
      transformed
        .clone()
        .resize(imageVariants.gallery.width, imageVariants.gallery.height, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 84 })
        .toFile(galleryPath),
      transformed
        .clone()
        .resize(imageVariants.hero.width, imageVariants.hero.height, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 84 })
        .toFile(heroPath),
    ]);

    const baseRelativeDir = path.join("properties", propertyId).replace(/\\/g, "/");
    const created = await prisma.propertyImage.create({
      data: {
        propertyId,
        url: toPublicUploadUrl(`${baseRelativeDir}/${galleryFilename}`),
        thumbnailUrl: toPublicUploadUrl(`${baseRelativeDir}/${thumbnailFilename}`),
        cardUrl: toPublicUploadUrl(`${baseRelativeDir}/${cardFilename}`),
        galleryUrl: toPublicUploadUrl(`${baseRelativeDir}/${galleryFilename}`),
        heroUrl: toPublicUploadUrl(`${baseRelativeDir}/${heroFilename}`),
        altText: sanitizeNullableText(file.altText, 160),
        width: metadata.width,
        height: metadata.height,
        sortOrder: nextOrder,
        isCover: Boolean(file.isCover),
      },
    });

    createdImages.push(created);
    nextOrder += 1;
  }

  const shouldResetCover = files.some((file) => file.isCover);
  if (shouldResetCover) {
    const latestCover = createdImages.find((image) => image.isCover);
    if (latestCover) {
      await prisma.propertyImage.updateMany({
        where: {
          propertyId,
          id: { not: latestCover.id },
          isCover: true,
        },
        data: { isCover: false },
      });
    }
  }

  return createdImages.map(mapImage);
}

export async function removePropertyImage(prisma: PrismaClient, args: { propertyId: string; imageId: string }) {
  const propertyId = sanitizeText(args.propertyId, 120);
  const imageId = sanitizeText(args.imageId, 120);

  const image = await prisma.propertyImage.findFirst({
    where: { id: imageId, propertyId },
  });
  if (!image) throw new AppError("Image not found.", "NOT_FOUND", 404);

  await prisma.propertyImage.delete({ where: { id: image.id } });
  return true;
}

export async function reorderPropertyImages(
  prisma: PrismaClient,
  args: { propertyId: string; orderedImageIds: string[] },
) {
  const propertyId = sanitizeText(args.propertyId, 120);
  const ids = args.orderedImageIds.map((id) => sanitizeText(id, 120));
  const uniqueIds = Array.from(new Set(ids));

  const images = await prisma.propertyImage.findMany({
    where: { propertyId },
    orderBy: [{ sortOrder: "asc" }],
  });
  if (images.length !== uniqueIds.length) {
    throw new AppError("orderedImageIds must include every property image exactly once.", "INVALID_INPUT", 400);
  }

  const idSet = new Set(images.map((image) => image.id));
  if (uniqueIds.some((id) => !idSet.has(id))) {
    throw new AppError("orderedImageIds contains invalid ids.", "INVALID_INPUT", 400);
  }

  await prisma.$transaction(
    uniqueIds.map((id, index) =>
      prisma.propertyImage.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  const updated = await prisma.propertyImage.findMany({
    where: { propertyId },
    orderBy: [{ sortOrder: "asc" }],
  });
  return updated.map(mapImage);
}

export async function setCoverImage(prisma: PrismaClient, args: { propertyId: string; imageId: string }) {
  const propertyId = sanitizeText(args.propertyId, 120);
  const imageId = sanitizeText(args.imageId, 120);
  const image = await prisma.propertyImage.findFirst({ where: { id: imageId, propertyId } });
  if (!image) throw new AppError("Image not found.", "NOT_FOUND", 404);

  await prisma.$transaction([
    prisma.propertyImage.updateMany({
      where: { propertyId, isCover: true },
      data: { isCover: false },
    }),
    prisma.propertyImage.update({
      where: { id: image.id },
      data: { isCover: true },
    }),
  ]);

  return true;
}

