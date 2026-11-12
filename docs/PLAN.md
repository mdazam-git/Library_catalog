# Library Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a small SSR library catalog (grid + detail + checkout/return) in React Router framework mode, with SQLite behind a repository interface, URL-driven catalog state, and an agent-friendly verify loop.

**Architecture:** React Router loaders/actions are the BFF. Domain operations go through `CatalogRepository`. Drizzle + better-sqlite3 is the only adapter in-repo; seed-on-empty loads ~200 synthetic books into a persistent SQLite file. Catalog search params are parsed once and consumed by the repository list method.

**Tech Stack:** TypeScript (strict), React Router (framework mode / Vite / SSR), Tailwind CSS, Drizzle ORM, better-sqlite3, Vitest, ESLint, npm.

## Global Constraints

- Spec source of truth: `docs/SPEC.md` (all product rules there are in force for every task).
- TypeScript strict mode; no `any` escapes without a one-line justification in code review.
- No separate API service — data loading/mutations only via RR loaders/actions.
- Tailwind only — no shadcn/MUI/Chakra.
- No auth, multi-user, waitlist, admin CRUD, reviews, external book APIs, or e2e/Playwright.
- Page size fixed at 12; genres fixed to the eight in the spec.
- One documented run command: `npm install && npm run dev`.
- Agent verify command: `npm run verify` (typecheck + lint + tests).
- Frequent commits; commit after each task’s green verify slice.
- Prefer TDD at the seams listed per task; do not test private helpers.

## File Structure

| Path | Responsibility |
| --- | --- |
| `AGENTS.md` | Agent entrypoint: stack, commands, out-of-scope, verify loop |
| `.cursor/rules/library-catalog.mdc` | Always-on pointer to `AGENTS.md` + spec/plan |
| `.cursor/rules/catalog-domain.mdc` | Catalog-file rule pointing to canonical domain language and behavior |
| `README.md` | Human runbook: choices, run/verify, URL contract, AI process |
| `docs/SPEC.md` | Locked product/tech decisions |
| `docs/PLAN.md` | This plan |
| `package.json` | Scripts: `dev`, `build`, `typecheck`, `lint`, `test`, `verify` |
| `vitest.config.ts` | Vitest + path aliases matching the app |
| `drizzle.config.ts` | Drizzle kit config (sqlite) |
| `app/catalog/genres.ts` | Fixed genre const + type |
| `app/catalog/types.ts` | `Book`, list query/result types, action error types |
| `app/catalog/repository.ts` | `CatalogRepository` interface only |
| `app/catalog/schema.ts` | Drizzle `books` table |
| `app/catalog/db.ts` | Open SQLite + drizzle client; ensure schema |
| `app/catalog/sqlite-repository.ts` | SQLite adapter implementing the interface |
| `app/catalog/seed.ts` | ~200 synthetic books; seed-on-empty |
| `app/catalog/query.ts` | Parse/normalize URL search params → `CatalogListParams` |
| `app/catalog/get-repository.ts` | Process singleton wiring db → repository + seed |
| `app/routes.ts` | Route table |
| `app/routes/home.tsx` | Catalog grid route (`/`) — loader + UI |
| `app/routes/books.$id.tsx` | Detail + checkout/return action |
| `app/root.tsx` | Shell, error boundary wiring |
| `app/app.css` | Tailwind entry |
| `app/catalog/*.test.ts` | Repository + query unit/integration tests |
| `app/routes/*.test.ts` | Loader/action tests |
| `data/catalog.sqlite` | Persistent DB file (gitignored) |

---

### Task 1: Scaffold, harness, and verify loop

**Files:**
- Create: `AGENTS.md`, `.cursor/rules/library-catalog.mdc`, `README.md` (stub), `.gitignore`
- Create/modify: React Router app via official template; `package.json` scripts; `vitest.config.ts`; ESLint if not present; Tailwind
- Modify: `docs/SPEC.md` (already present — do not rewrite), `docs/PLAN.md` (already present)

**Interfaces:**
- Consumes: none
- Produces: runnable `npm run dev` skeleton; `npm run verify` script that runs typecheck + lint + vitest (vitest may have zero tests and still exit 0)

