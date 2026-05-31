# Rubi Study Web React

React, TypeScript, and Vite frontend for the Rubi public content site.

## Setup

```sh
npm install
npm run dev
```

The dev server runs with the Vite config in `vite.config.ts`. Development API
requests use the relative `/api/open/` base URL so the Vite proxy can avoid
browser CORS issues.

## Environment

Open API runtime values are maintained in Vite env files:

```env
VITE_OPEN_API_BASE_URL=/api/open/
VITE_OPEN_API_CHANNEL=Rubi
```

Production uses:

```env
VITE_OPEN_API_BASE_URL=https://www.ganjianping.com/api/open/
VITE_OPEN_API_CHANNEL=Rubi
```

The app reads these values through `src/shared/data/openApiConfig.ts`.

## Scripts

```sh
npm run dev           # Start local Vite dev server
npm run build         # Type-check and build production assets
npm run lint          # Run ESLint
npm run format        # Format source files with Prettier
npm run format:check  # Check Prettier formatting
npm run test          # Run Vitest tests
npm run check         # Run lint, format:check, and build
npm run preview       # Preview production build
```

Run `npm run check` before committing UI, data, routing, or infrastructure
changes.

## Project Structure

```text
src/
├── app/                    # App shell, routes, layouts
├── pages/                  # Feature-sliced page modules
│   └── Xxx/
│       ├── XxxPage.tsx
│       ├── xxxApi.ts
│       ├── xxx.css
│       ├── i18n.ts
│       └── components/
├── shared/
│   ├── components/         # App-aware composed components
│   ├── contexts/           # Context feature folders
│   ├── data/               # Open API client/config and shared types
│   ├── hooks/              # Shared hooks
│   ├── i18n.ts             # Translation registry and useT()
│   └── ui/                 # Primitive reusable controls
└── index.css               # Global tokens and base styles
```

## Architecture Notes

- `shared/data/openApi.ts` contains only reusable Open API client helpers.
- Page-owned endpoint wrappers live beside pages as `src/pages/Xxx/xxxApi.ts`.
- Context features such as `AppSettings` and `UIContext` live in folders with an
  `index.ts` public entrypoint.
- `shared/ui` contains primitive controls; `shared/components` contains
  app-aware composed components such as `SiteHeader`, `Footer`, and `Toolbar`.
- Visible text belongs in the i18n registry. Config files should reference
  translation keys instead of inline bilingual labels.
- API-provided HTML must go through `shared/security/sanitizeHtml.ts`, and
  API-provided URLs must go through `shared/security/safeUrl.ts`.
- Route-specific search text is owned by the page, not by global UI context.

For detailed contribution and code-generation rules, see `AGENTS.md`.
