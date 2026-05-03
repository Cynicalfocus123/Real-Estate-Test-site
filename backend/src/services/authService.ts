import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signAuthToken } from "../auth/jwt";
import { AppError } from "../utils/errors";
import { sanitizeNullableText, sanitizeText } from "../utils/sanitize";

const registerSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(8).max(128),
  displayName: z.string().max(80).optional(),
  phone: z.string().max(30).optional(),
  address: z.string().max(200).optional(),
});

const loginSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(8).max(128),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z.string().min(8).max(128),
});

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function assertPasswordStrength(password: string) {
  const strong =
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password);
  if (!strong) {
    throw new AppError(
      "Password must include uppercase, lowercase, number, and symbol.",
      "WEAK_PASSWORD",
      400,
    );
  }
}

function mapUser(user: {
  id: string;
  email: string;
  displayName: string | null;
  phone: string | null;
  address: string | null;
  role: "USER" | "ADMIN";
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    phone: user.phone,
    address: user.address,
    role: user.role,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function registerUser(prisma: PrismaClient, input: unknown) {
  const payload = registerSchema.parse(input);
  assertPasswordStrength(payload.password);
  const email = normalizeEmail(payload.email);

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    throw new AppError("Email is already registered.", "EMAIL_TAKEN", 409);
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const created = await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName: sanitizeNullableText(payload.displayName, 80),
      phone: sanitizeNullableText(payload.phone, 30),
      address: sanitizeNullableText(payload.address, 200),
      notificationPrefs: {
        create: {
          savedListingsEmailFrequency: "REALTIME",
          marketingUpdates: true,
        },
      },
    },
  });

  const token = signAuthToken({ userId: created.id, role: created.role });
  return {
    token,
    user: mapUser(created),
  };
}

export async function loginUser(prisma: PrismaClient, input: unknown) {
  const payload = loginSchema.parse(input);
  const email = normalizeEmail(payload.email);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("Invalid email or password.", "INVALID_CREDENTIALS", 401);
  }

  const valid = await bcrypt.compare(payload.password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid email or password.", "INVALID_CREDENTIALS", 401);
  }

  const token = signAuthToken({ userId: user.id, role: user.role });
  return {
    token,
    user: mapUser(user),
  };
}

export async function getCurrentUser(prisma: PrismaClient, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: sanitizeText(userId, 120) } });
  if (!user) return null;
  return mapUser(user);
}

export async function verifyEmail(prisma: PrismaClient, userId: string) {
  const user = await prisma.user.update({
    where: { id: sanitizeText(userId, 120) },
    data: { emailVerified: true },
  });
  return mapUser(user);
}

export async function changeEmail(prisma: PrismaClient, userId: string, newEmailRaw: string) {
  const newEmail = normalizeEmail(newEmailRaw);
  const parsed = z.string().email().max(120).parse(newEmail);
  const exists = await prisma.user.findUnique({ where: { email: parsed } });
  if (exists && exists.id !== userId) {
    throw new AppError("Email is already in use.", "EMAIL_TAKEN", 409);
  }

  const user = await prisma.user.update({
    where: { id: sanitizeText(userId, 120) },
    data: { email: parsed, emailVerified: false },
  });
  return mapUser(user);
}

export async function changePassword(prisma: PrismaClient, userId: string, input: unknown) {
  const payload = changePasswordSchema.parse(input);
  assertPasswordStrength(payload.newPassword);

  const user = await prisma.user.findUnique({ where: { id: sanitizeText(userId, 120) } });
  if (!user) throw new AppError("User not found.", "NOT_FOUND", 404);

  const valid = await bcrypt.compare(payload.currentPassword, user.passwordHash);
  if (!valid) {
    throw new AppError("Current password is incorrect.", "INVALID_CREDENTIALS", 401);
  }

  const passwordHash = await bcrypt.hash(payload.newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
  return true;
}

export async function requestResetPassword(prisma: PrismaClient, emailRaw: string) {
  const email = normalizeEmail(emailRaw);
  const parsed = z.string().email().max(120).parse(email);
  const user = await prisma.user.findUnique({ where: { email: parsed } });

  // Placeholder token for future email provider integration.
  if (!user) return "If this email exists, a reset link will be sent.";
  return `Reset password flow is backend-ready for ${user.email}.`;
}

