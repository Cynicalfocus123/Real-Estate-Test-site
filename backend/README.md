# Buy Home For Less Backend (Express + MySQL)

Express/MySQL backend for the real estate project. Hostinger is not connected; deployment folders and ZIPs are workspace artifacts only.

## Stack
- Node.js + Express + TypeScript
- MySQL (`mysql2`)
- JWT auth
- bcrypt password hashing
- multer + sharp image processing

## Core Coverage
- Current staff auth: one-time first Head Admin bootstrap, authorized staff registration, login, and current user (`/api/v1/auth/me`).
- Task 5 boundary: real public customer authentication will be separate from staff roles; public signup can never create `HEAD_ADMIN`, `ADMIN`, or `EMPLOYEE` accounts.
- Roles: `HEAD_ADMIN`, `ADMIN`, `EMPLOYEE`.
- Dashboard overview metrics: listings by status, users, seller apps, employee accounts, recent items.
- Property administration (`/api/v1/admin/properties`) with one typed camelCase contract:
  - pricing (`priceAmount`, `currencyCode`, `buyPrice`, `rentMonthlyPrice`, `depositAmount`, `priceUnitLabel`)
  - content (`title`, `description`, `highlights`, `amenities`, `features`, `propertyDetails`)
  - feature toggles (`furnishingStatus`, `hasAirConditioner`, `hasKitchen`)
  - property attributes (`propertyType`, beds/baths, land/interior size, built year)
  - location (`streetAddress`, district/subdistrict, city/province, postal code, country, latitude/longitude, `mapSearchLabel`)
  - enums: section (`BUY`, `RENT`, `SELL`, `SENIOR_HOME`), category (`FORECLOSURE`, `PRE_FORECLOSURE`, `DISTRESS_PROPERTY`, `FIXER_UPPER`, `URGENT_SALE`, `FEATURED`, `NEW_LISTING`), status (`DRAFT`, `PUBLISHED`, `ARCHIVED`, `DELETED`)
- Per-property FAQ and nearby-location management is part of the property save transaction.
- Property image manager (max 12): queued upload on create, upload later, reorder, optional cover, metadata, and delete. A cover image is never required.
- Agent management (`/api/v1/admin/agents`) and optional active-agent assignment.
- Seller applications:
  - frontend submit: `POST /api/v1/seller-applications`
  - admin list/update status: `GET /api/v1/admin/seller-applications`, `PATCH /api/v1/admin/seller-applications/:id/status`
  - statuses: `NEW`, `CONTACTED`, `IN_REVIEW`, `CLOSED`, `SPAM_REJECTED`
- Registered users + employee account management APIs.

## Future manual host setup
1. Keep secrets in the private hosting environment; use `.env.production.example` only as a safe key template.
2. Create the database, import `database.sql`, and apply pending explicit migrations through the migration command after review.
3. Install the locked runtime dependencies in the private Node application root.
4. Use the packaged `dist/server.js` as the hosting startup file and the hosting-assigned `PORT`.

Codex verification does not start a local service or apply a production migration.

## API contract
- Production API base: `https://buyhomeforless.com/api/v1`
- Health: `GET /health`
- Readiness: `GET /ready`
- Head Admin bootstrap status: `GET /api/v1/auth/bootstrap-status`
- Register: `POST /api/v1/auth/register`
- Login: `POST /api/v1/auth/login`
- Current user: `GET /api/v1/auth/me`
- Public properties: `GET /api/v1/properties` and `GET /api/v1/properties/:slug`
- Public geocoding: `GET /api/v1/map/geocode`
- Seller submit: `POST /api/v1/seller-applications`

Migrations are explicit (`npm run migrate:status`, `npm run migrate`) and never run during startup. `001_schema_migrations.sql` creates the tracking table and `002_property_authoring.sql` adds the current property-authoring schema. The baseline schema remains in `database.sql`.

Properties may be saved and published without images, price, SEO, an agent, or complete location/senior details. The frontend shows the approved placeholder for absent images and “Price on request” for absent price values. Database relation writes are transactional; optional image processing is intentionally outside that transaction so a saved property is never discarded after an image failure.

Public property responses are frontend-ready camelCase DTOs and include only `PUBLISHED` records. The list route supports bounded pagination, ID lookup, filters, and sorting; detail responses include active public relations and related summaries. No automatic property import or seed exists: importing old frontend data requires separate explicit approval. The canonical geocoding route is `GET /api/v1/map/geocode`.

The production public frontend uses this REST API and has no static-property fallback. An empty authoritative database is a valid public empty state. The legacy frontend property-data file is not a production runtime source.

## Future manual deployment
- Keep frontend build in `public_html`.
- Deploy backend as separate Node.js app root outside `public_html`.
- `backend-live/` and the release ZIP are workspace deployment mirrors only. Verify through builds, tests, manifests, and extraction; no Hostinger upload or live deployment is implied.
