import { useId, useMemo, useState } from 'react'
import type { Question } from '../../../shared/data/types'
import { useT } from '../../../shared/i18n'
import { QuestionAnswer } from './QuestionAnswer'

interface QuestionCardProps {
  question: Question
}

const getUniqueTags = (tags: string) => {
  const unique: string[] = []
  const seen = new Set<string>()

  const parts = tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
  for (const tag of parts) {
    const key = tag.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(tag)
    }
  }

  return unique
}

export const QuestionCard = ({ question }: QuestionCardProps) => {
  const t = useT()
  const [expanded, setExpanded] = useState(false)
  const answerId = useId()

  const tags = useMemo(() => getUniqueTags(question.tags ?? ''), [question.tags])

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  return (
    <article
      className={`card question-card${expanded ? ' question-card--expanded' : ''}`}
      aria-label={question.question}
    >
      <button
        type="button"
        className="question-card__header"
        onClick={toggleExpanded}
        aria-expanded={expanded}
        aria-controls={answerId}
        aria-label={t(expanded ? 'questions.collapse' : 'questions.expand', { question: question.question })}
      >
        <span className="question-card__mark" aria-hidden="true">
          Q
        </span>
        <div className="question-card__content">
          <h3 className="question-card__question">{question.question}</h3>
          {tags.length > 0 && (
            <div className="question-card__tags">
              {tags.map((tag) => (
                <span key={tag} className="question-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className={`question-card__icon ${expanded ? 'question-card__icon--expanded' : ''}`}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </button>

      {expanded && (
        <>
          <QuestionAnswer id={answerId} answer={question.answer} />
          <div className="question-card__footer">
            <button
              className="question-card__close-btn"
              onClick={(e) => {
                e.stopPropagation()
                setExpanded(false)
              }}
              aria-label={t('common.close')}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </button>
          </div>
        </>
      )}
    </article>
  )
}

export default QuestionCard
