import { openCatalogDatabase } from "./db";
import { SqliteCatalogRepository } from "./sqlite-repository";

let repository: SqliteCatalogRepository | null = null;

export function getRepository() {
  if (!repository) {
    repository = new SqliteCatalogRepository(openCatalogDatabase());
  }

  return repository;
}
