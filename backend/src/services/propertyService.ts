import type { Prisma, PrismaClient } from "@prisma/client";
import { PropertyStatus } from "@prisma/client";
import { z } from "zod";
import { AppError } from "../utils/errors";
import { sanitizeText } from "../utils/sanitize";

const propertyFiltersSchema = z.object({
  listingType: z.enum(["BUY", "RENT", "SENIOR_HOME"]).optional(),
  province: z.string().trim().max(120).optional(),
  cityOrQuery: z.string().trim().max(120).optional(),
  minPrice: z.number().int().nonnegative().optional(),
  maxPrice: z.number().int().nonnegative().optional(),
  bedrooms: z.number().int().min(0).max(20).optional(),
  bathrooms: z.number().int().min(0).max(20).optional(),
  propertyType: z.string().trim().max(80).optional(),
  amenities: z.array(z.string().trim().max(80)).max(30).optional(),
  saleCategory: z.enum(["NORMAL", "DISTRESS", "FORECLOSURE", "PRE_FORECLOSURE", "FIXER_UPPER", "URGENT_SALE"]).optional(),
  minLandSize: z.number().nonnegative().optional(),
  maxLandSize: z.number().nonnegative().optional(),
});

const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(60).default(12),
});

export const propertySortValues = ["RECOMMENDED", "NEWEST", "PRICE_LOW", "PRICE_HIGH", "SIZE_HIGH", "SIZE_LOW"] as const;
type PropertySort = (typeof propertySortValues)[number];

export type PropertyFiltersInput = z.input<typeof propertyFiltersSchema>;
export type PaginationInput = z.input<typeof paginationSchema> | null | undefined;

const propertyInclude = {
  images: {
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
  },
  faqs: {
    orderBy: [{ sortOrder: "asc" as const }],
  },
} satisfies Prisma.PropertyInclude;

type PropertyWithRelations = Prisma.PropertyGetPayload<{ include: typeof propertyInclude }>;

function toLocation(property: Pick<PropertyWithRelations, "city" | "province">): string {
  return `${property.city}, ${property.province}`;
}

function toPriceLabel(property: Pick<PropertyWithRelations, "listingType" | "price" | "rentPrice">): string {
  if (property.listingType === "RENT") {
    return property.rentPrice ? `THB ${property.rentPrice.toLocaleString()} / month` : "Price on request";
  }
  return property.price ? `THB ${property.price.toLocaleString()}` : "Price on request";
}

function getCoverImage(property: PropertyWithRelations) {
  return property.images.find((image) => image.isCover) ?? property.images[0] ?? null;
}

function toGraphQLProperty(property: PropertyWithRelations) {
  const coverImage = getCoverImage(property);
  return {
    id: property.id,
    slug: property.slug,
    title: property.title,
    listingType: property.listingType,
    saleCategory: property.saleCategory,
    propertyType: property.propertyType,
    status: property.status,
    price: property.price,
    rentPrice: property.rentPrice,
    depositAmount: property.depositAmount,
    depositText: property.depositText,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sqm: property.sqm,
    landSize: property.landSize,
    builtYear: property.builtYear,
    province: property.province,
    city: property.city,
    district: property.district,
    subdistrict: property.subdistrict,
    streetAddress: property.streetAddress,
    postalCode: property.postalCode,
    country: property.country,
    latitude: property.latitude,
    longitude: property.longitude,
    description: property.description,
    features: property.features,
    amenities: property.amenities,
    location: toLocation(property),
    priceLabel: toPriceLabel(property),
    coverImageUrl: coverImage?.url ?? null,
    images: property.images,
    faqs: property.faqs,
    createdAt: property.createdAt.toISOString(),
    updatedAt: property.updatedAt.toISOString(),
  };
}

function toPropertySummary(property: PropertyWithRelations) {
  const coverImage = getCoverImage(property);
  return {
    id: property.id,
    slug: property.slug,
    title: property.title,
    listingType: property.listingType,
    city: property.city,
    province: property.province,
    location: toLocation(property),
    price: property.price,
    rentPrice: property.rentPrice,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sqm: property.sqm,
    imageUrl: coverImage?.cardUrl ?? coverImage?.url ?? null,
  };
}

