import { createOpenApiUrl, fetchOpenApiJson } from '../../shared/data/openApi'
import type { ApiListResponse, ApiPagedResponse, ArticleDetail, ArticleSummary } from '../../shared/data/types'

export const getArticles = (page = 0, size = 60, lang?: string, signal?: AbortSignal) =>
  fetchOpenApiJson<ApiPagedResponse<ArticleSummary>>(createOpenApiUrl('articles', { page, size, lang }), { signal })

export const getArticleById = (id: string) =>
  fetchOpenApiJson<ApiListResponse<ArticleDetail>>(createOpenApiUrl(`articles/${id}`))
