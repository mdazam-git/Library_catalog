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

export function isGenre(value: string | null | undefined): value is Genre {
  return typeof value === "string" && GENRES.includes(value as Genre);
}
