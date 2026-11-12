import type Database from "better-sqlite3";

import { isGenre } from "./genres";
import { openCatalogDatabase } from "./db";
import { seedCatalogIfEmpty } from "./seed";
import type { CatalogRepository } from "./repository";
import type { Book, CatalogListParams, CatalogListResult, MutationResult } from "./types";

export type BookRow = {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  coverUrl: string;
  totalCopies: number;
  availableCopies: number;
  heldByReader: number | boolean;
};

function toBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    genre: isGenre(row.genre) ? row.genre : "Fiction",
    description: row.description,
    coverUrl: row.coverUrl,
    totalCopies: Number(row.totalCopies),
    availableCopies: Number(row.availableCopies),
    heldByReader: Boolean(row.heldByReader),
  };
}

export class SqliteCatalogRepository implements CatalogRepository {
  constructor(private readonly database: Database.Database) {
    seedCatalogIfEmpty(database);
  }

  async list(params: CatalogListParams): Promise<CatalogListResult> {
    const rows = this.database
      .prepare(
        `SELECT * FROM books WHERE (? = '' OR lower(title) LIKE '%' || lower(?) || '%' OR lower(author) LIKE '%' || lower(?) || '%') AND (? IS NULL OR genre = ?) ORDER BY title ASC`,
      )
      .all(
        params.q,
        params.q,
        params.q,
        params.genre,
        params.genre,
      ) as BookRow[];

    const filtered = rows.filter((row) => {
      const haystack = `${row.title} ${row.author}`.toLowerCase();
      const q = params.q.toLowerCase();
      const matches = !q || haystack.includes(q);
      const sameGenre = params.genre === null || row.genre === params.genre;
      return matches && sameGenre;
    });

    const sorted = [...filtered].sort((left, right) => {
      if (params.sort === "author") {
        return left.author.localeCompare(right.author) || left.title.localeCompare(right.title);
      }

      if (params.sort === "availability") {
        return right.availableCopies - left.availableCopies || left.title.localeCompare(right.title);
      }

      return left.title.localeCompare(right.title) || left.author.localeCompare(right.author);
    });

    const total = sorted.length;
    const totalPages = total === 0 ? 0 : Math.max(1, Math.ceil(total / params.pageSize));
    const safePage = totalPages === 0 ? 1 : Math.min(params.page, totalPages);
    const offset = (safePage - 1) * params.pageSize;
    const slice = sorted.slice(offset, offset + params.pageSize).map(toBook);

    return {
      books: slice,
      total,
      page: safePage,
      pageSize: params.pageSize,
      totalPages,
      hasPrevious: safePage > 1,
      hasNext: safePage < totalPages,
    };
  }

  async getById(id: string): Promise<Book | null> {
    const row = this.database
      .prepare("SELECT * FROM books WHERE id = ?")
      .get(id) as BookRow | undefined;

    return row ? toBook(row) : null;
  }

  async checkout(
    id: string,
  ): Promise<MutationResult<"NOT_FOUND" | "NONE_AVAILABLE" | "ALREADY_HELD">> {
    return this.database.transaction(
      (): MutationResult<"NOT_FOUND" | "NONE_AVAILABLE" | "ALREADY_HELD"> => {
        const row = this.database
          .prepare("SELECT * FROM books WHERE id = ?")
          .get(id) as BookRow | undefined;

        if (!row) {
          return { ok: false, code: "NOT_FOUND" };
        }

        if (row.heldByReader) {
          return { ok: false, code: "ALREADY_HELD" };
        }

        if (row.availableCopies === 0) {
          return { ok: false, code: "NONE_AVAILABLE" };
        }

        const updated = {
          ...row,
          availableCopies: row.availableCopies - 1,
          heldByReader: 1,
        };

        this.database
          .prepare(
            `UPDATE books SET availableCopies = ?, heldByReader = ? WHERE id = ?`,
          )
          .run(updated.availableCopies, updated.heldByReader, id);

        return { ok: true, book: toBook(updated) };
      },
    )();
  }

  async returnBook(id: string): Promise<MutationResult<"NOT_FOUND" | "NOT_HELD">> {
    return this.database.transaction((): MutationResult<"NOT_FOUND" | "NOT_HELD"> => {
      const row = this.database
        .prepare("SELECT * FROM books WHERE id = ?")
        .get(id) as BookRow | undefined;

      if (!row) {
        return { ok: false, code: "NOT_FOUND" };
      }

      if (!row.heldByReader) {
        return { ok: false, code: "NOT_HELD" };
      }

      const updatedCopies = Math.min(row.totalCopies, row.availableCopies + 1);
      const updated = {
        ...row,
        availableCopies: updatedCopies,
        heldByReader: 0,
      };

      this.database
        .prepare(
          `UPDATE books SET availableCopies = ?, heldByReader = ? WHERE id = ?`,
        )
        .run(updated.availableCopies, updated.heldByReader, id);

      return { ok: true, book: toBook(updated) };
    })();
  }
}

export function getDefaultRepository() {
  const database = openCatalogDatabase();
  return new SqliteCatalogRepository(database);
}
