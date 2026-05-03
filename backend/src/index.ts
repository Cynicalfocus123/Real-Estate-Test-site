import fs from "node:fs/promises";
import path from "node:path";
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import mercurius from "mercurius";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { extractBearerToken, verifyAuthToken } from "./auth/jwt";
import { AppError } from "./utils/errors";
import type { GraphQLContext } from "./types/context";

async function buildServer() {
  await fs.mkdir(env.UPLOAD_DIR, { recursive: true });

  const app = Fastify({ logger: true });

  await app.register(helmet, {
    global: true,
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });

  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      cb(null, origin === env.FRONTEND_ORIGIN);
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
  });

  await app.register(rateLimit, {
    max: 25,
    timeWindow: "1 minute",
    keyGenerator: (request) => request.ip,
    cache: 5000,
  });

  await app.register(fastifyStatic, {
    root: env.UPLOAD_DIR,
    prefix: "/uploads/",
    decorateReply: false,
  });

  app.get("/health", async () => ({ ok: true }));

  await app.register(mercurius as any, {
    schema: typeDefs,
    resolvers: resolvers as any,
    graphiql: true,
    context: async (request: any, reply: any): Promise<GraphQLContext> => {
      const token = extractBearerToken(request.headers.authorization);
      const verified = token ? verifyAuthToken(token) : null;

      return {
        request,
        reply,
        prisma,
        authUser: verified ? { id: verified.userId, role: verified.role } : null,
      };
    },
    errorFormatter: (execution: any, context: any) => {
      const original = execution.errors?.[0]?.originalError;
      if (original instanceof AppError) {
        context.reply.status(original.statusCode);
        return {
          statusCode: original.statusCode,
          response: {
            data: null,
            errors: [{ message: original.message, extensions: { code: original.code } }],
          },
        };
      }

      context.reply.status(500);
      return {
        statusCode: 500,
        response: {
          data: null,
          errors: execution.errors.map((error: any) => ({ message: error.message })),
        },
      };
    },
  } as any);

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return app;
}

async function start() {
  const app = await buildServer();
  const host = "0.0.0.0";
  await app.listen({ port: env.PORT, host });
  app.log.info(`Backend running on http://localhost:${env.PORT}/graphql`);
  app.log.info(`Serving uploads from ${path.resolve(env.UPLOAD_DIR)}`);
}

void start();