- [ ] **Step 1: Initialize git** (repo is currently untracked)

```bash
cd /Users/mohammad/Desktop/Library_catalog
git init
```

- [ ] **Step 2: Scaffold React Router framework mode into this directory**

Use the official CLI non-interactively. Prefer installing into the existing folder without wiping `docs/` or `.agents/`. If the CLI requires an empty directory, scaffold in a temp dir and move app files over, preserving `docs/`, `.agents/`, `skills-lock.json`.

```bash
# Example — adjust flags to whatever create-react-router currently offers for:
# TypeScript, Tailwind yes, no extras
npx create-react-router@latest . --yes
```

If `.` is rejected as non-empty, use:

```bash
npx create-react-router@latest /tmp/library-catalog-scaffold --yes
# then copy app/, public/, package.json, tsconfig*, vite.config*, react-router.config.* into the repo
# without deleting docs/ or .agents/
```

Enable TypeScript strict in `tsconfig.json` (`"strict": true`) if the template left any looseness.

- [ ] **Step 3: Add Tailwind if the template did not**

Follow current React Router + Tailwind docs (PostCSS or Vite plugin). Ensure `app/app.css` imports Tailwind and `root.tsx` imports that CSS.

- [ ] **Step 4: Add Vitest + verify scripts**

Install:

```bash
npm install -D vitest @vitest/coverage-v8
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["app/**/*.test.ts"],
  },
});
```

(If `vite-tsconfig-paths` is missing: `npm install -D vite-tsconfig-paths`.)

In `package.json` scripts:

```json
{
  "dev": "react-router dev",
  "build": "react-router build",
  "start": "react-router-serve ./build/server/index.js",
  "typecheck": "react-router typegen && tsc --noEmit",
  "lint": "eslint .",
  "test": "vitest run",
  "verify": "npm run typecheck && npm run lint && npm test"
}
```

Ensure ESLint runs clean on the scaffold (add flat config if the template omitted it).

- [ ] **Step 5: Write harness files**

`AGENTS.md`:

```markdown
# Agent guide — Library Catalog

## What this is
Small public-library catalog: grid, detail, checkout/return. Spec: `docs/SPEC.md`. Plan: `docs/PLAN.md`.

## Commands
- Run: `npm install && npm run dev`
- Verify before claiming done: `npm run verify`

## Stack
React Router framework mode (SSR), Tailwind, SQLite + Drizzle behind `CatalogRepository`, Vitest, npm.

## Out of scope
No auth, multi-user, waitlist, admin CRUD, reviews, external book APIs, Playwright/e2e, separate REST API.

## Working rules
1. Read `docs/SPEC.md` before changing behavior.
2. Prefer TDD at repository and loader/action seams.
3. Do not expand scope past the three required features.
```

`.cursor/rules/library-catalog.mdc`:

```markdown
---
description: Library catalog take-home constraints
alwaysApply: true
---

Before implementing, read `AGENTS.md` and `docs/SPEC.md`.
Execute work from `docs/PLAN.md`. Run `npm run verify` before claiming a task done.
Do not add auth, e2e, external book APIs, or a separate REST service.
```

Stub `README.md` with title + “full README in Task 8” is fine for now; or a minimal run section.

`.gitignore` must include at least:

```
node_modules
build
.react-router
dist
data/*.sqlite
data/*.sqlite-*
.env
DS_Store
```

- [ ] **Step 6: Run verify**

```bash
npm run verify
```

Expected: PASS (typecheck + lint + zero/empty tests).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore: scaffold React Router app with harness and verify loop

EOF
)"
```

---

### Task 2: Domain types, genres, and `CatalogRepository` interface

**Files:**
- Create: `app/catalog/genres.ts`, `app/catalog/types.ts`, `app/catalog/repository.ts`
- Test: `app/catalog/genres.test.ts` (optional smoke — prefer testing via query/repo later; if you add a test, only assert the genre list length/contents)

**Interfaces:**
- Consumes: nothing
- Produces:

```ts
// genres.ts
export const GENRES = [
  "Fiction",
  "Nonfiction",
  "Mystery",
  "Sci-Fi",
  "Fantasy",
  "Biography",
  "History",
  "Romance",
] as const;
export type Genre = (typeof GENRES)[number];
export function isGenre(value: string): value is Genre;

