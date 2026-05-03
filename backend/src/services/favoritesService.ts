import type { PrismaClient } from "@prisma/client";
import { PropertyStatus } from "@prisma/client";
import { AppError } from "../utils/errors";
import { sanitizeText } from "../utils/sanitize";
import { getPropertySummariesByIds } from "./propertyService";

export async function getMyFavorites(prisma: PrismaClient, userId: string) {
  const safeUserId = sanitizeText(userId, 120);
  const favorites = await prisma.favorite.findMany({
    where: { userId: safeUserId },
    orderBy: [{ createdAt: "desc" }],
  });

  const propertyIds = favorites.map((favorite) => favorite.propertyId);
  return getPropertySummariesByIds(prisma, propertyIds, true);
}

export async function savePropertyToFavorites(prisma: PrismaClient, userId: string, propertyId: string) {
  const safeUserId = sanitizeText(userId, 120);
  const safePropertyId = sanitizeText(propertyId, 120);

  const property = await prisma.property.findUnique({
    where: { id: safePropertyId },
    select: { id: true, status: true },
  });
  if (!property || property.status !== PropertyStatus.PUBLISHED) {
    throw new AppError("Property is unavailable.", "NOT_FOUND", 404);
  }

  const favorite = await prisma.favorite.upsert({
    where: { userId_propertyId: { userId: safeUserId, propertyId: safePropertyId } },
    create: { userId: safeUserId, propertyId: safePropertyId },
    update: {},
  });

  return { saved: true, favoriteId: favorite.id };
}

export async function unsavePropertyFromFavorites(prisma: PrismaClient, userId: string, propertyId: string) {
  const safeUserId = sanitizeText(userId, 120);
  const safePropertyId = sanitizeText(propertyId, 120);

  await prisma.favorite.deleteMany({
    where: { userId: safeUserId, propertyId: safePropertyId },
  });

  return { saved: false, favoriteId: null };
}

export async function togglePropertyFavorite(prisma: PrismaClient, userId: string, propertyId: string) {
  const safeUserId = sanitizeText(userId, 120);
  const safePropertyId = sanitizeText(propertyId, 120);

  const existing = await prisma.favorite.findUnique({
    where: { userId_propertyId: { userId: safeUserId, propertyId: safePropertyId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return { saved: false, favoriteId: null };
  }

  const saved = await savePropertyToFavorites(prisma, safeUserId, safePropertyId);
  return saved;
}

