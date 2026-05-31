import { type ChangeEvent, useCallback, useMemo, useState } from 'react'
import type { FileItem } from '../../shared/data/types'
import { useUIContext } from '../../shared/contexts/UIContext'
import { useT } from '../../shared/i18n'
import { useAppSettings } from '../../shared/contexts/AppSettings'
import { usePagedFetch } from '../../shared/hooks/usePagedFetch'
import { getFiles } from './filesApi'
import { FileCard } from './FileCard'
import { Pagination } from '../../shared/ui/Pagination'
import { Toolbar } from '../../shared/components/Toolbar/Toolbar'
import './files.css'

const normalizeText = (value: string) => value.toLowerCase()

const matchesSearch = (item: FileItem, query: string) => {
  if (!query) return true
  const text = normalizeText(query)
  const fields = [item.name, item.description ?? '', item.tags ?? '']
  return fields.some((field) => normalizeText(field).includes(text))
}

const hasTag = (item: FileItem, tag: string | null) => {
  if (!tag) return true
  const tagList = (item.tags ?? '')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
  return tagList.includes(tag.toLowerCase())
}

type SortOrder = 'displayOrder' | 'alpha' | 'recent'

export const FilesPage = () => {
  const { language } = useUIContext()
  const [searchQuery, setSearchQuery] = useState('')
  const { getTags } = useAppSettings()
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('displayOrder')
  const sectionTags = getTags('file_tags')
  const t = useT()

  const fetcher = useCallback(
    (page: number, size: number, lang: string, signal: AbortSignal) => getFiles(page, size, lang, signal),
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
  } = usePagedFetch(fetcher, { initialPageSize: 50, skeletonCount: 28 })

  const displayItems = useMemo(() => {
    const trimmedQuery = searchQuery.trim()
    let filtered = items.filter((item) => item.lang === language)
    if (trimmedQuery) filtered = filtered.filter((item) => matchesSearch(item, trimmedQuery))
    if (selectedTag) filtered = filtered.filter((item) => hasTag(item, selectedTag))

    switch (sortOrder) {
      case 'displayOrder':
        filtered.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        break
      case 'alpha':
        filtered.sort((a, b) =>
          a.name.localeCompare(b.name, language === 'ZH' ? 'zh-CN' : 'en', { sensitivity: 'base' }),
        )
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
        namespace="files"
      />

      {loading ? (
        <div className="grid grid--files">
          {skeletonItems.map((item) => (
            <div key={item} className="card file-card file-card--skeleton" aria-hidden="true">
              <div className="skeleton skeleton--line skeleton--line-lg" style={{ flex: 1 }} />
              <div className="skeleton skeleton--icon" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
            </div>
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
          <div className="grid grid--files">
            {displayItems.map((item) => (
              <FileCard key={item.id} item={item} />
            ))}
          </div>
          {displayItems.length === 0 ? <div className="status status--empty">{t('files.empty')}</div> : null}
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
    </section>
  )
}
