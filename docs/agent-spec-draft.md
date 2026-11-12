# Library Catalog — Agent Spec

## Problem Statement

A public library needs a small, usable online catalog so a visitor can browse the collection, open a book’s full record, and check a copy out or return it—without accounts, waitlists, or admin tooling. Search, genre filter, sort, and pagination must be bookmarkable and work with server-rendered pages. Copy counts and hold rules must be enforced on the server so the UI cannot oversell stock.

## Solution

Build a TypeScript React Router (framework mode) SSR app that acts as a BFF: loaders and actions talk to a `CatalogRepository` backed by SQLite (Drizzle + better-sqlite3). Seed ~200 synthetic books on first empty DB. The home route is a responsive catalog grid driven by URL params `q`, `genre`, `sort`, and `page`. The detail route `/books/:id` shows the full Book record, maps unknown ids to 404, and supports checkout/return for a single anonymous reader (multi-hold allowed; no loan cap). Grid shows stock only (`N of M available` / none available); hold state appears on detail as Checkout vs Return. Tailwind only. Verify with `npm run verify` (typecheck + lint + Vitest).

## User Stories

1. As a library visitor, I want to see a grid of books on the home page, so that I can browse the collection at a glance.
2. As a library visitor, I want each card to show cover, title, author, and availability, so that I can decide which books are worth opening.
3. As a library visitor, I want availability shown as “N of M available” or a clear none-available state, so that I know stock without learning hold rules on the grid.
4. As a library visitor, I want the grid to be responsive, so that browsing works on phone and desktop.
5. As a library visitor, I want to search by title or author substring, so that I can find a known book quickly.
6. As a library visitor, I want search to be case-insensitive, so that capitalization does not hide matches.
7. As a library visitor, I want to filter by a single genre, so that I can narrow the shelf to a category I like.
8. As a library visitor, I want an All/empty genre option, so that I can clear the genre filter.
9. As a library visitor, I want to sort by title ascending, so that I can scan alphabetically by title.
10. As a library visitor, I want to sort by author ascending, so that I can scan alphabetically by author.
11. As a library visitor, I want to sort by availability descending, so that the most available books appear first.
12. As a library visitor, I want results paginated (12 per page), so that large result sets stay manageable.
13. As a library visitor, I want page controls that update the URL, so that I can share or bookmark a specific page.
14. As a library visitor, I want search, genre, sort, and page all reflected in the URL, so that reloading or sharing restores the same view.
15. As a library visitor, I want changing search, genre, or sort to reset to page 1, so that I am not stranded on an empty later page.
16. As a library visitor, I want missing or invalid URL params to fall back to sensible defaults (not HTTP 400), so that bad links still work.
17. As a library visitor, I want the catalog page to be server-rendered with the current query, so that the first paint matches the URL without waiting on client-only fetches.
18. As a library visitor, I want an empty-state message when no books match, so that I know the filters are active rather than the app being broken.
19. As a library visitor, I want each card to link to `/books/:id`, so that I can open the full record.
20. As a library visitor, I want a book detail page with title, author, genre, description, cover, and available copy count, so that I can evaluate the book before borrowing.
21. As a library visitor, I want unknown book ids to show a proper 404, so that I am not shown a blank or misleading page.
22. As a library visitor, I want a way back to the catalog from error/not-found UI, so that I can recover quickly.
23. As a library visitor, I want unexpected loader/DB failures to show an error boundary with a back link, so that hard failures are recoverable.
24. As a library visitor, I want to check out a book from the detail page when copies are available and I do not already hold it, so that I can borrow without creating an account.
25. As a library visitor, I want checkout to fail clearly when no copies are available, so that I understand why borrow did not work.
26. As a library visitor, I want checkout to fail clearly when I already hold that book, so that I do not double-borrow the same title.
27. As a library visitor, I want to return a book I hold from the detail page, so that I can free the copy.
28. As a library visitor, I want return to fail clearly when I do not hold the book, so that mistaken returns are explained.
29. As a library visitor, I want to stay on `/books/:id` after checkout or return with the page revalidated, so that availability and button state update in place.
30. As a library visitor, I want business-rule failures shown as inline action errors on detail (not a dead-end page), so that I can correct course without leaving the book.
31. As a library visitor, I want the detail page to show Checkout when I do not hold the book and Return when I do, so that the next action is obvious.
32. As a library visitor, I want checkout visually disabled when no copies are available and I do not hold the book, while the server still enforces the rule, so that the UI guides me without trusting the client alone.
33. As a library visitor, I want to hold many books at once with no global loan cap, so that my reading list is not artificially limited for this demo.
34. As a library visitor, I want hold state to persist across refresh, so that checkout/return is real durable state, not session UI theater.
35. As a library operator (developer), I want ~200 synthetic books seeded when the database is empty, so that the catalog is usable immediately after install.
36. As a library operator (developer), I want covers from `https://picsum.photos/seed/{id}/400/600`, so that cards have consistent placeholder art without external book APIs.
37. As a library operator (developer), I want a persistent SQLite file I can delete to reset, so that I can restore a clean seeded catalog.
38. As a library operator (developer), I want `npm install && npm run dev` as the documented run path, so that reviewers can start the app quickly.
39. As a library operator (developer), I want `npm run verify` (typecheck + lint + tests) before claiming done, so that agents and humans share one quality gate.
40. As a library operator (developer), I want domain operations behind `CatalogRepository`, so that list/get/checkout/return rules live in one testable place.
41. As a coding agent, I want Vitest coverage at repository and thin route/query seams (no Playwright), so that stock invariants and URL/404/error-string behavior are verified without a browser suite.
42. As a coding agent, I want fixed genres (Fiction, Nonfiction, Mystery, Sci-Fi, Fantasy, Biography, History, Romance), so that filter options and validation stay closed and predictable.
43. As a coding agent, I want TypeScript strict mode and Tailwind-only styling, so that the stack stays small and reviewable for a take-home.
44. As a coding agent, I want no separate REST API—only React Router loaders and actions—so that the BFF boundary stays clear.
45. As a reviewer, I want a short README covering choices, run/verify, URL contract, reset, AI process, and out-of-scope, so that evaluation does not require reverse-engineering the repo.

