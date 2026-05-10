# Сплетни по понедельникам

Astro-прототип сайта маленького gossip-клуба.

## Что есть в MVP

- One-page сайт на русском с ru/en корпоративным жаргоном.
- Стиль: office tabloid + corporate parody + meme details.
- Countdown до встречи 04.05.2026.
- RSVP board с обновлением статуса каждого участника.
- Office access alert: показывает, кто может пустить людей в Booking.com office.
- Gossip backlog с формой добавления темы.
- Vacation intelligence с формой отсутствий.
- Карточки 8 участников.
- Reports, gallery по событиям, правила/традиции, join form.
- Секретная страница `/drama` с конституцией клуба и пасхалкой.

## Важно про интерактивность

Сейчас данные форм сохраняются в `localStorage` браузера. Это удобно для быстрого прототипа, но не синхронизируется между участниками.

Следующий шаг для настоящей общей версии: подключить Supabase или другой backend.

## Команды

```bash
bun install
bun run dev
bun run build
bun run preview
bun run deploy
```

## Деплой

Сайт опубликован через GitHub Pages из ветки `gh-pages` на custom domain с включенным HTTPS.

URL:

- https://goss.im/
- https://goss.im/drama/

Деплой происходит автоматически при push в `main` через GitHub Actions.

Чтобы обновить опубликованную версию вручную локально:

```bash
bun run deploy
```

## Где менять контент

- Участники, backlog, reports, gallery: `src/data/club.ts`
- Главная страница: `src/pages/index.astro`
- Секретная страница: `src/pages/drama.astro`
- Стили: `src/styles/global.css`
