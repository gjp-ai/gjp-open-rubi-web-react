import DOMPurify from 'dompurify'

export const htmlToText = (value?: string | null) =>
  DOMPurify.sanitize(value ?? '', { ALLOWED_TAGS: [] })
    .replace(/\s+/g, ' ')
    .trim()

export const renderHtml = (value?: string | null) => ({
  __html: DOMPurify.sanitize(value ?? ''),
})

export const playAudio = (url?: string | null) => {
  if (!url) return
  new Audio(url).play().catch((error) => {
    console.error('Audio playback failed:', error)
  })
}

export const splitTags = (tags?: string | null) =>
  (tags ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

const normalizeTag = (tag: string) => tag.trim().toLowerCase()

export const hasSelectedTags = (itemTags: string | null | undefined, selectedTags: string[]) => {
  if (selectedTags.length === 0) return true

  const itemTagSet = new Set(splitTags(itemTags).map(normalizeTag))
  return selectedTags.map(normalizeTag).every((tag) => itemTagSet.has(tag))
}
