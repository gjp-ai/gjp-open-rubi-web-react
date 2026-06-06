import { useEffect, useState } from 'react'
import type { EduQuestion } from '../../../shared/data/types'
import { useT } from '../../../shared/i18n'
import { htmlToText, renderHtml } from '../eduUtils'
import { QuestionImages } from './QuestionImages'

const pairs = ['A', 'B', 'C', 'D', 'E', 'F'] as const

export const FreeTextQuestionCard = ({ question, isExpandedView, lang }: { question: EduQuestion; isExpandedView: boolean; lang: string }) => {
  const t = useT()
  const [isExpanded, setIsExpanded] = useState(isExpandedView)
  const [mainAnswer, setMainAnswer] = useState('')
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [feedback, setFeedback] = useState<Record<string, 'none' | 'success' | 'fail'>>({ main: 'none' })

  useEffect(() => setIsExpanded(isExpandedView), [isExpandedView])

  const reset = () => {
    setVisible({})
    setFeedback({ main: 'none' })
    setMainAnswer('')
  }

  return (
    <div className={`ftq-card ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {!isExpanded ? (
        <button type="button" className="ftq-card-header" onClick={() => setIsExpanded(true)}>
          <div className="ftq-card-question-preview">{htmlToText(question.question || question.description || '').slice(0, 180)}</div>
          <span className="expand-icon">⌄</span>
        </button>
      ) : (
        <div className="ftq-card-expanded">
          <QuestionImages questionId={question.id} referenceKey="freeTextQuestionId" lang={lang} />
          <div className="ftq-exam-main-question">
            <div className="ftq-exam-question-line">
              <button type="button" className="collapse-btn" onClick={() => { setIsExpanded(false); reset() }} aria-label={t('vocabulary.hide')}>⌃</button>
              <div className="ftq-exam-text" dangerouslySetInnerHTML={renderHtml(question.question || question.description)} />
            </div>
            <div className="ftq-exam-interaction-row">
              <textarea className="ftq-user-input" placeholder={t('vocabulary.your_answer')} value={mainAnswer} onChange={(event) => setMainAnswer(event.target.value)} />
              <AnswerActions
                shown={Boolean(visible.main)}
                status={feedback.main ?? 'none'}
                onToggle={() => setVisible((current) => ({ ...current, main: !current.main }))}
                onSuccess={() => setFeedback((current) => ({ ...current, main: 'success' }))}
                onFail={() => setFeedback((current) => ({ ...current, main: 'fail' }))}
              />
            </div>
            {visible.main && question.answer ? <AnswerBox answer={question.answer} /> : null}
          </div>
          {pairs.map((letter) => {
            const q = question[`question${letter}` as keyof EduQuestion] as string | null | undefined
            const a = question[`answer${letter}` as keyof EduQuestion] as string | null | undefined
            if (!q && !a) return null
            return (
              <div key={letter} className="ftq-exam-part">
                <div className="ftq-exam-part-label">{letter}</div>
                <div className="ftq-exam-text" dangerouslySetInnerHTML={renderHtml(q)} />
                <div className="ftq-exam-interaction-row">
                  <textarea className="ftq-user-input" placeholder={t('vocabulary.your_answer')} />
                  <AnswerActions
                    shown={Boolean(visible[letter])}
                    status={feedback[letter] ?? 'none'}
                    onToggle={() => setVisible((current) => ({ ...current, [letter]: !current[letter] }))}
                    onSuccess={() => setFeedback((current) => ({ ...current, [letter]: 'success' }))}
                    onFail={() => setFeedback((current) => ({ ...current, [letter]: 'fail' }))}
                  />
                </div>
                {visible[letter] && a ? <AnswerBox answer={a} /> : null}
              </div>
            )
          })}
          <QuestionMeta question={question} />
        </div>
      )}
    </div>
  )
}

const AnswerActions = ({ shown, status, onToggle, onSuccess, onFail }: { shown: boolean; status: 'none' | 'success' | 'fail'; onToggle: () => void; onSuccess: () => void; onFail: () => void }) => (
  <div className="ftq-action-buttons">
    <button type="button" className={`ftq-icon-btn ${shown ? 'active' : ''}`} onClick={onToggle}>{shown ? '◐' : '◉'}</button>
    {shown ? (
      <>
        <button type="button" className={`ftq-icon-btn ftq-success-btn ${status === 'success' ? 'selected' : ''}`} onClick={onSuccess} disabled={status !== 'none'}>✓</button>
        <button type="button" className={`ftq-icon-btn ftq-fail-btn ${status === 'fail' ? 'selected' : ''}`} onClick={onFail} disabled={status !== 'none'}>×</button>
      </>
    ) : null}
  </div>
)

const AnswerBox = ({ answer }: { answer: string }) => {
  const t = useT()
  return <div className="ftq-exam-answer-box"><span>{t('edu.answer')}:</span><div dangerouslySetInnerHTML={renderHtml(answer)} /></div>
}

const QuestionMeta = ({ question }: { question: EduQuestion }) => (
  <div className="ftq-metadata">
    {question.difficultyLevel ? <span>{question.difficultyLevel}</span> : null}
    {question.successCount !== null && question.successCount !== undefined ? <span>✓ {question.successCount}</span> : null}
    {question.failCount !== null && question.failCount !== undefined ? <span>× {question.failCount}</span> : null}
  </div>
)

