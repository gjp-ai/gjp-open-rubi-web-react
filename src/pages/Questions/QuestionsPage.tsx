import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import type { Question } from '../../shared/data/types'
import { useUIContext } from '../../shared/contexts/UIContext'
import { useAppSettings } from '../../shared/contexts/AppSettings'
import { useT } from '../../shared/i18n'
import { usePagedFetch } from '../../shared/hooks/usePagedFetch'
import { Pagination } from '../../shared/ui/Pagination'
import { getQuestions } from './questionsApi'
import { QuestionCard } from './components/QuestionCard'
import { QuestionAnswer } from './components/QuestionAnswer'
import { Toolbar } from '../../shared/components/Toolbar/Toolbar'
import './questions.css'

const normalizeText = (value: string) => value.toLowerCase()

const matchesSearch = (question: Question, query: string) => {
  if (!query) {
    return true
  }

  const text = normalizeText(query)
  const fields = [question.question, question.answer, question.tags ?? '']
  return fields.some((field) => normalizeText(field).includes(text))
}

const hasTag = (question: Question, tag: string | null) => {
  if (!tag) {
    return true
  }

  const tagList = (question.tags ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  return tagList.includes(tag.toLowerCase())
}

type SortOrder = 'displayOrder' | 'alpha' | 'recent'

const QUESTIONS_PER_INDEX_PAGE = 8

const getUniqueTags = (tags: string | undefined) => {
  const unique: string[] = []
  const seen = new Set<string>()

  for (const tag of (tags ?? '').split(',')) {
    const trimmed = tag.trim()
    const key = trimmed.toLowerCase()

    if (trimmed && !seen.has(key)) {
      seen.add(key)
      unique.push(trimmed)
    }
  }

  return unique
}

export const QuestionsPage = () => {
  const { language } = useUIContext()
  const [searchQuery, setSearchQuery] = useState('')
  const { getTags } = useAppSettings()
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('displayOrder')
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [indexPage, setIndexPage] = useState(1)
  const sectionTags = getTags('question_tags')
  const t = useT()
  const backendSearchQuery = searchQuery.trim() || undefined
  const backendTag = selectedTag ?? undefined

  const fetcher = useCallback(
    (page: number, size: number, lang: string, signal: AbortSignal) =>
      getQuestions(page, size, backendSearchQuery, backendTag, lang, signal),
    [backendSearchQuery, backendTag],
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
  } = usePagedFetch(fetcher, { initialPageSize: 500, skeletonCount: 5 })

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
          a.question.localeCompare(b.question, language === 'ZH' ? 'zh-CN' : 'en', { sensitivity: 'base' }),
        )
        break
      case 'recent':
        filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        break
    }

    return filtered
  }, [items, searchQuery, selectedTag, sortOrder, language])

  const selectedQuestion = useMemo(
    () => displayItems.find((item) => item.id === selectedQuestionId) ?? displayItems[0],
    [displayItems, selectedQuestionId],
  )

  const indexTotalPages = Math.max(1, Math.ceil(displayItems.length / QUESTIONS_PER_INDEX_PAGE))
  const indexPageItems = useMemo(
    () => displayItems.slice((indexPage - 1) * QUESTIONS_PER_INDEX_PAGE, indexPage * QUESTIONS_PER_INDEX_PAGE),
    [displayItems, indexPage],
  )

  useEffect(() => {
    if (displayItems.length === 0) {
      setSelectedQuestionId(null)
      return
    }

    if (!selectedQuestionId || !displayItems.some((item) => item.id === selectedQuestionId)) {
      setSelectedQuestionId(displayItems[0].id)
    }
  }, [displayItems, selectedQuestionId])

  useEffect(() => {
    if (indexPage > indexTotalPages) {
      setIndexPage(indexTotalPages)
    }
  }, [indexPage, indexTotalPages])

  useEffect(() => {
    if (indexPageItems.length === 0) {
      return
    }

    if (!selectedQuestionId || !indexPageItems.some((item) => item.id === selectedQuestionId)) {
      setSelectedQuestionId(indexPageItems[0].id)
    }
  }, [indexPageItems, selectedQuestionId])

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
    setIndexPage(1)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setCurrentPage(1)
    setIndexPage(1)
  }

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag)
    setCurrentPage(1)
    setIndexPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="page-container questions-page">
      <section className="questions-hero" aria-labelledby="questions-title">
        <div>
          <h1 id="questions-title" className="questions-hero__title">
            {t('questions.title')}
          </h1>
          <p className="questions-hero__subtitle">{t('questions.subtitle')}</p>
        </div>
        <div className="questions-hero__meta" aria-label={t('questions.result_count', { count: displayItems.length })}>
          <strong>{displayItems.length}</strong>
          <span>{t('questions.meta_label')}</span>
        </div>
      </section>

      <Toolbar
        sectionTags={sectionTags}
        selectedTag={selectedTag}
        onSelectTag={handleTagSelect}
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onClearSearch={handleClearSearch}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        namespace="questions"
      />

      {loading ? (
        <div className="questions-workspace questions-workspace--skeleton" aria-hidden="true">
          <div className="questions-index">
            <div className="skeleton skeleton--line skeleton--line-lg" />
            {skeletonItems.map((item) => (
              <div key={item} className="questions-index__skeleton">
                <div className="skeleton skeleton--line skeleton--line-lg" />
                <div className="skeleton skeleton--line skeleton--line-sm" />
              </div>
            ))}
          </div>
          <div className="questions-detail">
            <div className="skeleton skeleton--line skeleton--line-lg" />
            <div className="skeleton skeleton--line skeleton--line-sm" />
            <div className="questions-detail__skeleton-block skeleton" />
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid--questions questions-accordion--loading">
          {skeletonItems.map((item) => (
            <div key={item} className="card question-card question-card--skeleton" aria-hidden="true">
              <div className="question-card__header">
                <div className="skeleton skeleton--line skeleton--line-lg" style={{ width: '70%' }} />
              </div>
              <div className="question-card__tags" style={{ display: 'flex', gap: '0.5rem' }}>
                <div className="skeleton skeleton--pill-sm" style={{ width: '60px' }} />
                <div className="skeleton skeleton--pill-sm" style={{ width: '80px' }} />
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
          {displayItems.length > 0 ? (
            <>
              <section className="questions-workspace" aria-label={t('questions.workspace_label')}>
                <aside className="questions-index" aria-label={t('questions.index_label')}>
                  <div className="questions-index__header">
                    <span>{t('questions.index_title')}</span>
                    <strong>{t('questions.index_count', { count: displayItems.length })}</strong>
                  </div>
                  <div className="questions-index__list">
                    {indexPageItems.map((question) => {
                      const tags = getUniqueTags(question.tags)
                      const isSelected = selectedQuestion?.id === question.id

                      return (
                        <button
                          key={question.id}
                          type="button"
                          className={`questions-index__item${isSelected ? ' questions-index__item--active' : ''}`}
                          onClick={() => setSelectedQuestionId(question.id)}
                          aria-current={isSelected ? 'true' : undefined}
                        >
                          <span className="questions-index__mark" aria-hidden="true">
                            Q
                          </span>
                          <span className="questions-index__content">
                            <span className="questions-index__question">{question.question}</span>
                            {tags.length > 0 ? (
                              <span className="questions-index__tags">
                                {tags.slice(0, 2).map((tag) => (
                                  <span key={tag}>{tag}</span>
                                ))}
                              </span>
                            ) : null}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  {indexTotalPages > 1 ? (
                    <div className="questions-index__pagination" aria-label={t('questions.index_pagination_label')}>
                      <button
                        type="button"
                        className="questions-index__page-button"
                        onClick={() => setIndexPage((page) => Math.max(1, page - 1))}
                        disabled={indexPage === 1}
                      >
                        {t('pagination.prev')}
                      </button>
                      <span className="questions-index__page-status" aria-live="polite">
                        {t('questions.index_page_status', {
                          page: indexPage,
                          total: indexTotalPages,
                        })}
                      </span>
                      <button
                        type="button"
                        className="questions-index__page-button"
                        onClick={() => setIndexPage((page) => Math.min(indexTotalPages, page + 1))}
                        disabled={indexPage === indexTotalPages}
                      >
                        {t('pagination.next')}
                      </button>
                    </div>
                  ) : null}
                </aside>

                {selectedQuestion ? (
                  <article className="questions-detail" aria-labelledby="questions-detail-title">
                    <div className="questions-detail__header">
                      <span className="questions-detail__mark" aria-hidden="true">
                        Q
                      </span>
                      <div>
                        <p className="questions-detail__label">{t('questions.selected_label')}</p>
                        <h2 id="questions-detail-title" className="questions-detail__title">
                          {selectedQuestion.question}
                        </h2>
                      </div>
                    </div>

                    {getUniqueTags(selectedQuestion.tags).length > 0 ? (
                      <div className="questions-detail__tags" aria-label={t('questions.tags_label')}>
                        {getUniqueTags(selectedQuestion.tags).map((tag) => (
                          <span key={tag} className="question-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <QuestionAnswer
                      className="questions-detail__answer question-card__answer"
                      answer={selectedQuestion.answer}
                    />
                  </article>
                ) : null}
              </section>

              <div className="grid grid--questions questions-accordion">
                {indexPageItems.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))}
              </div>
              {indexTotalPages > 1 ? (
                <div className="questions-accordion__pagination" aria-label={t('questions.index_pagination_label')}>
                  <button
                    type="button"
                    className="questions-index__page-button"
                    onClick={() => setIndexPage((page) => Math.max(1, page - 1))}
                    disabled={indexPage === 1}
                  >
                    {t('pagination.prev')}
                  </button>
                  <span className="questions-index__page-status" aria-live="polite">
                    {t('questions.index_page_status', {
                      page: indexPage,
                      total: indexTotalPages,
                    })}
                  </span>
                  <button
                    type="button"
                    className="questions-index__page-button"
                    onClick={() => setIndexPage((page) => Math.min(indexTotalPages, page + 1))}
                    disabled={indexPage === indexTotalPages}
                  >
                    {t('pagination.next')}
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="status status--empty">{t('questions.empty')}</div>
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </>
      ) : null}
    </div>
  )
}
