# AGENTS.md

Инструкции для coding agents, работающих с этим репозиторием.

## Проект

Это Astro-прототип сайта клуба **«Сплетни по понедельникам»**.

Сайт — one-page community page в стиле office tabloid / corporate parody / meme chaos. Основной язык — русский, допустим смешанный ru/en корпоративный жаргон.

Публичная версия сейчас опубликована через GitHub Pages:

- http://meafmira.me/gossip-monday/
- http://meafmira.me/gossip-monday/drama/

Репозиторий:

- https://github.com/meafmira/gossip-monday

## Команды

```bash
npm install
npm run dev
npm run build
npm run preview
npm run deploy
```

`npm run deploy` билдит сайт и публикует `dist/` в ветку `gh-pages` через `gh-pages` CLI.

## Структура

- `src/pages/index.astro` — главная one-page страница.
- `src/pages/drama.astro` — секретная страница `/drama` с конституцией клуба и пасхалкой.
- `src/data/club.ts` — участники, backlog, reports, gallery events.
- `src/styles/global.css` — все глобальные стили.
- `public/favicon.svg` — favicon.
- `public/.nojekyll` — обязательно для GitHub Pages, чтобы папка `_astro` не игнорировалась.
- `astro.config.mjs` — Astro config, включая `base: '/gossip-monday'`.

## Важные технические детали

### GitHub Pages и `_astro`

Astro кладёт ассеты в папку `_astro`. GitHub Pages/Jekyll может игнорировать папки, начинающиеся с `_`, если нет `.nojekyll`.

Поэтому **не удалять**:

```text
public/.nojekyll
```

Иначе сайт откроется как голый HTML без CSS.

### Base path

Сайт опубликован как project page, поэтому базовый путь:

```js
base: '/gossip-monday'
```

При добавлении внутренних ссылок не хардкодить `/drama`, `/favicon.svg` и т.п. без учёта `import.meta.env.BASE_URL`.

На страницах уже используется:

```js
const base = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;
```

### Деплой и старые ассеты

В `package.json` deploy использует `gh-pages` с `--add`, чтобы не удалять старые hashed assets. Это снижает риск, что кешированный HTML будет ссылаться на CSS, который уже удалён.

Не менять без причины:

```bash
npx gh-pages -d dist -b gh-pages -t --add
```

## Интерактивность MVP

Сейчас формы и интерактивные списки работают через `localStorage`:

- RSVP board;
- gossip backlog;
- vacation list.

Это значит, что данные сохраняются только в браузере пользователя и **не синхронизируются между участниками**.

Для настоящей общей версии следующий логичный шаг — Supabase:

- общие RSVP;
- общий gossip backlog;
- vacation calendar;
- будущая авторизация через magic link / Google / Apple.

## Контентные договорённости

Название сайта:

- **Сплетни по понедельникам**

Тон:

- смешной;
- саркастичный;
- можно жёстко;
- corporate parody;
- meme/tabloid energy.

Основная встреча:

- дата MVP: `04.05.2026`;
- время: `когда все морально готовы`;
- место: `Booking.com office`.

Люди, которые могут пустить в офис:

- Олег Нечипоренко;
- Влад Лаухин;
- Мария Замжитская.

Участники:

- Олег Нечипоренко;
- Лиза Панарина;
- Юлия Бокова;
- Влад Лаухин;
- Дими;
- Анастасия Кулакова;
- Мария Замжитская;
- Надин.

Карточки участников используют шуточные роли и placeholder-аватары с инициалами. В будущем реальные фото можно положить в `public/` и добавить пути в `src/data/club.ts`.

## Privacy

Сайт сейчас публичный из-за ограничений GitHub Pages для приватных репозиториев на текущем плане. В HTML добавлен:

```html
<meta name="robots" content="noindex, nofollow" />
```

Это не пароль и не защита. Если появится чувствительный контент, нужно добавить auth или перенести на backend/hosting с доступом.

## Custom domain / HTTPS

GitHub Pages сейчас отдаёт сайт через custom domain аккаунта:

```text
http://meafmira.me/gossip-monday/
```

HTTPS на `meafmira.me` на момент создания файла не работает корректно из-за сертификата. DNS домена смотрит на старые GitHub Pages IP:

```text
192.30.252.153
192.30.252.154
```

Для нормального HTTPS нужно обновить A records на актуальные GitHub Pages IP:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Опционально AAAA:

```text
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

После DNS propagation включить **Enforce HTTPS** в `meafmira/meafmira.github.io → Settings → Pages`.

## Перед ответом пользователю

Если менялись код или стили:

1. Запустить `npm run build`.
2. Если изменения должны быть опубликованы — запустить `npm run deploy`.
3. Проверить живую страницу через `curl` или браузер.

Будь кратким в финальных ответах, но явно указывай пути файлов и URL, если они важны.
