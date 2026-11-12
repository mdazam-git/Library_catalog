import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const books = sqliteTable("books", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  genre: text("genre").notNull(),
  description: text("description").notNull(),
  coverUrl: text("coverUrl").notNull(),
  totalCopies: integer("totalCopies").notNull(),
  availableCopies: integer("availableCopies").notNull(),
  heldByReader: integer("heldByReader", { mode: "boolean" }).notNull().default(false),
});

export type BookRow = typeof books.$inferSelect;
