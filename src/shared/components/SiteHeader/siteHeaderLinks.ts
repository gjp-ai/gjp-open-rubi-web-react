export interface SiteHeaderLink {
  path: string
  labelKey: string
  tagsKey: string
}

export interface SiteHeaderGroup {
  labelKey: string
  tagsKey: string
  links: SiteHeaderLink[]
}

export const englishHeaderLinks: SiteHeaderLink[] = [
  { path: '/edu/vocabularies', labelKey: 'nav.edu_vocabularies', tagsKey: 'vocabulary_tags' },
  { path: '/edu/phrases', labelKey: 'nav.edu_phrases', tagsKey: 'phrase_tags' },
  { path: '/edu/sentences', labelKey: 'nav.edu_sentences', tagsKey: 'sentence_tags' },
]

export const questionHeaderLinks: SiteHeaderLink[] = [
  { path: '/edu/multiple-choice-questions', labelKey: 'nav.edu_mcq', tagsKey: 'edu_mcq_tags' },
  { path: '/edu/fill-blank-questions', labelKey: 'nav.edu_fill_blank', tagsKey: 'edu_fill_blank_tags' },
  { path: '/edu/free-text-questions', labelKey: 'nav.edu_free_text', tagsKey: 'edu_free_text_tags' },
  { path: '/edu/true-false-questions', labelKey: 'nav.edu_true_false', tagsKey: 'edu_true_false_tags' },
]

export const mediaHeaderLinks: SiteHeaderLink[] = [
  { path: '/images', labelKey: 'nav.images', tagsKey: 'image_tags' },
  { path: '/audios', labelKey: 'nav.audios', tagsKey: 'audio_tags' },
  { path: '/videos', labelKey: 'nav.videos', tagsKey: 'video_tags' },
  { path: '/files', labelKey: 'nav.files', tagsKey: 'file_tags' },
]

export const siteHeaderLinks: SiteHeaderLink[] = [
  { path: '/websites', labelKey: 'nav.websites', tagsKey: 'website_tags' },
  { path: '/articles', labelKey: 'nav.articles', tagsKey: 'article_tags' },
]

export const siteHeaderGroups: SiteHeaderGroup[] = [
  { labelKey: 'nav.english', tagsKey: 'edu_english_group', links: englishHeaderLinks },
  { labelKey: 'nav.edu_questions', tagsKey: 'edu_questions_group', links: questionHeaderLinks },
  { labelKey: 'nav.media', tagsKey: 'media_group', links: mediaHeaderLinks },
]
