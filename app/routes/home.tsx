import { useRef } from "react";
import { Form, Link, useLoaderData } from "react-router";

import { GENRES } from "~/catalog/genres";
import { getRepository } from "~/catalog/get-repository";
import { loadCatalog } from "~/catalog/route-helpers";
import type { SortKey } from "~/catalog/types";

export async function loader({ request }: { request: Request }) {
  return loadCatalog(request, getRepository());
}

export function meta() {
  return [
    { title: "Library Catalog" },
    { name: "description", content: "Browse the public library catalog." },
  ];
}

function buildCatalogHref({
  q,
  genre,
  sort,
  page,
}: {
  q: string;
  genre: string | null;
  sort: SortKey;
  page: number;
}) {
  const params = new URLSearchParams();

  if (q) {
    params.set("q", q);
  }

  if (genre) {
    params.set("genre", genre);
  }

  params.set("sort", sort);
  params.set("page", String(page));

  return `/?${params.toString()}`;
}

export default function HomePage() {
  const data = useLoaderData<typeof loader>();
  const formRef = useRef<HTMLFormElement | null>(null);
  const { books, q, genre, sort, page, totalPages, total } = data;

  const handleClearFilters = () => {
    const form = formRef.current;
    if (!form) {
      return;
    }

    const qField = form.elements.namedItem("q") as HTMLInputElement | null;
    const genreField = form.elements.namedItem("genre") as HTMLSelectElement | null;
    const sortField = form.elements.namedItem("sort") as HTMLSelectElement | null;
    const pageField = form.elements.namedItem("page") as HTMLInputElement | null;

    if (qField) qField.value = "";
    if (genreField) genreField.value = "";
    if (sortField) sortField.value = "title";
    if (pageField) pageField.value = "1";

    form.requestSubmit();
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl bg-slate-900 px-6 py-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Public library</p>
          <h1 className="mt-3 text-4xl font-bold">Library catalog</h1>
        </header>

        <Form ref={formRef} method="get" className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1.5fr_0.9fr_0.9fr_auto_auto]">
          <label className="flex flex-col text-sm font-medium text-slate-700">
            Search
            <div className="relative mt-1">
              <input
                defaultValue={q}
                name="q"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 pr-9 focus:border-sky-500 focus:outline-none"
                placeholder="Title or author"
              />
              {q ? (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600 transition hover:bg-slate-300 hover:text-slate-900"
                  aria-label="Clear search and filters"
                >
                  ×
                </button>
              ) : null}
            </div>
          </label>

          <label className="flex flex-col text-sm font-medium text-slate-700">
            Genre
            <select
              defaultValue={genre ?? ""}
              name="genre"
              className="mt-1 rounded-xl border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none"
            >
              <option value="">All</option>
              {GENRES.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-sm font-medium text-slate-700">
            Sort
            <select
              defaultValue={sort}
              name="sort"
              className="mt-1 rounded-xl border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none"
            >
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="availability">Availability</option>
            </select>
          </label>

          <div className="flex items-end">
            <input type="hidden" name="page" value="1" />
            <button
              className="w-full rounded-xl bg-sky-600 px-4 py-2.5 font-semibold text-white transition hover:bg-sky-500"
              type="submit"
            >
              Apply
            </button>
          </div>
        </Form>

        <div className="flex items-center justify-between text-sm text-slate-600">
          <p>
            {total === 0 ? "No books match the current filter." : `${total} result${total === 1 ? "" : "s"}`}
          </p>
          {total > 0 ? <p>Page {page}</p> : null}
        </div>

        {books.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600 shadow-sm">
            No books match the current search and filters.
          </div>
        ) : (
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {books.map((book) => (
              <Link
                key={book.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                to={`/books/${book.id}`}
              >
                <img
                  alt={book.title}
                  className="h-72 w-full object-cover"
                  src={book.coverUrl}
                />
                <div className="space-y-3 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-700">
                      {book.genre}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-900">{book.title}</h2>
                    <p className="text-sm text-slate-600">{book.author}</p>
                  </div>

                  <p className="text-sm font-medium text-slate-700">
                    {book.availableCopies === 0 ? "None available" : `${book.availableCopies} of ${book.totalCopies} available`}
                  </p>
                </div>
              </Link>
            ))}
          </section>
        )}

        {totalPages > 1 ? (
          <nav className="flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => {
              const selected = pageNumber === page;
              return (
                <Link
                  key={pageNumber}
                  className={
                    selected
                      ? "rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                      : "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-400"
                  }
                  to={buildCatalogHref({
                    q,
                    genre,
                    sort,
                    page: pageNumber,
                  })}
                >
                  {pageNumber}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>
    </main>
  );
}
