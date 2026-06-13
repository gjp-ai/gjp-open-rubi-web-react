import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { EduLearningItem } from '../../../shared/data/types'
import { useAppSettings } from '../../../shared/contexts/AppSettings'
import { useUIContext } from '../../../shared/contexts/UIContext'
import { useT } from '../../../shared/i18n'
import { usePagedFetch } from '../../../shared/hooks/usePagedFetch'
import { Pagination } from '../../../shared/ui/Pagination'
import { getEduLearningItems, type EduLearningKind } from '../eduApi'
import { hasSelectedTags, htmlToText } from '../eduUtils'
import { PhraseCard } from './PhraseCard'
import { generatePrintSheet, openPrintWindow } from './printSheet'
import './phrases.css'

type SortOrder = 'displayOrder' | 'alpha' | 'recent'

const tagKeys: Record<EduLearningKind, string> = {
  vocabularies: 'vocabulary_tags',
  phrases: 'phrase_tags',
  sentences: 'sentence_tags',
}

const matches = (item: EduLearningItem, query: string) => {
  if (!query) return true
  const text = query.toLowerCase()
  return [item.name, item.translation, item.meaning, item.easyMeaning, item.tags]
    .some((field) => htmlToText(field).toLowerCase().includes(text))
}

const getAudioUrl = (item: EduLearningItem) => item.phoneticUsAudioUrl || item.phoneticAudioUrl || item.phoneticUkAudioUrl

