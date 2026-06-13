import { type ChangeEvent, useCallback, useMemo, useState } from 'react'
import type { EduQuestion } from '../../../shared/data/types'
import { useAppSettings } from '../../../shared/contexts/AppSettings'
import { useUIContext } from '../../../shared/contexts/UIContext'
import { useT } from '../../../shared/i18n'
import { usePagedFetch } from '../../../shared/hooks/usePagedFetch'
import { Pagination } from '../../../shared/ui/Pagination'
import { getEduQuestions, type EduQuestionKind } from '../eduApi'
import { hasSelectedTags, htmlToText } from '../eduUtils'
import { FillBlankQuestionCard } from './FillBlankQuestionCard'
import { generatePrintExamSheet, openPrintWindow } from './printExamSheet'
import './fillBlankQuestions.css'

type SortOrder = 'displayOrder' | 'alpha' | 'recent'

const matches = (question: EduQuestion, query: string) => {
  if (!query) return true
  const text = query.toLowerCase()
  return [question.question, question.answer, question.explanation, question.tags]
    .some((field) => htmlToText(field).toLowerCase().includes(text))
}

export const EduFillBlankQuestionsPage = () => {
  const kind = 'fill-blank-questions' as EduQuestionKind
  const { language } = useUIContext()
  const { getTags } = useAppSettings()
  const t = useT()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState<SortOrder>('displayOrder')
  const [isExpandedView, setIsExpandedView] = useState(false)
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [printOptions, setPrintOptions] = useState({ showAnswer: false, showExplanation: false })
  const backendSearchQuery = searchQuery.trim() || undefined
  const backendTag = selectedTags[0]
  const sectionTags = getTags('edu_question_tags')

  const fetcher = useCallback(
    (page: number, size: number, lang: string, signal: AbortSignal) =>
      getEduQuestions(kind, page, size, backendSearchQuery, backendTag, lang, signal),
    [kind, backendSearchQuery, backendTag],
  )

  const { items, loading, error, currentPage, setCurrentPage, totalElements, totalPages, pageSize, handlePageSizeChange, skeletonItems } =
    usePagedFetch(fetcher, { initialPageSize: 40, skeletonCount: 8 })

  const displayItems = useMemo(() => {
    const query = searchQuery.trim()
    let filtered = items.filter((item) => item.lang === language && matches(item, query))
    filtered = filtered.filter((item) => hasSelectedTags(item.tags, selectedTags))
    switch (sortOrder) {
      case 'alpha':
        filtered = [...filtered].sort((a, b) => htmlToText(a.question).localeCompare(htmlToText(b.question), language === 'ZH' ? 'zh-CN' : 'en'))
        break
      case 'recent':
        filtered = [...filtered].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        break
      default:
        filtered = [...filtered].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    }
    return filtered
  }, [items, language, searchQuery, selectedTags, sortOrder])

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleToggleView = () => {
    setIsExpandedView((prev) => !prev)
  }

  const handleShowPrintDialog = () => {
    setShowPrintDialog(true)
  }

  const handlePrintExam = () => {
    const htmlContent = generatePrintExamSheet({
      questions: displayItems,
      title: t('edu.fill-blank-questions.title'),
      language,
      showAnswer: printOptions.showAnswer,
      showExplanation: printOptions.showExplanation,
    })
    openPrintWindow(htmlContent)
    setShowPrintDialog(false)
  }

  const handleReset = () => {
    setSearchQuery('')
    setSelectedTags([])
    setSortOrder('displayOrder')
    setCurrentPage(1)
  }

  return (
    <div className="page-container edu-page fill-blank-page">
      {/* ───── Filters Header: Title + Tags + Actions (single row) ───── */}
      <div className="filters-container">
        <div className="filters-header">
          <div className="header-left">
            <h2 className="page-title">
              {t('nav.edu_questions')}
              <span className="title-count">({displayItems.length})</span>
            </h2>
            {sectionTags.length > 0 && (
              <div className="tags-scroll-area" role="group" aria-label={t('edu.tags_filter')}>
                {sectionTags.map((tag) => {
                  const isActive = selectedTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      className={`tag-chip ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]))
                        setCurrentPage(1)
                      }}
                      aria-pressed={isActive}
                      type="button"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="7" y1="7" x2="7.01" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>{tag}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="header-actions">
            {/* Toggle expanded/compact view */}
            <button
              type="button"
              onClick={handleToggleView}
              title={isExpandedView ? t('vocabulary.compact') : t('vocabulary.detailed')}
              aria-label={isExpandedView ? t('vocabulary.compact') : t('vocabulary.detailed')}
              className={`action-btn ${isExpandedView ? 'active' : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {isExpandedView ? (
                  <g>
                    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <line x1="6" y1="8" x2="18" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </g>
                ) : (
                  <g>
                    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <line x1="6" y1="8" x2="18" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="6" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="6" y1="16" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </g>
                )}
              </svg>
            </button>
            {/* Print */}
            <button
              type="button"
              onClick={handleShowPrintDialog}
              title={t('vocabulary.print')}
              aria-label={t('vocabulary.print')}
              className="action-btn"
              disabled={displayItems.length === 0}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9V2h12v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 14h12v8H6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {/* Reset */}
            <button
              type="button"
              onClick={handleReset}
              title={t('vocabulary.reset')}
              aria-label={t('vocabulary.reset')}
              className="action-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {/* Filter toggle */}
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              title={t('edu.tags_filter')}
              aria-label={t('edu.tags_filter')}
              className={`action-btn ${showFilters ? 'active' : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Expandable search/sort panel */}
        {showFilters && (
          <div className="filters-panel expanded">
            <div className="filters-panel-inner">
              <div className="mcq-search-sort-row">
                <div className="mcq-search-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="m20 20-3.5-3.5M16 10.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    type="search"
                    value={searchQuery}
                    placeholder={t('edu.search_placeholder')}
                    aria-label={t('edu.search_placeholder')}
                    onChange={handleSearch}
                  />
                  {searchQuery && (
                    <button type="button" className="mcq-search-clear" onClick={() => { setSearchQuery(''); setCurrentPage(1) }} aria-label={t('edu.search_clear')}>
                      ×
                    </button>
                  )}
                </div>
                <div className="mcq-sort-buttons">
                  {(['displayOrder', 'alpha', 'recent'] as const).map((order) => (
                    <button
                      key={order}
                      type="button"
                      className={`mcq-sort-btn ${sortOrder === order ? 'active' : ''}`}
                      onClick={() => setSortOrder(order)}
                    >
                      {t(`edu.sort.${order === 'recent' ? 'recency' : order}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ───── Content ───── */}
      {loading ? (
        <div className="fbq-grid" aria-hidden>{skeletonItems.map((item) => <div key={item} className="fbq-card skeleton" />)}</div>
      ) : error ? (
        <div className="state-card state-card--error">{error}</div>
      ) : displayItems.length === 0 ? (
        <div className="fbq-empty">📭 {t('edu.no_results')}</div>
      ) : (
        <div className="fbq-grid">
          {displayItems.map((question) => (
            <FillBlankQuestionCard key={question.id} question={question} isExpandedView={isExpandedView} lang={language} />
          ))}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} totalElements={totalElements} onPageChange={setCurrentPage} onPageSizeChange={handlePageSizeChange} />

      {/* ───── Print Dialog ───── */}
      {showPrintDialog && (
        <div className="print-dialog-overlay" onClick={() => setShowPrintDialog(false)}>
          <div className="print-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>{t('edu.print_options')}</h3>
            <div className="print-options">
              <label>
                <input
                  type="checkbox"
                  checked={printOptions.showAnswer}
                  onChange={(e) => setPrintOptions({ ...printOptions, showAnswer: e.target.checked })}
                />
                <span>{t('edu.answer')}</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={printOptions.showExplanation}
                  onChange={(e) => setPrintOptions({ ...printOptions, showExplanation: e.target.checked })}
                />
                <span>{t('edu.explanation')}</span>
              </label>
            </div>
            <div className="print-dialog-actions">
              <button className="btn-secondary" onClick={() => setShowPrintDialog(false)}>
                {t('edu.cancel')}
              </button>
              <button className="btn-primary" onClick={handlePrintExam}>
                {t('vocabulary.print')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EduFillBlankQuestionsPage
