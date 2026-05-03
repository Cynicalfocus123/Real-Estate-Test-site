# Buy Home For Less Backend (Express + MySQL)

Simple cPanel/TMDHosting-friendly backend for the real estate project.

## Stack
- Node.js + Express + TypeScript
- MySQL (`mysql2`)
- JWT auth
- bcrypt password hashing
- multer + sharp image processing

## Required Features Implemented
- Login/register flow.
- Head Admin / Admin / Employee role system.
- Head Admin can update own email/password.
- Head Admin can create and manage employee/admin accounts.
- Protected admin routes.
- Listing create/edit/delete (soft delete to `DELETED`).
- Listing status: `DRAFT`, `PUBLISHED`, `ARCHIVED`, `DELETED`.
- Listing section: `BUY`, `RENT`, `SENIOR_HOME`, `SELL`.
- Listing categories: `NORMAL`, `FORECLOSURE`, `URGENT_SALE`, `FEATURED`, `NEW_LISTING`, `DISTRESS`, `PRE_FORECLOSURE`, `FIXER_UPPER`.
- Admin listing table includes section/category/status.
- Up to 12 images per listing with generated variants:
  - card
  - banner
  - detail
  - mobile
  - gallery
- CORS-ready for frontend localhost.

## Setup
1. Copy `.env.example` to `.env`.
2. Create DB and import `database.sql` in phpMyAdmin.
3. Install deps:
   - `npm install`
4. Run:
   - `npm run dev`

## Local URLs
- Backend base: `http://localhost:4000`
- Health: `GET /health`
- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Protected admin test: `GET /api/admin/test`

## cPanel / TMDHosting Notes
- Keep frontend build in `public_html`.
- Deploy backend as separate Node.js app root outside `public_html`.
- Set Node app startup file to built output (`dist/server.js`) after running `npm run build`.
