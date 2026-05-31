import { createOpenApiUrl, fetchOpenApiJson } from '../../shared/data/openApi'
import type { ApiPagedResponse, Website } from '../../shared/data/types'

export const getWebsites = (page = 0, size = 60, search?: string, tag?: string, lang?: string, signal?: AbortSignal) =>
  fetchOpenApiJson<ApiPagedResponse<Website>>(createOpenApiUrl('websites', { page, size, search, tag, lang }), {
    signal,
  })