## Implementation Decisions

- **Product surface:** Exactly three features—catalog grid, book detail with 404, checkout/return from detail. Nothing beyond that.
- **Reader model:** Single anonymous reader. Multi-hold allowed. No global loan cap. Per-book `heldByReader` flag. Hold UI on detail only; grid shows stock only.
- **Book fields:** `id`, `title`, `author`, `description`, `genre`, `coverUrl`, `totalCopies` (positive int), `availableCopies` (0…totalCopies), `heldByReader` (boolean).
- **Genres (closed set):** Fiction, Nonfiction, Mystery, Sci-Fi, Fantasy, Biography, History, Romance.
- **Cover URLs:** `https://picsum.photos/seed/{id}/400/600`.
- **Catalog URL contract:** `/?q=&genre=&sort=title|author|availability&page=`. `q` = case-insensitive substring on title **or** author; `genre` single select, empty/All = no filter; `sort` title asc, author asc, availability desc; `page` 1-based, page size **12**. Missing/invalid params → loader defaults (not 400). Changing search/filter/sort resets to page 1.
- **Checkout rules (server, transactional):** Reject if book missing (`NOT_FOUND`), `availableCopies === 0` (`NONE_AVAILABLE`), or `heldByReader` (`ALREADY_HELD`); else decrement available and set hold.
- **Return rules (server, transactional):** Reject if missing (`NOT_FOUND`) or not held (`NOT_HELD`); else increment available (capped at total) and clear hold.
- **After mutation:** Remain on `/books/:id`, revalidate in place; map business failures to inline action error strings:
  - `NONE_AVAILABLE` → “No copies available.”
  - `ALREADY_HELD` → “You already have this book checked out.”
  - `NOT_HELD` → “You do not have this book checked out.”
  - `NOT_FOUND` → not-found path (or equivalent race handling).
