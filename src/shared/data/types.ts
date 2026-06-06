export interface ApiStatus {
  code: number
  message: string
  errors: string | null
}

export interface ApiMeta {
  serverDateTime: string
}

export interface ApiListResponse<TData> {
  status: ApiStatus
  data: TData
  meta?: ApiMeta
}

export interface PagedData<TItem> {
  content: TItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type ApiPagedResponse<TItem> = ApiListResponse<PagedData<TItem>>

export interface AppSetting {
  name: string
  value: string
  lang: 'EN' | 'ZH'
}

export interface Website {
  id: string
  name: string
  url: string
  logoUrl: string
  description: string
  tags: string
  lang: 'EN' | 'ZH'
  displayOrder: number
  updatedAt: string
}

export interface Question {
  id: string
  question: string
  answer: string
  tags: string
  lang: 'EN' | 'ZH'
  displayOrder: number
  updatedAt: string
}

export interface ArticleSummary {
  id: string
  title: string
  summary: string
  originalUrl: string
  sourceName: string
  coverImageOriginalUrl: string | null
  coverImageUrl: string | null
  tags: string
  lang: 'EN' | 'ZH'
  displayOrder: number
  updatedAt: string
}

export interface ArticleDetail extends ArticleSummary {
  content: string
  coverImageFilename: string | null
  createdBy: string
  updatedBy: string
  isActive: boolean
  createdAt: string
}

export interface MediaItem {
  id: string
  name?: string
  title?: string
  subtitle?: string | null
  description?: string | null
  url: string
  thumbnailUrl?: string | null
  originalUrl?: string | null
  coverImageUrl?: string | null
  coverImageOriginalUrl?: string | null
  altText?: string | null
  captionsUrl?: string | null
  tags: string
  artist?: string
  lang: 'EN' | 'ZH'
  displayOrder: number
  updatedAt: string
}

export interface FileItem {
  id: string
  name: string
  description: string | null
  url: string
  originalUrl: string | null
  tags: string
  lang: 'EN' | 'ZH'
  displayOrder: number
  updatedAt: string
}

export interface EduLearningItem {
  id: string
  name: string
  phonetic?: string | null
  phoneticUs?: string | null
  phoneticUk?: string | null
  phoneticAudioUrl?: string | null
  phoneticUsAudioUrl?: string | null
  phoneticUkAudioUrl?: string | null
  partOfSpeech?: string | null
  synonyms?: string | null
  translation?: string | null
  meaningClue?: string | null
  meaning?: string | null
  easyMeaning?: string | null
  sentenceOne?: string | null
  sentenceTwo?: string | null
  explanation?: string | null
  difficultyLevel?: string | null
  dictionaryUrl?: string | null
  additionalInfo?: string | null
  term?: number | null
  week?: number | null
  channel?: string | null
  tags?: string | null
  lang: 'EN' | 'ZH'
  displayOrder: number
  updatedAt: string
}

export interface EduQuestion {
  id: string
  question: string
  optionA?: string | null
  optionB?: string | null
  optionC?: string | null
  optionD?: string | null
  answer?: string | null
  description?: string | null
  questionA?: string | null
  answerA?: string | null
  questionB?: string | null
  answerB?: string | null
  questionC?: string | null
  answerC?: string | null
  questionD?: string | null
  answerD?: string | null
  questionE?: string | null
  answerE?: string | null
  questionF?: string | null
  answerF?: string | null
  explanation?: string | null
  difficultyLevel?: string | null
  failCount?: number | null
  successCount?: number | null
  gradeLevel?: string | null
  subject?: string | null
  topic?: string | null
  term?: number | null
  week?: number | null
  channel?: string | null
  tags?: string | null
  lang: 'EN' | 'ZH'
  displayOrder: number
  updatedAt: string
}

export interface EduQuestionImage {
  id: string
  multipleChoiceQuestionId?: string | null
  freeTextQuestionId?: string | null
  trueFalseQuestionId?: string | null
  fillBlankQuestionId?: string | null
  filename: string
  originalUrl?: string | null
  fileUrl?: string | null
  width?: number | null
  height?: number | null
  lang: 'EN' | 'ZH'
  displayOrder: number
  updatedAt: string
}
