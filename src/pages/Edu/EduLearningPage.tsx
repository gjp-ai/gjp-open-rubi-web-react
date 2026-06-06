import { type ChangeEvent, useCallback, useMemo, useState } from 'react'
import type { EduLearningItem } from '../../shared/data/types'
import { useAppSettings } from '../../shared/contexts/AppSettings'
import { useUIContext } from '../../shared/contexts/UIContext'
import { useT } from '../../shared/i18n'
import { usePagedFetch } from '../../shared/hooks/usePagedFetch'
import { Pagination } from '../../shared/ui/Pagination'
import { Toolbar } from '../../shared/components/Toolbar/Toolbar'
import { getEduLearningItems, type EduLearningKind } from './eduApi'
import { htmlToText, playAudio, renderHtml, splitTags } from './eduUtils'
import './edu.css'

type SortOrder = 'displayOrder' | 'alpha' | 'recent'

const tagKeys: Record<EduLearningKind, string> = {
  vocabularies: 'vocabulary_tags',
  phrases: 'phrase_tags',
  sentences: 'sentence_tags',
}

const getAudioUrl = (item: EduLearningItem) => item.phoneticAudioUrl || item.phoneticUsAudioUrl || item.phoneticUkAudioUrl
const getPhonetic = (item: EduLearningItem) => item.phonetic || item.phoneticUs || item.phoneticUk

const matches = (item: EduLearningItem, query: string) => {
  if (!query) return true
  const text = query.toLowerCase()
  return [item.name, item.translation, item.meaning, item.easyMeaning, item.tags]
    .some((field) => htmlToText(field).toLowerCase().includes(text))
}

export const EduLearningPage = ({ kind }: { kind: EduLearningKind }) => {
  const { language } = useUIContext()
  const { getTags } = useAppSettings()
  const t = useT()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('displayOrder')
  const backendSearchQuery = searchQuery.trim() || undefined
  const backendTag = selectedTag ?? undefined
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
    const query = searchQuery.trim()
    const filtered = items.filter((item) => item.lang === language && matches(item, query))
    if (selectedTag) {
      return filtered.filter((item) => splitTags(item.tags).map((tag) => tag.toLowerCase()).includes(selectedTag.toLowerCase()))
    }
    switch (sortOrder) {
      case 'alpha':
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name, language === 'ZH' ? 'zh-CN' : 'en'))
      case 'recent':
        return [...filtered].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      default:
        return [...filtered].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    }
  }, [items, language, searchQuery, selectedTag, sortOrder])

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="page-container edu-page">
      <section className="edu-hero">
        <div>
          <h1>{t(`edu.${kind}.title`)}</h1>
          <p>{t('edu.subtitle')}</p>
        </div>
        <div className="edu-hero__count">
          <strong>{displayItems.length}</strong>
          <span>{t('edu.result_count', { count: totalElements })}</span>
        </div>
      </section>

      <Toolbar
        sectionTags={sectionTags}
        selectedTag={selectedTag}
        onSelectTag={(tag) => {
          setSelectedTag(tag)
          setCurrentPage(1)
        }}
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onClearSearch={() => {
          setSearchQuery('')
          setCurrentPage(1)
        }}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        namespace="edu"
      />

      {loading ? (
        <div className="edu-grid" aria-hidden>
          {skeletonItems.map((item) => <div key={item} className="edu-card edu-card--skeleton skeleton" />)}
        </div>
      ) : error ? (
        <div className="state-card state-card--error">{error}</div>
      ) : (
        <div className="edu-grid">
          {displayItems.map((item) => (
            <article key={item.id} className="edu-card edu-card--learning">
              <div className="edu-card__head">
                <h2 dangerouslySetInnerHTML={renderHtml(item.name)} />
                {getAudioUrl(item) ? (
                  <button type="button" className="edu-audio" onClick={() => playAudio(getAudioUrl(item))} aria-label="Play audio">
                    ▶
                  </button>
                ) : null}
              </div>
              {getPhonetic(item) ? <p className="edu-phonetic">/{htmlToText(getPhonetic(item))}/</p> : null}
              {item.partOfSpeech ? <span className="edu-pill">{item.partOfSpeech}</span> : null}
              {item.translation ? <div className="edu-rich" dangerouslySetInnerHTML={renderHtml(item.translation)} /> : null}
              {item.meaning || item.easyMeaning || item.explanation ? (
                <div className="edu-rich edu-rich--muted" dangerouslySetInnerHTML={renderHtml(item.meaning || item.easyMeaning || item.explanation)} />
              ) : null}
              {item.sentenceOne ? <div className="edu-example" dangerouslySetInnerHTML={renderHtml(item.sentenceOne)} /> : null}
              <div className="edu-card__meta">
                {item.difficultyLevel ? <span>{item.difficultyLevel}</span> : null}
                {item.term ? <span>T{item.term}</span> : null}
                {item.week ? <span>W{item.week}</span> : null}
              </div>
              {splitTags(item.tags).length > 0 ? (
                <div className="edu-tags">
                  {splitTags(item.tags).slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              ) : null}
            </article>
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

export default EduLearningPage
