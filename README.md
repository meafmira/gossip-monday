# Сплетни по понедельникам

Astro-сайт маленького gossip-клуба с общими данными в Convex.

## Что есть в MVP

- One-page сайт на русском с ru/en корпоративным жаргоном.
- Стиль: office tabloid + corporate parody + meme details.
- Countdown до встречи 04.05.2026.
- RSVP board с синхронизацией между участниками.
- Office access alert: показывает, кто может пустить людей в Booking.com office.
- Gossip backlog с формой добавления темы.
- Vacation intelligence с формой отсутствий.
- Карточки 8 участников.
- Reports, gallery по событиям, правила/традиции, join form.
- Секретная страница `/drama` с конституцией клуба и пасхалкой.

## Данные и интерактивность

Shared state хранится в Convex, а не в `localStorage`:

- RSVP;
- gossip backlog;
- vacation list;
- join applications;
- members/reports/gallery seed data.

Convex project:

- project slug: `gossip-monday`
- dev deployment: `curious-shepherd-470`
- production deployment: `amicable-poodle-60`
- production URL: `https://amicable-poodle-60.convex.cloud`

Frontend не импортирует Convex напрямую из компонентов или `src/scripts/app.ts`. Весь доступ идёт через слой `src/lib/api/`.

Initial data лежит в `convex/seedData.ts` и загружается idempotent seed mutation:

```bash
bun run convex:seed
```

## Локальная разработка

```bash
bun install
bunx convex dev
```

`convex dev` создаст `.env.local` с `CONVEX_URL`. Astro отдаёт в браузер только переменные с префиксом `PUBLIC_`, поэтому добавьте в `.env.local`:

```bash
PUBLIC_CONVEX_URL=<значение CONVEX_URL>
```

Затем в отдельных терминалах:

```bash
bun run convex:seed
bun run dev
```

## Команды

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

## Деплой

Сайт опубликован через GitHub Pages из ветки `gh-pages` на custom domain с включенным HTTPS.

URL:

- https://goss.im/
- https://goss.im/drama/

Деплой происходит автоматически при push в `main` через GitHub Actions.

GitHub Actions должен иметь secret:

```text
CONVEX_DEPLOY_KEY
```

Secret `CONVEX_DEPLOY_KEY` is configured in GitHub for the production deployment. Workflow деплоит Convex, собирает Astro с production `PUBLIC_CONVEX_URL`, запускает seed и публикует `dist/` в `gh-pages`.

Чтобы обновить опубликованную версию вручную локально:

```bash
bun run deploy
```

## Где менять код и контент

- Convex schema/functions/seed data: `convex/`
- Frontend API abstraction: `src/lib/api/`
- Главная страница: `src/pages/index.astro`
- Секретная страница: `src/pages/drama.astro`
- Стили: `src/styles/global.css`
