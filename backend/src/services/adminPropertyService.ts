import type { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { AppError } from "../utils/errors";
import { sanitizeNullableText, sanitizeStringArray, sanitizeText, toSlug } from "../utils/sanitize";
import { propertyInclude, toGraphQLProperty } from "./propertyService";

const listingTypeEnum = z.enum(["BUY", "RENT", "SENIOR_HOME"]);
const saleCategoryEnum = z.enum(["NORMAL", "DISTRESS", "FORECLOSURE", "PRE_FORECLOSURE", "FIXER_UPPER", "URGENT_SALE"]);
const propertyStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

const basePropertyInputSchema = z.object({
  slug: z.string().max(140).optional(),
  title: z.string().min(3).max(180),
  listingType: listingTypeEnum,
  saleCategory: saleCategoryEnum.default("NORMAL"),
  propertyType: z.string().min(2).max(80),
  status: propertyStatusEnum.default("DRAFT"),
  price: z.number().int().nonnegative().optional().nullable(),
  rentPrice: z.number().int().nonnegative().optional().nullable(),
  depositAmount: z.number().int().nonnegative().optional().nullable(),
  depositText: z.string().max(120).optional().nullable(),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().int().min(0).max(20),
  sqm: z.number().positive().max(50000),
  landSize: z.number().nonnegative().max(1000000).optional().nullable(),
  builtYear: z.number().int().min(1800).max(2200).optional().nullable(),
  province: z.string().min(2).max(120),
  city: z.string().min(1).max(120),
  district: z.string().max(120).optional().nullable(),
  subdistrict: z.string().max(120).optional().nullable(),
  streetAddress: z.string().max(220).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  country: z.string().max(80).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  description: z.string().min(20).max(6000),
  features: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
});

const updatePropertyInputSchema = basePropertyInputSchema.partial();

const faqSchema = z.object({
  question: z.string().min(3).max(280),
  answer: z.string().min(3).max(2000),
  sortOrder: z.number().int().min(0).optional(),
});

async function buildUniqueSlug(prisma: PrismaClient, slugSource: string) {
  const baseSlug = toSlug(slugSource).slice(0, 110);
  let currentSlug = baseSlug;
  let counter = 2;

  while (true) {
    const exists = await prisma.property.findUnique({ where: { slug: currentSlug }, select: { id: true } });
    if (!exists) return currentSlug;
    currentSlug = `${baseSlug}-${counter}`;
    counter += 1;
    if (counter > 9999) throw new AppError("Could not generate unique slug.", "SLUG_CONFLICT", 500);
  }
}

function sanitizeBasePropertyData(payload: z.infer<typeof basePropertyInputSchema>) {
  return {
    title: sanitizeText(payload.title, 180),
    listingType: payload.listingType,
    saleCategory: payload.saleCategory,
    propertyType: sanitizeText(payload.propertyType, 80),
    status: payload.status,
    price: payload.price ?? null,
    rentPrice: payload.rentPrice ?? null,
    depositAmount: payload.depositAmount ?? null,
    depositText: sanitizeNullableText(payload.depositText, 120),
    bedrooms: payload.bedrooms,
    bathrooms: payload.bathrooms,
    sqm: payload.sqm,
    landSize: payload.landSize ?? null,
    builtYear: payload.builtYear ?? null,
    province: sanitizeText(payload.province, 120),
    city: sanitizeText(payload.city, 120),
    district: sanitizeNullableText(payload.district, 120),
    subdistrict: sanitizeNullableText(payload.subdistrict, 120),
    streetAddress: sanitizeNullableText(payload.streetAddress, 220),
    postalCode: sanitizeNullableText(payload.postalCode, 20),
    country: sanitizeNullableText(payload.country, 80) ?? "Thailand",
    latitude: payload.latitude ?? null,
    longitude: payload.longitude ?? null,
    description: sanitizeText(payload.description, 6000),
    features: sanitizeStringArray(payload.features ?? [], 120, 100),
    amenities: sanitizeStringArray(payload.amenities ?? [], 120, 100),
  };
}

function sanitizeUpdateData(payload: z.infer<typeof updatePropertyInputSchema>) {
  const data: Record<string, unknown> = {};

  if (payload.title !== undefined) data.title = sanitizeText(payload.title, 180);
  if (payload.listingType !== undefined) data.listingType = payload.listingType;
  if (payload.saleCategory !== undefined) data.saleCategory = payload.saleCategory;
  if (payload.propertyType !== undefined) data.propertyType = sanitizeText(payload.propertyType, 80);
  if (payload.status !== undefined) data.status = payload.status;
  if (payload.price !== undefined) data.price = payload.price ?? null;
  if (payload.rentPrice !== undefined) data.rentPrice = payload.rentPrice ?? null;
  if (payload.depositAmount !== undefined) data.depositAmount = payload.depositAmount ?? null;
  if (payload.depositText !== undefined) data.depositText = sanitizeNullableText(payload.depositText, 120);
  if (payload.bedrooms !== undefined) data.bedrooms = payload.bedrooms;
  if (payload.bathrooms !== undefined) data.bathrooms = payload.bathrooms;
  if (payload.sqm !== undefined) data.sqm = payload.sqm;
  if (payload.landSize !== undefined) data.landSize = payload.landSize ?? null;
  if (payload.builtYear !== undefined) data.builtYear = payload.builtYear ?? null;
  if (payload.province !== undefined) data.province = sanitizeText(payload.province, 120);
  if (payload.city !== undefined) data.city = sanitizeText(payload.city, 120);
  if (payload.district !== undefined) data.district = sanitizeNullableText(payload.district, 120);
  if (payload.subdistrict !== undefined) data.subdistrict = sanitizeNullableText(payload.subdistrict, 120);
  if (payload.streetAddress !== undefined) data.streetAddress = sanitizeNullableText(payload.streetAddress, 220);
  if (payload.postalCode !== undefined) data.postalCode = sanitizeNullableText(payload.postalCode, 20);
  if (payload.country !== undefined) data.country = sanitizeNullableText(payload.country, 80) ?? "Thailand";
  if (payload.latitude !== undefined) data.latitude = payload.latitude ?? null;
  if (payload.longitude !== undefined) data.longitude = payload.longitude ?? null;
  if (payload.description !== undefined) data.description = sanitizeText(payload.description, 6000);
  if (payload.features !== undefined) data.features = sanitizeStringArray(payload.features, 120, 100);
  if (payload.amenities !== undefined) data.amenities = sanitizeStringArray(payload.amenities, 120, 100);

  return data;
}

export async function createProperty(prisma: PrismaClient, input: unknown) {
  const payload = basePropertyInputSchema.parse(input);
  const slug = await buildUniqueSlug(prisma, payload.slug || payload.title);

  const created = await prisma.property.create({
    data: {
      slug,
      ...sanitizeBasePropertyData(payload),
    },
    include: propertyInclude,
  });
  return toGraphQLProperty(created);
}

export async function updateProperty(prisma: PrismaClient, propertyId: string, input: unknown) {
  const id = sanitizeText(propertyId, 120);
  const payload = updatePropertyInputSchema.parse(input);
  const updateData = sanitizeUpdateData(payload);

  if (payload.slug !== undefined) {
    const desiredSlug = toSlug(payload.slug).slice(0, 110);
    const existing = await prisma.property.findUnique({
      where: { slug: desiredSlug },
      select: { id: true },
    });
    if (existing && existing.id !== id) {
      throw new AppError("Slug already exists.", "SLUG_CONFLICT", 409);
    }
    updateData.slug = desiredSlug;
  }

  const updated = await prisma.property.update({
    where: { id },
    data: updateData,
    include: propertyInclude,
  });
  return toGraphQLProperty(updated);
}

export async function archiveProperty(prisma: PrismaClient, propertyId: string) {
  const id = sanitizeText(propertyId, 120);
  const updated = await prisma.property.update({
    where: { id },
    data: { status: "ARCHIVED" },
    include: propertyInclude,
  });
  return toGraphQLProperty(updated);
}

export async function deletePropertySafely(prisma: PrismaClient, propertyId: string) {
  const id = sanitizeText(propertyId, 120);

  const favoriteCount = await prisma.favorite.count({ where: { propertyId: id } });
  if (favoriteCount > 0) {
    throw new AppError("Property has user favorites and cannot be deleted safely.", "DELETE_BLOCKED", 400);
  }

  await prisma.property.delete({ where: { id } });
  return true;
}

export async function updatePropertyFeatures(prisma: PrismaClient, propertyId: string, features: unknown) {
  const id = sanitizeText(propertyId, 120);
  const nextFeatures = sanitizeStringArray(features, 120, 100);
  const updated = await prisma.property.update({
    where: { id },
    data: { features: nextFeatures },
    include: propertyInclude,
  });
  return toGraphQLProperty(updated);
}

export async function updatePropertyAmenities(prisma: PrismaClient, propertyId: string, amenities: unknown) {
  const id = sanitizeText(propertyId, 120);
  const nextAmenities = sanitizeStringArray(amenities, 120, 100);
  const updated = await prisma.property.update({
    where: { id },
    data: { amenities: nextAmenities },
    include: propertyInclude,
  });
  return toGraphQLProperty(updated);
}

export async function updatePropertyFaqs(prisma: PrismaClient, propertyId: string, faqsInput: unknown) {
  const id = sanitizeText(propertyId, 120);
  const parsedFaqs = z.array(faqSchema).max(60).parse(faqsInput);

  await prisma.$transaction([
    prisma.propertyFAQ.deleteMany({ where: { propertyId: id } }),
    ...parsedFaqs.map((faq, index) =>
      prisma.propertyFAQ.create({
        data: {
          propertyId: id,
          question: sanitizeText(faq.question, 280),
          answer: sanitizeText(faq.answer, 2000),
          sortOrder: faq.sortOrder ?? index,
        },
      }),
    ),
  ]);

  const updated = await prisma.property.findUnique({
    where: { id },
    include: propertyInclude,
  });
  if (!updated) throw new AppError("Property not found.", "NOT_FOUND", 404);
  return toGraphQLProperty(updated);
}

