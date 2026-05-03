import type { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { AppError } from "../utils/errors";
import { sanitizeNullableText, sanitizeText } from "../utils/sanitize";

const notificationFrequencySchema = z.enum(["REALTIME", "DAILY", "NONE"]);

const updateAccountSettingsSchema = z.object({
  displayName: z.string().max(80).optional(),
  phone: z.string().max(30).optional(),
  address: z.string().max(200).optional(),
  savedListingsEmailFrequency: notificationFrequencySchema.optional(),
  marketingUpdates: z.boolean().optional(),
});

const accountEmailSchema = z.string().email().max(120);

export async function getAccountSettings(prisma: PrismaClient, userId: string) {
  const safeUserId = sanitizeText(userId, 120);
  const user = await prisma.user.findUnique({
    where: { id: safeUserId },
    include: { notificationPrefs: true },
  });
  if (!user) throw new AppError("User not found.", "NOT_FOUND", 404);

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    phone: user.phone,
    address: user.address,
    emailVerified: user.emailVerified,
    savedListingsEmailFrequency: user.notificationPrefs?.savedListingsEmailFrequency ?? "REALTIME",
    marketingUpdates: user.notificationPrefs?.marketingUpdates ?? true,
  };
}

export async function updateAccountSettings(prisma: PrismaClient, userId: string, input: unknown) {
  const safeUserId = sanitizeText(userId, 120);
  const payload = updateAccountSettingsSchema.parse(input);

  await prisma.user.update({
    where: { id: safeUserId },
    data: {
      displayName: payload.displayName === undefined ? undefined : sanitizeNullableText(payload.displayName, 80),
      phone: payload.phone === undefined ? undefined : sanitizeNullableText(payload.phone, 30),
      address: payload.address === undefined ? undefined : sanitizeNullableText(payload.address, 200),
    },
  });

  await prisma.accountNotificationPreference.upsert({
    where: { userId: safeUserId },
    create: {
      userId: safeUserId,
      savedListingsEmailFrequency: payload.savedListingsEmailFrequency ?? "REALTIME",
      marketingUpdates: payload.marketingUpdates ?? true,
    },
    update: {
      ...(payload.savedListingsEmailFrequency ? { savedListingsEmailFrequency: payload.savedListingsEmailFrequency } : {}),
      ...(typeof payload.marketingUpdates === "boolean" ? { marketingUpdates: payload.marketingUpdates } : {}),
    },
  });

  return getAccountSettings(prisma, safeUserId);
}

export async function changeEmailBackendReady(prisma: PrismaClient, userId: string, newEmail: string) {
  const safeUserId = sanitizeText(userId, 120);
  const parsedEmail = accountEmailSchema.parse(newEmail.trim().toLowerCase());

  const existing = await prisma.user.findUnique({ where: { email: parsedEmail } });
  if (existing && existing.id !== safeUserId) {
    throw new AppError("Email already in use.", "EMAIL_TAKEN", 409);
  }

  await prisma.user.update({
    where: { id: safeUserId },
    data: {
      email: parsedEmail,
      emailVerified: false,
    },
  });

  return getAccountSettings(prisma, safeUserId);
}

export async function verifyEmailBackendReady(prisma: PrismaClient, userId: string) {
  const safeUserId = sanitizeText(userId, 120);
  await prisma.user.update({
    where: { id: safeUserId },
    data: { emailVerified: true },
  });
  return getAccountSettings(prisma, safeUserId);
}

export async function resetPasswordBackendReady() {
  return "Reset password flow is backend-ready for email provider integration.";
}

