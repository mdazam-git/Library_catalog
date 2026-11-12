# Library Catalog

This glossary defines the canonical language for the library catalog domain so the catalog, book detail, and borrowing flows use the same vocabulary across code, tests, and product decisions.

## Language

**Book**:
A cataloged title with a unique identity, author, description, genre, and cover image. A book is the thing a visitor browses and opens from the catalog.
_Avoid_: title record, volume, item

**Copy**:
A physical instance of a book that can be checked out or returned. The library may hold multiple copies of the same book, and each copy contributes to the total stock.
_Avoid_: stock unit, physical item, copy count

**Catalog**:
The collection of books presented to a visitor with search, filtering, sorting, and pagination controls.
_Avoid_: shelf, index, inventory

**Genre**:
A closed classification used to organize books into a predictable browsing set. The project recognizes Fiction, Nonfiction, Mystery, Sci-Fi, Fantasy, Biography, History, and Romance.
_Avoid_: category, tag, section

**Reader**:
The anonymous library visitor using the catalog. In this project, the reader is a single, untracked user identity that may hold many books at once.
_Avoid_: account, patron, user

**Hold**:
A reader’s active relationship to a book indicating that they currently have a copy checked out. A hold is per book, not per copy, and it is the core rule used to block duplicate checkouts.
_Avoid_: reservation, waitlist, loan, borrow record

**Checkout**:
The act of taking a copy of a book from the available pool into the reader’s possession. A checkout is allowed only if copies are available and the reader does not already hold the book.
_Avoid_: borrow, take out, issue

**Return**:
The act of returning a held book to the library so it becomes available again. A return is valid only if the reader currently holds the book.
_Avoid_: check-in, refund, restore

**Availability**:
The current number of copies available to borrow, derived from the book’s total copies minus the copies currently held by the reader.
_Avoid_: stock, capacity, count

**Search**:
A case-insensitive lookup across a book’s title and author. A search is one of the URL-driven filters on the catalog page.
_Avoid_: query, lookup, filter

**Filter**:
A narrowing preference that limits the catalog to a single genre or removes the genre restriction altogether.
_Avoid_: tag, category selector, browse mode

**Page**:
A numbered slice of search results within the catalog. The catalog page size is fixed at 12 results.
_Avoid_: screen, view, window
