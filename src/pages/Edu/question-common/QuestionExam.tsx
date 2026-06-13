import { useMemo, useState } from 'react'
import type { EduQuestion } from '../../../shared/data/types'
import { useT } from '../../../shared/i18n'
import type { EduQuestionKind } from '../eduApi'
import { htmlToText, renderHtml } from '../eduUtils'
import './questionExam.css'

const mcqOptions = ['A', 'B', 'C', 'D'] as const
const freeTextPairs = ['A', 'B', 'C', 'D', 'E', 'F'] as const

type ExamResult = {
  correct: boolean
  points: number
  total: number
}

type QuestionExamProps = {
  kind: EduQuestionKind
  onClose: () => void
  questions: EduQuestion[]
  title: string
}

const normalizeAnswer = (value?: string | null) => htmlToText(value).trim().toLowerCase()

const splitFillAnswers = (answer?: string | null) => (answer ?? '').split(',').map((item) => item.trim())

const getFreeTextParts = (question: EduQuestion) =>
  freeTextPairs
    .map((letter) => ({
      answer: question[`answer${letter}` as keyof EduQuestion] as string | null | undefined,
      letter,
      question: question[`question${letter}` as keyof EduQuestion] as string | null | undefined,
    }))
    .filter((part) => htmlToText(part.question).length > 0 || htmlToText(part.answer).length > 0)

