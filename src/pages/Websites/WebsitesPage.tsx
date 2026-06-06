import { type ChangeEvent, type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Website } from '../../shared/data/types'
import { useUIContext } from '../../shared/contexts/UIContext'
import { useAppSettings } from '../../shared/contexts/AppSettings'
import { useT } from '../../shared/i18n'
import { usePagedFetch } from '../../shared/hooks/usePagedFetch'
import { getWebsites } from './websitesApi'
import { WebsiteCard } from './components/WebsiteCard'
import './websites.css'

const normalizeText = (value: string) => value.toLowerCase()

const tagPalette = ['#0f6fff', '#22a447', '#f97316', '#7c3aed', '#0891b2', '#db2777']

const splitTags = (tags?: string) =>
  (tags ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

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

  return splitTags(website.tags).some((item) => item.toLowerCase() === tag.toLowerCase())
}

type SortOrder = 'displayOrder' | 'alpha' | 'recent'

const getLaneId = (tag: string) => `websites-section-${tag.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

const getTagStyle = (index: number) =>
  ({
    '--tag-color': tagPalette[index % tagPalette.length],
  }) as CSSProperties

const CategoryIcon = ({ tag }: { tag: string }) => {
  const key = tag.toLowerCase()

  if (key.includes('school')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 10.5 12 5l8 5.5v7.5h-4.5v-4h-7v4H4z" />
        <path d="M9 18v-5h6v5M7 10v8M17 10v8" />
      </svg>
    )
  }

  if (key.includes('english') || key.includes('text')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 6h14M7 6v12M17 6v12M9 18h6" />
        <path d="M9.5 13h5" />
      </svg>
    )
  }

  if (key.includes('tuition') || key.includes('learn')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m12 4 8 4-8 4-8-4z" />
        <path d="M6.5 10.5v4.2c1.5 1.8 3.3 2.7 5.5 2.7s4-.9 5.5-2.7v-4.2" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="5" width="6" height="6" rx="1.5" />
      <rect x="13" y="5" width="6" height="6" rx="1.5" />
      <rect x="5" y="13" width="6" height="6" rx="1.5" />
      <rect x="13" y="13" width="6" height="6" rx="1.5" />
    </svg>
  )
}

export const WebsitesPage = () => {
  const { language } = useUIContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const { getTags } = useAppSettings()
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('displayOrder')
  const sectionTags = getTags('website_tags')
  const t = useT()

  const fetcher = useCallback(
    (page: number, size: number, lang: string, signal: AbortSignal) =>
      getWebsites(page, size, undefined, undefined, lang, signal),
    [],
  )

  const { items, loading, error, setCurrentPage, skeletonItems } = usePagedFetch(fetcher, {
    initialPageSize: 500,
    skeletonCount: 12,
  })

  const languageItems = useMemo(() => items.filter((item) => item.lang === language), [items, language])

  const dynamicTags = useMemo(() => {
    const tagCounts = new Map<string, number>()

    languageItems.forEach((item) => {
      splitTags(item.tags).forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
      })
    })

    const orderedTags = [...sectionTags]
    tagCounts.forEach((_count, tag) => {
      if (!orderedTags.some((item) => item.toLowerCase() === tag.toLowerCase())) {
        orderedTags.push(tag)
      }
    })

    return orderedTags
      .map((tag) => ({
        tag,
        count: tagCounts.get(tag) ?? 0,
      }))
      .filter((item) => item.count > 0)
  }, [languageItems, sectionTags])

  const displayItems = useMemo(() => {
    const trimmedQuery = searchQuery.trim()
    let filtered = languageItems.filter((item) => matchesSearch(item, trimmedQuery))

    if (selectedTag) {
      filtered = filtered.filter((item) => hasTag(item, selectedTag))
    }

    switch (sortOrder) {
      case 'alpha':
        filtered = [...filtered].sort((a, b) =>
          a.name.localeCompare(b.name, language === 'ZH' ? 'zh-CN' : 'en', { sensitivity: 'base' }),
        )
        break
      case 'recent':
        filtered = [...filtered].sort((a, b) => {
          const aTime = new Date(a.updatedAt ?? '').getTime()
          const bTime = new Date(b.updatedAt ?? '').getTime()
          return Number.isNaN(bTime - aTime) ? 0 : bTime - aTime
        })
        break
      case 'displayOrder':
      default:
        filtered = [...filtered].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        break
    }

    return filtered
  }, [language, languageItems, searchQuery, selectedTag, sortOrder])

  const categorySections = useMemo(
    () =>
      dynamicTags
        .map((tagInfo) => {
          const sectionItems = displayItems.filter((item) => hasTag(item, tagInfo.tag))
          return {
            ...tagInfo,
            id: getLaneId(tagInfo.tag),
            items: sectionItems,
          }
        })
        .filter((section) => section.items.length > 0),
    [displayItems, dynamicTags],
  )

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus()
    }
  }, [searchOpen])

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
    setCurrentPage(1)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchOpen(false)
    setCurrentPage(1)
  }

  const handleOpenSearch = () => {
    setSearchOpen(true)
    window.setTimeout(() => searchInputRef.current?.focus(), 0)
  }

  const handleSelectTag = (tag: string | null) => {
    setSelectedTag((current) => (current === tag ? null : tag))
    setCurrentPage(1)
  }

  return (
    <section className="page websites-page">
      <div className="websites-hero">
        <img
          src={`${import.meta.env.BASE_URL}rubi-websites-banner.png`}
          alt={t('websites.banner_alt')}
          className="websites-hero__image"
        />
      </div>

      <div
        className={`websites-toolbar${searchOpen || searchQuery ? ' websites-toolbar--search-open' : ''}`}
        aria-label={t('websites.toolbar_label')}
      >
        {searchOpen || searchQuery ? (
          <label className="websites-toolbar__search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m20 20-3.5-3.5M16 10.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z" />
            </svg>
            <span className="sr-only">{t('websites.search_placeholder')}</span>
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              placeholder={t('websites.search_placeholder')}
              onChange={handleSearchChange}
            />
            <button type="button" onClick={handleClearSearch} aria-label={t('websites.search_clear')}>
              ×
            </button>
          </label>
        ) : null}

        <div className="websites-toolbar__tags" aria-label={t('websites.tags_filter')}>
          <button
            type="button"
            className={`websites-tag-chip${selectedTag === null ? ' websites-tag-chip--active' : ''}`}
            onClick={() => handleSelectTag(null)}
          >
            {t('websites.filters.all')}
            <span>{languageItems.length}</span>
          </button>
          {dynamicTags.map((tagInfo, index) => (
            <button
              key={tagInfo.tag}
              type="button"
              className={`websites-tag-chip${selectedTag === tagInfo.tag ? ' websites-tag-chip--active' : ''}`}
              style={getTagStyle(index)}
              onClick={() => handleSelectTag(tagInfo.tag)}
            >
              {tagInfo.tag}
              <span>{tagInfo.count}</span>
            </button>
          ))}
        </div>

        <div className="websites-toolbar__actions">
          <button
            type="button"
            className={`websites-toolbar__icon-button${searchOpen || searchQuery ? ' websites-toolbar__icon-button--active' : ''}`}
            onClick={handleOpenSearch}
            aria-label={t('websites.search_placeholder')}
            aria-expanded={searchOpen || Boolean(searchQuery)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m20 20-3.5-3.5M16 10.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z" />
            </svg>
          </button>

          <label className="websites-toolbar__sort">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M7 12h10M10 17h4" />
            </svg>
            <select
              aria-label={t('websites.sort_label')}
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            >
              <option value="displayOrder">{t('websites.sort.displayOrder')}</option>
              <option value="alpha">{t('websites.sort.alpha')}</option>
              <option value="recent">{t('websites.sort.recency')}</option>
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="websites-grid websites-grid--skeleton">
          {skeletonItems.map((item) => (
            <div key={item} className="card website-card website-card--skeleton" aria-hidden="true">
              <div className="website-card__layout">
                <div className="website-card__logo skeleton" />
                <div className="website-card__content">
                  <div className="skeleton skeleton--line skeleton--line-lg" />
                  <div className="skeleton skeleton--line skeleton--line-sm" />
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
        <div className="websites-content">
          {categorySections.length > 0 ? (
            <div className="websites-sections" aria-label={t('websites.category_lanes')}>
              {categorySections.map((section, index) => (
                <section key={section.tag} className="websites-section" aria-labelledby={section.id}>
                  <div className="websites-section__header">
                    <h2 id={section.id} className="websites-section__title">
                      <span className="websites-section__icon" style={getTagStyle(index)} aria-hidden="true">
                        <CategoryIcon tag={section.tag} />
                      </span>
                      {section.tag}
                      <span className="websites-section__count">{section.items.length}</span>
                    </h2>
                    <button
                      type="button"
                      className="websites-section__view-all"
                      onClick={() => handleSelectTag(section.tag)}
                    >
                      {t('websites.view_all')}
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <div className="websites-grid">
                    {section.items.slice(0, selectedTag ? undefined : 4).map((item) => (
                      <WebsiteCard key={`${section.tag}-${item.id}`} website={item} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : null}

          {displayItems.length === 0 ? (
            <div className="status status--empty">
              <span>{t('websites.empty')}</span>
            </div>
          ) : null}

          {displayItems.length > 0 ? (
            <div className="websites-page__summary" aria-live="polite">
              {t('websites.range_summary', { start: 1, end: displayItems.length, total: displayItems.length })}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
