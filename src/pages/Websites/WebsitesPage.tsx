import { type ChangeEvent, useCallback, useMemo, useState } from 'react'
import type { Website } from '../../shared/data/types'
import { useUIContext } from '../../shared/contexts/UIContext'
import { useAppSettings } from '../../shared/contexts/AppSettings'
import { useT } from '../../shared/i18n'
import { usePagedFetch } from '../../shared/hooks/usePagedFetch'
import { Pagination } from '../../shared/ui/Pagination'
import { getWebsites } from './websitesApi'
import { WebsiteCard } from './components/WebsiteCard'
import { Toolbar } from '../../shared/components/Toolbar/Toolbar'
import './websites.css'

const normalizeText = (value: string) => value.toLowerCase()

const matchesSearch = (website: Website, query: string) => {
  if (!query) {
    return true
  }

  const text = normalizeText(query)
  const fields = [website.name, website.description ?? '', website.tags ?? '']
  return fields.some((field) => normalizeText(field).includes(text))
}

const hasTag = (website: Website, tag: string | null) => {
  if (!tag) {
    return true
  }

  const tagList = (website.tags ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  return tagList.includes(tag.toLowerCase())
}

type SortOrder = 'displayOrder' | 'alpha' | 'recent'

const getLaneId = (tag: string) => `websites-lane-${tag.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

const CategoryIcon = ({ tag }: { tag: string }) => {
  const key = tag.toLowerCase()

  if (key.includes('news')) {
    return (
      <span className="websites-lane__icon websites-lane__icon--news" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M6 6.5h12v11H6z" />
          <path d="M9 10h6M9 13h4" />
        </svg>
      </span>
    )
  }

  if (key.includes('text')) {
    return (
      <span className="websites-lane__icon websites-lane__icon--text" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M7 7h10M12 7v10M9 17h6" />
        </svg>
      </span>
    )
  }

  if (key.includes('image')) {
    return (
      <span className="websites-lane__icon websites-lane__icon--image" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M5.5 6.5h13v11h-13z" />
          <path d="M7.5 15l3.2-3.2 2.2 2.2 1.4-1.4 2.2 2.4" />
          <circle cx="9" cy="9.2" r="1" />
        </svg>
      </span>
    )
  }

  if (key.includes('video')) {
    return (
      <span className="websites-lane__icon websites-lane__icon--video" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M5.5 7h9.5v10H5.5z" />
          <path d="M15 10l4-2.2v8.4L15 14z" />
        </svg>
      </span>
    )
  }

  if (key.includes('audio')) {
    return (
      <span className="websites-lane__icon websites-lane__icon--audio" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M9 17V7l8-1.5V15" />
          <circle cx="7.5" cy="17" r="1.8" />
          <circle cx="15.5" cy="15" r="1.8" />
        </svg>
      </span>
    )
  }

  if (key.includes('code') || key.includes('api')) {
    return (
      <span className="websites-lane__icon websites-lane__icon--code" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M9 8.5L5.5 12 9 15.5M15 8.5l3.5 3.5-3.5 3.5" />
        </svg>
      </span>
    )
  }

  if (key.includes('model')) {
    return (
      <span className="websites-lane__icon websites-lane__icon--model" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M12 5l6 3.5v7L12 19l-6-3.5v-7z" />
          <path d="M12 12l6-3.5M12 12v7M12 12L6 8.5" />
        </svg>
      </span>
    )
  }

  if (key.includes('agent')) {
    return (
      <span className="websites-lane__icon websites-lane__icon--agent" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="9" r="3" />
          <path d="M7 18a5 5 0 0110 0" />
        </svg>
      </span>
    )
  }

  if (key.includes('studio') || key.includes('app')) {
    return (
      <span className="websites-lane__icon websites-lane__icon--studio" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12" rx="3" />
          <path d="M9 10h6M9 14h4" />
        </svg>
      </span>
    )
  }

  if (key.includes('open')) {
    return (
      <span className="websites-lane__icon websites-lane__icon--open" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M8 16L16 8M11 8h5v5" />
          <path d="M15 16H8V9" />
        </svg>
      </span>
    )
  }

  if (key.includes('directory')) {
    return (
      <span className="websites-lane__icon websites-lane__icon--directory" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M6.5 7.5h11M6.5 12h11M6.5 16.5h11" />
        </svg>
      </span>
    )
  }

  return (
    <span className="websites-lane__icon websites-lane__icon--default" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="6" />
        <path d="M12 9v6M9 12h6" />
      </svg>
    </span>
  )
}

export const WebsitesPage = () => {
  const { language } = useUIContext()
  const [searchQuery, setSearchQuery] = useState('')
  const { getTags } = useAppSettings()
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('displayOrder')
  const [expandedLanes, setExpandedLanes] = useState<Set<string>>(() => new Set())
  const sectionTags = getTags('website_tags')
  const t = useT()

  const fetcher = useCallback(
    (page: number, size: number, lang: string, signal: AbortSignal) =>
      getWebsites(page, size, undefined, undefined, lang, signal),
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
  } = usePagedFetch(fetcher, { initialPageSize: 500, skeletonCount: 30 })

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

  const isFilteredView = Boolean(searchQuery.trim() || selectedTag)

  const categoryLanes = useMemo(
    () =>
      sectionTags
        .map((tag) => {
          const laneItems = displayItems.filter((item) => hasTag(item, tag))
          return {
            tag,
            id: getLaneId(tag),
            count: laneItems.length,
            items: laneItems,
          }
        })
        .filter((lane) => lane.items.length > 0),
    [displayItems, sectionTags],
  )

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

  const handleToggleLane = (tag: string) => {
    setExpandedLanes((current) => {
      const next = new Set(current)
      if (next.has(tag)) {
        next.delete(tag)
      } else {
        next.add(tag)
      }
      return next
    })
  }

  return (
    <section className="page websites-page">
      <div className="websites-page__intro">
        <div>
          <h1 className="websites-page__title">{t('websites.title')}</h1>
          <p className="websites-page__subtitle">{t('websites.subtitle')}</p>
        </div>
        <div className="websites-page__count">
          <span className="websites-page__count-full">
            {t('websites.result_count', { count: displayItems.length })}
          </span>
          <span
            className="websites-page__count-compact"
            aria-label={t('websites.result_count', { count: displayItems.length })}
          >
            {displayItems.length}
          </span>
        </div>
      </div>

      <Toolbar
        sectionTags={sectionTags}
        selectedTag={selectedTag}
        onSelectTag={handleSelectTag}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        namespace="websites"
      />

      {loading ? (
        <div className="grid grid--websites">
          {skeletonItems.map((item) => (
            <div key={item} className="card website-card website-card--skeleton" aria-hidden="true">
              <div className="website-card__layout">
                <div className="website-card__logo">
                  <div className="skeleton skeleton--image" />
                </div>
                <div className="website-card__content">
                  <div className="skeleton skeleton--line skeleton--line-lg" />
                  <div className="website-card__description skeleton skeleton--line skeleton--line-sm" />
                </div>
              </div>
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
          {!isFilteredView && categoryLanes.length > 0 ? (
            <div className="websites-lanes" aria-label={t('websites.category_lanes')}>
              {categoryLanes.map((lane) => {
                const isExpanded = expandedLanes.has(lane.tag)

                return (
                  <section
                    key={lane.tag}
                    className={`websites-lane${isExpanded ? ' websites-lane--expanded' : ''}`}
                    aria-labelledby={lane.id}
                  >
                    <div className="websites-lane__header">
                      <div>
                        <h2 id={lane.id} className="websites-lane__title">
                          <span className="websites-lane__icon">
                            <CategoryIcon tag={lane.tag} />
                          </span>
                          {lane.tag}
                        </h2>
                      </div>
                      <button
                        type="button"
                        className="websites-lane__view-all"
                        onClick={() => handleToggleLane(lane.tag)}
                        aria-expanded={isExpanded}
                        aria-controls={`${lane.id}-track`}
                        aria-label={t(isExpanded ? 'websites.collapse_category' : 'websites.expand_category', {
                          category: lane.tag,
                          count: lane.count,
                        })}
                      >
                        <span>{lane.count}</span>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          {isExpanded ? <path d="M6 15l6-6 6 6" /> : <path d="M6 9l6 6 6-6" />}
                        </svg>
                      </button>
                    </div>
                    <div id={`${lane.id}-track`} className="websites-lane__track">
                      {lane.items.map((item) => (
                        <div key={`${lane.tag}-${item.id}`} className="websites-lane__item">
                          <WebsiteCard website={item} />
                        </div>
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          ) : (
            <div className="websites-results">
              <div className="websites-results__header">
                <h2 className="websites-results__title">{t('websites.results_title')}</h2>
                <span className="websites-results__count">
                  {t('websites.result_count', { count: displayItems.length })}
                </span>
              </div>
              <div className="grid grid--websites">
                {displayItems.map((item) => (
                  <WebsiteCard key={item.id} website={item} />
                ))}
              </div>
            </div>
          )}
          {displayItems.length === 0 ? <div className="status status--empty">{t('websites.empty')}</div> : null}
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
