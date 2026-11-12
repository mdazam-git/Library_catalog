import type Database from "better-sqlite3";

import { GENRES } from "./genres";

const authorPool = [
  "Avery Stone",
  "Maya Finch",
  "Jordan Vale",
  "Priya Nair",
  "Elliot Cross",
  "Camila Reed",
  "Leo Hart",
  "Sofia Quinn",
  "Nolan Price",
  "Eden Brooks",
  "Harper Cole",
  "Miles Rowan",
  "Rina Patel",
  "Theo Grant",
  "Zoe Marlowe",
  "Isaac Hale",
  "Lena Mitchell",
  "Akira Bell",
  "Noah Grey",
  "Clara Wren",
];

const titleWords = [
  "Lantern",
  "Harbor",
  "Signal",
  "Glass",
  "Marble",
  "Briar",
  "Cinder",
  "Mist",
  "Echo",
  "Harvest",
  "Field",
  "Velvet",
  "Willow",
  "Atelier",
  "Summit",
  "Drift",
  "Ember",
  "Thread",
  "North",
  "River",
  "Stone",
  "Sky",
  "Dawn",
  "Hollow",
  "Tide",
  "Maple",
  "Copper",
  "Fable",
  "Winter",
  "Bloom",
  "Grove",
];

const descriptionStarts = [
  "A thoughtful look at",
  "An intricate story about",
  "A deeply human account of",
  "An immersive journey through",
  "A compelling examination of",
  "A vivid portrait of",
  "A memorable tale shaped by",
  "An elegant meditation on",
];

function getSeedData() {
  return Array.from({ length: 200 }, (_, index) => {
    const genre = GENRES[index % GENRES.length];
    const titleWordA = titleWords[(index * 2) % titleWords.length];
    const titleWordB = titleWords[(index * 3 + 1) % titleWords.length];
    const title = `${titleWordA} ${titleWordB}`;
    const author = authorPool[index % authorPool.length];
    const totalCopies = 1 + ((index * 3) % 4);
    const availableCopies = Math.max(1, totalCopies - (index % 3 === 0 ? 1 : 0));

    return {
      id: String(index + 1),
      title,
      author,
      genre,
      description: `${descriptionStarts[index % descriptionStarts.length]} ${title.toLowerCase()} and the people who cross its path.`,
      coverUrl: `https://picsum.photos/seed/${index + 1}/400/600`,
      totalCopies,
      availableCopies,
      heldByReader: 0,
    };
  });
}

export function seedCatalogIfEmpty(database: Database.Database) {
  const tableExists = database
    .prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name = 'books'")
    .get() as { count: number };

  if (tableExists.count === 0) {
    database.exec(`
      CREATE TABLE books (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        genre TEXT NOT NULL,
        description TEXT NOT NULL,
        coverUrl TEXT NOT NULL,
        totalCopies INTEGER NOT NULL,
        availableCopies INTEGER NOT NULL,
        heldByReader INTEGER NOT NULL DEFAULT 0
      );
    `);
  }

  const rowCount = database.prepare("SELECT COUNT(*) as count FROM books").get() as { count: number };

  if (rowCount.count === 0) {
    const rows = getSeedData();
    const insert = database.prepare(`
      INSERT INTO books (
        id,
        title,
        author,
        genre,
        description,
        coverUrl,
        totalCopies,
        availableCopies,
        heldByReader
      ) VALUES (
        @id,
        @title,
        @author,
        @genre,
        @description,
        @coverUrl,
        @totalCopies,
        @availableCopies,
        @heldByReader
      )
    `);

    const transaction = database.transaction(() => {
      for (const row of rows) {
        insert.run(row);
      }
    });

    transaction();
  }
}
