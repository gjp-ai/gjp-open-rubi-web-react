import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ApiPagedResponse } from '../data/types'
import { useUIContext } from '../contexts/UIContext'
import { useT } from '../i18n'

interface UsePagedFetchOptions {
  /** Initial page size (default: 50) */
  initialPageSize?: number
  /** Number of skeleton items to render while loading (default: 12) */
  skeletonCount?: number
}

interface UsePagedFetchResult<TItem> {
  items: TItem[]
  loading: boolean
  error: string | null
  currentPage: number
  setCurrentPage: (page: number) => void
  totalElements: number
  totalPages: number
  pageSize: number
  setPageSize: (size: number) => void
  skeletonItems: number[]
  handlePageSizeChange: (newPageSize: number) => void
}

/**
 * Shared hook for paginated API data fetching.
 *
 * Handles the full lifecycle: loading state, error state, AbortController cleanup,
 * React StrictMode debounce, language-based re-fetch, and pagination state.
 *
 * @param fetcher  A function that calls the API (must accept page, size, lang, signal)
 * @param options  Optional initial page size and skeleton count
 */
export function usePagedFetch<TItem>(
  fetcher: (page: number, size: number, lang: string, signal: AbortSignal) => Promise<ApiPagedResponse<TItem>>,
  options: UsePagedFetchOptions = {},
): UsePagedFetchResult<TItem> {
  const { initialPageSize = 50, skeletonCount = 12 } = options
  const { language } = useUIContext()
  const t = useT()
  const failedLabel = t('failed_to_load')

  const [items, setItems] = useState<TItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const controller = new AbortController()

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetcher(currentPage - 1, pageSize, language, controller.signal)
        setItems(response.data.content)
        setTotalElements(response.data.totalElements)
        setTotalPages(response.data.totalPages)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }

        const message = err instanceof Error ? err.message : failedLabel
        setError(message)
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    // Debounce the request to avoid double-fetching in React StrictMode
    const timeoutId = setTimeout(() => {
      void fetchData()
    }, 10)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [fetcher, failedLabel, pageSize, currentPage, language])

  // Reset to page 1 when language changes
  useEffect(() => {
    setCurrentPage(1)
  }, [language])

  // Clamp to last page when total pages shrinks
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }, [])

  const skeletonItems = useMemo(() => Array.from({ length: skeletonCount }, (_, index) => index), [skeletonCount])

  return {
    items,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalElements,
    totalPages,
    pageSize,
    setPageSize,
    skeletonItems,
    handlePageSizeChange,
  }
}
