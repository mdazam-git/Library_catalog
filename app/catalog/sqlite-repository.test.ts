import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";

import { SqliteCatalogRepository } from "./sqlite-repository";

describe("SqliteCatalogRepository", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  function createRepository() {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "catalog-"));
    const dbPath = path.join(tempDir, "catalog.sqlite");
    tempDirs.push(tempDir);

    const database = new Database(dbPath);
    const repository = new SqliteCatalogRepository(database);

    return { database, repository };
  }

  it("lists books with pagination and filtering", async () => {
    const { repository } = createRepository();

    const firstPage = await repository.list({
      q: "",
      genre: null,
      sort: "title",
      page: 1,
      pageSize: 12,
    });

    expect(firstPage.total).toBe(200);
    expect(firstPage.books).toHaveLength(12);
    expect(firstPage.totalPages).toBe(17);
    expect(firstPage.page).toBe(1);

    const fictionPage = await repository.list({
      q: "",
      genre: "Fiction",
      sort: "availability",
      page: 1,
      pageSize: 12,
    });

    expect(fictionPage.books.length).toBeGreaterThan(0);
    expect(fictionPage.books.every((book) => book.genre === "Fiction")).toBe(true);
  });

  it("checks out and returns a book with transactional hold rules", async () => {
    const { repository } = createRepository();

    const before = await repository.getById("1");
    expect(before).not.toBeNull();

    const checkout = await repository.checkout("1");
    expect(checkout.ok).toBe(true);
    if (checkout.ok) {
      expect(checkout.book.heldByReader).toBe(true);
    }

    const duplicateCheckout = await repository.checkout("1");
    expect(duplicateCheckout).toEqual({ ok: false, code: "ALREADY_HELD" });

    const returned = await repository.returnBook("1");
    expect(returned).toEqual({ ok: true, book: expect.objectContaining({ id: "1", heldByReader: false }) });

    const after = await repository.getById("1");
    expect(after?.heldByReader).toBe(false);
  });
});
