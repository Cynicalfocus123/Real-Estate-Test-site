# Buy Home For Less Backend (Express + MySQL)

Express/MySQL backend for the real estate project. Hostinger is not connected; deployment folders and ZIPs are workspace artifacts only.

## Stack
- Node.js + Express + TypeScript
- MySQL (`mysql2`)
- JWT auth
- bcrypt password hashing
- multer + sharp image processing

## Core Coverage
- Auth: first Head Admin bootstrap/register, login, current user (`/api/auth/me`).
- Roles: `HEAD_ADMIN`, `ADMIN`, `EMPLOYEE`.
- Admin demo UI: `GET /admin-demo` with step-by-step register/login/dashboard flow.
- Dashboard overview metrics: listings by status, users, seller apps, employee accounts, recent items.
- Listings admin CRUD with required fields:
  - pricing (`priceAmount`, `currencyCode`, `buyPrice`, `rentMonthlyPrice`, `depositAmount`, `priceUnitLabel`)
  - content (`title`, `description`, `highlights`, `amenities`, `features`, `propertyDetails`)
  - feature toggles (`furnishingStatus`, `hasAirConditioner`, `hasKitchen`)
  - property attributes (`propertyType`, beds/baths, land/interior size, built year)
  - location (`streetAddress`, district/subdistrict, city/province, postal code, country, latitude/longitude, `mapSearchLabel`)
  - enums: section (`BUY`, `RENT`, `SELL`, `SENIOR_HOME`), category (`FORECLOSURE`, `PRE_FORECLOSURE`, `DISTRESS_PROPERTY`, `FIXER_UPPER`, `URGENT_SALE`, `FEATURED`, `NEW_LISTING`), status (`DRAFT`, `PUBLISHED`, `ARCHIVED`, `DELETED`)
- Per-listing FAQ manager (`/api/admin/listings/:id/faqs`).
- Listing image manager (max 12): upload, reorder, set cover, delete.
- Seller applications:
  - frontend submit: `POST /api/seller-applications`
  - admin list/update status: `GET /api/admin/seller-applications`, `PATCH /api/admin/seller-applications/:id/status`
  - statuses: `NEW`, `CONTACTED`, `IN_REVIEW`, `CLOSED`, `SPAM_REJECTED`
- Registered users + employee account management APIs.

## Setup
1. Copy `.env.example` to `.env`.
2. Create DB and import `database.sql` in phpMyAdmin.
3. Install deps: `npm install`
4. Run: `npm run dev` only for local development. Production uses the hosting-assigned `PORT` and refuses incomplete or non-canonical production URLs.

## API contract
- Production API base: `https://buyhomeforless.com/api/v1`
- Health: `GET /health`
- Readiness: `GET /ready`
- Admin demo: `GET /admin-demo`
- Register: `POST /api/v1/auth/register`
- Login: `POST /api/v1/auth/login`
- Public listings: `GET /api/v1/listings`
- Seller submit: `POST /api/v1/seller-applications`

Migrations are explicit (`npm run migrate:status`, `npm run migrate`) and never run during startup. The initial migration only creates the tracking table; the existing schema remains preserved in `database.sql`.

## Future manual deployment
- Keep frontend build in `public_html`.
- Deploy backend as separate Node.js app root outside `public_html`.
- `backend-live/` and the release ZIP are workspace deployment mirrors only. Verify through builds, tests, manifests, and extraction; no Hostinger upload or live deployment is implied.
