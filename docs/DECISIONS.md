# Architecture Decisions

## Page-Owned API Wrappers

Endpoint wrappers such as `getArticles` live beside the page that owns them.
This keeps feature contracts easy to find and prevents `shared/data/openApi.ts`
from becoming a large endpoint registry.

## Core Open API Client

`shared/data/openApi.ts` owns only reusable client behavior: URL creation,
channel query insertion, JSON fetching, and error handling. Environment config
lives in `openApiConfig.ts`.

## Context Feature Folders

Contexts with provider, core type, hook, storage keys, and API helpers use a
folder with an `index.ts` public entrypoint. This keeps related behavior
together while preserving React Fast Refresh boundaries.

## Feature-Local Storage Keys

Browser storage keys are implementation details of the owning feature. They are
kept in feature-local `*StorageKeys.ts` files instead of inline in providers or
in a broad global constants file.

## `shared/ui` And `shared/components`

`shared/ui` contains primitive reusable controls. `shared/components` contains
app-aware composed components. Dependencies flow from components to ui, not the
other way around.

## Page-Owned Search Text

Search text is owned by each page. This prevents search state from leaking
between routes such as Websites, Articles, Images, and Files.

## I18n Keys In Config

Config files use translation keys such as `labelKey`. Visible text lives in the
i18n registry so adding languages remains centralized.

## Security Helpers

Rich HTML and API-provided URLs are treated as untrusted. HTML is sanitized with
DOMPurify and URLs are validated before rendering.

## Curated Highlight.js Imports

The app imports `highlight.js/lib/core` and registers selected languages. This
replaced the full highlight.js bundle and removed the Vite large chunk warning.
