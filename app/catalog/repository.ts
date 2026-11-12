import type { Book, CatalogListParams, CatalogListResult, MutationResult } from "./types";

export interface CatalogRepository {
  list(params: CatalogListParams): Promise<CatalogListResult>;
  getById(id: string): Promise<Book | null>;
  checkout(
    id: string,
  ): Promise<MutationResult<"NOT_FOUND" | "NONE_AVAILABLE" | "ALREADY_HELD">>;
  returnBook(id: string): Promise<MutationResult<"NOT_FOUND" | "NOT_HELD">>;
}
