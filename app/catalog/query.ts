import { isGenre } from "./genres";
import type { CatalogListParams, SortKey } from "./types";

export const PAGE_SIZE = 12;

export function parseCatalogSearchParams(
  value: URLSearchParams | Record<string, string | null | undefined>,
): CatalogListParams {
  const params =
    value instanceof URLSearchParams
      ? value
      : new URLSearchParams(
          Object.entries(value)
            .filter(([, nextValue]) => nextValue != null)
            .map(([key, nextValue]) => [key, String(nextValue)]),
        );

  const q = (params.get("q") ?? "").trim();
  const genreInput = params.get("genre") ?? "";
  const genre = isGenre(genreInput) ? genreInput : null;

  const sortValue = (params.get("sort") ?? "title").toLowerCase();
  const sort: SortKey =
    sortValue === "author" || sortValue === "availability"
      ? sortValue
      : "title";

  const requestedPage = Number(params.get("page") ?? "1");
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.trunc(requestedPage) : 1;

  return {
    q,
    genre,
    sort,
    page,
    pageSize: PAGE_SIZE,
  };
}
