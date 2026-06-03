# AGENTS.md

Instructions for coding agents working in this repository.

## Project

This is an Astro prototype for the **“Сплетни по понедельникам”** club website.

The site is a one-page community page with an office tabloid / corporate parody / meme chaos style. The primary language of the site is Russian. Mixed Russian/English corporate jargon is intentional and allowed.

The current public version is deployed with GitHub Pages on the custom domain:

- https://goss.im/
- https://goss.im/drama/

Repository:

- https://github.com/meafmira/gossip-monday

## Working memory

Use `PROGRESS.md` as persistent working memory for coding agents:

- read `PROGRESS.md` at the start of every task/session before making changes;
- log only findings, decisions, blockers, and follow-ups that are useful for future work;
- keep it concise and remove stale, duplicated, or unnecessary notes when encountered.

## Commands

```bash
bun install
bun run dev
bun run build
bun run preview
bun run deploy
bun run convex:dev
bun run convex:seed
bun run convex:deploy
```

This project uses Bun as the package manager. Keep `bun.lock` committed and do not reintroduce `package-lock.json` or `yarn.lock`.

Deploys happen automatically on every push to `main` via `.github/workflows/deploy.yml`.

`bun run deploy` can still be used for manual local deployment. It builds the site and publishes `dist/` to the `gh-pages` branch using the `gh-pages` CLI.

## Structure

- `src/pages/index.astro` — main one-page site.
- `src/pages/drama.astro` — secret `/drama` page with the club constitution and easter egg.
- `convex/` — Convex schema, backend functions, generated types, and seed data.
- `src/lib/api/` — frontend API abstraction layer. UI code must use this layer instead of importing Convex directly.
- `src/data/club.ts` — legacy/static content reference; shared live data is seeded from `convex/seedData.ts`.
- `src/styles/global.css` — all global styles.
- `public/favicon.svg` — favicon.
- `public/CNAME` — GitHub Pages custom domain (`goss.im`).
- `public/.nojekyll` — required for GitHub Pages so the `_astro` asset directory is not ignored.
- `astro.config.mjs` — Astro config, including `site: 'https://goss.im'` and `base: '/'`.

## Important technical details

### GitHub Pages and `_astro`

Astro outputs assets into the `_astro` directory. GitHub Pages/Jekyll may ignore directories starting with `_` unless `.nojekyll` exists.

Do **not** delete:

```text
public/.nojekyll
```

If it is removed, the site may load as unstyled HTML because CSS assets return 404.

### Base path

The site is published on its own domain, so the base path is:

```js
base: '/';
```

When adding internal links, keep using `import.meta.env.BASE_URL` helpers so local/dev and future hosting changes remain safe.

Pages currently use:

```js
const base = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;
```

### Deployment and old assets

Automatic deployment is configured in `.github/workflows/deploy.yml`:

- trigger: push to `main` or manual `workflow_dispatch`;
- setup: Node `24` for Astro compatibility, then `oven-sh/setup-bun@v2` with Bun `1.3.6`;
- build/backend deploy: `bun --dns-result-order=ipv4first install --frozen-lockfile --network-concurrency 1 --registry https://registry.npmjs.org`, then `bunx convex deploy --cmd "bun run build" --cmd-url-env-var-name PUBLIC_CONVEX_URL`;
- deploy target: `gh-pages` branch;
- action: `peaceiris/actions-gh-pages@v4`;
- `keep_files: true` is intentional so old hashed assets are not deleted.

The local `deploy` script in `package.json` uses `bunx gh-pages` with `--add` for the same reason. This reduces the chance that cached HTML points to a CSS file that no longer exists.

Do not change these without a good reason:

```bash
# GitHub Actions
keep_files: true

# local deploy
bunx gh-pages -d dist -b gh-pages -t --add
```

## Shared interactivity / Convex

Shared features are backed by Convex, not browser `localStorage`:

- RSVP board;
- office access alert;
- gossip backlog;
- vacation list;
- join applications;
- seeded members, reports, and gallery events.

Convex project details:

- project slug: `gossip-monday`;
- dev deployment: `curious-shepherd-470`;
- production deployment: `amicable-poodle-60`;
- production URL: `https://amicable-poodle-60.convex.cloud`;
- GitHub Actions secret `CONVEX_DEPLOY_KEY` is configured for production deploys.

Frontend code must not import `convex/*` directly from components or scripts. Always go through the abstraction layer in `src/lib/api/` (for example `createGossipApi()` from `src/lib/api/gossip.ts`). Direct Convex imports are allowed only inside `convex/` backend files and the `src/lib/api/` implementation.

Initial/stub data lives in `convex/seedData.ts` and is loaded with:

```bash
bun run convex:seed
```

The seed mutation is idempotent: it upserts seeded content and does not wipe user-created backlog items, vacations, RSVP updates, or join applications.

Local development requires `PUBLIC_CONVEX_URL` because Astro only exposes `PUBLIC_` variables to browser code. Run `bunx convex dev`, then copy `CONVEX_URL` from `.env.local` into `PUBLIC_CONVEX_URL`.

Production GitHub Actions deployment requires a `CONVEX_DEPLOY_KEY` secret. `convex deploy --cmd ... --cmd-url-env-var-name PUBLIC_CONVEX_URL` injects the production Convex URL into the Astro build.

GitHub Actions uses `bun --dns-result-order=ipv4first install ...` because the runner repeatedly hit socket errors while downloading new Convex-related tarballs with Bun's default DNS order.

## Content agreements

Site name:

- **Сплетни по понедельникам**

Tone:

- funny;
- sarcastic;
- harsh jokes are allowed;
- corporate parody;
- meme/tabloid energy.

Main meeting:

- MVP date: `04.05.2026`;
- time: `когда все морально готовы`;
- location: `Booking.com office`.

Members who can let people into the office:

- Олег Нечипоренко;
- Влад Лаухин;
- Мария Замжитская.

Members:

- Олег Нечипоренко;
- Лиза Панарина;
- Юлия Бокова;
- Влад Лаухин;
- Дими;
- Анастасия Кулакова;
- Мария Замжитская;
- Надин.

Member cards use joke roles and placeholder initial-based avatars. In the future, real photos can be placed in `public/` and referenced from Convex-backed member records / seed data.

## Privacy

The site is currently public because GitHub Pages for private repositories was not available on the current GitHub plan. The HTML includes:

```html
<meta name="robots" content="noindex, nofollow" />
```

This is not authentication and not real protection. If sensitive content is added, implement auth or move the site to hosting/backend with access control.

## Custom domain / HTTPS

GitHub Pages serves the site through the custom domain with HTTPS enabled:

```text
https://goss.im/
```

Keep this file committed so GitHub Pages preserves the domain on deploy:

```text
public/CNAME
```

The repository Pages settings should keep **Enforce HTTPS** enabled. If DNS is ever changed, point the domain back to the current GitHub Pages IPs before troubleshooting certificates:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Optional AAAA records:

```text
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

## Before replying to the user

If code or styles changed:

1. Run `bun run build`.
2. If Convex schema/functions changed, run `bun run convex:codegen` and ensure generated files are committed.
3. If changes should be published manually, deploy Convex first with `bun run convex:deploy`, then run `bun run deploy`; otherwise push to `main` and wait for the GitHub Actions deploy.
4. Check the live page with `curl` or a browser.

Keep final responses concise, but clearly mention file paths and URLs when they matter.
