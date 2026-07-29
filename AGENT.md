# Buy Home For Less Agent Guide

Last reviewed: 2026-07-29. Caveman mode on full every time from now on. This is the concise repository, security, Git, and delivery guide. Frontend and backend design plus production-weight rules live together in `design and weight.md`.

## Step 1 operating rules

- Inspect before editing, reuse existing systems, make safe assumptions, verify, and report blockers honestly.
- Keep output targeted and bounded; use `rg` and explicit reads. Context7 is only for a genuinely required current library question.
- Do not start local servers, Vite dev/preview, browser automation, or production smoke tests during verification.
- Hostinger is not connected. Workspace mirrors and ZIPs are Hostinger-ready artifacts only; never claim an upload or live deployment.
- The sole approved public origin is `https://buyhomeforless.com`; API is `https://buyhomeforless.com/api/v1`; media is `https://buyhomeforless.com/uploads`. API hosts/subdomains and GitHub Pages paths are forbidden.
- `Foodonline desktop version` is read-only and must never enter this repository, mirrors, ZIPs, or commits.
- Keep source (`frontend/`, `backend/`), mirrors (`frontend-live/`, `backend-live/`), canonical ZIPs, Git, and manifests synchronized.

## Canonical repository state

- `frontend/` is the React, TypeScript, Vite, and Tailwind public site.
- `backend/` is the active Express, TypeScript, and MySQL API. The duplicate `Backend buyhomeforless/backend/` is inactive user work; never edit, synchronize, stage, or delete it unless the user explicitly asks.
- `frontend-live/` and `backend-live/` are generated deployment mirrors, not source and not evidence of an external upload.
- `release/` contains only the two current deployment archives: `BuyHomeForLess_Frontend_Live.zip` and `BuyHomeForLess_Backend_Live.zip`.
- Keep exactly these two root guidance files: this `AGENT.md` and `design and weight.md`. Do not create separate root `design.md`, `weight.md`, historical logs, backups, or duplicate rule files. Git history is the record of superseded decisions.

## Security and application boundaries

Preserve existing public property, search, account, favorites, comparison, visa, senior-home, and administration workflows unless a task changes them. Keep the frontend API-ready and use the established GraphQL/REST contracts; do not create duplicate backend, storage, or deployment systems.

All changes require a focused security pass appropriate to the edited area. At minimum check for unsafe HTML injection, `javascript:` URLs, unsafe `href`/`src`/image URLs, unsanitized input or URL parameters, missing `rel="noopener noreferrer"` on external new-tab links, validation gaps, exposed secrets, insecure headers, and vulnerable dependencies. Render untrusted content as text, validate API and asset URLs, and keep third-party embeds tightly controlled. Never expose API URLs, tokens, credentials, database details, raw responses, stack traces, server paths, or technical diagnostics in the public or admin interface.

## Hostinger-ready workspace gate

Hostinger is not connected. The canonical and only permitted public origin is `https://buyhomeforless.com`. The frontend, API, and public media must remain on this same origin. A separate API hostname or API subdomain is forbidden. `frontend-live/` and `backend-live/` are workspace deployment mirrors; ZIPs are future manual-upload packages.

- Production client requests must use the configured full HTTPS live base such as `https://buyhomeforless.com/api/v1`, never `localhost`, `127.0.0.1`, a development port, an unresolved placeholder, or a raw root-relative API value such as `/api`.
- Track only safe production examples for the frontend public origin, API base URL, allowed frontend origin, and public upload base URL. Do not commit secrets or private filesystem paths. Vite-exposed variables are public configuration and must never contain credentials.
- Do not hardcode `/`, `/Real-Estate-Test-site/`, `public_html`, a Windows path, or another assumed deployment location in application links. Configure Vite `base` from the verified Hostinger public base path and construct internal application/asset URLs from `import.meta.env.BASE_URL`. A root deployment may resolve to `/`, but source code must not assume it.
- Server filesystem paths and public URLs are different contracts. Resolve private runtime/upload directories from the deployed application root; generate browser-visible upload URLs only from the configured live HTTPS origin.
- A future manual deployment must configure SPA deep links and API forwarding. Codex verifies builds, tests, filesystem output, manifests, and archive extraction only; it cannot verify Hostinger.
- Production builds must fail validation if generated frontend files contain `localhost`, `127.0.0.1`, `/Real-Estate-Test-site/`, source-machine paths, or an unapproved API hostname. Do not begin the frontend/backend cutover until this live URL and path gate passes.

## Required matched release workflow

Every completed source, configuration, content, documentation, security, frontend, or backend change must leave one matched source, mirror, Git, and ZIP state:

1. Finish the authoritative source and these two guidance files. Do not touch unrelated dirty work.
2. Run the relevant checks. Frontend changes require `npm run build` in `frontend/`; backend changes require `npm run typecheck` and `npm run build` in `backend/`. Run the focused security pass and relevant dependency audit before release.
3. Rebuild `frontend/dist/`, then replace (never merge) `frontend-live/` with its exact contents. Verify path, size, and SHA-256 parity; exclude source maps unless deliberately required.
4. Rebuild `backend/dist/`, then replace (never merge) `backend-live/` from the active `backend/` deployment input. Include the production package metadata and built runtime; exclude `.env`, `node_modules`, logs, runtime uploads, local caches, test-only files, and secrets. Generate and verify `backend-live/SHA256SUMS`.
5. Verify the Hostinger production configuration contract and scan the generated output for forbidden development URLs and paths. Commit the authoritative source, both mirrors, the manifest, and documentation, then push. Confirm local `HEAD` equals the tracked remote branch before archiving.
6. Regenerate both Live ZIPs together from the verified mirrors. ZIP entries must use portable `/` paths and place the deployable files at archive root, never inside an extra project folder. Verify archive listings and CRCs, reject duplicate/unsafe/backslash paths and forbidden content, and extract with both Windows and PHP tooling to prove full SHA-256 parity. Remove stale ZIPs and temporary release/extraction folders so only the two canonical archives remain.

The mirrors and ZIPs are manual deployment artifacts only. Never claim that hosting, DNS, database migrations, environment changes, cache clearing, or production smoke tests occurred without direct evidence. A manual upload must preserve the live backend `.env`, installed dependencies, database, uploads/media, writable directories, logs, and runtime configuration.

## Git and working rules

At the start of a session, confirm the repository and remote are usable; inspect the working tree and preserve any pre-existing user changes. After verified in-scope work, update the relevant canonical guide, commit, and push without asking unless the user explicitly says not to push or a real blocker prevents it. Before every push, complete the applicable verification and security pass. Confirm the pushed commit matches the remote branch.

Keep tool output bounded: use `rg` for searches when available and targeted PowerShell output otherwise. Do not append historical task logs to these guides; replace obsolete text with current, verified rules and measurements. Record only facts verified during the current release.

## Current verified baseline

- Git remote: `origin` points to `https://github.com/Cynicalfocus123/Real-Estate-Test-site.git`.
- The active release structure and scripts described above are the required delivery contract; no external deployment is asserted by this document.
- A pre-existing modification remains in the inactive duplicate backend at `Backend buyhomeforless/backend/src/routes/adminDemoRoutes.ts`; it is excluded from this documentation update.