export const QuestionExam = ({ kind, onClose, questions, title }: QuestionExamProps) => {
  const t = useT()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState('')
  const [fillAnswers, setFillAnswers] = useState<string[]>([])
  const [freeTextAnswers, setFreeTextAnswers] = useState<Record<string, string>>({})
  const [showFreeTextAnswer, setShowFreeTextAnswer] = useState(false)
  const [results, setResults] = useState<Record<string, ExamResult>>({})
  const [finished, setFinished] = useState(false)

  const currentQuestion = questions[currentIndex]
  const currentResult = currentQuestion ? results[currentQuestion.id] : undefined
  const score = useMemo(() => Object.values(results).reduce((sum, result) => sum + result.points, 0), [results])
  const totalScore = useMemo(() => Object.values(results).reduce((sum, result) => sum + result.total, 0), [results])

  if (!currentQuestion) {
    return null
  }

  const progressLabel = `${currentIndex + 1} / ${questions.length}`

  const clearWorkingAnswer = () => {
    setSelectedChoice('')
    setFillAnswers([])
    setFreeTextAnswers({})
    setShowFreeTextAnswer(false)
  }

  const goToQuestion = (nextIndex: number) => {
    setCurrentIndex(nextIndex)
    clearWorkingAnswer()
  }

  const submitResult = (result: ExamResult) => {
    setResults((current) => ({ ...current, [currentQuestion.id]: result }))
  }

  const submitObjectiveAnswer = () => {
    if (kind === 'multiple-choice-questions' || kind === 'true-false-questions') {
      submitResult({
        correct: selectedChoice === currentQuestion.answer,
        points: selectedChoice === currentQuestion.answer ? 1 : 0,
        total: 1,
      })
      return
    }

    if (kind === 'fill-blank-questions') {
      const correctAnswers = splitFillAnswers(currentQuestion.answer)
      const total = correctAnswers.length || 1
      const points = correctAnswers.reduce((count, answer, index) => (normalizeAnswer(fillAnswers[index]) === normalizeAnswer(answer) ? count + 1 : count), 0)
      submitResult({ correct: points === total, points, total })
    }
  }

  const finishOrNext = () => {
    if (currentIndex >= questions.length - 1) {
      setFinished(true)
      return
    }
    goToQuestion(currentIndex + 1)
  }

  const restartExam = () => {
    setResults({})
    setFinished(false)
    goToQuestion(0)
  }

  return (
    <div className="question-exam" role="dialog" aria-modal="true" aria-label={title}>
      <div className="question-exam__topbar">
        <div>
          <div className="question-exam__eyebrow">{title}</div>
          <h2>{finished ? 'Score' : progressLabel}</h2>
        </div>
        <button type="button" className="question-exam__close" onClick={onClose} aria-label={t('vocabulary.close')}>x</button>
      </div>

      {finished ? (
        <div className="question-exam__score-screen">
          <div className="question-exam__score-ring">
            <strong>{score}</strong>
            <span>/ {totalScore || questions.length}</span>
          </div>
          <div className="question-exam__score-copy">
            <h3>Final score</h3>
            <p>{Object.keys(results).length} / {questions.length} questions completed</p>
          </div>
          <div className="question-exam__score-actions">
            <button type="button" className="question-exam__secondary" onClick={restartExam}>Restart</button>
            <button type="button" className="question-exam__primary" onClick={onClose}>{t('vocabulary.close')}</button>
          </div>
        </div>
      ) : (
        <>
          <div className="question-exam__progress">
            <div style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
          </div>

          <div className="question-exam__body">
            <div className="question-exam__question" dangerouslySetInnerHTML={renderHtml(currentQuestion.question || currentQuestion.description)} />

            {kind === 'multiple-choice-questions' ? (
              <div className="question-exam__choices">
                {mcqOptions.map((letter) => {
                  const value = currentQuestion[`option${letter}` as keyof EduQuestion] as string | null | undefined
                  if (!value) return null
                  const isCorrect = currentResult && currentQuestion.answer === letter
                  const isWrongSelection = currentResult && selectedChoice === letter && currentQuestion.answer !== letter
                  return (
                    <button
                      key={letter}
                      type="button"
                      className={`question-exam__choice ${selectedChoice === letter ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrongSelection ? 'incorrect' : ''}`}
                      disabled={Boolean(currentResult)}
                      onClick={() => setSelectedChoice(letter)}
                    >
                      <span>{letter}</span>
                      <div dangerouslySetInnerHTML={renderHtml(value)} />
                    </button>
                  )
                })}
              </div>
            ) : null}

            {kind === 'true-false-questions' ? (
              <div className="question-exam__choices question-exam__choices--two">
                {(['TRUE', 'FALSE'] as const).map((value) => {
                  const isCorrect = currentResult && currentQuestion.answer === value
                  const isWrongSelection = currentResult && selectedChoice === value && currentQuestion.answer !== value
                  return (
                    <button
                      key={value}
                      type="button"
                      className={`question-exam__choice ${selectedChoice === value ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrongSelection ? 'incorrect' : ''}`}
                      disabled={Boolean(currentResult)}
                      onClick={() => setSelectedChoice(value)}
                    >
                      <span>{value === 'TRUE' ? 'T' : 'F'}</span>
                      <div>{value === 'TRUE' ? 'True' : 'False'}</div>
                    </button>
                  )
                })}
              </div>
            ) : null}

            {kind === 'fill-blank-questions' ? (
              <FillBlankExam question={currentQuestion} values={fillAnswers} onChange={setFillAnswers} disabled={Boolean(currentResult)} />
            ) : null}

            {kind === 'free-text-questions' ? (
              <FreeTextExam
                question={currentQuestion}
                values={freeTextAnswers}
                showAnswer={showFreeTextAnswer}
                disabled={Boolean(currentResult)}
                onChange={setFreeTextAnswers}
                onShowAnswer={() => setShowFreeTextAnswer(true)}
              />
            ) : null}

            {currentResult ? (
              <div className={`question-exam__feedback ${currentResult.correct ? 'correct' : 'incorrect'}`}>
                {currentResult.correct ? t('edu.correct') : 'Incorrect'}: {currentResult.points} / {currentResult.total}
              </div>
            ) : null}
          </div>

          <div className="question-exam__footer">
            <button type="button" className="question-exam__secondary" onClick={() => goToQuestion(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>
              {t('vocabulary.previous')}
            </button>
            <div className="question-exam__footer-main">
              {kind === 'free-text-questions' ? (
                <>
                  <button type="button" className="question-exam__secondary" onClick={() => setShowFreeTextAnswer(true)} disabled={showFreeTextAnswer || Boolean(currentResult)}>
                    {t('edu.show_answer')}
                  </button>
                  <button type="button" className="question-exam__danger" onClick={() => submitResult({ correct: false, points: 0, total: 1 })} disabled={!showFreeTextAnswer || Boolean(currentResult)}>
                    Incorrect
                  </button>
                  <button type="button" className="question-exam__primary" onClick={() => submitResult({ correct: true, points: 1, total: 1 })} disabled={!showFreeTextAnswer || Boolean(currentResult)}>
                    {t('edu.correct')}
                  </button>
                </>
              ) : (
                <button type="button" className="question-exam__primary" onClick={submitObjectiveAnswer} disabled={Boolean(currentResult) || (kind !== 'fill-blank-questions' && !selectedChoice)}>
                  Submit
                </button>
              )}
            </div>
            <button type="button" className="question-exam__primary" onClick={finishOrNext} disabled={!currentResult}>
              {currentIndex >= questions.length - 1 ? 'Finish' : t('vocabulary.next')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const FillBlankExam = ({
  disabled,
  onChange,
  question,
  values,
}: {
  disabled: boolean
  onChange: (values: string[]) => void
  question: EduQuestion
  values: string[]
}) => {
  let blankIndex = 0
  const parts = question.question.replace(/____/g, () => `<!--BLANK_${blankIndex++}-->`).split(/<!--BLANK_(\d+)-->/)

  return (
    <div className="question-exam__fill">
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          const blank = Number(part)
          return (
            <input
              key={`blank-${blank}`}
              value={values[blank] || ''}
              disabled={disabled}
              placeholder="____"
              onChange={(event) => onChange(Array.from({ length: blankIndex }, (_, itemIndex) => (itemIndex === blank ? event.target.value : values[itemIndex] || '')))}
            />
          )
        }
        return <span key={`text-${index}`} dangerouslySetInnerHTML={renderHtml(part)} />
      })}
    </div>
  )
}

const FreeTextExam = ({
  disabled,
  onChange,
  onShowAnswer,
  question,
  showAnswer,
  values,
}: {
  disabled: boolean
  onChange: (values: Record<string, string>) => void
  onShowAnswer: () => void
  question: EduQuestion
  showAnswer: boolean
  values: Record<string, string>
}) => {
  const t = useT()
  const parts = getFreeTextParts(question)

  if (parts.length > 0) {
    return (
      <div className="question-exam__free-parts">
        {parts.map((part) => (
          <section key={part.letter} className="question-exam__free-part">
            <div className="question-exam__free-question">
              <strong>{part.letter}</strong>
              <div dangerouslySetInnerHTML={renderHtml(part.question)} />
            </div>
            <textarea
              disabled={disabled}
              value={values[part.letter] || ''}
              placeholder={t('vocabulary.your_answer')}
              onChange={(event) => onChange({ ...values, [part.letter]: event.target.value })}
            />
            {showAnswer && part.answer ? <div className="question-exam__answer" dangerouslySetInnerHTML={renderHtml(part.answer)} /> : null}
          </section>
        ))}
      </div>
    )
  }

  return (
    <div className="question-exam__free-main">
      <textarea
        disabled={disabled}
        value={values.main || ''}
        placeholder={t('vocabulary.your_answer')}
        onChange={(event) => onChange({ ...values, main: event.target.value })}
      />
      {showAnswer && question.answer ? <div className="question-exam__answer" dangerouslySetInnerHTML={renderHtml(question.answer)} /> : null}
      {!showAnswer ? (
        <button type="button" className="question-exam__inline-answer" onClick={onShowAnswer}>
          {t('edu.show_answer')}
        </button>
      ) : null}
    </div>
  )
}

export default QuestionExam
