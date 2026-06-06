import { useEffect, useState } from 'react'
import type { EduQuestion } from '../../../shared/data/types'
import { useT } from '../../../shared/i18n'
import { htmlToText, renderHtml } from '../eduUtils'
import { QuestionImages } from './QuestionImages'

export const TrueFalseQuestionCard = ({ question, isExpandedView, lang }: { question: EduQuestion; isExpandedView: boolean; lang: string }) => {
  const t = useT()
  const [isExpanded, setIsExpanded] = useState(isExpandedView)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  useEffect(() => setIsExpanded(isExpandedView), [isExpandedView])

  const answer = (value: 'TRUE' | 'FALSE') => {
    if (isAnswered) return
    setIsCorrect(value === question.answer)
    setIsAnswered(true)
  }

  const reset = () => {
    setIsAnswered(false)
    setIsCorrect(null)
  }

  return (
    <div className={`tfq-card ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {!isExpanded ? (
        <button type="button" className="tfq-card-header" onClick={() => setIsExpanded(true)}>
          <div className="tfq-card-question-preview">{htmlToText(question.question).slice(0, 180)}</div>
          <span className="expand-icon">⌄</span>
        </button>
      ) : (
        <div className="tfq-card-expanded">
          <QuestionImages questionId={question.id} referenceKey="trueFalseQuestionId" lang={lang} />
          <div className="tfq-card-header-expanded">
            <div className="tfq-card-question-full" dangerouslySetInnerHTML={renderHtml(question.question)} />
            <button type="button" className="collapse-btn" onClick={() => { setIsExpanded(false); reset() }}>⌃</button>
          </div>
          {!isAnswered ? (
            <div className="tfq-answer-buttons">
              <button type="button" className="tfq-btn tfq-btn-true" onClick={() => answer('TRUE')}>✓ True</button>
              <button type="button" className="tfq-btn tfq-btn-false" onClick={() => answer('FALSE')}>× False</button>
            </div>
          ) : (
            <>
              <div className={`tfq-result ${isCorrect ? 'correct' : 'incorrect'}`}>{isCorrect ? t('edu.correct') : t('edu.incorrect')}</div>
              {question.explanation ? <div className="tfq-explanation" dangerouslySetInnerHTML={renderHtml(question.explanation)} /> : null}
              <button type="button" className="tfq-reset-btn" onClick={reset}>{t('vocabulary.try_again')}</button>
            </>
          )}
          <div className="tfq-metadata">{question.difficultyLevel ? <span>{question.difficultyLevel}</span> : null}</div>
        </div>
      )}
    </div>
  )
}

