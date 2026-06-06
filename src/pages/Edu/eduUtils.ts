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
