import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { EduLearningItem } from '../../../shared/data/types'
import { useAppSettings } from '../../../shared/contexts/AppSettings'
import { useUIContext } from '../../../shared/contexts/UIContext'
import { useT } from '../../../shared/i18n'
import { usePagedFetch } from '../../../shared/hooks/usePagedFetch'
import { Pagination } from '../../../shared/ui/Pagination'
import { EduPlayBar, type EduPlayField, type EduPlayOrder } from '../EduPlayBar'
import { hasFavoriteTag } from '../favoriteUtils'
import { getEduLearningItems, toggleEduLearningFavoriteTag, type EduLearningKind } from '../eduApi'
import { hasSelectedTags, htmlToText } from '../eduUtils'
import { readEduPlaySettings, saveEduPlaySettings } from '../playSettings'
import { SentenceCard } from './SentenceCard'
import { generatePrintSheet, openPrintWindow } from './printSheet'
import './sentences.css'

type SortOrder = 'displayOrder' | 'alpha' | 'recent'
const playSettingsKey = 'sentences'

const tagKeys: Record<EduLearningKind, string> = {
  vocabularies: 'vocabulary_tags',
  phrases: 'phrase_tags',
  sentences: 'sentence_tags',
}

const matches = (item: EduLearningItem, query: string) => {
  if (!query) return true
  const text = query.toLowerCase()
  return [item.name, item.translation, item.meaning, item.easyMeaning, item.tags].some((field) =>
    htmlToText(field).toLowerCase().includes(text),
  )
}

const getAudioUrl = (item: EduLearningItem) =>
  item.phoneticUsAudioUrl || item.phoneticAudioUrl || item.phoneticUkAudioUrl

const formatPhonetics = (item?: EduLearningItem) => {
  if (!item) return ''
  const values = [
    item.phoneticUs ? `US /${htmlToText(item.phoneticUs)}/` : '',
    item.phoneticUk ? `UK /${htmlToText(item.phoneticUk)}/` : '',
  ].filter(Boolean)
  return values.length > 0 ? values.join(' · ') : item.phonetic ? `/${htmlToText(item.phonetic)}/` : ''
}

const shuffleArray = (array: number[]) => {
  const shuffled = [...array]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }
  return shuffled
}

