import { type ChangeEvent, useCallback, useMemo, useState } from 'react'
import type { MediaItem } from '../../shared/data/types'
import { useUIContext } from '../../shared/contexts/UIContext'
import { useT } from '../../shared/i18n'
import { useAppSettings } from '../../shared/contexts/AppSettings'
import { usePagedFetch } from '../../shared/hooks/usePagedFetch'
import { getImages } from './imagesApi'
import { ImageCard } from './ImageCard'
import { ImagePreview } from './ImagePreview'
import { Pagination } from '../../shared/ui/Pagination'
import { Toolbar } from '../../shared/components/Toolbar/Toolbar'
import './images.css'

const normalizeText = (value: string) => value.toLowerCase()

const matchesSearch = (item: MediaItem, query: string) => {
  if (!query) {
    return true
  }

  const text = normalizeText(query)
  const fields = [item.name ?? item.title ?? '', item.tags ?? '']
  return fields.some((field) => normalizeText(field).includes(text))
}

const hasTag = (item: MediaItem, tag: string | null) => {
  if (!tag) {
    return true
  }

  const tagList = (item.tags ?? '')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)

  return tagList.includes(tag.toLowerCase())
}

type SortOrder = 'displayOrder' | 'alpha' | 'recent'

export const ImagesPage = () => {
  const { language } = useUIContext()
  const [searchQuery, setSearchQuery] = useState('')
  const { getTags } = useAppSettings()
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('displayOrder')
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const sectionTags = getTags('image_tags')
  const t = useT()

  const fetcher = useCallback(
    (page: number, size: number, lang: string, signal: AbortSignal) => getImages(page, size, lang, signal),
    [],
  )

  const {
    items,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalElements,
    totalPages,
    pageSize,
    handlePageSizeChange,
    skeletonItems,
  } = usePagedFetch(fetcher, { initialPageSize: 50, skeletonCount: 12 })

  const displayItems = useMemo(() => {
    const trimmedQuery = searchQuery.trim()
    let filtered = items.filter((item) => item.lang === language)

    if (trimmedQuery) {
      filtered = filtered.filter((item) => matchesSearch(item, trimmedQuery))
    }

    if (selectedTag) {
      filtered = filtered.filter((item) => hasTag(item, selectedTag))
    }

    // Sort items
    switch (sortOrder) {
      case 'displayOrder':
        filtered.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        break
      case 'alpha':
        filtered.sort((a, b) => {
          const aName = a.name ?? a.title ?? ''
          const bName = b.name ?? b.title ?? ''
          return aName.localeCompare(bName, language === 'ZH' ? 'zh-CN' : 'en', { sensitivity: 'base' })
        })
        break
      case 'recent':
        filtered.sort((a, b) => {
          const aTime = new Date(a.updatedAt ?? '').getTime()
          const bTime = new Date(b.updatedAt ?? '').getTime()
          return Number.isNaN(bTime - aTime) ? 0 : bTime - aTime
        })
        break
      default:
        filtered.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        break
    }

    return filtered
  }, [items, language, searchQuery, selectedTag, sortOrder])

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
    setCurrentPage(1)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setCurrentPage(1)
  }

  const handleSelectTag = (tag: string | null) => {
    setSelectedTag(tag)
    setCurrentPage(1)
  }

  return (
    <section className="page">
      <Toolbar
        sectionTags={sectionTags}
        selectedTag={selectedTag}
        onSelectTag={handleSelectTag}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        namespace="images"
      />

      {loading ? (
        <div className="grid grid--images">
          {skeletonItems.map((item) => (
            <figure key={item} className="card image-card image-card--skeleton" aria-hidden="true">
              <div className="image-card__media">
                <div className="skeleton skeleton--image" />
              </div>
              <figcaption className="image-card__overlay image-card__overlay--skeleton">
                <div className="skeleton skeleton--line skeleton--line-lg" />
                <div className="skeleton skeleton--line skeleton--line-sm" />
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <div className="status status--error">
          <span>{t('failed_to_load')}</span>
          <span className="status__message">{error}</span>
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="grid grid--images">
            {displayItems.map((item, index) => (
              <ImageCard key={item.id} item={item} onClick={() => setSelectedImageIndex(index)} />
            ))}
          </div>
          {displayItems.length === 0 ? <div className="status status--empty">{t('images.empty')}</div> : null}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      ) : null}

      {selectedImageIndex !== null && (
        <ImagePreview
          image={displayItems[selectedImageIndex]}
          allImages={displayItems}
          onClose={() => setSelectedImageIndex(null)}
          onNext={() =>
            setSelectedImageIndex((prev) => (prev !== null && prev < displayItems.length - 1 ? prev + 1 : prev))
          }
          onPrevious={() => setSelectedImageIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))}
        />
      )}
    </section>
  )
}
