import { createOpenApiUrl, fetchOpenApiJson } from '../../shared/data/openApi'
import type { ApiListResponse, ApiPagedResponse, EduLearningItem, EduQuestion, EduQuestionImage } from '../../shared/data/types'

export type EduLearningKind = 'vocabularies' | 'phrases' | 'sentences'
export type EduQuestionKind = 'multiple-choice-questions' | 'fill-blank-questions' | 'free-text-questions' | 'true-false-questions'

export interface EduLearningFilters {
  term?: string
  week?: string
  partOfSpeech?: string
  difficultyLevel?: string
}

export interface EduQuestionFilters {
  difficultyLevel?: string
  gradeLevel?: string
  subject?: string
  topic?: string
  term?: string
  week?: string
}

const learningPaths: Record<EduLearningKind, string> = {
  vocabularies: 'edu-vocabularies',
  phrases: 'edu-phrases',
  sentences: 'edu-sentences',
}

const questionPaths: Record<EduQuestionKind, string> = {
  'multiple-choice-questions': 'edu-multiple-choice-questions',
  'fill-blank-questions': 'edu-fill-blank-questions',
  'free-text-questions': 'edu-free-text-questions',
  'true-false-questions': 'edu-true-false-questions',
}

export const getEduLearningItems = (
  kind: EduLearningKind,
  page = 0,
  size = 60,
  search?: string,
  tag?: string,
  lang?: string,
  signal?: AbortSignal,
  filters?: EduLearningFilters,
) =>
  fetchOpenApiJson<ApiPagedResponse<EduLearningItem>>(
    createOpenApiUrl(learningPaths[kind], { page, size, name: search, tags: tag, lang, ...filters }),
    { signal },
  )

export const getEduQuestions = (
  kind: EduQuestionKind,
  page = 0,
  size = 60,
  search?: string,
  tag?: string,
  lang?: string,
  signal?: AbortSignal,
  filters?: EduQuestionFilters,
) =>
  fetchOpenApiJson<ApiPagedResponse<EduQuestion>>(
    createOpenApiUrl(questionPaths[kind], { page, size, question: search, tags: tag, lang, ...filters }),
    { signal },
  )

export const getEduQuestionImages = (
  referenceKey?: keyof Pick<
    EduQuestionImage,
    'multipleChoiceQuestionId' | 'freeTextQuestionId' | 'trueFalseQuestionId' | 'fillBlankQuestionId'
  >,
  questionId?: string,
  lang?: string,
  signal?: AbortSignal,
) =>
  fetchOpenApiJson<ApiListResponse<EduQuestionImage[]>>(
    createOpenApiUrl('edu-question-images', {
      ...(referenceKey && questionId ? { [referenceKey]: questionId } : {}),
      lang,
    }),
    { signal },
  )

export const toggleEduLearningFavoriteTag = (kind: EduLearningKind, id: string) =>
  fetchOpenApiJson<ApiListResponse<EduLearningItem>>(
    createOpenApiUrl(`${learningPaths[kind]}/${id}/favorite-tag`),
    { method: 'PATCH' },
  )

export const toggleEduQuestionFavoriteTag = (kind: EduQuestionKind, id: string) =>
  fetchOpenApiJson<ApiListResponse<EduQuestion>>(
    createOpenApiUrl(`${questionPaths[kind]}/${id}/favorite-tag`),
    { method: 'PATCH' },
  )
