export interface SiteHeaderLink {
  path: string
  labelKey: string
  tagsKey: string
}

export const siteHeaderLinks: SiteHeaderLink[] = [
  { path: '/websites', labelKey: 'nav.websites', tagsKey: 'website_tags' },
  { path: '/questions', labelKey: 'nav.questions', tagsKey: 'question_tags' },
  { path: '/articles', labelKey: 'nav.articles', tagsKey: 'article_tags' },
  { path: '/images', labelKey: 'nav.images', tagsKey: 'image_tags' },
  { path: '/audios', labelKey: 'nav.audios', tagsKey: 'audio_tags' },
  { path: '/videos', labelKey: 'nav.videos', tagsKey: 'video_tags' },
  { path: '/files', labelKey: 'nav.files', tagsKey: 'file_tags' },
]
