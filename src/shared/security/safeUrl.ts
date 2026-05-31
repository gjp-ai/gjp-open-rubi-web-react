const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:'])
const YOUTUBE_EMBED_HOSTS = new Set(['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com'])

interface SafeUrlOptions {
  allowRelative?: boolean
}

export const getSafeUrl = (value: string | null | undefined, options: SafeUrlOptions = {}) => {
  const { allowRelative = true } = options
  const trimmed = value?.trim()

  if (!trimmed) {
    return undefined
  }

  try {
    const url = new URL(trimmed, window.location.origin)
    const isRelative = !/^[a-z][a-z0-9+.-]*:/i.test(trimmed)

    if (isRelative) {
      return allowRelative ? `${url.pathname}${url.search}${url.hash}` : undefined
    }

    return SAFE_URL_PROTOCOLS.has(url.protocol) ? url.href : undefined
  } catch {
    return undefined
  }
}

export const getSafeYoutubeEmbedUrl = (value: string | null | undefined) => {
  const safeUrl = getSafeUrl(value, { allowRelative: false })

  if (!safeUrl) {
    return undefined
  }

  const url = new URL(safeUrl)
  const isYoutubeEmbed = YOUTUBE_EMBED_HOSTS.has(url.hostname) && url.pathname.startsWith('/embed/')

  return isYoutubeEmbed ? url.href : undefined
}
