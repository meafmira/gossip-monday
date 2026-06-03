# PROGRESS.md

Persistent working memory for coding agents in this repository. Read this file before starting any task, keep it concise, and update it with only findings or decisions that are useful for future work. Remove stale or unnecessary notes when encountered.

## Standing workflow

- At the start of each task/session, read `PROGRESS.md` before making changes.
- During work, log important findings, decisions, blockers, and future follow-ups here.
- Keep this file clean: delete notes that are obsolete, duplicated, or not useful as future memory.

## Log

- 2026-05-10: User requested that all findings and necessary future memory be maintained in `PROGRESS.md` and that agents read it every time before work.
- 2026-05-10: `AGENTS.md` now documents the `PROGRESS.md` workflow so future agents see it in repository instructions too.
- 2026-06-03: Code-review cleanup pass.
  - Deleted dead `src/data/club.ts` (duplicated/diverged from `convex/seedData.ts`). Convex is the only content source now.
  - `src/lib/base.ts` is the single normalized base-path helper; pages/components import it instead of re-deriving from `BASE_URL`.
  - `convex/limits.ts` holds shared content limits (server validation in `convex/club.ts` + form `maxlength` in `Modals.astro`) and `LIST_LIMITS` caps for the page query. Update limits there only.
  - `getPageData` now uses `.take()` for backlog/vacations to bound the realtime payload.
  - Lightbox is a native `<dialog>` (Escape + focus return + backdrop), matching the other modals.
- Open follow-up (product decision, not done): Convex mutations are still unauthenticated — anyone with `PUBLIC_CONVEX_URL` can write/overwrite any member's RSVP and spam tables. Needs real auth or a rate-limiter (`@convex-dev/rate-limiter`) if content ever becomes sensitive.
