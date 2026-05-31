import { OPEN_API_BASE_URL, OPEN_API_CHANNEL } from './openApiConfig'

const API_BASE_URL = OPEN_API_BASE_URL.endsWith('/') ? OPEN_API_BASE_URL : `${OPEN_API_BASE_URL}/`

const buildUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  return `${API_BASE_URL}${normalizedPath}`
}

export const createOpenApiUrl = (
  path: string,
  searchParams?: Record<string, string | number | undefined | null>,
): string => {
  const baseUrl = buildUrl(path)

  const params = new URLSearchParams()
  params.set('channel', OPEN_API_CHANNEL)

  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.set(key, String(value))
    }
  })

  const queryString = params.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

export const fetchOpenApiJson = async <TResponse>(input: string, init?: RequestInit): Promise<TResponse> => {
  const response = await fetch(input, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(`Request failed with status ${response.status}: ${errorText}`)
  }

  return (await response.json()) as TResponse
}
