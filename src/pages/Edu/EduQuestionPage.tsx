import { type ChangeEvent, useCallback, useMemo, useState } from 'react'
import type { EduQuestion } from '../../shared/data/types'
import { useAppSettings } from '../../shared/contexts/AppSettings'
import { useUIContext } from '../../shared/contexts/UIContext'
import { useT } from '../../shared/i18n'
import { usePagedFetch } from '../../shared/hooks/usePagedFetch'
import { Pagination } from '../../shared/ui/Pagination'
import { Toolbar } from '../../shared/components/Toolbar/Toolbar'
import { getEduQuestions, type EduQuestionKind } from './eduApi'
import { htmlToText, renderHtml, splitTags } from './eduUtils'
import { QuestionImages } from './QuestionImages'
import './edu.css'

type SortOrder = 'displayOrder' | 'alpha' | 'recent'

const imageKeys: Record<EduQuestionKind, 'multipleChoiceQuestionId' | 'freeTextQuestionId' | 'trueFalseQuestionId' | 'fillBlankQuestionId'> = {
  'multiple-choice-questions': 'multipleChoiceQuestionId',
  'fill-blank-questions': 'fillBlankQuestionId',
  'free-text-questions': 'freeTextQuestionId',
  'true-false-questions': 'trueFalseQuestionId',
}

const matches = (question: EduQuestion, query: string) => {
  if (!query) return true
  const text = query.toLowerCase()
  return [question.question, question.answer, question.explanation, question.tags]
    .some((field) => htmlToText(field).toLowerCase().includes(text))
}

const options = ['A', 'B', 'C', 'D'] as const

export const EduQuestionPage = ({ kind }: { kind: EduQuestionKind }) => {
  const { language } = useUIContext()
  const { getTags } = useAppSettings()
  const t = useT()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('displayOrder')
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [selected, setSelected] = useState<Record<string, string>>({})
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

  const toggleAnswer = (id: string) => setRevealed((current) => ({ ...current, [id]: !current[id] }))
  const chooseAnswer = (question: EduQuestion, answer: string) => setSelected((current) => ({ ...current, [question.id]: answer }))

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

      {loading ? (
        <div className="edu-question-list" aria-hidden>{skeletonItems.map((item) => <div key={item} className="edu-question-card skeleton" />)}</div>
      ) : error ? (
        <div className="state-card state-card--error">{error}</div>
      ) : (
        <div className="edu-question-list">
          {displayItems.map((question) => {
            const selectedAnswer = selected[question.id]
            const isRevealed = revealed[question.id] || (kind === 'multiple-choice-questions' && Boolean(selectedAnswer))
            return (
              <article key={question.id} className="edu-question-card">
                <QuestionImages questionId={question.id} referenceKey={imageKeys[kind]} lang={language} />
                <div className="edu-question-card__question" dangerouslySetInnerHTML={renderHtml(question.question)} />
                {kind === 'multiple-choice-questions' ? (
                  <div className="edu-options">
                    {options.map((letter) => {
                      const value = question[`option${letter}` as keyof EduQuestion] as string | null | undefined
                      if (!value) return null
                      const correct = question.answer === letter
                      const active = selectedAnswer === letter
                      return (
                        <button
                          key={letter}
                          type="button"
                          className={`edu-option${active ? ' edu-option--active' : ''}${active && correct ? ' edu-option--correct' : ''}${active && !correct ? ' edu-option--wrong' : ''}`}
                          onClick={() => chooseAnswer(question, letter)}
                        >
                          <strong>{letter}</strong>
                          <span dangerouslySetInnerHTML={renderHtml(value)} />
                        </button>
                      )
                    })}
                  </div>
                ) : null}
                {kind !== 'multiple-choice-questions' ? (
                  <button type="button" className="edu-answer-toggle" onClick={() => toggleAnswer(question.id)}>
                    {isRevealed ? t('edu.hide_answer') : t('edu.show_answer')}
                  </button>
                ) : null}
                {isRevealed ? (
                  <div className="edu-answer">
                    {question.answer ? <p><strong>{t('edu.answer')}:</strong> {question.answer}</p> : null}
                    {question.explanation ? <div className="edu-rich" dangerouslySetInnerHTML={renderHtml(question.explanation)} /> : null}
                    {kind === 'free-text-questions' ? (
                      <div className="edu-free-text-pairs">
                        {(['A', 'B', 'C', 'D', 'E', 'F'] as const).map((letter) => {
                          const q = question[`question${letter}` as keyof EduQuestion] as string | null | undefined
                          const a = question[`answer${letter}` as keyof EduQuestion] as string | null | undefined
                          return q || a ? <p key={letter}><strong>{htmlToText(q)}</strong>{a ? ` ${htmlToText(a)}` : ''}</p> : null
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <div className="edu-card__meta">
                  {question.difficultyLevel ? <span>{question.difficultyLevel}</span> : null}
                  {question.gradeLevel ? <span>{question.gradeLevel}</span> : null}
                  {question.term ? <span>T{question.term}</span> : null}
                  {question.week ? <span>W{question.week}</span> : null}
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} totalElements={totalElements} onPageChange={setCurrentPage} onPageSizeChange={handlePageSizeChange} />
    </div>
  )
}

export default EduQuestionPage
