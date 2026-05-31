import DOMPurify from 'dompurify'

export const sanitizeHtml = (html: string) =>
  DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['src', 'width', 'height'],
    FORBID_ATTR: ['style'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta'],
  })
