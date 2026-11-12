# AI Workflow

## How the work was broken down

I followed the plan’s intended layers: app harness and verification; domain types, query parsing, and repository; SQLite persistence and seeding; then the catalog and detail routes. I ran `npm run verify` as the main feedback loop and made later small UI changes (including the search clear button) directly in the route.

## Delegation and hands-on work

I did not delegate implementation or review to subagents. The spec workflow called for ticket-based implementers and mergers, but no issue tracker or published tickets were available in the repo. Rather than invent ticket state or claim parallel work happened, I implemented the changes in the current worktree and on the `integration` branch. I also handled the domain glossary, Copilot instructions, README pointers, and this retrospective by hand.

That kept the work coherent for a small repo, but it skipped the prescribed fresh-context implementation and independent review. The earlier account that described system-level planning as delegated was inaccurate: it was handled in this session, not by a subagent.

## Mistakes caught—and one not caught

Verification caught a real checkout edge case. After checking out the last available copy, a second checkout initially returned `NONE_AVAILABLE` instead of `ALREADY_HELD`. I had chosen the wrong guard order; the repository test exposed it, and I reordered the checks so the duplicate hold is reported first.

The verify run also caught missing `better-sqlite3` type declarations and an incorrect inferred row type. Those were fixed before the final passing run.

One important mismatch was **not** caught by verification: the plan calls for Drizzle behind the repository, but the SQLite repository and seed path use raw `better-sqlite3` SQL. Drizzle is installed and a schema is declared, but the adapter does not use it. A green typecheck/lint/test run did not establish that the planned persistence architecture was followed. This should have been checked against the plan, or tested/reviewed independently, before calling the implementation complete.

## What I would change next time

First, make ticket availability an explicit preflight and follow the spec workflow with separate worktrees and independent review when tickets exist. Second, turn architectural requirements—not just runtime behavior—into review checks, especially whether the chosen ORM actually owns persistence. Finally, keep the test expectations tied to explicit spec decisions; where the spec leaves precedence ambiguous, resolve that choice before encoding it in a test.