function buildWhereClause(filtersInput: PropertyFiltersInput | null | undefined, publicOnly: boolean): Prisma.PropertyWhereInput {
  const filters = propertyFiltersSchema.parse(filtersInput ?? {});
  const where: Prisma.PropertyWhereInput = {};

  if (publicOnly) {
    where.status = PropertyStatus.PUBLISHED;
  }

  if (filters.listingType) where.listingType = filters.listingType;
  if (filters.province) where.province = sanitizeText(filters.province, 120);
  if (filters.propertyType) where.propertyType = sanitizeText(filters.propertyType, 80);
  if (filters.saleCategory) where.saleCategory = filters.saleCategory;

  if (filters.cityOrQuery) {
    const search = sanitizeText(filters.cityOrQuery, 120);
    where.OR = [
      { city: { contains: search, mode: "insensitive" } },
      { province: { contains: search, mode: "insensitive" } },
      { district: { contains: search, mode: "insensitive" } },
      { subdistrict: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (typeof filters.bedrooms === "number") {
    where.bedrooms = { gte: filters.bedrooms };
  }
  if (typeof filters.bathrooms === "number") {
    where.bathrooms = { gte: filters.bathrooms };
  }

  if (typeof filters.minLandSize === "number" || typeof filters.maxLandSize === "number") {
    where.landSize = {};
    if (typeof filters.minLandSize === "number") where.landSize.gte = filters.minLandSize;
    if (typeof filters.maxLandSize === "number") where.landSize.lte = filters.maxLandSize;
  }

  if (filters.amenities?.length) {
    where.amenities = { hasEvery: filters.amenities.map((amenity) => sanitizeText(amenity, 80)) };
  }

  if (typeof filters.minPrice === "number" || typeof filters.maxPrice === "number") {
    const isRent = filters.listingType === "RENT";
    const key = isRent ? "rentPrice" : "price";
    where[key] = {};
    if (typeof filters.minPrice === "number") where[key]!.gte = filters.minPrice;
    if (typeof filters.maxPrice === "number") where[key]!.lte = filters.maxPrice;
  }

  return where;
}

function buildOrderBy(sort: PropertySort): Prisma.PropertyOrderByWithRelationInput[] {
  switch (sort) {
    case "NEWEST":
      return [{ createdAt: "desc" }];
    case "PRICE_LOW":
      return [{ price: { sort: "asc", nulls: "last" } }, { rentPrice: { sort: "asc", nulls: "last" } }];
    case "PRICE_HIGH":
      return [{ price: { sort: "desc", nulls: "last" } }, { rentPrice: { sort: "desc", nulls: "last" } }];
    case "SIZE_HIGH":
      return [{ sqm: "desc" }];
    case "SIZE_LOW":
      return [{ sqm: "asc" }];
    case "RECOMMENDED":
    default:
      return [{ updatedAt: "desc" }, { createdAt: "desc" }];
  }
}

export async function listProperties(
  prisma: PrismaClient,
  {
    filtersInput,
    sort = "RECOMMENDED",
    paginationInput,
    publicOnly = true,
  }: {
    filtersInput: PropertyFiltersInput | null | undefined;
    sort?: PropertySort;
    paginationInput?: PaginationInput;
    publicOnly?: boolean;
  },
) {
  const pagination = paginationSchema.parse(paginationInput ?? {});
  const where = buildWhereClause(filtersInput, publicOnly);
  const orderBy = buildOrderBy(sort);
  const skip = (pagination.page - 1) * pagination.pageSize;
  const take = pagination.pageSize;

  const [total, properties] = await prisma.$transaction([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      include: propertyInclude,
      orderBy,
      skip,
      take,
    }),
  ]);

  return {
    items: properties.map(toGraphQLProperty),
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    hasNextPage: skip + properties.length < total,
  };
}

export async function getPropertyByIdOrSlug(
  prisma: PrismaClient,
  args: { id?: string | null; slug?: string | null; publicOnly?: boolean },
) {
  const id = typeof args.id === "string" ? sanitizeText(args.id, 120) : "";
  const slug = typeof args.slug === "string" ? sanitizeText(args.slug.toLowerCase(), 120) : "";

  if (!id && !slug) {
    throw new AppError("Provide property id or slug.", "BAD_REQUEST", 400);
  }

  const property = await prisma.property.findFirst({
    where: {
      ...(args.publicOnly === false ? {} : { status: PropertyStatus.PUBLISHED }),
      OR: [{ id: id || undefined }, { slug: slug || undefined }],
    },
    include: propertyInclude,
  });

  return property ? toGraphQLProperty(property) : null;
}

export async function getFeaturedProperties(
  prisma: PrismaClient,
  { listingType, limit, publicOnly = true }: { listingType?: "BUY" | "RENT" | "SENIOR_HOME" | null; limit?: number; publicOnly?: boolean },
) {
  const take = Math.max(1, Math.min(limit ?? 6, 24));
  const properties = await prisma.property.findMany({
    where: {
      ...(publicOnly ? { status: PropertyStatus.PUBLISHED } : {}),
      ...(listingType ? { listingType } : {}),
    },
    include: propertyInclude,
    orderBy: [{ updatedAt: "desc" }],
    take,
  });

  return properties.map(toGraphQLProperty);
}

export async function getSimilarProperties(
  prisma: PrismaClient,
  { propertyId, limit, publicOnly = true }: { propertyId: string; limit?: number; publicOnly?: boolean },
) {
  const id = sanitizeText(propertyId, 120);
  const anchor = await prisma.property.findUnique({ where: { id } });
  if (!anchor) {
    throw new AppError("Property not found.", "NOT_FOUND", 404);
  }

  const take = Math.max(1, Math.min(limit ?? 6, 24));
  const sameProvince = await prisma.property.findMany({
    where: {
      id: { not: anchor.id },
      listingType: anchor.listingType,
      province: anchor.province,
      ...(publicOnly ? { status: PropertyStatus.PUBLISHED } : {}),
    },
    include: propertyInclude,
    orderBy: [{ updatedAt: "desc" }],
    take,
  });

  if (sameProvince.length >= take) return sameProvince.map(toGraphQLProperty);

  const fallback = await prisma.property.findMany({
    where: {
      id: { notIn: [anchor.id, ...sameProvince.map((item) => item.id)] },
      listingType: anchor.listingType,
      ...(publicOnly ? { status: PropertyStatus.PUBLISHED } : {}),
    },
    include: propertyInclude,
    orderBy: [{ updatedAt: "desc" }],
    take: take - sameProvince.length,
  });

  return [...sameProvince, ...fallback].map(toGraphQLProperty);
}

export async function getPropertySummariesByIds(
  prisma: PrismaClient,
  ids: string[],
  publicOnly = true,
) {
  if (ids.length === 0) return [];

  const records = await prisma.property.findMany({
    where: {
      id: { in: ids },
      ...(publicOnly ? { status: PropertyStatus.PUBLISHED } : {}),
    },
    include: propertyInclude,
  });

  const orderLookup = new Map(ids.map((id, index) => [id, index]));
  return records
    .sort((left, right) => (orderLookup.get(left.id) ?? 0) - (orderLookup.get(right.id) ?? 0))
    .map(toPropertySummary);
}

export { toGraphQLProperty, toPropertySummary, propertyInclude, type PropertyWithRelations };

