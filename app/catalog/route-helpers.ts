import { redirect } from "react-router";

import { parseCatalogSearchParams } from "./query";
import type { CatalogRepository } from "./repository";
import type { MutationCode } from "./types";

export function getActionErrorMessage(code: MutationCode): string {
  switch (code) {
    case "NONE_AVAILABLE":
      return "No copies available.";
    case "ALREADY_HELD":
      return "You already have this book checked out.";
    case "NOT_HELD":
      return "You do not have this book checked out.";
    default:
      return "Book not found.";
  }
}

export async function loadCatalog(request: Request, repository: CatalogRepository) {
  const url = new URL(request.url);
  const params = parseCatalogSearchParams(url.searchParams);
  const data = await repository.list(params);

  return {
    ...data,
    q: params.q,
    genre: params.genre,
    sort: params.sort,
  };
}

export async function loadBook(request: Request, repository: CatalogRepository, id: string) {
  const book = await repository.getById(id);

  if (!book) {
    throw new Response("Book not found", {
      status: 404,
      statusText: "Not Found",
    });
  }

  return book;
}

export async function performBookAction(
  request: Request,
  repository: CatalogRepository,
  id: string,
  intent: string,
) {
  if (intent === "checkout") {
    const result = await repository.checkout(id);
    if (!result.ok) {
      return { ok: false, code: result.code, message: getActionErrorMessage(result.code) };
    }

    throw redirect(`/books/${id}`);
  }

  if (intent === "return") {
    const result = await repository.returnBook(id);
    if (!result.ok) {
      return { ok: false, code: result.code, message: getActionErrorMessage(result.code) };
    }

    throw redirect(`/books/${id}`);
  }

  return {
    ok: false,
    code: "NOT_FOUND" as const,
    message: "Book not found.",
  };
}