export const EduPhrasesPage = () => {
  const kind: EduLearningKind = 'phrases'
  const { language } = useUIContext()
  const { getTags } = useAppSettings()
  const t = useT()
  const [searchQuery, setSearchQuery] = useState('')
  const [draftSearchQuery, setDraftSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState<SortOrder>('displayOrder')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [isExpandedView, setIsExpandedView] = useState(true)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showIntervalModal, setShowIntervalModal] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [currentPlayIndex, setCurrentPlayIndex] = useState(0)
  const [playInterval, setPlayInterval] = useState(5000)
  const autoPlayTimerRef = useRef<number | null>(null)
  const backendSearchQuery = searchQuery.trim() || undefined
  const backendTag = selectedTags[0]
  const sectionTags = getTags(tagKeys[kind])

  const fetcher = useCallback(
    (page: number, size: number, lang: string, signal: AbortSignal) =>
      getEduLearningItems(kind, page, size, backendSearchQuery, backendTag, lang, signal),
    [kind, backendSearchQuery, backendTag],
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
  } = usePagedFetch(fetcher, { initialPageSize: 60, skeletonCount: 12 })

  const displayItems = useMemo(() => {
    const query = draftSearchQuery.trim()
    const filtered = items.filter((item) => item.lang === language && matches(item, query))
    const tagFiltered = filtered.filter((item) => hasSelectedTags(item.tags, selectedTags))
    switch (sortOrder) {
      case 'alpha':
        return [...tagFiltered].sort((a, b) => a.name.localeCompare(b.name, language === 'ZH' ? 'zh-CN' : 'en'))
      case 'recent':
        return [...tagFiltered].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      default:
        return [...tagFiltered].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    }
  }, [draftSearchQuery, items, language, selectedTags, sortOrder])

  const applyFilters = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    setSearchQuery(draftSearchQuery)
    setCurrentPage(1)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]))
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setSearchQuery('')
    setDraftSearchQuery('')
    setSelectedTags([])
    setSortOrder('displayOrder')
    setShowSortMenu(false)
    setCurrentPage(1)
  }

  const handlePrint = () => {
    if (displayItems.length === 0) return
    openPrintWindow(generatePrintSheet({ phrases: displayItems, title: t('edu.phrases.title'), language }))
  }

  const stopAutoPlay = useCallback(() => {
    setIsAutoPlaying(false)
    setCurrentPlayIndex(0)
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current)
      autoPlayTimerRef.current = null
    }
  }, [])

  const handleAutoPlay = () => {
    if (isAutoPlaying) {
      stopAutoPlay()
      return
    }
    if (displayItems.length > 0) setShowIntervalModal(true)
  }

  const startAutoPlay = (intervalMs: number) => {
    setPlayInterval(intervalMs)
    setShowIntervalModal(false)
    setCurrentPlayIndex(0)
    setIsAutoPlaying(true)
  }

  useEffect(() => {
    if (!isAutoPlaying || displayItems.length === 0) return undefined

    const phrase = displayItems[currentPlayIndex]
    const audioUrl = phrase ? getAudioUrl(phrase) : undefined
    if (audioUrl) {
      new Audio(audioUrl).play().catch((error) => console.error('Audio playback failed:', error))
    }

    if (currentPlayIndex < displayItems.length - 1) {
      autoPlayTimerRef.current = window.setTimeout(() => setCurrentPlayIndex((index) => index + 1), playInterval)
    } else {
      autoPlayTimerRef.current = window.setTimeout(stopAutoPlay, playInterval)
    }

    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current)
    }
  }, [currentPlayIndex, displayItems, isAutoPlaying, playInterval, stopAutoPlay])

  useEffect(() => stopAutoPlay, [stopAutoPlay])

  const toolbarTags = sectionTags.length > 0 ? sectionTags : ['P3', 'P4', 'English', 'Science', 'School', 'LL', 'Phrase', 'Idiom']

  return (
    <div className="page-container edu-page phrases-page">
      {showIntervalModal ? (
        <div className="interval-modal-overlay" onClick={() => setShowIntervalModal(false)}>
          <div className="interval-modal" onClick={(event) => event.stopPropagation()}>
            <h3>{t('vocabulary.select_play_interval')}</h3>
            <p>{t('vocabulary.choose_play_interval')}</p>
            <div className="interval-options">
              {[2000, 5000, 10000, 15000, 20000, 25000].map((interval) => (
                <button key={interval} onClick={() => startAutoPlay(interval)} className="interval-btn" type="button">
                  {interval / 1000} {t('vocabulary.seconds')}
                </button>
              ))}
            </div>
            <button onClick={() => setShowIntervalModal(false)} className="interval-cancel-btn" type="button">
              {t('vocabulary.cancel')}
            </button>
          </div>
        </div>
      ) : null}

      <section className="vocab-toolbar" aria-label={t('vocabulary.filters')}>
        <div className="vocab-toolbar__top">
          <div className="vocab-toolbar__title">
            <h1>{t('edu.phrases.title')}</h1>
            <span>({displayItems.length})</span>
          </div>
          <div className="vocab-toolbar__chips" aria-label={t('edu.tags_filter')}>
            {toolbarTags.map((tag) => (
              <button key={tag} type="button" className={`vocab-chip${selectedTags.includes(tag) ? ' active' : ''}`} onClick={() => toggleTag(tag)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.6 13.2 13.2 20.6a2 2 0 0 1-2.8 0L3 13.2V4h9.2l7.4 7.4a2 2 0 0 1 0 2.8Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="8" cy="8" r="1.4" fill="currentColor" />
                </svg>
                {tag}
              </button>
            ))}
          </div>
          <div className="vocab-actions">
            <div className="vocab-sort-menu">
              <button className={`vocab-action${showSortMenu ? ' active' : ''}`} onClick={() => setShowSortMenu((value) => !value)} type="button" title={t('edu.sort_label')} aria-label={t('edu.sort_label')} aria-expanded={showSortMenu}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="5" cy="12" r="2" fill="currentColor" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                  <circle cx="19" cy="12" r="2" fill="currentColor" />
                </svg>
              </button>
              {showSortMenu ? (
                <div className="vocab-sort-dropdown" role="menu">
                  <span>{t('edu.sort_label')}</span>
                  {[
                    { value: 'displayOrder' as SortOrder, label: t('edu.sort.displayOrder') },
                    { value: 'alpha' as SortOrder, label: t('edu.sort.alpha') },
                    { value: 'recent' as SortOrder, label: t('edu.sort.recency') },
                  ].map((option) => (
                    <button
                      key={option.value}
                      className={sortOrder === option.value ? 'active' : ''}
                      onClick={() => {
                        setSortOrder(option.value)
                        setShowSortMenu(false)
                      }}
                      role="menuitemradio"
                      aria-checked={sortOrder === option.value}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button className={`vocab-action${isExpandedView ? ' active' : ''}`} onClick={() => setIsExpandedView((value) => !value)} type="button" title={isExpandedView ? t('vocabulary.show_compact') : t('vocabulary.show_detailed')} aria-label={isExpandedView ? t('vocabulary.show_compact') : t('vocabulary.show_detailed')}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
            <button className="vocab-action" onClick={handlePrint} type="button" disabled={displayItems.length === 0} title={t('vocabulary.print')} aria-label={t('vocabulary.print')}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M7 14h10v7H7z" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
            </button>
            <button className={`vocab-action${isAutoPlaying ? ' active playing' : ''}`} onClick={handleAutoPlay} type="button" disabled={displayItems.length === 0} title={isAutoPlaying ? t('vocabulary.stop_auto_play') : t('vocabulary.play_all')} aria-label={isAutoPlaying ? t('vocabulary.stop_auto_play') : t('vocabulary.play_all')}>
              <svg viewBox="0 0 24 24" aria-hidden="true">{isAutoPlaying ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" /> : <path d="M8 5v14l11-7Z" fill="currentColor" />}</svg>
            </button>
            <button className={`vocab-action${showAdvancedFilters ? ' active' : ''}`} onClick={() => setShowAdvancedFilters((value) => !value)} type="button" title={t('vocabulary.filters')} aria-label={t('vocabulary.filters')}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18l-7 8v5l-4 2v-7Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
        {showAdvancedFilters ? (
          <form className="vocab-filter-grid" onSubmit={applyFilters}>
            <label className="vocab-filter-grid__search">
              <span>Name</span>
              <input value={draftSearchQuery} onChange={(event) => setDraftSearchQuery(event.target.value)} type="search" placeholder="Name" aria-label="Name" />
            </label>
            <div className="vocab-filter-actions">
              <button className="vocab-filter-btn vocab-filter-btn--primary" type="submit">
                Search
              </button>
              <button className="vocab-filter-btn" onClick={resetFilters} type="button">
                {t('vocabulary.reset')}
              </button>
            </div>
          </form>
        ) : null}
      </section>

      {loading ? (
        <div className="phrases-grid" aria-hidden>
          {skeletonItems.map((item) => <div key={item} className="phrase-card phrase-card--skeleton skeleton" />)}
        </div>
      ) : error ? (
        <div className="state-card state-card--error">{error}</div>
      ) : (
        <div className="phrases-grid">
          {displayItems.map((item, index) => (
            <PhraseCard key={item.id} phrase={item} phrases={displayItems} currentIndex={index} expanded={isExpandedView} />
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalElements={totalElements}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}

export default EduPhrasesPage
