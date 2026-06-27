import { useEffect, useState, useCallback } from 'react'
import type { EduQuestion } from '../../../shared/data/types'
import { useT } from '../../../shared/i18n'
import { FavoriteBadge, FavoriteToggleButton } from '../FavoriteToggleButton'
import { hasFavoriteTag } from '../favoriteUtils'
import { toggleEduQuestionFavoriteTag } from '../eduApi'
import { htmlToText, renderHtml } from '../eduUtils'
import { AnswerIcon, ExplanationIcon, QuestionToolButton, QuestionTools } from '../question-common/QuestionCardTools'
import '../question-common/questionCardTools.css'

const pairs = ['A', 'B', 'C', 'D', 'E', 'F'] as const

export const FreeTextQuestionCard = ({
  question: initialQuestion,
  isExpandedView,
  onFavoriteUpdated,
}: {
  question: EduQuestion
  isExpandedView: boolean
  onFavoriteUpdated?: (question: EduQuestion) => void
}) => {
  const t = useT()
  const [question, setQuestion] = useState(initialQuestion)
  const [isExpanded, setIsExpanded] = useState(isExpandedView)
  const [mainAnswer, setMainAnswer] = useState('')
  const [subAnswers, setSubAnswers] = useState<Record<string, string>>({})
  const [revealedSubAnswers, setRevealedSubAnswers] = useState<Record<string, boolean>>({})
  const [showAnswer, setShowAnswer] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const subquestions = pairs
    .map((letter) => ({
      answer: question[`answer${letter}` as keyof EduQuestion] as string | null | undefined,
      letter,
      question: question[`question${letter}` as keyof EduQuestion] as string | null | undefined,
    }))
    .filter((item) => htmlToText(item.question).length > 0 || htmlToText(item.answer).length > 0)
  const hasSubquestions = subquestions.some((item) => htmlToText(item.question).length > 0)

  useEffect(() => setQuestion(initialQuestion), [initialQuestion])
  useEffect(() => setIsExpanded(isExpandedView), [isExpandedView])

  const reset = () => {
    setShowAnswer(false)
    setMainAnswer('')
    setSubAnswers({})
    setRevealedSubAnswers({})
    setShowExplanation(false)
  }

  const toggleMainAnswer = () => {
    setShowAnswer((current) => {
      const next = !current
      setMainAnswer(next ? htmlToText(question.answer) : '')
      return next
    })
  }

  const toggleSubAnswer = (letter: string, answer?: string | null) => {
    setRevealedSubAnswers((current) => {
      const next = !current[letter]
      setSubAnswers((answers) => ({ ...answers, [letter]: next ? htmlToText(answer) : '' }))
      return { ...current, [letter]: next }
    })
  }

  const handleCardClick = useCallback(() => {
    if (!isExpanded) {
      setIsExpanded(true)
    }
  }, [isExpanded])

  const toggleExpanded = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsExpanded(!isExpanded)
      if (isExpanded) {
        reset()
      }
    },
    [isExpanded]
  )

  const handleToggleFavorite = useCallback(async () => {
    setIsTogglingFavorite(true)
    try {
      const response = await toggleEduQuestionFavoriteTag('free-text-questions', question.id)
      setQuestion(response.data)
      onFavoriteUpdated?.(response.data)
    } finally {
      setIsTogglingFavorite(false)
    }
  }, [onFavoriteUpdated, question.id])

  return (
    <div
      className={`ftq-card ${isExpanded ? 'expanded' : 'collapsed'}`}
      onClick={handleCardClick}
    >
      {/* Card Header (clickable when collapsed or expanded) */}
      <button
        className="ftq-card-header"
        onClick={toggleExpanded}
        type="button"
        aria-expanded={isExpanded}
        aria-label={t('vocabulary.view_details')}
      >
        <div className="ftq-card-question-preview">
          {hasFavoriteTag(question) ? <FavoriteBadge className="edu-card-favourite" /> : null}
          <span>{htmlToText(question.question || question.description || '').slice(0, 180)}</span>
        </div>
        <svg className={`expand-icon ${isExpanded ? 'rotated' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Slide-down Card Body wrapper */}
      <div className="ftq-card-body-wrapper">
        <div className="ftq-card-body-inner">
          <div className="ftq-exam-main-question">
            <div className="ftq-exam-question-line">
              <div className="ftq-exam-text" dangerouslySetInnerHTML={renderHtml(question.question || question.description)} />
              <div className="ftq-header-controls">
                <button
                  type="button"
                  className="collapse-btn"
                  onClick={toggleExpanded}
                  aria-label={t('vocabulary.hide')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 15l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            {!hasSubquestions ? (
              <>
                <div className="ftq-exam-interaction-row">
                  <textarea
                    className="ftq-user-input"
                    placeholder={t('vocabulary.your_answer')}
                    value={mainAnswer}
                    onChange={(event) => setMainAnswer(event.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    />
                  </div>
              </>
            ) : null}
          </div>

          {subquestions.length > 0 ? (
            <div className="ftq-exam-parts">
              {subquestions.map(({ answer, letter, question: subquestion }) => (
                <section key={letter} className="ftq-exam-part animate-fade-in">
                  <div className="ftq-exam-part-header">
                    <div className="ftq-exam-part-label">{letter}</div>
                    <div className="ftq-exam-text" dangerouslySetInnerHTML={renderHtml(subquestion)} />
                  </div>
                  <div className="ftq-exam-interaction-row">
                    <textarea
                      className="ftq-user-input"
                      placeholder={t('vocabulary.your_answer')}
                      value={subAnswers[letter] ?? ''}
                      onChange={(event) => setSubAnswers((current) => ({ ...current, [letter]: event.target.value }))}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <QuestionToolButton
                      active={Boolean(revealedSubAnswers[letter])}
                      disabled={!answer}
                      label={t('edu.answer')}
                      onClick={() => toggleSubAnswer(letter, answer)}
                    >
                      <AnswerIcon />
                    </QuestionToolButton>
                  </div>
                </section>
              ))}
            </div>
          ) : null}

          {showExplanation && question.explanation ? (
            <div className="ftq-exam-explanation-box animate-fade-in">
              <span>{t('edu.explanation')}:</span>
              <div dangerouslySetInnerHTML={renderHtml(question.explanation)} />
            </div>
          ) : null}

          <QuestionMeta
            question={question}
            hasSubquestions={hasSubquestions}
            showAnswer={showAnswer}
            showExplanation={showExplanation}
            onToggleAnswer={toggleMainAnswer}
            onToggleExplanation={() => setShowExplanation((current) => !current)}
            onToggleFavorite={handleToggleFavorite}
            isFavourite={hasFavoriteTag(question)}
            isTogglingFavorite={isTogglingFavorite}
          />
        </div>
      </div>
    </div>
  )
}

const QuestionMeta = ({
  hasSubquestions,
  onToggleAnswer,
  onToggleExplanation,
  onToggleFavorite,
  question,
  showAnswer,
  showExplanation,
  isFavourite,
  isTogglingFavorite,
}: {
  onToggleAnswer: () => void
  onToggleExplanation: () => void
  onToggleFavorite: () => void
  hasSubquestions: boolean
  question: EduQuestion
  showAnswer: boolean
  showExplanation: boolean
  isFavourite: boolean
  isTogglingFavorite: boolean
}) => {
  const t = useT()
  return (
    <div className="ftq-metadata">
      <QuestionTools>
        <FavoriteToggleButton
          active={isFavourite}
          className="edu-question-tool-btn"
          disabled={isTogglingFavorite}
          onClick={onToggleFavorite}
        />
        {!hasSubquestions ? (
          <QuestionToolButton
            active={showAnswer}
            disabled={!question.answer}
            label={t('edu.answer')}
            onClick={onToggleAnswer}
          >
            <AnswerIcon />
          </QuestionToolButton>
        ) : null}
        <QuestionToolButton
          active={showExplanation}
          disabled={!question.explanation}
          label={t('edu.explanation')}
          onClick={onToggleExplanation}
        >
          <ExplanationIcon />
        </QuestionToolButton>
      </QuestionTools>
      <div className="ftq-metadata-values">
        {question.difficultyLevel ? <span className="difficulty">{question.difficultyLevel}</span> : null}
        {question.successCount !== null && question.successCount !== undefined ? <span className="success">✓ {question.successCount}</span> : null}
        {question.failCount !== null && question.failCount !== undefined ? <span className="fail">× {question.failCount}</span> : null}
      </div>
    </div>
  )
}

export default FreeTextQuestionCard
