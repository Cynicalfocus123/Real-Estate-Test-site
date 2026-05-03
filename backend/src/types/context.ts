import type { FastifyReply, FastifyRequest } from "fastify";
import type { UserRole } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

export type AuthContextUser = {
  id: string;
  role: UserRole;
};

export type GraphQLContext = {
  request: FastifyRequest;
  reply: FastifyReply;
  prisma: PrismaClient;
  authUser: AuthContextUser | null;
};

