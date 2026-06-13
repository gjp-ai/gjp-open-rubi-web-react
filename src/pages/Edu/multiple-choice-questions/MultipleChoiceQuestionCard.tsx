import { useCallback, useEffect, useRef, useState } from 'react'
import type { EduQuestion } from '../../../shared/data/types'
import { useT } from '../../../shared/i18n'
import { htmlToText, renderHtml } from '../eduUtils'
import './MultipleChoiceQuestionCard.css'

const options = ['A', 'B', 'C', 'D'] as const

export const MultipleChoiceQuestionCard = ({
  question,
  isExpandedView,
}: {
  question: EduQuestion
  isExpandedView: boolean
}) => {
  const t = useT()
  const [isExpanded, setIsExpanded] = useState(isExpandedView)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [isCorrect, setIsCorrect] = useState(false)
  const [errorOption, setErrorOption] = useState<string | null>(null)
  const errorTimeoutRef = useRef<number | null>(null)

  useEffect(() => setIsExpanded(isExpandedView), [isExpandedView])
  useEffect(
    () => () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
    },
    [],
  )

  const handleCardClick = useCallback(() => {
    if (!isExpanded) {
      setIsExpanded(true)
    }
  }, [isExpanded])

  const handleOptionClick = useCallback(
    (event: React.MouseEvent, option: string) => {
      event.stopPropagation()
      if (isCorrect || selectedAnswers.includes(option)) return

      // Clear any existing error styling
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current)
        errorTimeoutRef.current = null
      }
      setErrorOption(null)
      // Remove any previous wrong answers
      setSelectedAnswers((prev) => prev.filter((ans) => ans === question.answer))

      const newAnswers = [...selectedAnswers.filter((ans) => ans === question.answer), option]
      setSelectedAnswers(newAnswers)

      if (option === question.answer) {
        setIsCorrect(true)
      } else {
        setErrorOption(option)
        // Auto-remove error style after 2 seconds
        errorTimeoutRef.current = window.setTimeout(() => {
          setErrorOption(null)
          setSelectedAnswers((prev) => prev.filter((ans) => ans !== option))
          errorTimeoutRef.current = null
        }, 2000)
      }
    },
    [isCorrect, question.answer, selectedAnswers],
  )

  const getOptionClass = useCallback(
    (option: string) => {
      const wasSelected = selectedAnswers.includes(option)
      if (!wasSelected) return 'mcq-option'
      if (option === errorOption) return 'mcq-option error'
      if (option === question.answer) return 'mcq-option correct'
      return 'mcq-option selected'
    },
    [selectedAnswers, question.answer, errorOption],
  )

  const toggleExpanded = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsExpanded(!isExpanded)
      if (isExpanded) {
        // Reset answer state when collapsing
        setSelectedAnswers([])
        setIsCorrect(false)
        setErrorOption(null)
        if (errorTimeoutRef.current) {
          clearTimeout(errorTimeoutRef.current)
          errorTimeoutRef.current = null
        }
      }
    },
    [isExpanded],
  )

  return (
    <div
      className={`mcq-card ${isExpanded ? 'expanded' : 'collapsed'}`}
      onClick={handleCardClick}
    >
      {/* Card Header (clickable to expand/collapse) */}
      <button
        className="mcq-card-header"
        onClick={toggleExpanded}
        type="button"
        aria-expanded={isExpanded}
        aria-label={t('vocabulary.view_details')}
      >
        <div className="mcq-card-question-preview-container">
          <div className="mcq-card-question-preview">{htmlToText(question.question).slice(0, 150)}</div>
          <div className="mcq-card-question-full" dangerouslySetInnerHTML={renderHtml(question.question)} />
        </div>
        <svg className={`expand-icon ${isExpanded ? 'rotated' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Slide-down Card Body wrapper */}
      <div className="mcq-card-body-wrapper">
        <div className="mcq-card-body-inner">
          {/* Options */}
          <div className="mcq-options">
            {options.map((letter) => {
              const value = question[`option${letter}` as keyof EduQuestion] as string | null | undefined
              if (!value) return null
              return (
                <button
                  key={letter}
                  className={getOptionClass(letter)}
                  onClick={(e) => handleOptionClick(e, letter)}
                  type="button"
                >
                  <span className="option-letter">{letter}</span>
                  <span className="option-content" dangerouslySetInnerHTML={renderHtml(value)} />
                  {selectedAnswers.includes(letter) && question.answer === letter && (
                    <span className="option-indicator correct-indicator">✓</span>
                  )}
                  {selectedAnswers.includes(letter) && question.answer !== letter && (
                    <span className="option-indicator incorrect-indicator">✗</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Answer Feedback */}
          {isCorrect && (
            <div className="mcq-feedback correct animate-fade-in">
              <span className="feedback-icon">✓</span>
              <span className="feedback-text">{t('edu.correct')}</span>
            </div>
          )}

          {/* Explanation */}
          {isCorrect && question.explanation && (
            <div className="mcq-explanation animate-fade-in">
              <h4>{t('edu.explanation')}</h4>
              <div className="explanation-content" dangerouslySetInnerHTML={renderHtml(question.explanation)} />
            </div>
          )}

          {/* Question Metadata */}
          <div className="mcq-metadata">
            {question.difficultyLevel && (
              <div className="mcq-meta-item">
                <span className="meta-icon">📊</span>
                <span className="meta-value difficulty">{question.difficultyLevel}</span>
              </div>
            )}
            {question.successCount !== null && question.successCount !== undefined && (
              <div className="mcq-meta-item">
                <span className="meta-icon success">✓</span>
                <span className="meta-value success">{question.successCount}</span>
              </div>
            )}
            {question.failCount !== null && question.failCount !== undefined && (
              <div className="mcq-meta-item">
                <span className="meta-icon fail">✗</span>
                <span className="meta-value fail">{question.failCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MultipleChoiceQuestionCard
