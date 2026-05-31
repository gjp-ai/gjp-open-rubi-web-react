# Security

## Dependency Auditing

Use:

```sh
npm audit --omit=dev
npm audit
```

`npm run check` runs linting, formatting checks, tests, and build.

## HTML Sanitization

API-provided HTML must be sanitized before rendering with
`dangerouslySetInnerHTML`.

Use:

```ts
import { sanitizeHtml } from '../shared/security/sanitizeHtml'
```

Current sanitized render paths:

- article content
- question answers
- audio subtitles

The sanitizer removes dangerous tags such as `script`, `iframe`, `object`, and
`embed`, and strips inline styles and event handlers.

## URL Validation

API-provided URLs must pass `getSafeUrl` before use in:

- `href`
- `src`
- `download`
- `audio`, `video`, `img`, `source`, and `track`

Only `http:` and `https:` URLs are accepted for absolute URLs. Relative URLs are
allowed only when the caller opts into that behavior.

## YouTube Embeds

Rich content can include YouTube embed placeholders. They are converted to
iframes only when `getSafeYoutubeEmbedUrl` accepts the URL.

Allowed host/path shape:

```text
https://www.youtube.com/embed/...
https://youtube.com/embed/...
https://www.youtube-nocookie.com/embed/...
```

Created iframes include:

- `sandbox`
- `loading="lazy"`
- `referrerpolicy="strict-origin-when-cross-origin"`
- a restricted `allow` policy

## Browser Storage

Feature-owned storage keys live beside the owning context:

```text
shared/contexts/AppSettings/appSettingsStorageKeys.ts
shared/contexts/UIContext/uiStorageKeys.ts
```

Current keys:

```text
localStorage:
- gjpapp_settings
- gjp.theme
- gjp.language
- gjp.themeColor

sessionStorage:
- gjpapp_settings_fetched
```

Do not store secrets in browser storage.

## Development Server

The Vite dev server is limited to localhost by default:

```ts
host: 'localhost'
cors: false
```

Only broaden host or CORS settings for intentional LAN/device testing.

## Tests

Security helper tests live in:

```text
src/shared/security/safeUrl.test.ts
src/shared/security/sanitizeHtml.test.ts
```
