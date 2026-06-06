import { useCallback, useEffect, useRef, useState } from 'react'
import type { EduQuestion } from '../../../shared/data/types'
import { useT } from '../../../shared/i18n'
import { htmlToText, renderHtml } from '../eduUtils'
import { QuestionImages } from './QuestionImages'

const options = ['A', 'B', 'C', 'D'] as const

export const MultipleChoiceQuestionCard = ({
  question,
  isExpandedView,
  lang,
}: {
  question: EduQuestion
  isExpandedView: boolean
  lang: string
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

  const handleOptionClick = useCallback(
    (event: React.MouseEvent, option: string) => {
      event.stopPropagation()
      if (isCorrect || selectedAnswers.includes(option)) return
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
      setErrorOption(null)
      const previousCorrect = selectedAnswers.filter((answer) => answer === question.answer)
      setSelectedAnswers([...previousCorrect, option])
      if (option === question.answer) {
        setIsCorrect(true)
      } else {
        setErrorOption(option)
        errorTimeoutRef.current = window.setTimeout(() => {
          setErrorOption(null)
          setSelectedAnswers((current) => current.filter((answer) => answer !== option))
          errorTimeoutRef.current = null
        }, 1600)
      }
    },
    [isCorrect, question.answer, selectedAnswers],
  )

  const optionClass = (option: string) => {
    if (!selectedAnswers.includes(option)) return 'mcq-option'
    if (option === errorOption) return 'mcq-option error'
    if (option === question.answer) return 'mcq-option correct'
    return 'mcq-option selected'
  }

  const collapse = (event: React.MouseEvent) => {
    event.stopPropagation()
    setIsExpanded(false)
    setSelectedAnswers([])
    setIsCorrect(false)
    setErrorOption(null)
  }

  return (
    <div className={`mcq-card ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {!isExpanded ? (
        <button className="mcq-card-header" type="button" onClick={() => setIsExpanded(true)} aria-label={t('vocabulary.view_details')}>
          <div className="mcq-card-question-preview">{htmlToText(question.question).slice(0, 180)}</div>
          <span className="expand-icon">⌄</span>
        </button>
      ) : (
        <div className="mcq-card-expanded">
          <div className="mcq-card-header-expanded">
            <QuestionImages questionId={question.id} referenceKey="multipleChoiceQuestionId" lang={lang} />
            <div className="mcq-card-question-full" dangerouslySetInnerHTML={renderHtml(question.question)} />
            <button type="button" className="collapse-btn" onClick={collapse} aria-label={t('vocabulary.hide')}>⌃</button>
          </div>
          <div className="mcq-options">
            {options.map((letter) => {
              const value = question[`option${letter}` as keyof EduQuestion] as string | null | undefined
              if (!value) return null
              return (
                <button key={letter} type="button" className={optionClass(letter)} onClick={(event) => handleOptionClick(event, letter)}>
                  <span className="option-letter">{letter}</span>
                  <span className="option-content" dangerouslySetInnerHTML={renderHtml(value)} />
                  {selectedAnswers.includes(letter) && question.answer === letter ? <span className="option-indicator">✓</span> : null}
                  {selectedAnswers.includes(letter) && question.answer !== letter ? <span className="option-indicator">×</span> : null}
                </button>
              )
            })}
          </div>
          {isCorrect ? <div className="mcq-feedback correct">✓ {t('edu.correct')}</div> : null}
          {isCorrect && question.explanation ? (
            <div className="mcq-explanation">
              <h4>{t('edu.explanation')}</h4>
              <div dangerouslySetInnerHTML={renderHtml(question.explanation)} />
            </div>
          ) : null}
          <div className="mcq-metadata">
            {question.difficultyLevel ? <span>{question.difficultyLevel}</span> : null}
            {question.successCount !== null && question.successCount !== undefined ? <span>✓ {question.successCount}</span> : null}
            {question.failCount !== null && question.failCount !== undefined ? <span>× {question.failCount}</span> : null}
          </div>
        </div>
      )}
    </div>
  )
}

