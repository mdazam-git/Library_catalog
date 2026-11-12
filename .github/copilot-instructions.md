# Copilot Instructions for Library Catalog

## Commands

Use the repository scripts as the canonical entry points:

```bash
npm install
npm run dev
npm run build
npm run typecheck
npm run lint
npm run test
npm run verify
```

Run a single test file or test name when iterating:

```bash
npm run test -- app/catalog/query.test.ts
npm run test -- --run app/catalog/sqlite-repository.test.ts
npx vitest run app/catalog/query.test.ts
npx vitest run app/catalog/sqlite-repository.test.ts
```

The project’s verify gate is `npm run verify`, which runs typecheck, lint, and Vitest.

## Project shape

This repo is a React Router framework-mode SSR app for a small public library catalog. The high-level structure is:

- `app/routes/` holds route modules for the catalog and book detail pages.
- `app/catalog/` contains the domain and persistence seam: repository interface, SQLite adapter, query parsing, seeding, and typed domain models.
- `app/root.tsx` is the app shell and global error boundary.
- `app/app.css` owns the Tailwind styling entry point.
- `docs/SPEC.md` and `docs/PLAN.md` are the source-of-truth product and implementation decisions.
- `AGENTS.md` and `.cursor/rules/library-catalog.mdc` capture working constraints for AI agents.

The core architecture is intentionally narrow:

- React Router loaders/actions are the BFF boundary.
- The domain rules live behind `CatalogRepository` rather than being scattered in route code.
- SQLite persists catalog data in `data/catalog.sqlite`, and the database is seeded on first empty startup.
- Search, genre, sort, and page state live in the URL and are parsed by the catalog query helpers.

## Key conventions

- Treat `docs/SPEC.md` as the product contract. Do not broaden scope beyond the catalog grid, book detail, and checkout/return flows.
- Keep route loaders/actions thin; use the repository seam for list/get/checkout/return behavior.
- Use the closed genre set and the fixed URL contract described in `docs/SPEC.md`.
- Preserve SSR behavior: catalog state must be derived from URL params, not client-only fetches.
- Business rules are enforced on the server. The UI may disable actions, but the repository must still reject invalid state.
- The single-reader model is intentional: there is no auth or multi-user identity layer.
- The expected database reset is deleting `data/catalog.sqlite`; the app will repopulate it on next startup.
- This project uses Vitest for repository and route/query seams; there is no browser/e2e suite in scope.
- Prefer testing the repository contract and thin route/query helpers rather than component internals.

## Source-of-truth docs

When making product or behavior changes, read these before editing code:

- `docs/SPEC.md`
- `docs/PLAN.md`
- `AGENTS.md`

Those files define the valid scope, verification loop, and expected behavior more than any single route file does.
