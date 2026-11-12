# Agent guide — Library Catalog

## Scope

This repo implements a single-reader library catalog: grid, detail, and checkout/return. The product contract is in [docs/SPEC.md](./docs/SPEC.md); the build plan lives in [docs/PLAN.md](./docs/PLAN.md); the project’s agent workflow and past failure patterns live in [AI_WORKFLOW.md](./AI_WORKFLOW.md).

## Working rules

- Read [docs/SPEC.md](./docs/SPEC.md) before changing behavior.
- Treat [docs/PLAN.md](./docs/PLAN.md) as the build order and seam placement guide.
- For catalog-domain changes, use [GLOSSARY.md](./GLOSSARY.md) as the canonical vocabulary; update it only when domain language is clarified or added.
- Prefer TDD at the repository and loader/action seams.
- Keep scope to the three required features: catalog grid, detail view, and checkout/return.
- Do not add auth, multi-user logic, waitlists, admin CRUD, reviews, external book APIs, or a separate REST service.

## Commands

- Run locally: `npm install && npm run dev`
- Verify before claiming done: `npm run verify`
- Targeted tests: `npx vitest run app/catalog/query.test.ts` or `npx vitest run app/catalog/sqlite-repository.test.ts`

## Stack

React Router framework mode (SSR), Tailwind, SQLite + `better-sqlite3` behind `CatalogRepository`, Vitest, and npm. A Drizzle schema is declared but not used by the current persistence implementation.

## Key constraints

- The repo is intentionally narrow: the domain rules live behind `CatalogRepository`, while the route layer remains thin.
- Search, genre, sort, and page state are URL-driven and SSR-safe.
- Business rules must be enforced on the server; the UI may disable actions, but it cannot be the source of truth.
- Reset data by deleting `data/catalog.sqlite`; the app reseeds it on startup.

For the SSR request flow, BFF boundaries, persistence details, and architecture diagram, see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).
