import { type ChangeEvent, useCallback, useMemo, useState } from 'react'
import type { EduQuestion } from '../../../shared/data/types'
import { useAppSettings } from '../../../shared/contexts/AppSettings'
import { useUIContext } from '../../../shared/contexts/UIContext'
import { useT } from '../../../shared/i18n'
import { usePagedFetch } from '../../../shared/hooks/usePagedFetch'
import { Pagination } from '../../../shared/ui/Pagination'
import { Toolbar } from '../../../shared/components/Toolbar/Toolbar'
import { getEduQuestions, type EduQuestionKind } from '../eduApi'
import { htmlToText, splitTags } from '../eduUtils'
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
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('displayOrder')
  const [isExpandedView, setIsExpandedView] = useState(false)
  const [printOptions, setPrintOptions] = useState({ showAnswer: false, showExplanation: false })
  const backendSearchQuery = searchQuery.trim() || undefined
  const backendTag = selectedTag ?? undefined
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
    if (selectedTag) {
      filtered = filtered.filter((item) => splitTags(item.tags).map((tag) => tag.toLowerCase()).includes(selectedTag.toLowerCase()))
    }
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
  }, [items, language, searchQuery, selectedTag, sortOrder])

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="page-container edu-page fill-blank-page">
      <section className="edu-hero">
        <div>
          <h1>{t(`edu.${kind}.title`)}</h1>
          <p>{t('edu.subtitle')}</p>
        </div>
        <div className="edu-hero__count"><strong>{displayItems.length}</strong><span>{t('edu.result_count', { count: totalElements })}</span></div>
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

      <div className="edu-page-actions">
        <button type="button" className="edu-page-action" onClick={() => setIsExpandedView((value) => !value)}>{isExpandedView ? t('vocabulary.compact') : t('vocabulary.detailed')}</button>
        <label className="edu-print-option"><input type="checkbox" checked={printOptions.showAnswer} onChange={(event) => setPrintOptions((current) => ({ ...current, showAnswer: event.target.checked }))} /> {t('edu.answer')}</label>
        <label className="edu-print-option"><input type="checkbox" checked={printOptions.showExplanation} onChange={(event) => setPrintOptions((current) => ({ ...current, showExplanation: event.target.checked }))} /> {t('edu.explanation')}</label>
        <button type="button" className="edu-page-action" disabled={displayItems.length === 0} onClick={() => openPrintWindow(generatePrintExamSheet({ questions: displayItems, title: t('edu.fill-blank-questions.title'), language, ...printOptions }))}>{t('vocabulary.print')}</button>
      </div>

      {loading ? (
        <div className="fill-blank-list" aria-hidden>{skeletonItems.map((item) => <div key={item} className="fill-blank-card skeleton" />)}</div>
      ) : error ? (
        <div className="state-card state-card--error">{error}</div>
      ) : (
        <div className="fill-blank-list">
          {displayItems.map((question) => (
            <FillBlankQuestionCard key={question.id} question={question} isExpandedView={isExpandedView} lang={language} />
          ))}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} totalElements={totalElements} onPageChange={setCurrentPage} onPageSizeChange={handlePageSizeChange} />
    </div>
  )
}

export default EduFillBlankQuestionsPage
