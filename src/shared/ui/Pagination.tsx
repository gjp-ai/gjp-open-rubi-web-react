import { useT } from '../i18n'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalElements?: number
  pageSize?: number
  onPageSizeChange?: (pageSize: number) => void
}

const createPageRange = (currentPage: number, totalPages: number) => {
  const pages = new Set<number>()

  pages.add(1)
  pages.add(totalPages)

  for (let index = currentPage - 2; index <= currentPage + 2; index += 1) {
    if (index > 0 && index <= totalPages) {
      pages.add(index)
    }
  }

  return Array.from(pages).sort((a, b) => a - b)
}

const PAGE_SIZE_OPTIONS = [50, 100, 500, 1000]

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalElements,
  pageSize = 50,
  onPageSizeChange,
}: PaginationProps) => {
  const t = useT()

  if (totalPages <= 1 && !totalElements) {
    return null
  }

  const range = createPageRange(currentPage, totalPages)
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalElements ?? 0)
  const shouldRenderMetaRow = totalElements !== undefined || Boolean(onPageSizeChange)

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(event.target.value)
    onPageSizeChange?.(newSize)
    onPageChange(1) // Reset to first page when changing page size
  }

  return (
    <nav className="pagination" aria-label={t('pagination.ariaLabel')}>
      <div className="pagination__row pagination__row--controls">
        <button
          type="button"
          className="pagination__button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          {t('pagination.prev')}
        </button>
        <ul className="pagination__list">
          {range.map((page, index) => {
            const previousPage = range[index - 1]
            const shouldRenderEllipsis = previousPage && page - previousPage > 1

            return (
              <li key={page} className="pagination__item">
                {shouldRenderEllipsis ? <span className="pagination__ellipsis">...</span> : null}
                <button
                  type="button"
                  className={`pagination__button${page === currentPage ? ' pagination__button--active' : ''}`}
                  onClick={() => onPageChange(page)}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              </li>
            )
          })}
        </ul>
        <button
          type="button"
          className="pagination__button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          {t('pagination.next')}
        </button>
      </div>

      {shouldRenderMetaRow && (
        <div className="pagination__row pagination__row--meta" aria-live="polite">
          <div className="pagination__meta">
            {totalElements !== undefined && totalElements > 0 && (
              <div className="pagination__info">
                <span className="pagination__range">
                  {startItem}-{endItem}
                </span>
                <span className="pagination__total">
                  {t('pagination.of')} {totalElements}
                </span>
              </div>
            )}

            {onPageSizeChange && (
              <div className="pagination__page-size">
                <label htmlFor="page-size-select" className="pagination__page-size-label">
                  {t('pagination.perPage')}
                </label>
                <select
                  id="page-size-select"
                  className="pagination__page-size-select"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
