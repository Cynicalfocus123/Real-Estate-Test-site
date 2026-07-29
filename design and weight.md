# Buy Home For Less Design and Weight Guide

Last reviewed: 2026-07-29. Caveman mode on full every time from now on. This is the single design and production-weight source for both frontend and backend. Repository, security, Git, and delivery workflow rules live in `AGENT.md`.

## Release contract

Use only the canonical production URLs (`https://buyhomeforless.com`, `/api/v1`, `/uploads`) in production output. Missing, placeholder, non-HTTPS, development, API-subdomain, and private-machine URLs must fail validation. The Express app is importable without listening; startup performs dependency checks and never changes schemas. Health and readiness responses are safe, migrations are explicit and repeatable, and no production migration is run by Codex. Verification uses in-process tests, typechecks, builds, audits, mirror parity, and paired root-level Deflate ZIP extraction; no local server or browser is launched.

## Product and frontend design

Preserve the established Buy Home For Less identity: the supplied logo in both header and footer, a polished Thailand property-search experience, clear sale/rent/senior-home information, and responsive layouts with no page-level horizontal overflow. Keep the existing header navigation, property cards, search/filter behavior, location browsing, property details, FAQs, visa and senior-living pages, account settings, favorites, and comparison workflows unless a request changes them.

The public site must work across desktop, tablet, iOS Safari, and Android Chrome. Use stable image frames, responsive type and spacing, touch-safe controls, visible keyboard focus, sensible loading behavior, and clear loading, empty, unavailable, and error states. Do not substitute mock data for an unavailable authoritative response without clearly scoped existing demo behavior. Preserve EN, RU, ZH, TH, AR, and FA language choices. Keep map work ready for Leaflet/OpenStreetMap or the existing approved map integration.

Property and user-facing copy must be readable, direct, and safe. Do not reveal technical implementation, infrastructure, endpoint, database, provider, token, or raw-error information. External links and embeds use validated URLs; user/API text renders as text, never as injected HTML. New images need meaningful alt text and must use the existing safe asset-path patterns.

## Backend and administration design

The Express/MySQL backend remains the authority for authentication, staff roles, listings, listing FAQs and images, seller applications, users, and dashboard data. Maintain the existing role model (`HEAD_ADMIN`, `ADMIN`, and `EMPLOYEE`), validation, authentication, rate limiting, security headers, error normalization, and safe upload handling. Do not add a competing API, database schema, auth system, or media pipeline where an established path exists.

Administration should remain task-focused and responsive: searchable/paginated list workspaces, explicit create/edit flows, clear confirmation/error feedback, and no raw server data or diagnostics in the UI. Listing inputs must preserve the established pricing, property details, location, media, SEO, section/category/status, and FAQ contracts. Validate all request data server-side, normalize safe plain text, restrict uploads by type and size, and return short safe errors.

The property editor is one continuous workflow. Images and cover selection are optional at all statuses; queued images may be selected before create and uploaded during the same action. A failed optional upload must not roll back a saved property. Sale lists use sale price, rental lists use monthly rent, and properties without a price say “Price on request.” Published and archived records remain editable; deleting requires confirmation but never a prerequisite status change.

## Production weight rules

- Build only from current authoritative source; never package old ZIPs, extracted folders, stale `dist/`, or stale deployment mirrors.
- Build for the Hostinger-ready workspace contract. Hostinger is not connected. The live site origin is `https://buyhomeforless.com`; the frontend API base, allowed origin, public upload URL, and Vite public base path must be production environment values, not local or root-relative assumptions.
- The current GitHub Pages path `/Real-Estate-Test-site/` is not a Hostinger production base. Replace it with environment-driven Vite `base` handling before the next frontend deployment, and use `import.meta.env.BASE_URL` for application and asset links.
- Browser API calls must resolve to a full HTTPS live URL on the sole canonical origin `https://buyhomeforless.com`, not `localhost`, a development port, a separate API hostname or subdomain, or a literal `/api` fallback. Private server filesystem paths must never be used as public URLs.
- Verify source through builds, tests, filesystem checks, manifests, and archive extraction. Never claim a real deployment, live-domain smoke test, or Hostinger verification.
- `frontend-live/` must be byte-for-byte equivalent to the current `frontend/dist/` after each release.
- `backend-live/` must be rebuilt from the active `backend/` and include a complete verified `SHA256SUMS` manifest. The inactive duplicate backend is never a release input.
- Keep the frontend archive free of backend source, environment files, source maps unless explicitly needed, duplicate raster assets, unused videos, local logs, and development dependencies.
- Keep the backend archive free of `.env`, `node_modules`, local databases, runtime uploads, caches, logs, test artifacts, and secrets; install runtime dependencies in the private host application root.
- The release directory contains only `BuyHomeForLess_Frontend_Live.zip` and `BuyHomeForLess_Backend_Live.zip`. Rebuild and verify the pair together for every completed change.
- Use standard Deflate ZIP32 archives with root-level deployment entries and portable `/` paths. Verify listings, CRC, Windows extraction parity, PHP extraction parity, SHA-256 parity, no duplicate/unsafe paths, and no forbidden files before handoff.

## Verification record

Exact counts, sizes, timestamps, and SHA-256 hashes are release-specific. Record them only after a successful matched build, mirror, Git, and paired-ZIP verification; do not treat old archive names or timestamps as proof of current code. No external hosting upload, migration, cache rebuild, or live smoke test is asserted unless directly verified.
