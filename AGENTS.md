# AGENTS.md

Instructions for coding agents working in this repository.

## Project

This is an Astro prototype for the **“Сплетни по понедельникам”** club website.

The site is a one-page community page with an office tabloid / corporate parody / meme chaos style. The primary language of the site is Russian. Mixed Russian/English corporate jargon is intentional and allowed.

The current public version is deployed with GitHub Pages:

- http://meafmira.me/gossip-monday/
- http://meafmira.me/gossip-monday/drama/

Repository:

- https://github.com/meafmira/gossip-monday

## Commands

```bash
bun install
bun run dev
bun run build
bun run preview
bun run deploy
```

This project uses Bun as the package manager. Keep `bun.lock` committed and do not reintroduce `package-lock.json` or `yarn.lock`.

Deploys happen automatically on every push to `main` via `.github/workflows/deploy.yml`.

`bun run deploy` can still be used for manual local deployment. It builds the site and publishes `dist/` to the `gh-pages` branch using the `gh-pages` CLI.

## Structure

- `src/pages/index.astro` — main one-page site.
- `src/pages/drama.astro` — secret `/drama` page with the club constitution and easter egg.
- `src/data/club.ts` — members, backlog items, reports, gallery events.
- `src/styles/global.css` — all global styles.
- `public/favicon.svg` — favicon.
- `public/.nojekyll` — required for GitHub Pages so the `_astro` asset directory is not ignored.
- `astro.config.mjs` — Astro config, including `base: '/gossip-monday'`.

## Important technical details

### GitHub Pages and `_astro`

Astro outputs assets into the `_astro` directory. GitHub Pages/Jekyll may ignore directories starting with `_` unless `.nojekyll` exists.

Do **not** delete:

```text
public/.nojekyll
```

If it is removed, the site may load as unstyled HTML because CSS assets return 404.

### Base path

The site is published as a GitHub project page, so the base path is:

```js
base: '/gossip-monday'
```

When adding internal links, do not hardcode `/drama`, `/favicon.svg`, etc. without considering `import.meta.env.BASE_URL`.

Pages currently use:

```js
const base = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;
```

### Deployment and old assets

Automatic deployment is configured in `.github/workflows/deploy.yml`:

- trigger: push to `main` or manual `workflow_dispatch`;
- setup: `oven-sh/setup-bun@v2` with Bun `1.3.6`;
- build: `bun install --frozen-lockfile` and `bun run build`;
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

## MVP interactivity

Current forms and interactive lists use browser `localStorage`:

- RSVP board;
- gossip backlog;
- vacation list.

This means data is stored only in the current user’s browser and is **not synchronized between members**.

The logical next step for a real shared version is Supabase:

- shared RSVP;
- shared gossip backlog;
- vacation calendar;
- future auth via magic link / Google / Apple.

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

Member cards use joke roles and placeholder initial-based avatars. In the future, real photos can be placed in `public/` and referenced from `src/data/club.ts`.

## Privacy

The site is currently public because GitHub Pages for private repositories was not available on the current GitHub plan. The HTML includes:

```html
<meta name="robots" content="noindex, nofollow" />
```

This is not authentication and not real protection. If sensitive content is added, implement auth or move the site to hosting/backend with access control.

## Custom domain / HTTPS

GitHub Pages currently serves the site through the account custom domain:

```text
http://meafmira.me/gossip-monday/
```

At the time this file was written, HTTPS for `meafmira.me` does not work correctly because the certificate does not match the domain. DNS points to old GitHub Pages IPs:

```text
192.30.252.153
192.30.252.154
```

For proper HTTPS, update the domain A records to the current GitHub Pages IPs:

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

After DNS propagation, enable **Enforce HTTPS** in `meafmira/meafmira.github.io → Settings → Pages`.

## Before replying to the user

If code or styles changed:

1. Run `bun run build`.
2. If changes should be published manually, run `bun run deploy`; otherwise push to `main` and wait for the GitHub Actions deploy.
3. Check the live page with `curl` or a browser.

Keep final responses concise, but clearly mention file paths and URLs when they matter.
