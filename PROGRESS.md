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
- 2026-06-03: Code-quality / tooling pass.
  - Tooling stack: **oxlint** (lint, TS/JS only) + **Prettier** with `prettier-plugin-astro` (format). Configs: `.oxlintrc.json`, `.prettierrc.json`, `.prettierignore`. Scripts: `lint`, `format`, `format:check`, `test`. CI runs all of them before build.
  - oxlint cannot parse `.astro` (false unused-import errors), so `**/*.astro` is excluded from oxlint; Prettier owns `.astro` formatting.
  - Convex validators extracted to `convex/validation.ts` (pure, no Convex runtime dep) and unit-tested in `tests/validation.test.ts` via `bun test`. Tests live OUTSIDE `convex/` so a `bun:test` import does not break `convex deploy` typecheck.
  - Fonts load non-blocking: `media="print"` link (`#fonts-css`) promoted to `all` by an `is:inline` head script in `src/layouts/Base.astro`, with a `<noscript>` fallback. Used `is:inline` (not an `onload=` attribute) to avoid an Astro `ts(6133)` hint.
  - `src/scripts/app.ts` form reads/writes go through `fieldValue`/`fieldChecked`/`setField`/`setChecked` helpers instead of repeated `namedItem(...) as ...` casts.
- 2026-06-03: QA automation — Tier 1 test coverage added (proportionate; Tier 2 e2e/visual intentionally skipped for an 8-member hobby site).
  - Convex function tests in `tests/club.test.ts` via `convex-test` (in-memory DB), covering the branching logic the pure `validation.ts` tests don't reach: `updateRsvp` upsert + member-not-found, `addVacation` reversed/malformed dates, `addBacklogItem` author fallback, `getPageData` RSVP defaulting + ordering, join-application required fields.
  - `convex-test` runs under `bun test` (no Vitest) — its default `import.meta.glob` discovery is unavailable in Bun, so `tests/convexSetup.ts` builds the module map by hand (must include a `_generated` path). Keep that map in sync if new Convex function modules are added.
  - `tests/convexSetup.ts` also exports `expectReject(promise, substring)`; use it instead of `await expect(p).rejects.toThrow(...)`, which `astro check` flags because `bun-types` types `toThrow` as `void`.
  - Pure client logic extracted to `src/lib/club-logic.ts` (`canOpenDoor` door rule, `formatDate`, `countdownState`) and unit-tested in `tests/club-logic.test.ts`. `src/scripts/app.ts` now imports these instead of inlining them, so the tests guard the real code.
- Intentionally NOT changed: single big `getPageData` subscription (fine at 8 members), `.agents/skills/` (intentional agent tooling), countdown timezone logic (functionally correct).
- Open follow-up (product decision, not done): Convex mutations are still unauthenticated — anyone with `PUBLIC_CONVEX_URL` can write/overwrite any member's RSVP and spam tables. Needs real auth or a rate-limiter (`@convex-dev/rate-limiter`) if content ever becomes sensitive.