// types.ts
export type Book = {
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

export type CatalogSort = "title" | "author" | "availability";

export type CatalogListParams = {
  q: string;
  genre: Genre | null;
  sort: CatalogSort;
  page: number; // 1-based
  pageSize: number; // always 12 from callers
};

export type CatalogListResult = {
  books: Book[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CheckoutErrorCode = "NOT_FOUND" | "NONE_AVAILABLE" | "ALREADY_HELD";
export type ReturnErrorCode = "NOT_FOUND" | "NOT_HELD";

export type MutationResult<E extends string> =
  | { ok: true; book: Book }
  | { ok: false; code: E };

// repository.ts
export interface CatalogRepository {
  list(params: CatalogListParams): Promise<CatalogListResult>;
  getById(id: string): Promise<Book | null>;
  checkout(id: string): Promise<MutationResult<CheckoutErrorCode>>;
  returnBook(id: string): Promise<MutationResult<ReturnErrorCode>>;
}
```

- [ ] **Step 1: Write a failing test for `isGenre`**

Create `app/catalog/genres.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { GENRES, isGenre } from "./genres";

describe("isGenre", () => {
  it("accepts every fixed genre", () => {
    for (const g of GENRES) {
      expect(isGenre(g)).toBe(true);
    }
  });

  it("rejects unknown strings", () => {
    expect(isGenre("Horror")).toBe(false);
    expect(isGenre("")).toBe(false);
  });

  it("exposes exactly eight genres", () => {
    expect(GENRES).toHaveLength(8);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run app/catalog/genres.test.ts
```

Expected: FAIL (module not found / `isGenre` not defined).

- [ ] **Step 3: Implement genres + types + repository interface**

`app/catalog/genres.ts` — as in Interfaces.

`app/catalog/types.ts` — as in Interfaces (import `Genre` from `./genres`).

`app/catalog/repository.ts` — interface only; import types from `./types`.

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run app/catalog/genres.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/catalog/genres.ts app/catalog/genres.test.ts app/catalog/types.ts app/catalog/repository.ts
git commit -m "$(cat <<'EOF'
feat: add catalog domain types and repository interface

EOF
)"
```

---

### Task 3: SQLite schema, db bootstrap, seed-on-empty

**Files:**
- Create: `app/catalog/schema.ts`, `app/catalog/db.ts`, `app/catalog/seed.ts`, `drizzle.config.ts`, `data/.gitkeep`
- Modify: `.gitignore` (ensure `data/*.sqlite` ignored)
- Test: `app/catalog/seed.test.ts`

**Interfaces:**
- Consumes: `Book` shape / `GENRES`
- Produces:

```ts
// schema.ts — drizzle table `books` with columns matching Book
// db.ts
export function openCatalogDb(dbPath: string): { db: /* drizzle db */; sqlite: Database };
export function migrateCatalogSchema(db: /* drizzle db */): void;

// seed.ts
export function buildSeedBooks(count?: number): Omit<Book, never>[]; // length default 200
export function seedIfEmpty(db: /* drizzle db */): number; // rows inserted, 0 if already populated
export function coverUrlFor(id: string): string; // https://picsum.photos/seed/{id}/400/600
```

- [ ] **Step 1: Write failing seed tests**

`app/catalog/seed.test.ts`:

```ts
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { openCatalogDb, migrateCatalogSchema } from "./db";
import { buildSeedBooks, coverUrlFor, seedIfEmpty } from "./seed";
import { books } from "./schema";

describe("seed", () => {
  it("buildSeedBooks returns ~200 books across fixed genres", () => {
    const rows = buildSeedBooks(200);
    expect(rows).toHaveLength(200);
    expect(rows[0]?.coverUrl).toBe(coverUrlFor(rows[0]!.id));
    expect(rows.every((b) => b.availableCopies <= b.totalCopies)).toBe(true);
    expect(rows.every((b) => b.heldByReader === false)).toBe(true);
  });

  it("seedIfEmpty inserts once and is idempotent", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "catalog-"));
    const dbPath = path.join(dir, "test.sqlite");
    const { db, sqlite } = openCatalogDb(dbPath);
    migrateCatalogSchema(db);
    expect(seedIfEmpty(db)).toBe(200);
    expect(seedIfEmpty(db)).toBe(0);
    const count = db.select().from(books).all().length;
    expect(count).toBe(200);
    sqlite.close();
  });
});
```

(Adjust `.all()` vs async drizzle API to match the sync better-sqlite3 driver you wire — keep tests sync if using `drizzle-orm/better-sqlite3`.)

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run app/catalog/seed.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Install DB deps and implement**

```bash
npm install better-sqlite3 drizzle-orm
npm install -D drizzle-kit @types/better-sqlite3
```

`app/catalog/schema.ts`:

```ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const books = sqliteTable("books", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  genre: text("genre").notNull(),
  description: text("description").notNull(),
  coverUrl: text("cover_url").notNull(),
  totalCopies: integer("total_copies").notNull(),
  availableCopies: integer("available_copies").notNull(),
  heldByReader: integer("held_by_reader", { mode: "boolean" }).notNull().default(false),
});
```

`app/catalog/db.ts`: open with `better-sqlite3`, `drizzle(...)`, `migrateCatalogSchema` via `db.run(sql\`CREATE TABLE IF NOT EXISTS...\`)` **or** drizzle `push` equivalent in-process — keep it simple: `CREATE TABLE IF NOT EXISTS` matching the schema is fine for this take-home.

`app/catalog/seed.ts`: generate 200 deterministic synthetic titles/authors/descriptions; cycle genres; `totalCopies` in 1–5; `availableCopies === totalCopies`; `heldByReader false`; ids like `book-001` … `book-200`.

`coverUrlFor`:

```ts
export function coverUrlFor(id: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(id)}/400/600`;
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run app/catalog/seed.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/catalog/schema.ts app/catalog/db.ts app/catalog/seed.ts app/catalog/seed.test.ts drizzle.config.ts data/.gitkeep package.json package-lock.json
git commit -m "$(cat <<'EOF'
feat: add sqlite schema and seed-on-empty

EOF
)"
```

---

### Task 4: `SqliteCatalogRepository` — list, get, checkout, return

**Files:**
- Create: `app/catalog/sqlite-repository.ts`, `app/catalog/get-repository.ts`
- Test: `app/catalog/sqlite-repository.test.ts`

**Interfaces:**
- Consumes: `CatalogRepository`, schema, `openCatalogDb`, `migrateCatalogSchema`, `seedIfEmpty`
- Produces:

```ts
export class SqliteCatalogRepository implements CatalogRepository {
  constructor(private readonly db: /* drizzle db */) {}
  list(params: CatalogListParams): Promise<CatalogListResult>;
  getById(id: string): Promise<Book | null>;
  checkout(id: string): Promise<MutationResult<CheckoutErrorCode>>;
  returnBook(id: string): Promise<MutationResult<ReturnErrorCode>>;
}

// get-repository.ts
export function getCatalogRepository(): CatalogRepository;
// opens data/catalog.sqlite (path relative to cwd), migrates, seedIfEmpty, returns singleton
```

**List rules:** filter `q` with case-insensitive substring on title OR author; filter genre when non-null; sort title/author ASC, availability DESC; paginate with `pageSize` (12); `totalPages = max(1, ceil(total/pageSize))` or `0` when total is 0 — pick one and test it: **use `Math.max(1, Math.ceil(total / pageSize))` when total > 0, else `0`.**

**Checkout/return:** wrap in `sqlite.transaction(() => { ... })`. Re-read the row inside the transaction.

- [ ] **Step 1: Write failing repository tests**

`app/catalog/sqlite-repository.test.ts` — use a temp DB, migrate, insert a few known rows (or seed then override). Minimum cases:

```ts
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { openCatalogDb, migrateCatalogSchema } from "./db";
import { books } from "./schema";
import { SqliteCatalogRepository } from "./sqlite-repository";
import type { Book } from "./types";

function tempRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "catalog-repo-"));
  const { db, sqlite } = openCatalogDb(path.join(dir, "t.sqlite"));
  migrateCatalogSchema(db);
  return { db, sqlite, repo: new SqliteCatalogRepository(db) };
}

const sample = (over: Partial<Book> & Pick<Book, "id">): Book => ({
  title: "The Sample Book",
  author: "Ada Author",
  genre: "Fiction",
  description: "A book.",
  coverUrl: "https://picsum.photos/seed/x/400/600",
  totalCopies: 2,
  availableCopies: 2,
  heldByReader: false,
  ...over,
});

describe("SqliteCatalogRepository", () => {
  it("getById returns null for unknown ids", async () => {
    const { repo, sqlite, db } = tempRepo();
    expect(await repo.getById("missing")).toBeNull();
    sqlite.close();
  });

  it("lists with q/genre/sort/page", async () => {
    const { repo, sqlite, db } = tempRepo();
    db.insert(books).values([
      sample({ id: "a", title: "Alpha", author: "Zed", availableCopies: 1, totalCopies: 1 }),
      sample({ id: "b", title: "Beta", author: "Ann", genre: "Mystery", availableCopies: 5, totalCopies: 5 }),
      sample({ id: "c", title: "Alpha Centauri", author: "Ann", availableCopies: 0, totalCopies: 1 }),
    ]).run();
    const byQ = await repo.list({ q: "alpha", genre: null, sort: "title", page: 1, pageSize: 12 });
    expect(byQ.books.map((b) => b.id)).toEqual(["a", "c"]);
    const byGenre = await repo.list({ q: "", genre: "Mystery", sort: "title", page: 1, pageSize: 12 });
    expect(byGenre.books.map((b) => b.id)).toEqual(["b"]);
    const byAvail = await repo.list({ q: "", genre: null, sort: "availability", page: 1, pageSize: 12 });
    expect(byAvail.books.map((b) => b.id)).toEqual(["b", "a", "c"]);
    const page2 = await repo.list({ q: "", genre: null, sort: "title", page: 2, pageSize: 2 });
    expect(page2.books).toHaveLength(1);
    expect(page2.total).toBe(3);
    expect(page2.totalPages).toBe(2);
    sqlite.close();
  });

  it("checkout decrements and sets hold; blocks when none available or already held", async () => {
    const { repo, sqlite, db } = tempRepo();
    db.insert(books).values([
      sample({ id: "ok", availableCopies: 1, totalCopies: 1 }),
      sample({ id: "gone", availableCopies: 0, totalCopies: 1 }),
    ]).run();
    const first = await repo.checkout("ok");
    expect(first).toMatchObject({ ok: true, book: { availableCopies: 0, heldByReader: true } });
    expect(await repo.checkout("ok")).toEqual({ ok: false, code: "ALREADY_HELD" });
    expect(await repo.checkout("gone")).toEqual({ ok: false, code: "NONE_AVAILABLE" });
    expect(await repo.checkout("missing")).toEqual({ ok: false, code: "NOT_FOUND" });
    sqlite.close();
  });

  it("returnBook restores a copy only when held", async () => {
    const { repo, sqlite, db } = tempRepo();
    db.insert(books).values([
      sample({ id: "held", availableCopies: 0, totalCopies: 1, heldByReader: true }),
      sample({ id: "free", availableCopies: 1, totalCopies: 1, heldByReader: false }),
    ]).run();
    const ok = await repo.returnBook("held");
    expect(ok).toMatchObject({ ok: true, book: { availableCopies: 1, heldByReader: false } });
    expect(await repo.returnBook("free")).toEqual({ ok: false, code: "NOT_HELD" });
    expect(await repo.returnBook("missing")).toEqual({ ok: false, code: "NOT_FOUND" });
    sqlite.close();
  });
});
```

Fix drizzle insert API (`.run()` vs await) to match your db helper — keep tests truthful to the sync driver.

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx vitest run app/catalog/sqlite-repository.test.ts
```

- [ ] **Step 3: Implement `SqliteCatalogRepository` + `getCatalogRepository`**

Use SQL `LIKE` with lowercasing for `q`, or fetch-and-filter only if necessary — prefer SQL for the 200-row set:

- `q`: `(lower(title) like '%' || :q || '%' OR lower(author) like '%' || :q || '%')` with `q` already lowercased
- genre equality when not null
- `ORDER BY` title/author ASC or `available_copies DESC`
- `LIMIT pageSize OFFSET (page-1)*pageSize`

Checkout transaction pseudocode:

```
BEGIN
  row = SELECT * WHERE id = ? 
  if !row -> NOT_FOUND
  if row.heldByReader -> ALREADY_HELD
  if row.availableCopies <= 0 -> NONE_AVAILABLE
  UPDATE available_copies = available_copies - 1, held_by_reader = 1
  return updated book
COMMIT
```

Return transaction:

```
if !row -> NOT_FOUND
if !held -> NOT_HELD
UPDATE available = min(total, available+1), held = 0
```

`getCatalogRepository`: singleton; path `path.join(process.cwd(), "data", "catalog.sqlite")`; `fs.mkdirSync` for `data/`; migrate; `seedIfEmpty`.

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx vitest run app/catalog/sqlite-repository.test.ts
npm run verify
```

- [ ] **Step 5: Commit**

```bash
git add app/catalog/sqlite-repository.ts app/catalog/sqlite-repository.test.ts app/catalog/get-repository.ts
git commit -m "$(cat <<'EOF'
feat: implement sqlite catalog repository with checkout invariants

EOF
)"
```

---

### Task 5: URL query parsing

**Files:**
- Create: `app/catalog/query.ts`
- Test: `app/catalog/query.test.ts`

**Interfaces:**
- Consumes: `GENRES`, `isGenre`, `CatalogListParams`, `CatalogSort`
- Produces:

```ts
export const DEFAULT_CATALOG_PARAMS: Omit<CatalogListParams, "pageSize"> & { pageSize: 12 } = {
  q: "",
  genre: null,
  sort: "title",
  page: 1,
  pageSize: 12,
};

export function parseCatalogSearchParams(
  input: URLSearchParams | Record<string, string | undefined>,
): CatalogListParams;
```

Rules: trim `q`; invalid/missing `sort` → `"title"`; invalid/missing genre → `null`; `page` non-positive or NaN → `1`; always `pageSize: 12`.

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from "vitest";
import { parseCatalogSearchParams } from "./query";

describe("parseCatalogSearchParams", () => {
  it("applies defaults for empty input", () => {
    expect(parseCatalogSearchParams(new URLSearchParams())).toEqual({
      q: "",
      genre: null,
      sort: "title",
      page: 1,
      pageSize: 12,
    });
  });

  it("parses valid params", () => {
    const sp = new URLSearchParams({
      q: "  dune ",
      genre: "Sci-Fi",
      sort: "availability",
      page: "3",
    });
    expect(parseCatalogSearchParams(sp)).toEqual({
      q: "dune",
      genre: "Sci-Fi",
      sort: "availability",
      page: 3,
      pageSize: 12,
    });
  });

  it("coerces invalid sort/genre/page to defaults", () => {
    expect(
      parseCatalogSearchParams({ q: "x", genre: "Horror", sort: "nope", page: "0" }),
    ).toEqual({ q: "x", genre: null, sort: "title", page: 1, pageSize: 12 });
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npx vitest run app/catalog/query.test.ts
```

- [ ] **Step 3: Implement `parseCatalogSearchParams`**

- [ ] **Step 4: Run — expect PASS**

```bash
npx vitest run app/catalog/query.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add app/catalog/query.ts app/catalog/query.test.ts
git commit -m "$(cat <<'EOF'
feat: parse bookmarkable catalog search params

EOF
)"
```

---

### Task 6: Catalog grid route (loader + UI)

**Files:**
- Create/Modify: `app/routes/home.tsx` (or rename to catalog index — keep URL `/`), `app/routes.ts`, `app/root.tsx` as needed
- Test: `app/routes/home.loader.test.ts`

**Interfaces:**
- Consumes: `getCatalogRepository()`, `parseCatalogSearchParams`
- Produces: loader data `{ books, total, page, pageSize, totalPages, params }` for `/`

- [ ] **Step 1: Write failing loader test**

```ts
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Pattern: export `loader` from home.tsx and inject repo via a testable helper,
// OR set process.env.CATALOG_DB_PATH before importing get-repository.
// Prefer: export async function loadCatalog(request: Request, repo: CatalogRepository)

import { loadCatalog } from "./home";
import { openCatalogDb, migrateCatalogSchema } from "../catalog/db";
import { SqliteCatalogRepository } from "../catalog/sqlite-repository";
import { books } from "../catalog/schema";

describe("loadCatalog", () => {
  it("returns filtered page from search params", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cat-load-"));
    const { db, sqlite } = openCatalogDb(path.join(dir, "t.sqlite"));
    migrateCatalogSchema(db);
    db.insert(books)
      .values({
        id: "1",
        title: "Dune",
        author: "Herbert",
        genre: "Sci-Fi",
        description: "Sand",
        coverUrl: "https://picsum.photos/seed/1/400/600",
        totalCopies: 1,
        availableCopies: 1,
        heldByReader: false,
      })
      .run();
    const repo = new SqliteCatalogRepository(db);
    const data = await loadCatalog(
      new Request("http://app/?q=dune&sort=title&page=1"),
      repo,
    );
    expect(data.books).toHaveLength(1);
    expect(data.params.q).toBe("dune");
    sqlite.close();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npx vitest run app/routes/home.loader.test.ts
```

- [ ] **Step 3: Implement loader helper + route UI**

In `app/routes/home.tsx`:

```ts
export async function loadCatalog(request: Request, repo: CatalogRepository) {
  const url = new URL(request.url);
  const params = parseCatalogSearchParams(url.searchParams);
  const result = await repo.list(params);
  return { ...result, params };
}

export async function loader({ request }: Route.LoaderArgs) {
  return loadCatalog(request, getCatalogRepository());
}
```

UI requirements (utilitarian, responsive):
- Form or controls that sync `q`, `genre`, `sort`, `page` to the URL (GET form and/or links). Changing search/filter/sort resets to page 1.
- Responsive grid of cards: image, title, author, availability text `N of M available` or distinct “None available”.
- Each card links to `/books/:id`.
- Pagination controls using URL `page` param.
- Empty state when `books.length === 0`.

Wire route in `app/routes.ts` to `/`.

- [ ] **Step 4: Run tests + typecheck**

```bash
npx vitest run app/routes/home.loader.test.ts
npm run verify
```

Expected: PASS. Manually spot-check `npm run dev` grid + URL updates.

- [ ] **Step 5: Commit**

```bash
git add app/routes/home.tsx app/routes/home.loader.test.ts app/routes.ts app/root.tsx app/app.css
git commit -m "$(cat <<'EOF'
feat: add SSR catalog grid with URL-driven query state

EOF
)"
```

---

### Task 7: Book detail, 404, checkout/return action, errors

**Files:**
- Create: `app/routes/books.$id.tsx`, `app/routes/books.$id.action.test.ts`, `app/routes/books.$id.loader.test.ts`
- Modify: `app/routes.ts`, `app/root.tsx` (error boundary / `ErrorBoundary` / `HydrateFallback` as template provides)

**Interfaces:**
- Consumes: `getCatalogRepository()`, mutation result codes
- Produces:

```ts
export async function loadBook(id: string, repo: CatalogRepository): Promise<Book>;
// throws notFound() when missing

export async function performBookAction(
  id: string,
  intent: "checkout" | "return",
  repo: CatalogRepository,
): Promise<{ book: Book } | { book: Book | null; error: string }>;
```

Map codes to user-facing strings:
- `NONE_AVAILABLE` → “No copies available.”
- `ALREADY_HELD` → “You already have this book checked out.”
- `NOT_HELD` → “You do not have this book checked out.”
- `NOT_FOUND` → not-found path (action should `throw notFound()` or return error if race-deleted)

- [ ] **Step 1: Write failing loader/action tests**

```ts
// loader: existing id returns book; missing throws/responds not found
// action: checkout success updates book; checkout when 0 returns inline error object; return success
```

Use the same temp-db + `SqliteCatalogRepository` pattern as Task 6. Assert `performBookAction("gone", "checkout", repo)` returns an object with `error: "No copies available."` without throwing.

- [ ] **Step 2: Run — expect FAIL**

```bash
npx vitest run app/routes/books.\$id.loader.test.ts app/routes/books.\$id.action.test.ts
```

- [ ] **Step 3: Implement route**

- `loader`: `getById`; if null `throw data(...)` / `throw new Response(null, { status: 404 })` per RR v7 not-found pattern used by the template (`export function headers` / `status: 404` or `notFound()` helper).
- `action`: read `intent` from formData (`checkout` | `return`); call repository; on business failure return `{ error, book }` (re-fetch book when possible); on success return `{ book }` or redirect-to-self is unnecessary — return data and let RR revalidate.
- UI: full record; availability; button Checkout **or** Return based on `heldByReader`; disable checkout visually when `availableCopies === 0` && !held (still enforce server-side); show `actionData.error` inline.
- `ErrorBoundary` / `NotFound` UI: short message + link back to `/`.

Register `/books/:id` in `app/routes.ts`.

- [ ] **Step 4: Run verify + manual check**

```bash
npm run verify
npm run dev
```

Manual: open a book, checkout, refresh (state persists), return, hit `/books/does-not-exist` for 404, double-submit last copy if feasible.

- [ ] **Step 5: Commit**

```bash
git add app/routes/books.\$id.tsx app/routes/books.\$id.*.test.ts app/routes.ts app/root.tsx
git commit -m "$(cat <<'EOF'
feat: add book detail with checkout/return and not-found

EOF
)"
```

---

### Task 8: README polish and final verification

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md` only if commands drifted

**Interfaces:**
- Consumes: final scripts and URL contract
- Produces: complete README for reviewers

- [ ] **Step 1: Write README**

Must include:
1. What the app is (three features)
2. Tech choices + why (RR framework/SSR BFF, SQLite+Drizzle behind interface, Tailwind, Vitest seams)
3. Run: `npm install && npm run dev`
4. Verify: `npm run verify`
5. URL contract table (`q`, `genre`, `sort`, `page`)
6. Resetting data (delete `data/catalog.sqlite`)
7. How AI was used: point at `AGENTS.md`, `.cursor/rules/`, `docs/SPEC.md`, `docs/PLAN.md`, `.agents/skills`, verify loop
8. Explicit out-of-scope list

Keep to roughly one focused page.

- [ ] **Step 2: Run full verify**

```bash
npm run verify
```

Expected: PASS.

- [ ] **Step 3: Smoke the happy path once**

```bash
npm run dev
```

Confirm: seeded grid renders, search/filter/sort/page update URL and SSR markup, detail works, checkout/return persist across refresh, unknown id 404s.

- [ ] **Step 4: Commit**

```bash
git add README.md AGENTS.md
git commit -m "$(cat <<'EOF'
docs: add README with run, verify, and AI process notes

EOF
)"
```

---

## Self-Review

**1. Spec coverage**
| Spec item | Task |
| --- | --- |
| Catalog grid + URL state + SSR | 5, 6 |
| Detail + 404 + error boundary | 7 |
| Checkout/return server enforcement | 4, 7 |
| TS strict / RR framework / BFF / Tailwind | 1, 6, 7 |
| SQLite behind interface | 2, 3, 4 |
| ~200 seed books | 3 |
| Tests + verify loop | 1, 2–7 |
| Harness + planning artifacts | 1 + existing `docs/*` |
| One run command + README | 1, 8 |
| Out of scope respected | Global constraints + README |

**2. Placeholder scan:** No TBD/TODO steps; commands and signatures spelled out. Drizzle sync vs async call style may need a one-line adapter tweak at implementation time — tests define the chosen sync style.

**3. Type consistency:** `CatalogRepository`, `CatalogListParams`, `MutationResult`, genre union, and URL defaults are defined in Task 2/5 and reused unchanged in Tasks 4–7. Action intent names: `checkout` | `return`. Method name is `returnBook` on the repository (not `return`).

---

## Execution Handoff

Plan complete and saved to `docs/PLAN.md` (spec alongside at `docs/SPEC.md`).

**Two execution options:**

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration  
**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints  

Which approach?
