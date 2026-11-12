import type { Genre } from "./genres";

export type SortKey = "title" | "author" | "availability";

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

export type CatalogListParams = {
  q: string;
  genre: Genre | null;
  sort: SortKey;
  page: number;
  pageSize: number;
};

export type CatalogListResult = {
  books: Book[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export type MutationCode =
  | "NOT_FOUND"
  | "NONE_AVAILABLE"
  | "ALREADY_HELD"
  | "NOT_HELD";

export type MutationResult<E extends string> =
  | { ok: true; book: Book }
  | { ok: false; code: E };
