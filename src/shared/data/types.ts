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
