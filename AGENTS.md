# Engineering Harness

This project uses a lightweight local harness to keep generated and hand-written
changes maintainable.

## Architecture

```
src/
├── app/                    # Application shell (App, routes, layouts)
├── pages/                  # Feature-sliced page modules
│   └── Xxx/
│       ├── XxxPage.tsx          # Page component
│       ├── xxxApi.ts            # Page-owned endpoint wrappers
│       ├── xxx.css              # Page-scoped styles
│       ├── i18n.ts              # Page-specific translations
│       └── components/          # Page-private components
├── shared/
│   ├── components/         # App-aware composed components (Footer, SiteHeader, Toolbar)
│   ├── contexts/           # React Context features; multi-file contexts may use folders
│   ├── data/               # Open API client/config helpers + shared types
│   ├── hooks/              # Shared custom hooks (usePagedFetch, etc.)
│   ├── i18n.ts             # Translation registry + useT()
│   └── ui/                 # Primitive reusable controls (Pagination, SearchBar)
└── index.css               # Global design tokens & base styles
```

### Key Patterns

- **Context split**: `xxxContextCore.ts` (types + createContext) →
  `XxxContext.tsx` (Provider with state) → `useXxx.ts` (consumer hook).
  This preserves React Fast Refresh on Provider edits. When a context has
  supporting API/cache/helper files, keep the context feature in one folder and
  expose it through an `index.ts` barrel, as with `contexts/AppSettings/` and
  `contexts/UIContext/`.
- **Page structure**: Every list page follows
  `Toolbar → skeleton / error / (Grid + Pagination)`.
- **Layouts**: Route layouts in `src/app/layouts/` compose the application
  shell. App-aware reusable shell parts such as `SiteHeader` and `Footer` live
  in `shared/components`.
- **Shared UI layering**: `shared/ui` contains primitive reusable controls that
  do not know app layout, routing, page conventions, or feature behavior.
  `shared/components` contains app-aware composed components that may combine
  primitives, contexts, translations, and layout conventions. Dependencies flow
  from `shared/components` to `shared/ui`; `shared/ui` must not import from
  `shared/components`.
- **API layer**: `shared/data/openApi.ts` contains only Open API client helpers
  such as URL creation and JSON fetching. Open API environment values live in
  `shared/data/openApiConfig.ts` and are maintained through Vite `.env` files.
  Page-owned endpoint functions live beside their page modules as `xxxApi.ts`.
  Shared/global endpoint functions live beside the shared feature that owns
  them. Response types live in `shared/data/types.ts`.
- **Translations**: Page-local i18n files register into `shared/i18n.ts`.
  Access translations with `useT()`.
- **Data fetching**: Paginated list pages use the `usePagedFetch` hook from
  `shared/hooks/usePagedFetch.ts` for consistent loading, error, and
  pagination state management.

## Quality Gate

Run before committing UI, data, routing, or infrastructure changes:

```sh
npm run check
```

`npm run check` runs:

- `npm run lint`
- `npm run format:check`
- `npm run test`
- `npm run build`

## Code Rules

- Follow the **Page → Toolbar → Grid → Card** component hierarchy.
- Page styles go in `src/pages/Xxx/xxx.css`; shared tokens stay in `index.css`.
- Contexts use the **3-file pattern**; never put Provider logic in the Core file.
  Keep multi-file context features in one folder with an `index.ts` entrypoint.
- Keep feature-owned browser storage keys in a feature-local `*StorageKeys.ts`
  file, such as `appSettingsStorageKeys.ts` or `uiStorageKeys.ts`, instead of
  inline in providers or in a broad global constants file.
- Keep route-specific search text in the owning page, not in `UIContext`.
- Page translations go in `src/pages/Xxx/i18n.ts` and register in `shared/i18n.ts`.
- Keep visible text in the i18n registry. Config files should reference
  translation keys such as `labelKey`, not inline bilingual labels.
- API-provided HTML must be sanitized through `shared/security/sanitizeHtml.ts`
  before rendering. API-provided URLs used in `href`, `src`, embeds, downloads,
  or media elements must be validated through `shared/security/safeUrl.ts`.
- Keep `shared/data/openApi.ts` limited to reusable Open API client helpers.
- Maintain `VITE_OPEN_API_BASE_URL` and `VITE_OPEN_API_CHANNEL` in `.env.*`.
- Put page-owned endpoint functions in `src/pages/Xxx/xxxApi.ts`; put shared
  endpoint functions beside the shared feature that owns them.
- Keep route layouts focused on shell composition; move reusable header/footer
  behavior into `shared/components`.
- Every list page must use `<Pagination>` from `shared/ui/`.
- Put primitive controls in `shared/ui`; put app-aware composed components in
  `shared/components`.
- `shared/components` may import from `shared/ui`; `shared/ui` must not import
  from `shared/components`.
- Keep tiny private helpers inline only while the parent remains easy to scan.
  Extract JSX helpers such as icons into sibling files when the parent component
  already owns meaningful state, effects, or layout branches.
- Skeleton loading states must use the `.skeleton` CSS utility classes.
- Search / tag-filter / sort come from `<Toolbar>` — no per-page alternatives.
- Paginated data fetching uses `usePagedFetch` from `shared/hooks/`.
- Avoid `any`; API types live in `shared/data/types.ts`.
- Preserve bilingual i18n behavior when adding visible labels.
- Verify dark and light mode for all UI changes.
- Keep cards and layouts dimensionally stable across desktop and mobile.

## Error Handling

- The app is wrapped with an `ErrorBoundary` to isolate component crashes.
- API errors show `.status--error` with a clear message.
- Paginated API requests use AbortController cleanup through `usePagedFetch`.
  Direct `useEffect` requests should add cleanup when the request can outlive
  the component or be replaced by a newer request.
- Never swallow errors silently — always surface them in the UI or console.

## Performance

- Page components are lazy-loaded with `React.lazy()` for route-level code splitting.
- All `<img>` tags must use `loading="lazy"`.
- Monitor bundle size with `npx vite-bundle-visualizer` before major merges.
- Prefer CSS transitions over JS animations for hover/focus effects.
- API responses use server-side pagination; avoid client-side-only paging.

## Accessibility

- Interactive elements need `aria-label` or visible text.
- Modals and drawers must trap focus and restore it on close.
- Images must have meaningful `alt` text.
- Keyboard: all clickable elements reachable via Tab.
- Color contrast must meet WCAG AA.

## Review Checklist

- [ ] The app builds without TypeScript errors.
- [ ] ESLint passes without unused disable comments.
- [ ] Prettier formatting passes (`npm run format:check`).
- [ ] New UI states have hover, focus, loading, empty, and dark-mode behavior.
- [ ] Shared behavior is changed in shared modules; page-specific stays in page modules.
- [ ] Generated code follows the existing naming, routing, and CSS conventions.
- [ ] Error and empty states render correctly.
- [ ] New API types are added to `shared/data/types.ts`.
- [ ] Page translations are registered in `shared/i18n.ts`.
- [ ] Accessibility: labels, keyboard, focus management verified.
- [ ] No regressions on mobile breakpoints (≤767px).
