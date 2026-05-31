import { createOpenApiUrl, fetchOpenApiJson } from '../../shared/data/openApi'
import type { ApiPagedResponse, Question } from '../../shared/data/types'

export const getQuestions = (page = 0, size = 60, search?: string, tag?: string, lang?: string, signal?: AbortSignal) =>
  fetchOpenApiJson<ApiPagedResponse<Question>>(createOpenApiUrl('questions', { page, size, search, tag, lang }), {
    signal,
  })
