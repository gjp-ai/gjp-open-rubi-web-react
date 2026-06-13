import { useEffect, useState, useCallback } from 'react'
import type { EduQuestion } from '../../../shared/data/types'
import { useT } from '../../../shared/i18n'
import { htmlToText, renderHtml } from '../eduUtils'
import { AnswerIcon, ExplanationIcon, QuestionToolButton, QuestionTools } from '../question-common/QuestionCardTools'
import '../question-common/questionCardTools.css'

const pairs = ['A', 'B', 'C', 'D', 'E', 'F'] as const

export const FreeTextQuestionCard = ({ question, isExpandedView }: { question: EduQuestion; isExpandedView: boolean }) => {
  const t = useT()
  const [isExpanded, setIsExpanded] = useState(isExpandedView)
  const [mainAnswer, setMainAnswer] = useState('')
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [feedback, setFeedback] = useState<Record<string, 'none' | 'success' | 'fail'>>({ main: 'none' })
  const [showExplanation, setShowExplanation] = useState(false)
  const subquestions = pairs
    .map((letter) => ({
      answer: question[`answer${letter}` as keyof EduQuestion] as string | null | undefined,
      letter,
      question: question[`question${letter}` as keyof EduQuestion] as string | null | undefined,
    }))
    .filter((item) => htmlToText(item.question).length > 0 || htmlToText(item.answer).length > 0)
  const hasSubquestions = subquestions.some((item) => htmlToText(item.question).length > 0)

  useEffect(() => setIsExpanded(isExpandedView), [isExpandedView])

  const reset = () => {
    setVisible({})
    setFeedback({ main: 'none' })
    setMainAnswer('')
    setShowExplanation(false)
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
          {htmlToText(question.question || question.description || '').slice(0, 180)}
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
                <QuestionTools>
                  <QuestionToolButton
                    active={showExplanation}
                    disabled={!question.explanation}
                    label={t('edu.explanation')}
                    onClick={() => setShowExplanation((current) => !current)}
                  >
                    <ExplanationIcon />
                  </QuestionToolButton>
                </QuestionTools>
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
                  <AnswerActions
                    shown={Boolean(visible.main)}
                    status={feedback.main ?? 'none'}
                    onToggle={() => setVisible((current) => ({ ...current, main: !current.main }))}
                    onSuccess={() => setFeedback((current) => ({ ...current, main: 'success' }))}
                    onFail={() => setFeedback((current) => ({ ...current, main: 'fail' }))}
                  />
                </div>
                {visible.main && question.answer ? <AnswerBox answer={question.answer} /> : null}
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
                      onClick={(e) => e.stopPropagation()}
                    />
                    <AnswerActions
                      shown={Boolean(visible[letter])}
                      status={feedback[letter] ?? 'none'}
                      onToggle={() => setVisible((current) => ({ ...current, [letter]: !current[letter] }))}
                      onSuccess={() => setFeedback((current) => ({ ...current, [letter]: 'success' }))}
                      onFail={() => setFeedback((current) => ({ ...current, [letter]: 'fail' }))}
                    />
                  </div>
                  {visible[letter] && answer ? <AnswerBox answer={answer} /> : null}
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

          <QuestionMeta question={question} />
        </div>
      </div>
    </div>
  )
}

const AnswerActions = ({ shown, status, onToggle, onSuccess, onFail }: { shown: boolean; status: 'none' | 'success' | 'fail'; onToggle: () => void; onSuccess: () => void; onFail: () => void }) => {
  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
  }
  return (
    <div className="ftq-action-buttons">
      <button type="button" className={`ftq-icon-btn ${shown ? 'active' : ''}`} onClick={(e) => handleActionClick(e, onToggle)} aria-label="Answer" title="Answer">
        <AnswerIcon />
      </button>
      {shown ? (
        <>
          <button type="button" className={`ftq-icon-btn ftq-success-btn ${status === 'success' ? 'selected' : ''}`} onClick={(e) => handleActionClick(e, onSuccess)} disabled={status !== 'none'}>✓</button>
          <button type="button" className={`ftq-icon-btn ftq-fail-btn ${status === 'fail' ? 'selected' : ''}`} onClick={(e) => handleActionClick(e, onFail)} disabled={status !== 'none'}>×</button>
        </>
      ) : null}
    </div>
  )
}

const AnswerBox = ({ answer }: { answer: string }) => {
  const t = useT()
  return (
    <div className="ftq-exam-answer-box animate-fade-in">
      <span>{t('edu.answer')}:</span>
      <div dangerouslySetInnerHTML={renderHtml(answer)} />
    </div>
  )
}

const QuestionMeta = ({ question }: { question: EduQuestion }) => (
  <div className="ftq-metadata">
    {question.difficultyLevel ? <span className="difficulty">{question.difficultyLevel}</span> : null}
    {question.successCount !== null && question.successCount !== undefined ? <span className="success">✓ {question.successCount}</span> : null}
    {question.failCount !== null && question.failCount !== undefined ? <span className="fail">× {question.failCount}</span> : null}
  </div>
)

export default FreeTextQuestionCard