- **Error UX:** Unknown id → React Router not-found (404). Unexpected loader/DB failures → error boundary with back link to `/`.
- **Stack:** TypeScript strict; React Router framework mode SSR; BFF via loaders/actions only; Tailwind only (no component library); SQLite + Drizzle + better-sqlite3 behind `CatalogRepository`; persistent DB with seed-on-empty (~200 synthetic books); npm; Vitest; `npm run verify` = typecheck + lint + tests.
- **Domain seam:** `CatalogRepository` with `list`, `getById`, `checkout`, `returnBook`. List returns books plus paging totals; mutations return a success/failure result with typed error codes (decision-critical shape below, from the grilled plan—not a live prototype).
- **Query parsing:** `parseCatalogSearchParams` normalizes URL/search input into list params (trim `q`; invalid sort → `title`; invalid genre → null; bad page → 1; always pageSize 12).
- **Route helpers:** Thin injectable helpers `loadCatalog`, `loadBook`, `performBookAction` so loaders/actions stay thin and testable without a browser.
- **Pagination totalPages rule:** When total > 0, `Math.max(1, Math.ceil(total / pageSize))`; when total is 0, `totalPages` is `0`.
- **Process artifacts:** `AGENTS.md` + Cursor rule; `docs/SPEC.md` / `docs/PLAN.md` as product/plan sources; README documents choices, run/verify, URL contract, reset, AI usage, out-of-scope.
- **Build order preference:** harness/verify → domain/persistence/mutations → UI → README polish.

Decision-critical repository/result shapes (from locked plan):

```ts
type Book = {
  id: string;
  title: string;
  author: string;
  genre: Genre;
  description: string;
  coverUrl: string;
  totalCopies: number;
  availableCopies: number;
  heldByReader: boolean;
};

type CatalogListParams = {
  q: string;
  genre: Genre | null;
  sort: "title" | "author" | "availability";
  page: number;
  pageSize: number;
};

type MutationResult<E extends string> =
  | { ok: true; book: Book }
  | { ok: false; code: E };

interface CatalogRepository {
  list(params: CatalogListParams): Promise<CatalogListResult>;
  getById(id: string): Promise<Book | null>;
  checkout(id: string): Promise<MutationResult<"NOT_FOUND" | "NONE_AVAILABLE" | "ALREADY_HELD">>;
  returnBook(id: string): Promise<MutationResult<"NOT_FOUND" | "NOT_HELD">>;
}
```

## Testing Decisions

**What makes a good test:** Assert observable external behavior at the chosen seams—inputs/outputs, invariants, and user-facing error strings—not private helpers, SQL shape, or React component internals. Prefer the highest seam that still makes the assertion stable. No Playwright/e2e. No UI component unit tests.

**Confirmed seams** (user confirmed):

1. **Primary (preferred — highest):** `CatalogRepository` (`list` / `getById` / `checkout` / `returnBook`) — covers search/filter/sort/page behavior, stock invariants, and hold rules (including transactional checkout/return outcomes and error codes).
2. **Secondary (thin):** `parseCatalogSearchParams` — URL defaulting and coercion for `q` / `genre` / `sort` / `page` / `pageSize`.
3. **Secondary (thin):** route helpers `loadCatalog` / `loadBook` / `performBookAction` — 404 mapping for missing books and user-facing action error string mapping for business-rule failures.

**Modules under test:** Catalog repository (SQLite adapter against temp DBs), catalog search-param parser, and the thin route helpers above. Seed/bootstrap may be covered where needed to support repository fixtures. Do not add browser e2e or component-level UI tests for this take-home.

**Prior art:** Greenfield. Prior art is the plan’s named seams and fixtures (temp SQLite + repository; parser unit cases; injectable route helpers). Mirror those patterns rather than inventing new test layers.

**Verify gate:** `npm run verify` must pass (typecheck + lint + Vitest) before claiming completion.

## Out of Scope

- Authentication / accounts
- Multi-user readers or per-user identity
- Waitlists / hold queues beyond the single-reader `heldByReader` flag
- Admin CRUD for books
- Recommendations
- Reviews / ratings
- External book APIs (Open Library, Google Books, etc.)
- Playwright or any browser e2e suite
- Separate REST API service (loaders/actions only)
- UI component unit tests
- Expanding beyond the three required features

## Further Notes

- Spec sources synthesized: `docs/SPEC.md`, `docs/PLAN.md`, and locked grilling decisions (2026-11-11). No domain `GLOSSARY.md` or ADRs were present; vocabulary follows the existing Spec (`Book`, `CatalogRepository`, checkout, return, `heldByReader`, etc.).
- Issue tracker publish is a separate step: this draft lives at `docs/agent-spec-draft.md` until `/setup-matt-pocock-skills` configures the tracker and an agent publishes with the `ready-for-agent` label.
- Implementation should follow `docs/PLAN.md` task order once agents pick up the published issue.
- Reset data by deleting the persistent SQLite file under `data/` (seed-on-empty will repopulate).
