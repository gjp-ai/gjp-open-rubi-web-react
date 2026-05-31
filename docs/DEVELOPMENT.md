# Development

## Setup

```sh
npm install
npm run dev
```

The Vite dev server uses port `3001` and is bound to `localhost`.

## Environment

Development:

```env
VITE_OPEN_API_BASE_URL=/api/open/
VITE_OPEN_API_CHANNEL=Rubi
```

Production:

```env
VITE_OPEN_API_BASE_URL=https://www.ganjianping.com/api/open/
VITE_OPEN_API_CHANNEL=Rubi
```

Development API requests use the Vite proxy in `vite.config.ts`.

## Scripts

```sh
npm run dev
npm run lint
npm run format
npm run format:check
npm run test
npm run build
npm run check
npm run preview
```

`npm run check` runs:

```text
lint -> format:check -> test -> build
```

Run it before committing UI, data, routing, infrastructure, or security-helper
changes.

## Adding A Page

Create:

```text
src/pages/Xxx/
├── XxxPage.tsx
├── xxxApi.ts
├── xxx.css
├── i18n.ts
└── components/
```

Then:

1. Add a lazy route in `src/app/routes.tsx`.
2. Add nav metadata in `shared/components/SiteHeader/siteHeaderLinks.ts` if it
   should appear in the header.
3. Add translations to the page `i18n.ts` or shared `i18n.ts`.
4. Use `usePagedFetch` for paginated API data.

## API Work

- Keep the API client in `shared/data/openApi.ts`.
- Put page endpoint wrappers in page-local `xxxApi.ts`.
- Add or update types in `shared/data/types.ts`.

## Security Work

- Use `sanitizeHtml` for all API-provided HTML.
- Use `getSafeUrl` for API-provided URLs.
- Add tests for new sanitizer or URL validation behavior.

## Bundle Checks

The app uses a curated highlight.js core setup in `shared/highlight/highlight.ts`
to avoid shipping the full highlight.js bundle.

If Vite reports a large chunk warning, inspect `dist/assets` and prefer code
splitting, curated imports, or manual chunks over raising the warning limit.