export const EduSentencesPage = () => {
  const kind: EduLearningKind = 'sentences'
  const { language } = useUIContext()
  const { getTags, getValue } = useAppSettings()
  const t = useT()
  const [searchQuery, setSearchQuery] = useState('')
  const [draftSearchQuery, setDraftSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState<SortOrder>('displayOrder')
  const [term, setTerm] = useState('')
  const [draftTerm, setDraftTerm] = useState('')
  const [week, setWeek] = useState('')
  const [draftWeek, setDraftWeek] = useState('')
  const [difficultyLevel, setDifficultyLevel] = useState('')
  const [draftDifficultyLevel, setDraftDifficultyLevel] = useState('')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [isPlayPaused, setIsPlayPaused] = useState(false)
  const [currentPlayIndex, setCurrentPlayIndex] = useState(0)
  const [playProgress, setPlayProgress] = useState(0)
  const [playInterval, setPlayInterval] = useState(() => readEduPlaySettings(playSettingsKey).interval)
  const [playOrder, setPlayOrder] = useState<EduPlayOrder>(() => readEduPlaySettings(playSettingsKey).order)
  const [hiddenPlayFields, setHiddenPlayFields] = useState<string[]>(
    () => readEduPlaySettings(playSettingsKey).hiddenFields,
  )
  const [playReplayToken, setPlayReplayToken] = useState(0)
  const [isPlayFavoritePending, setIsPlayFavoritePending] = useState(false)
  const autoPlayTimerRef = useRef<number | null>(null)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const playQueueRef = useRef<number[]>([])
  const playIntervalRef = useRef(playInterval)
  const isPlayPausedRef = useRef(isPlayPaused)
  const backendSearchQuery = searchQuery.trim() || undefined
  const backendTag = selectedTags[0]
  const backendFilters = useMemo(
    () => ({
      term: term || undefined,
      week: week || undefined,
      difficultyLevel: difficultyLevel || undefined,
    }),
    [difficultyLevel, term, week],
  )
  const sectionTags = getTags(tagKeys[kind])
  const difficultyLevels = useMemo(
    () =>
      (getValue('difficulty_level') ?? '')
        .split(',')
        .map((level) => level.trim())
        .filter(Boolean),
    [getValue],
  )

  const fetcher = useCallback(
    (page: number, size: number, lang: string, signal: AbortSignal) =>
      getEduLearningItems(kind, page, size, backendSearchQuery, backendTag, lang, signal, backendFilters),
    [kind, backendSearchQuery, backendTag, backendFilters],
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
    updateItem,
    skeletonItems,
  } = usePagedFetch(fetcher, { initialPageSize: 60, skeletonCount: 12 })

  const displayItems = useMemo(() => {
    const query = draftSearchQuery.trim()
    const tagFiltered = items.filter((item) => {
      const matchesTags = hasSelectedTags(item.tags, selectedTags)
      const matchesTerm = !draftTerm || String(item.term ?? '') === draftTerm
      const matchesWeek = !draftWeek || String(item.week ?? '') === draftWeek
      const matchesDifficulty = !draftDifficultyLevel || item.difficultyLevel === draftDifficultyLevel
      return (
        item.lang === language && matches(item, query) && matchesTags && matchesTerm && matchesWeek && matchesDifficulty
      )
    })
    switch (sortOrder) {
      case 'alpha':
        return [...tagFiltered].sort((a, b) => a.name.localeCompare(b.name, language === 'ZH' ? 'zh-CN' : 'en'))
      case 'recent':
        return [...tagFiltered].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      default:
        return [...tagFiltered].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    }
  }, [draftDifficultyLevel, draftSearchQuery, draftTerm, draftWeek, items, language, selectedTags, sortOrder])

  const applyFilters = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    setSearchQuery(draftSearchQuery)
    setTerm(draftTerm)
    setWeek(draftWeek)
    setDifficultyLevel(draftDifficultyLevel)
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
    setTerm('')
    setDraftTerm('')
    setWeek('')
    setDraftWeek('')
    setDifficultyLevel('')
    setDraftDifficultyLevel('')
    setShowSortMenu(false)
    setCurrentPage(1)
  }

  const handlePrint = () => {
    if (displayItems.length === 0) return
    openPrintWindow(generatePrintSheet({ sentences: displayItems, title: t('edu.sentences.title'), language }))
  }

  const stopAutoPlay = useCallback(() => {
    setIsAutoPlaying(false)
    setIsPlayPaused(false)
    setPlayProgress(0)
    setCurrentPlayIndex(0)
    currentAudioRef.current?.pause()
    currentAudioRef.current = null
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
    if (displayItems.length > 0) startAutoPlay()
  }

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      const element = target as HTMLElement | null
      return (
        element?.tagName === 'INPUT' ||
        element?.tagName === 'TEXTAREA' ||
        element?.tagName === 'SELECT' ||
        element?.isContentEditable
      )
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.key.toLowerCase() !== 'p' ||
        isTypingTarget(event.target) ||
        displayItems.length === 0
      )
        return
      event.preventDefault()
      if (isAutoPlaying) {
        stopAutoPlay()
        return
      }
      playQueueRef.current =
        playOrder === 'random'
          ? shuffleArray(displayItems.map((_, index) => index))
          : displayItems.map((_, index) => index)
      setCurrentPlayIndex(0)
      setIsPlayPaused(false)
      setPlayProgress(0)
      setIsAutoPlaying(true)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [displayItems, isAutoPlaying, playOrder, stopAutoPlay])

  const startAutoPlay = () => {
    playQueueRef.current =
      playOrder === 'random'
        ? shuffleArray(displayItems.map((_, index) => index))
        : displayItems.map((_, index) => index)
    setCurrentPlayIndex(0)
    setIsPlayPaused(false)
    setIsAutoPlaying(true)
  }

  const handlePlayIntervalChange = (interval: number) => {
    setPlayInterval(interval)
  }

  const handlePlayOrderChange = (order: EduPlayOrder) => {
    setPlayOrder(order)
  }

  const handleToggleFieldVisibility = (fieldKey: string) => {
    setHiddenPlayFields((current) =>
      current.includes(fieldKey) ? current.filter((key) => key !== fieldKey) : [...current, fieldKey],
    )
  }

  const handlePlayPrevious = useCallback(() => {
    if (!isAutoPlaying) return
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current)
      autoPlayTimerRef.current = null
    }
    currentAudioRef.current?.pause()
    currentAudioRef.current = null
    setPlayProgress(0)
    setIsPlayPaused(false)
    setCurrentPlayIndex((index) => Math.max(0, index - 1))
  }, [isAutoPlaying])

  const handlePlayNext = useCallback(() => {
    if (!isAutoPlaying) return
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current)
      autoPlayTimerRef.current = null
    }
    currentAudioRef.current?.pause()
    currentAudioRef.current = null
    setPlayProgress(0)
    setIsPlayPaused(false)
    setCurrentPlayIndex((index) => Math.min(playQueueRef.current.length - 1, index + 1))
  }, [isAutoPlaying])

  const handlePlayRepeat = useCallback(() => {
    if (!isAutoPlaying) return
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current)
      autoPlayTimerRef.current = null
    }
    currentAudioRef.current?.pause()
    currentAudioRef.current = null
    setPlayProgress(0)
    setIsPlayPaused(false)
    setPlayReplayToken((value) => value + 1)
  }, [isAutoPlaying])

  const handleTogglePlayPause = useCallback(() => {
    if (!isAutoPlaying) return

    setIsPlayPaused((paused) => {
      const nextPaused = !paused
      if (nextPaused) {
        if (autoPlayTimerRef.current) {
          clearTimeout(autoPlayTimerRef.current)
          autoPlayTimerRef.current = null
        }
        currentAudioRef.current?.pause()
      } else {
        const audio = currentAudioRef.current
        if (audio && !audio.ended) {
          audio.play().catch((error) => {
            console.error('Audio playback failed:', error)
          })
        } else if (!audio || audio.ended) {
          autoPlayTimerRef.current = window.setTimeout(() => {
            if (currentPlayIndex < playQueueRef.current.length - 1) {
              setCurrentPlayIndex((index) => index + 1)
            } else {
              stopAutoPlay()
            }
          }, playIntervalRef.current)
        }
      }
      return nextPaused
    })
  }, [currentPlayIndex, isAutoPlaying, stopAutoPlay])

  const handlePlayProgressSeek = useCallback((progress: number) => {
    setPlayProgress(progress)
    const audio = currentAudioRef.current
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return
    audio.currentTime = (audio.duration * progress) / 100
  }, [])

  useEffect(() => {
    playIntervalRef.current = playInterval
    saveEduPlaySettings(playSettingsKey, {
      interval: playInterval,
      order: playOrder,
      pronunciation: 'us',
      hiddenFields: hiddenPlayFields,
    })
  }, [hiddenPlayFields, playInterval, playOrder])

  useEffect(() => {
    isPlayPausedRef.current = isPlayPaused
  }, [isPlayPaused])

  useEffect(() => {
    if (!isAutoPlaying || displayItems.length === 0) return undefined

    const itemIndex = playQueueRef.current[currentPlayIndex] ?? currentPlayIndex
    const sentence = displayItems[itemIndex]
    const audioUrl = sentence ? getAudioUrl(sentence) : undefined
    setPlayProgress(0)
    let didScheduleNext = false
    const scheduleNext = () => {
      if (didScheduleNext) return
      didScheduleNext = true
      setPlayProgress(100)
      if (currentPlayIndex < playQueueRef.current.length - 1) {
        autoPlayTimerRef.current = window.setTimeout(
          () => setCurrentPlayIndex((index) => index + 1),
          playIntervalRef.current,
        )
      } else {
        autoPlayTimerRef.current = window.setTimeout(stopAutoPlay, playIntervalRef.current)
      }
    }

    if (audioUrl) {
      currentAudioRef.current?.pause()
      const audio = new Audio(audioUrl)
      currentAudioRef.current = audio
      audio.ontimeupdate = () => {
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          setPlayProgress(Math.min(100, (audio.currentTime / audio.duration) * 100))
        }
      }
      audio.onended = scheduleNext
      audio.onerror = scheduleNext
      if (!isPlayPausedRef.current) {
        audio.play().catch((error) => {
          console.error('Audio playback failed:', error)
          scheduleNext()
        })
      }
    } else {
      scheduleNext()
    }

    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current)
      if (currentAudioRef.current) {
        currentAudioRef.current.ontimeupdate = null
        currentAudioRef.current.onended = null
        currentAudioRef.current.onerror = null
        currentAudioRef.current.pause()
      }
    }
  }, [currentPlayIndex, displayItems, isAutoPlaying, playReplayToken, stopAutoPlay])

  useEffect(() => stopAutoPlay, [stopAutoPlay])

  const toolbarTags =
    sectionTags.length > 0 ? sectionTags : ['P3', 'P4', 'English', 'Science', 'School', 'LL', 'Sentence']
  const currentPlayItem = displayItems[playQueueRef.current[currentPlayIndex] ?? currentPlayIndex]
  const currentPlaySubtitle = formatPhonetics(currentPlayItem)
  const currentPlayDescription = currentPlayItem
    ? currentPlayItem.sentenceOne || currentPlayItem.sentenceTwo || currentPlayItem.explanation || ''
    : ''
  const currentPlayHeroFields: EduPlayField[] = currentPlayItem
    ? [
        { key: 'subtitle', label: t('vocabulary.phonetic'), value: currentPlaySubtitle },
        { key: 'difficultyLevel', label: t('vocabulary.difficulty'), value: currentPlayItem.difficultyLevel },
        { key: 'term', label: t('vocabulary.term'), value: currentPlayItem.term },
        { key: 'week', label: t('vocabulary.week'), value: currentPlayItem.week },
        { key: 'tags', label: 'Tags', value: currentPlayItem.tags },
      ]
    : []
  const currentPlayFields: EduPlayField[] = currentPlayItem
    ? [
        { key: 'meaningClue', label: t('vocabulary.meaning_clue'), value: currentPlayItem.meaningClue },
        { key: 'easyMeaning', label: t('vocabulary.easy_meaning'), value: currentPlayItem.easyMeaning },
        {
          key: 'meaning',
          label: t('vocabulary.meaning'),
          value: currentPlayItem.meaning ?? currentPlayItem.explanation,
        },
        { key: 'translation', label: t('vocabulary.translation'), value: currentPlayItem.translation },
        { key: 'sentenceOne', label: t('vocabulary.sentence_one'), value: currentPlayItem.sentenceOne },
        { key: 'sentenceTwo', label: t('vocabulary.sentence_two'), value: currentPlayItem.sentenceTwo },
        { key: 'additionalInfo', label: t('vocabulary.additional_info'), value: currentPlayItem.additionalInfo },
      ]
    : []

  const handleFavoriteUpdated = useCallback(
    (item: EduLearningItem) => {
      updateItem(item)
    },
    [updateItem],
  )

  const handleCurrentPlayFavoriteToggle = useCallback(async () => {
    if (!currentPlayItem) return
    setIsPlayFavoritePending(true)
    try {
      const response = await toggleEduLearningFavoriteTag('sentences', currentPlayItem.id)
      updateItem(response.data)
    } finally {
      setIsPlayFavoritePending(false)
    }
  }, [currentPlayItem, updateItem])

  return (
    <div className="page-container edu-page sentences-page">
      <section className="vocab-toolbar" aria-label={t('vocabulary.filters')}>
        <div className="vocab-toolbar__top">
          <div className="vocab-toolbar__title">
            <h1>{t('edu.sentences.title')}</h1>
            <span>({displayItems.length})</span>
          </div>
          <div className="vocab-toolbar__chips" aria-label={t('edu.tags_filter')}>
            {toolbarTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`vocab-chip${selectedTags.includes(tag) ? ' active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M20.6 13.2 13.2 20.6a2 2 0 0 1-2.8 0L3 13.2V4h9.2l7.4 7.4a2 2 0 0 1 0 2.8Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <circle cx="8" cy="8" r="1.4" fill="currentColor" />
                </svg>
                {tag}
              </button>
            ))}
          </div>
          <div className="vocab-actions">
            <div className="vocab-sort-menu">
              <button
                className={`vocab-action${showSortMenu ? ' active' : ''}`}
                onClick={() => setShowSortMenu((value) => !value)}
                type="button"
                title={t('edu.sort_label')}
                aria-label={t('edu.sort_label')}
                aria-expanded={showSortMenu}
              >
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
            <button
              className="vocab-action vocab-action--view active"
              type="button"
              title={t('vocabulary.detailed')}
              aria-label={t('vocabulary.detailed')}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="5" width="14" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <button
              className="vocab-action vocab-action--print"
              onClick={handlePrint}
              type="button"
              disabled={displayItems.length === 0}
              title={t('vocabulary.print')}
              aria-label={t('vocabulary.print')}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M7 14h10v7H7z" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            <button
              className={`vocab-action vocab-action--play${isAutoPlaying ? ' active playing' : ''}`}
              onClick={handleAutoPlay}
              type="button"
              disabled={displayItems.length === 0}
              title={`${isAutoPlaying ? t('vocabulary.stop_auto_play') : t('vocabulary.play_all')} (P)`}
              aria-label={`${isAutoPlaying ? t('vocabulary.stop_auto_play') : t('vocabulary.play_all')} (P)`}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {isAutoPlaying ? (
                  <path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" />
                ) : (
                  <path d="M8 5v14l11-7Z" fill="currentColor" />
                )}
              </svg>
              <kbd className="vocab-action__shortcut">P</kbd>
            </button>
            <button
              className={`vocab-action vocab-action--filters${showAdvancedFilters ? ' active' : ''}`}
              onClick={() => setShowAdvancedFilters((value) => !value)}
              type="button"
              title={t('vocabulary.filters')}
              aria-label={t('vocabulary.filters')}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M3 5h18l-7 8v5l-4 2v-7Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
        {showAdvancedFilters ? (
          <form className="vocab-filter-grid" onSubmit={applyFilters}>
            <label className="vocab-filter-grid__search">
              <span>{t('edu.name')}</span>
              <input
                value={draftSearchQuery}
                onChange={(event) => setDraftSearchQuery(event.target.value)}
                type="search"
                placeholder={t('edu.name')}
                aria-label={t('edu.name')}
              />
            </label>
            <label>
              <span>{t('vocabulary.term')}</span>
              <select value={draftTerm} onChange={(event) => setDraftTerm(event.target.value)}>
                <option value="">{t('edu.filters.all')}</option>
                {[1, 2, 3, 4].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t('vocabulary.week')}</span>
              <select value={draftWeek} onChange={(event) => setDraftWeek(event.target.value)}>
                <option value="">{t('edu.filters.all')}</option>
                {Array.from({ length: 14 }, (_, index) => index + 1).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t('vocabulary.difficulty')}</span>
              <select value={draftDifficultyLevel} onChange={(event) => setDraftDifficultyLevel(event.target.value)}>
                <option value="">{t('edu.filters.all')}</option>
                {difficultyLevels.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <div className="vocab-filter-actions">
              <button className="vocab-filter-btn vocab-filter-btn--primary" type="submit">
                {t('edu.search')}
              </button>
              <button className="vocab-filter-btn" onClick={resetFilters} type="button">
                {t('vocabulary.reset')}
              </button>
            </div>
          </form>
        ) : null}
      </section>

      {loading ? (
        <div className="sentences-list" aria-hidden>
          {skeletonItems.map((item) => (
            <div key={item} className="sentence-panel sentence-panel--skeleton skeleton" />
          ))}
        </div>
      ) : error ? (
        <div className="state-card state-card--error">{error}</div>
      ) : (
        <div className="sentences-list">
          {displayItems.map((item, index) => (
            <SentenceCard
              key={item.id}
              sentence={item}
              sentences={displayItems}
              currentIndex={index}
              onFavoriteUpdated={handleFavoriteUpdated}
            />
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

      {isAutoPlaying ? (
        <EduPlayBar
          currentIndex={currentPlayIndex}
          total={displayItems.length}
          interval={playInterval}
          order={playOrder}
          isPaused={isPlayPaused}
          currentTitle={currentPlayItem?.name ?? ''}
          currentDescription={currentPlayDescription}
          heroFields={currentPlayHeroFields}
          fullScreenFields={currentPlayFields}
          fullScreenTitlePlacement="stage"
          fullScreenVariant="sentence"
          hiddenFieldKeys={hiddenPlayFields}
          startFullScreen
          progress={playProgress}
          isFavourite={currentPlayItem ? hasFavoriteTag(currentPlayItem) : false}
          isFavoriteTogglePending={isPlayFavoritePending}
          onStop={stopAutoPlay}
          onPrevious={handlePlayPrevious}
          onRepeat={handlePlayRepeat}
          onNext={handlePlayNext}
          onTogglePause={handleTogglePlayPause}
          onHiddenFieldKeysChange={setHiddenPlayFields}
          onToggleFieldVisibility={handleToggleFieldVisibility}
          onProgressSeek={handlePlayProgressSeek}
          onToggleFavorite={handleCurrentPlayFavoriteToggle}
          onIntervalChange={handlePlayIntervalChange}
          onOrderChange={handlePlayOrderChange}
        />
      ) : null}
    </div>
  )
}

export default EduSentencesPage
