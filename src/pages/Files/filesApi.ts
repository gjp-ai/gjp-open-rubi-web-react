import { createOpenApiUrl, fetchOpenApiJson } from '../../shared/data/openApi'
import type { ApiPagedResponse, FileItem } from '../../shared/data/types'

export const getFiles = (page = 0, size = 60, lang?: string, signal?: AbortSignal) =>
  fetchOpenApiJson<ApiPagedResponse<FileItem>>(createOpenApiUrl('files', { page, size, lang }), { signal })
