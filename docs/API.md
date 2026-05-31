# API

## API Client

Open API requests are built through:

- `src/shared/data/openApi.ts`
- `src/shared/data/openApiConfig.ts`
- `src/shared/data/types.ts`

Every request automatically includes the configured `channel` query parameter.
The base URL and channel are read from:

```env
VITE_OPEN_API_BASE_URL
VITE_OPEN_API_CHANNEL
```

## Response Shapes

All API responses use the shared envelope:

```ts
interface ApiListResponse<TData> {
  status: ApiStatus
  data: TData
  meta?: ApiMeta
}
```

Paginated endpoints return:

```ts
type ApiPagedResponse<TItem> = ApiListResponse<PagedData<TItem>>
```

## Endpoints

| Feature | Function | Endpoint | Params | Response Type | Owner |
| --- | --- | --- | --- | --- | --- |
| App settings | `getAppSettings` | `app-settings` | `channel` | `ApiListResponse<AppSetting[]>` | `shared/contexts/AppSettings/appSettingsApi.ts` |
| Websites | `getWebsites` | `websites` | `page`, `size`, `search`, `tag`, `lang`, `channel` | `ApiPagedResponse<Website>` | `pages/Websites/websitesApi.ts` |
| Questions | `getQuestions` | `questions` | `page`, `size`, `search`, `tag`, `lang`, `channel` | `ApiPagedResponse<Question>` | `pages/Questions/questionsApi.ts` |
| Articles | `getArticles` | `articles` | `page`, `size`, `lang`, `channel` | `ApiPagedResponse<ArticleSummary>` | `pages/Articles/articlesApi.ts` |
| Article detail | `getArticleById` | `articles/:id` | `channel` | `ApiListResponse<ArticleDetail>` | `pages/Articles/articlesApi.ts` |
| Images | `getImages` | `images` | `page`, `size`, `lang`, `channel` | `ApiPagedResponse<MediaItem>` | `pages/Images/imagesApi.ts` |
| Audios | `getAudios` | `audios` | `page`, `size`, `lang`, `channel` | `ApiPagedResponse<MediaItem>` | `pages/Audios/audiosApi.ts` |
| Videos | `getVideos` | `videos` | `page`, `size`, `lang`, `channel` | `ApiPagedResponse<MediaItem>` | `pages/Videos/videosApi.ts` |
| Files | `getFiles` | `files` | `page`, `size`, `lang`, `channel` | `ApiPagedResponse<FileItem>` | `pages/Files/filesApi.ts` |

## API Ownership Rules

- Page-owned endpoints belong beside the page in `src/pages/Xxx/xxxApi.ts`.
- Shared/global endpoints belong beside the shared feature that owns them.
- `shared/data/openApi.ts` should stay limited to reusable client helpers.
- Shared response and domain types live in `shared/data/types.ts`.

## Security Rules

- Sanitize API-provided HTML before rendering.
- Validate API-provided URLs before using them in `href`, `src`, media, or
  download attributes.
- YouTube embeds must pass the allowlist in `getSafeYoutubeEmbedUrl`.
