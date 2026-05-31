# Features

## Site Shell

The public shell includes:

- fixed `SiteHeader`
- section navigation
- mobile drawer navigation
- theme toggle
- theme color picker
- language toggle
- footer populated from app settings

## Websites

Route: `/websites`

Displays website cards with logo, name, description, search, tag filtering,
sorting, and pagination. External website URLs are validated before rendering.

## Questions

Route: `/questions`

Displays Q&A content with search, tag filtering, sorting, pagination, syntax
highlighting, and safe YouTube embed conversion. Answer HTML is sanitized before
rendering.

## Articles

Routes:

- `/articles`
- `/articles/:id`

The article list displays summaries with cover images, tags, sorting, search,
and pagination. Article detail renders sanitized rich HTML, code highlighting,
copy-code buttons, hardened YouTube embeds, optional cover image display, and a
validated original-source link.

## Images

Route: `/images`

Displays image cards with search, tag filtering, sorting, pagination, and a
keyboard-aware preview modal. API-provided image URLs are validated before use.

## Audios

Route: `/audios`

Displays audio cards and an audio player with previous/next controls,
progress seeking, optional subtitles, and captions track support. Subtitle HTML
is sanitized before rendering.

## Videos

Route: `/videos`

Displays video cards with poster image, play control, captions track, download
link, tags, search, sorting, and pagination. API-provided video URLs are
validated before use.

## Files

Route: `/files`

Displays downloadable file cards with search, tag filtering, sorting, and
pagination. Download links are validated before rendering.

## App Settings

App settings are loaded by `AppSettingsProvider`, cached in `localStorage`, and
fetched once per browser session unless `reload()` is called.

## UI Preferences

`UIContext` owns theme, language, and theme color. These values persist in
`localStorage`. Route-specific search text is page-owned.
