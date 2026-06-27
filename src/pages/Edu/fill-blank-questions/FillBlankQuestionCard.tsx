import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import type { EduQuestion } from '../../../shared/data/types'
import { useT } from '../../../shared/i18n'
import { FavoriteToggleButton, hasFavoriteTag } from '../FavoriteToggleButton'
import { toggleEduQuestionFavoriteTag } from '../eduApi'
import { htmlToText, renderHtml } from '../eduUtils'
import { AnswerIcon, ExplanationIcon, QuestionToolButton, QuestionTools } from '../question-common/QuestionCardTools'
import '../question-common/questionCardTools.css'

export const FillBlankQuestionCard = ({ question: initialQuestion, isExpandedView }: { question: EduQuestion; isExpandedView: boolean }) => {
  const t = useT()
  const [question, setQuestion] = useState(initialQuestion)
  const [isExpanded, setIsExpanded] = useState(isExpandedView)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { blankCount, correctAnswers } = useMemo(() => {
    const count = (htmlToText(question.question).match(/____/g) || []).length
    return { blankCount: count, correctAnswers: (question.answer ?? '').split(',').map((answer) => answer.trim()) }
  }, [question.answer, question.question])

  useEffect(() => setQuestion(initialQuestion), [initialQuestion])
  useEffect(() => setIsExpanded(isExpandedView), [isExpandedView])
  useEffect(() => {
    setUserAnswers(new Array(blankCount).fill(''))
    inputRefs.current = new Array(blankCount).fill(null)
  }, [blankCount])

  const checkAnswers = () => {
    const allCorrect = userAnswers.every((answer, index) => answer.trim().toLowerCase() === (correctAnswers[index] || '').toLowerCase())
    setIsCorrect(allCorrect)
    setIsAnswered(true)
  }

  const toggleAnswer = () => {
    setShowAnswer((current) => {
      const next = !current
      setUserAnswers(next ? Array.from({ length: blankCount }, (_, index) => correctAnswers[index] || '') : new Array(blankCount).fill(''))
      if (!next) {
        setIsAnswered(false)
        setIsCorrect(null)
      }
      return next
    })
  }

  const renderQuestionWithInputs = () => {
    let blankIndex = 0
    const parts = question.question.replace(/____/g, () => `<!--BLANK_${blankIndex++}-->`).split(/<!--BLANK_(\d+)-->/)
    return (
      <div className="fbq-card-question-interactive">
        {parts.map((part, index) => {
          if (index % 2 === 1) {
            const blank = Number(part)
            const incorrect = isAnswered && userAnswers[blank]?.trim().toLowerCase() !== (correctAnswers[blank] || '').toLowerCase()
            return (
              <input
                key={`blank-${blank}`}
                ref={(element) => { inputRefs.current[blank] = element }}
                className={`fbq-inline-input ${isAnswered ? (incorrect ? 'incorrect' : 'correct') : ''}`}
                value={userAnswers[blank] || ''}
                onChange={(event) => setUserAnswers((current) => current.map((value, idx) => (idx === blank ? event.target.value : value)))}
                disabled={isAnswered}
                placeholder="____"
                onClick={(e) => e.stopPropagation()}
              />
            )
          }
          return <span key={`text-${index}`} dangerouslySetInnerHTML={renderHtml(part)} />
        })}
      </div>
    )
  }

  const reset = () => {
    setUserAnswers(new Array(blankCount).fill(''))
    setIsAnswered(false)
    setIsCorrect(null)
    setShowAnswer(false)
    setShowExplanation(false)
    setTimeout(() => inputRefs.current[0]?.focus(), 0)
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
    [isExpanded, blankCount]
  )

  const handleToggleFavorite = useCallback(async () => {
    setIsTogglingFavorite(true)
    try {
      const response = await toggleEduQuestionFavoriteTag('fill-blank-questions', question.id)
      setQuestion(response.data)
    } finally {
      setIsTogglingFavorite(false)
    }
  }, [question.id])

  return (
    <div
      className={`fbq-card ${isExpanded ? 'expanded' : 'collapsed'}`}
      onClick={handleCardClick}
    >
      {/* Card Header (clickable to expand/collapse) */}
      <button
        className="fbq-card-header"
        onClick={toggleExpanded}
        type="button"
        aria-expanded={isExpanded}
        aria-label={t('vocabulary.view_details')}
      >
        <div className="fbq-card-question-preview">{htmlToText(question.question).slice(0, 180)}</div>
        <svg className={`expand-icon ${isExpanded ? 'rotated' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Slide-down Card Body wrapper */}
      <div className="fbq-card-body-wrapper">
        <div className="fbq-card-body-inner">
          <div className="fbq-card-header-expanded">
            {renderQuestionWithInputs()}
            <div className="fbq-header-controls">
              {!isAnswered ? (
                <button
                  type="button"
                  className="fbq-check-btn"
                  onClick={checkAnswers}
                  disabled={!userAnswers.every((answer) => answer.trim())}
                >
                  ✓
                </button>
              ) : null}
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

          {isAnswered ? (
            <div className="fbq-result-section animate-fade-in">
              <div className={`fbq-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                {isCorrect ? t('edu.correct') : t('edu.incorrect')}
              </div>
              <button type="button" className="fbq-reset-btn" onClick={reset}>
                {t('vocabulary.try_again')}
              </button>
            </div>
          ) : null}

          {showExplanation && question.explanation ? (
            <div className="fbq-explanation animate-fade-in" dangerouslySetInnerHTML={renderHtml(question.explanation)} />
          ) : null}

          <div className="fbq-metadata">
            <QuestionTools>
              <FavoriteToggleButton
                active={hasFavoriteTag(question)}
                className="edu-question-tool-btn"
                disabled={isTogglingFavorite}
                onClick={handleToggleFavorite}
              />
              <QuestionToolButton
                active={showAnswer}
                disabled={correctAnswers.length === 0 || correctAnswers.every((answer) => !answer)}
                label={t('edu.answer')}
                onClick={toggleAnswer}
              >
                <AnswerIcon />
              </QuestionToolButton>
              <QuestionToolButton
                active={showExplanation}
                disabled={!question.explanation}
                label={t('edu.explanation')}
                onClick={() => setShowExplanation((current) => !current)}
              >
                <ExplanationIcon />
              </QuestionToolButton>
            </QuestionTools>
            <div className="fbq-metadata-values">
              {question.difficultyLevel ? <span>{question.difficultyLevel}</span> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FillBlankQuestionCard
