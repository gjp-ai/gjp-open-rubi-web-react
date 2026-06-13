import { useEffect, useState, useCallback } from 'react'
import type { EduQuestion } from '../../../shared/data/types'
import { useT } from '../../../shared/i18n'
import { htmlToText, renderHtml } from '../eduUtils'
import { AnswerIcon, ExplanationIcon, QuestionToolButton, QuestionTools } from '../question-common/QuestionCardTools'
import '../question-common/questionCardTools.css'

export const TrueFalseQuestionCard = ({ question, isExpandedView }: { question: EduQuestion; isExpandedView: boolean }) => {
  const t = useT()
  const [isExpanded, setIsExpanded] = useState(isExpandedView)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<'TRUE' | 'FALSE' | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  useEffect(() => setIsExpanded(isExpandedView), [isExpandedView])

  const answer = (value: 'TRUE' | 'FALSE') => {
    if (isAnswered) return
    setIsCorrect(value === question.answer)
    setSelectedAnswer(value)
    setIsAnswered(true)
  }

  const reset = () => {
    setIsAnswered(false)
    setIsCorrect(null)
    setSelectedAnswer(null)
    setShowAnswer(false)
    setShowExplanation(false)
  }

  const getAnswerButtonClass = (value: 'TRUE' | 'FALSE') => {
    const classes = [`tfq-btn tfq-btn-${value.toLowerCase()}`]
    if (showAnswer && question.answer === value) classes.push('correct')
    if (isAnswered && selectedAnswer === value && question.answer !== value) classes.push('incorrect')
    return classes.join(' ')
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

  return (
    <div
      className={`tfq-card ${isExpanded ? 'expanded' : 'collapsed'}`}
      onClick={handleCardClick}
    >
      {/* Card Header (clickable to expand/collapse) */}
      <button
        className="tfq-card-header"
        onClick={toggleExpanded}
        type="button"
        aria-expanded={isExpanded}
        aria-label={t('vocabulary.view_details')}
      >
        <div className="tfq-card-question-preview">{htmlToText(question.question).slice(0, 180)}</div>
        <svg className={`expand-icon ${isExpanded ? 'rotated' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Slide-down Card Body wrapper */}
      <div className="tfq-card-body-wrapper">
        <div className="tfq-card-body-inner">
          <div className="tfq-card-header-expanded">
            <div className="tfq-card-question-full" dangerouslySetInnerHTML={renderHtml(question.question)} />
            <div className="tfq-header-controls">
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

          <div className="tfq-answer-buttons">
            <button type="button" className={getAnswerButtonClass('TRUE')} disabled={isAnswered} onClick={(e) => { e.stopPropagation(); answer('TRUE') }}>✓ True</button>
            <button type="button" className={getAnswerButtonClass('FALSE')} disabled={isAnswered} onClick={(e) => { e.stopPropagation(); answer('FALSE') }}>× False</button>
          </div>

          {isAnswered ? (
            <div className="tfq-result-section animate-fade-in">
              <div className={`tfq-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                {isCorrect ? t('edu.correct') : t('edu.incorrect')}
              </div>
              <button type="button" className="tfq-reset-btn" onClick={(e) => { e.stopPropagation(); reset() }}>
                {t('vocabulary.try_again')}
              </button>
            </div>
          ) : null}

          {showExplanation && question.explanation ? (
            <div className="tfq-explanation animate-fade-in" dangerouslySetInnerHTML={renderHtml(question.explanation)} />
          ) : null}

          <div className="tfq-metadata">
            <QuestionTools>
              <QuestionToolButton
                active={showAnswer}
                disabled={!question.answer}
                label={t('edu.answer')}
                onClick={() => setShowAnswer((current) => !current)}
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
            <div className="tfq-metadata-values">
              {question.difficultyLevel ? <span>{question.difficultyLevel}</span> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrueFalseQuestionCard
