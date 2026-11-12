# Library Catalog — Spec

Locked decisions from the grilling session (2026-11-11). Implementation follows `docs/PLAN.md`.

## Required features

1. **Catalog grid** — Responsive grid of book cards (cover, title, author, availability). Search by title/author, filter by genre, sort, paginate. All four live in the URL and work with SSR.
2. **Book detail** — `/books/:id` with full record and available copy count. Proper 404 for unknown ids. Sensible error state on hard failures.
3. **Checkout / return** — From the detail view. Server-enforced copy counts. No checkout when none available. No authentication; single anonymous reader.

Anything beyond these three is out of scope.

## Hard out of scope

No auth, multi-user, holds/waitlist, admin CRUD, recommendations, reviews, external book APIs, e2e browser suite, or separate REST API.

## Domain

| Field | Notes |
| --- | --- |
| `id` | string |
| `title`, `author`, `description` | strings |
| `genre` | one of the fixed eight |
| `coverUrl` | `https://picsum.photos/seed/{id}/400/600` |
| `totalCopies` | positive int |
| `availableCopies` | 0…totalCopies |
| `heldByReader` | boolean — this single reader holds the book |

**Genres:** Fiction, Nonfiction, Mystery, Sci-Fi, Fantasy, Biography, History, Romance.

**Checkout:** SQLite transaction; reject if `availableCopies === 0` or `heldByReader`; else decrement and set hold.

**Return:** reject if not held; else increment (capped at total) and clear hold.

**Reader:** may hold many books; no global loan cap. Hold state shown on detail only (Checkout vs Return). Grid shows stock only (`N of M available` / none available).

**After mutation:** stay on `/books/:id`, revalidate in place; business-rule failures as inline action errors.

## Catalog URL contract

`/?q=&genre=&sort=title|author|availability&page=`

| Param | Behavior |
| --- | --- |
| `q` | Case-insensitive substring on title **or** author |
| `genre` | Single select; empty/All = no genre filter |
| `sort` | `title` asc, `author` asc, `availability` desc (most available first) |
| `page` | 1-based, page size **12** |

Missing/invalid params → loader defaults (not 400).

## Stack

- TypeScript strict
- React Router framework mode (official template), SSR
- BFF: loaders + actions only (no separate API service)
- Tailwind only (no component library)
- SQLite + Drizzle + better-sqlite3 behind `CatalogRepository`
- Persistent DB file; seed-on-empty (~200 synthetic books); wipe DB file to reset
- npm; run: `npm install && npm run dev`
- Vitest for repository + loader/action tests (no Playwright)
- Verify: `npm run verify` → typecheck + lint + tests

## Process / AI evaluation artifacts

1. Harness: `AGENTS.md` + Cursor rule; reuse `.agents/skills`
2. Planning: this file + `docs/PLAN.md`
3. Verification loop agents can run before claiming done
4. Build order: harness/verify → domain/persistence/mutations → UI
5. Short README: choices + why, run/verify, URL contract, how AI was used

## Error UX

- Unknown id → React Router not-found (404)
- Checkout/return business failures → inline message on detail
- Unexpected loader/DB failures → error boundary with back link
