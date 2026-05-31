# Architecture

## Overview

This app is a React, TypeScript, and Vite frontend for public Rubi Study
content. The architecture is feature-sliced by page, with shared infrastructure
kept small and explicit.

## Source Layout

```text
src/
├── app/                    # App shell, routes, layouts
├── pages/                  # Route feature modules
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
│   ├── highlight/          # Configured highlight.js instance
│   ├── hooks/              # Shared hooks
│   ├── security/           # Sanitization and URL validation helpers
│   ├── ui/                 # Primitive reusable controls
│   └── i18n.ts             # Translation registry and useT()
└── index.css               # Global tokens and base styles
```

## Routing And Layout

Routes are configured in `src/app/routes.tsx` and lazy-loaded with
`React.lazy()`. `PublicLayout` owns shell composition only:

```text
SiteHeader -> Outlet -> Footer
```

Reusable shell behavior lives in `shared/components`, currently including
`SiteHeader`, `Footer`, `Toolbar`, `ErrorBoundary`, and `NotFoundPage`.

## API Layer

`shared/data/openApi.ts` owns the Open API client helpers:

- base URL normalization
- query-string construction
- JSON fetch/error handling

Runtime API config lives in `shared/data/openApiConfig.ts` and is backed by
Vite env variables:

```env
VITE_OPEN_API_BASE_URL=/api/open/
VITE_OPEN_API_CHANNEL=Rubi
```

Page-owned endpoint wrappers live beside their pages as `xxxApi.ts`.

## Contexts

Context features use folder ownership:

```text
shared/contexts/AppSettings/
shared/contexts/UIContext/
```

Each context has a provider file, core context/type file, hook file, and
`index.ts` public entrypoint. Browser storage keys are feature-local in
`*StorageKeys.ts` files.

## Shared UI Layering

`shared/ui` contains primitive controls that should not know app routing,
layout, page conventions, or feature behavior.

`shared/components` contains app-aware composed components that may combine
primitive controls, contexts, translations, and layout conventions.

Dependency direction:

```text
shared/components -> shared/ui
shared/ui must not import from shared/components
```

## Data Fetching

Paginated pages use `shared/hooks/usePagedFetch.ts`. The hook centralizes:

- loading state
- error state
- AbortController cleanup
- language-based refetching
- pagination state

## Internationalization

Base translations live in `shared/i18n.ts`. Page-specific translations live in
`src/pages/Xxx/i18n.ts` and are registered into the shared registry.

Config files should use translation keys such as `labelKey`, not inline
bilingual labels.

## Security Helpers

API-provided HTML must be sanitized with `shared/security/sanitizeHtml.ts`.
API-provided URLs must be validated with `shared/security/safeUrl.ts` before
use in links, media elements, downloads, or embeds.

## Highlighting

Syntax highlighting uses `shared/highlight/highlight.ts`, which imports
`highlight.js/lib/core` and registers only selected languages. This avoids
shipping the full highlight.js bundle.
