/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { getSafeUrl, getSafeYoutubeEmbedUrl } from './safeUrl'

describe('getSafeUrl', () => {
  it('allows http and https URLs', () => {
    expect(getSafeUrl('https://example.com/file.pdf')).toBe('https://example.com/file.pdf')
    expect(getSafeUrl('http://example.com/file.pdf')).toBe('http://example.com/file.pdf')
  })

  it('allows relative URLs by default', () => {
    expect(getSafeUrl('/files/demo.pdf?download=1#top')).toBe('/files/demo.pdf?download=1#top')
  })

  it('can reject relative URLs', () => {
    expect(getSafeUrl('/files/demo.pdf', { allowRelative: false })).toBeUndefined()
  })

  it('rejects unsafe URL protocols', () => {
    expect(getSafeUrl('javascript:alert(1)')).toBeUndefined()
    expect(getSafeUrl('data:text/html,<script>alert(1)</script>')).toBeUndefined()
  })
})

describe('getSafeYoutubeEmbedUrl', () => {
  it('allows YouTube embed URLs', () => {
    expect(getSafeYoutubeEmbedUrl('https://www.youtube.com/embed/demo')).toBe('https://www.youtube.com/embed/demo')
    expect(getSafeYoutubeEmbedUrl('https://www.youtube-nocookie.com/embed/demo')).toBe(
      'https://www.youtube-nocookie.com/embed/demo',
    )
  })

  it('rejects non-embed or non-YouTube URLs', () => {
    expect(getSafeYoutubeEmbedUrl('https://www.youtube.com/watch?v=demo')).toBeUndefined()
    expect(getSafeYoutubeEmbedUrl('https://example.com/embed/demo')).toBeUndefined()
    expect(getSafeYoutubeEmbedUrl('javascript:alert(1)')).toBeUndefined()
  })
})
