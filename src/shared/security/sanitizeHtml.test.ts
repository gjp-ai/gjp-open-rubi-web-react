/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { sanitizeHtml } from './sanitizeHtml'

describe('sanitizeHtml', () => {
  it('removes scripts, inline handlers, and inline styles', () => {
    const html = '<p style="color:red">Hello</p><img src="x" onerror="alert(1)"><script>alert(1)</script>'
    const result = sanitizeHtml(html)

    expect(result).toContain('<p>Hello</p>')
    expect(result).toContain('<img src="x">')
    expect(result).not.toContain('script')
    expect(result).not.toContain('onerror')
    expect(result).not.toContain('style=')
  })

  it('removes iframe tags but preserves safe embed placeholder attributes', () => {
    const html =
      '<iframe src="https://example.com"></iframe><div class="video-embed" data-provider="youtube" src="https://www.youtube.com/embed/demo" width="600" height="400"></div>'
    const result = sanitizeHtml(html)

    expect(result).not.toContain('<iframe')
    expect(result).toContain('class="video-embed"')
    expect(result).toContain('data-provider="youtube"')
    expect(result).toContain('src="https://www.youtube.com/embed/demo"')
    expect(result).toContain('width="600"')
    expect(result).toContain('height="400"')
  })
})
