# Buy Home For Less Backend Foundation

Backend foundation for the current React frontend, built with:
- Node.js + TypeScript
- Fastify + GraphQL (Mercurius)
- PostgreSQL + Prisma ORM
- bcrypt password hashing
- JWT-ready auth context
- Sharp-based image optimization (WebP output)

## What This Includes
- Public property queries with filters/sort/pagination.
- Property detail, featured properties, and similar properties.
- Auth flows: register, login, current user, change password, reset-password placeholder.
- Account settings APIs (profile fields + notification preferences + email flows).
- Favorites APIs designed for Buy/Rent tab grouping.
- Admin property management APIs (create/update/archive/delete-safe).
- Admin image upload APIs with:
  - max 12 images per property
  - type whitelist (`jpg`, `jpeg`, `png`, `webp`, `avif`)
  - safe path checks
  - WebP derivatives: thumbnail, card, gallery, hero
  - metadata persisted in `PropertyImage`

## Folder Layout
```
backend/
  prisma/schema.prisma
  src/
    auth/jwt.ts
    config/env.ts
    graphql/{schema,resolvers}.ts
    lib/prisma.ts
    services/*.ts
    utils/*.ts
    index.ts
  .env.example
```

## Environment
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Required values:
- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `FRONTEND_ORIGIN`
- `UPLOAD_DIR`
- `PUBLIC_UPLOAD_BASE_URL`

## Install + Run
```bash
cd backend
npm install
npm run prisma:generate
npm run build
npm run dev
```

GraphQL endpoint:
- `http://localhost:4000/graphql`

Health check:
- `http://localhost:4000/health`

## Prisma Notes
Run migrations (first setup):
```bash
npm run prisma:migrate:dev -- --name init_backend_foundation
```

If you only want to push schema in local dev:
```bash
npm run prisma:push
```

## Frontend Integration Strategy
- Keep current frontend mock data and behavior intact.
- Existing frontend can gradually call these GraphQL operations when ready.
- Do **not** remove frontend mocks until backend API has been verified end-to-end.

## Security Notes
- CORS restricted to `FRONTEND_ORIGIN`.
- Basic security headers via `@fastify/helmet`.
- Rate limiting enabled.
- Input validation through Zod.
- Passwords are hashed (never stored plaintext).
- Auth token expected via `Authorization: Bearer <token>`.
- Admin mutations enforce `ADMIN` role.
- Public property queries return only `PUBLISHED` records.

## Image Upload Input Shape
`uploadPropertyImages(propertyId, files)` currently accepts GraphQL input objects:
- `filename`
- `mimeType`
- `base64Data`
- optional `altText`
- optional `isCover`

This is backend-safe and frontend-ready. A multipart transport can be added later without changing stored image variants.

