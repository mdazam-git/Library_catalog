import { describe, expect, it } from "vitest";

import { parseCatalogSearchParams } from "./query";

describe("parseCatalogSearchParams", () => {
  it("applies defaults for missing or invalid values", () => {
    expect(parseCatalogSearchParams(new URLSearchParams())).toEqual({
      q: "",
      genre: null,
      sort: "title",
      page: 1,
      pageSize: 12,
    });

    expect(
      parseCatalogSearchParams({
        q: "  alice  ",
        genre: "bogus",
        sort: "bogus",
        page: "0",
      }),
    ).toEqual({
      q: "alice",
      genre: null,
      sort: "title",
      page: 1,
      pageSize: 12,
    });
  });

  it("accepts valid search and sort values", () => {
    expect(
      parseCatalogSearchParams({
        q: "  test  ",
        genre: "Mystery",
        sort: "author",
        page: "2",
      }),
    ).toEqual({
      q: "test",
      genre: "Mystery",
      sort: "author",
      page: 2,
      pageSize: 12,
    });
  });
});
