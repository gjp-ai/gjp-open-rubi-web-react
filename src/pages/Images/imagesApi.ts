import { createOpenApiUrl, fetchOpenApiJson } from '../../shared/data/openApi'
import type { ApiPagedResponse, MediaItem } from '../../shared/data/types'

export const getImages = (page = 0, size = 60, lang?: string, signal?: AbortSignal) =>
  fetchOpenApiJson<ApiPagedResponse<MediaItem>>(createOpenApiUrl('images', { page, size, lang }), { signal })
