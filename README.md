# Library Catalog

A small SSR library catalog built with React Router, SQLite, and a repository-backed domain layer. The app includes a responsive book grid, a detail view for each title, and server-enforced checkout/return actions for a single anonymous reader.

## Run

```bash
npm install && npm run dev
```

The catalog runs in React Router framework mode. On first launch, the app creates a persistent SQLite database in `data/catalog.sqlite` and seeds it with synthetic books when empty.

## Verify

```bash
npm run verify
```

This runs type-checking, linting, and the Vitest suite.

## URL contract

- `/` — catalog grid
- `/?q=...&genre=...&sort=title|author|availability&page=...`
- `/books/:id` — book detail view

The catalog query state is reflected in the URL. Search, genre, and sort reset page to `1`. Invalid or missing query values fall back to safe defaults.

## Resetting data

Delete the SQLite file at `data/catalog.sqlite` to restore a fresh seeded catalog.

## AI and process notes

This project follows the locked decisions in `docs/SPEC.md` and `docs/PLAN.md`. The domain rules live behind `CatalogRepository`, while the React Router loaders/actions remain thin and testable. The verify loop is the quality gate before claiming a task is complete.

Agent-facing pointers:

- [AGENTS.md](./AGENTS.md): scope, commands, and working rules for AI sessions
- [AI_WORKFLOW.md](./AI_WORKFLOW.md): how the build was staged, delegated, and reviewed
- [GLOSSARY.md](./GLOSSARY.md): canonical domain vocabulary for books, copies, holds, and checkout/return
- [.cursor/rules/library-catalog.mdc](./.cursor/rules/library-catalog.mdc): repo constraints for Cursor sessions
- [.github/copilot-instructions.md](./.github/copilot-instructions.md): build/test/lint guidance for Copilot sessions

## Out of scope

- Auth or accounts
- Multi-user holds or waitlists
- Admin CRUD
- Reviews, ratings, or external APIs
- Browser E2E tests or a separate REST API
