import { useCallback } from 'react'
import type { EduQuestionImage } from '../../../shared/data/types'
import { useT } from '../../../shared/i18n'
import { usePagedFetch } from '../../../shared/hooks/usePagedFetch'
import { Pagination } from '../../../shared/ui/Pagination'
import { getEduQuestionImages } from '../eduApi'
import './questionImages.css'

export const EduQuestionImagesPage = () => {
  const t = useT()
  const fetcher = useCallback(async (_page: number, _size: number, lang: string, signal: AbortSignal) => {
    const response = await getEduQuestionImages(undefined, undefined, lang, signal)
    const content = response.data ?? []
    return {
      status: response.status,
      meta: response.meta,
      data: { content, page: 0, size: content.length, totalElements: content.length, totalPages: 1 },
    }
  }, [])

  const { items, loading, error, currentPage, totalPages, pageSize, totalElements, handlePageSizeChange, setCurrentPage } =
    usePagedFetch<EduQuestionImage>(fetcher, { initialPageSize: 200, skeletonCount: 12 })

  return (
    <div className="page-container edu-page question-images-page">
      <section className="edu-hero"><div><h1>Question Images</h1><p>{t('edu.subtitle')}</p></div></section>
      {loading ? <div className="edu-image-grid" aria-hidden /> : error ? <div className="state-card state-card--error">{error}</div> : (
        <div className="edu-image-grid">
          {items.map((image) => (
            <article key={image.id} className="edu-image-card">
              <img src={image.fileUrl || image.originalUrl || ''} alt={image.filename} loading="lazy" />
              <span>{image.filename}</span>
            </article>
          ))}
        </div>
      )}
      <Pagination currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} totalElements={totalElements} onPageChange={setCurrentPage} onPageSizeChange={handlePageSizeChange} />
    </div>
  )
}
