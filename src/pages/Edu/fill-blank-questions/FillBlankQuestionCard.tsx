import { useEffect, useMemo, useRef, useState } from 'react'
import type { EduQuestion } from '../../../shared/data/types'
import { useT } from '../../../shared/i18n'
import { htmlToText, renderHtml } from '../eduUtils'
import { QuestionImages } from './QuestionImages'

export const FillBlankQuestionCard = ({ question, isExpandedView, lang }: { question: EduQuestion; isExpandedView: boolean; lang: string }) => {
  const t = useT()
  const [isExpanded, setIsExpanded] = useState(isExpandedView)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { blankCount, correctAnswers } = useMemo(() => {
    const count = (htmlToText(question.question).match(/____/g) || []).length
    return { blankCount: count, correctAnswers: (question.answer ?? '').split(',').map((answer) => answer.trim()) }
  }, [question.answer, question.question])

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
    setTimeout(() => inputRefs.current[0]?.focus(), 0)
  }

  return (
    <div className={`fbq-card ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {!isExpanded ? (
        <button type="button" className="fbq-card-header" onClick={() => setIsExpanded(true)}>
          <div className="fbq-card-question-preview">{htmlToText(question.question).slice(0, 180)}</div>
          <span className="expand-icon">⌄</span>
        </button>
      ) : (
        <div className="fbq-card-expanded">
          <QuestionImages questionId={question.id} referenceKey="fillBlankQuestionId" lang={lang} />
          <div className="fbq-card-header-expanded">
            {renderQuestionWithInputs()}
            <div className="fbq-header-controls">
              {!isAnswered ? <button type="button" className="fbq-check-btn" onClick={checkAnswers} disabled={!userAnswers.every((answer) => answer.trim())}>✓</button> : null}
              <button type="button" className="collapse-btn" onClick={() => { setIsExpanded(false); reset() }}>⌃</button>
            </div>
          </div>
          {isAnswered ? (
            <>
              <div className={`fbq-result ${isCorrect ? 'correct' : 'incorrect'}`}>{isCorrect ? t('edu.correct') : t('edu.incorrect')}</div>
              {!isCorrect ? <div className="fbq-answer"><h4>{t('edu.answer')}</h4>{correctAnswers.map((answer, index) => <div key={`${answer}-${index}`}>({index + 1}) {answer}</div>)}</div> : null}
              {question.explanation ? <div className="fbq-explanation" dangerouslySetInnerHTML={renderHtml(question.explanation)} /> : null}
              <button type="button" className="fbq-reset-btn" onClick={reset}>{t('vocabulary.try_again')}</button>
            </>
          ) : null}
          <div className="fbq-metadata">{question.difficultyLevel ? <span>{question.difficultyLevel}</span> : null}</div>
        </div>
      )}
    </div>
  )
}

