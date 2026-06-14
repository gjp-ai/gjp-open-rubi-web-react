import DOMPurify from 'dompurify'
import { createElement, useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
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

type IconName = 'answer' | 'check' | 'explanation' | 'next' | 'previous'

const normalizeAnswer = (value?: string | null) => htmlToText(value).trim().toLowerCase()

const splitFillAnswers = (answer?: string | null) => (answer ?? '').split(',').map((item) => item.trim())

const iconPaths: Record<IconName, string> = {
  answer: 'M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  check: 'm20 6-11 11-5-5',
  explanation: 'M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2-3 4 M12 17h.01 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  next: 'm9 18 6-6-6-6',
  previous: 'm15 18-6-6 6-6',
}

const voidHtmlElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])

const Icon = ({ name }: { name: IconName }) => (
  <svg className="question-exam__button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d={iconPaths[name]} />
  </svg>
)

const IconButtonContent = ({ icon, shortcut }: { icon: IconName; shortcut: string }) => (
  <>
    <Icon name={icon} />
    <kbd>{shortcut}</kbd>
  </>
)

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
  const [showAnswer, setShowAnswer] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [results, setResults] = useState<Record<string, ExamResult>>({})
  const [finished, setFinished] = useState(false)

  const currentQuestion = questions[currentIndex]
  const currentResult = currentQuestion ? results[currentQuestion.id] : undefined
  const score = useMemo(() => Object.values(results).reduce((sum, result) => sum + result.points, 0), [results])
  const totalScore = useMemo(() => Object.values(results).reduce((sum, result) => sum + result.total, 0), [results])

  const progressLabel = `${currentIndex + 1} / ${questions.length}`
  const isObjectiveChoice = kind === 'multiple-choice-questions' || kind === 'true-false-questions'
  const hasExplanation = Boolean(currentQuestion?.explanation)

  const clearWorkingAnswer = useCallback(() => {
    setSelectedChoice('')
    setFillAnswers([])
    setFreeTextAnswers({})
    setShowAnswer(false)
    setShowExplanation(false)
  }, [])

  const goToQuestion = useCallback((nextIndex: number) => {
    setCurrentIndex(nextIndex)
    clearWorkingAnswer()
  }, [clearWorkingAnswer])

  const submitResult = useCallback((result: ExamResult) => {
    if (!currentQuestion) return
    setResults((current) => ({ ...current, [currentQuestion.id]: result }))
  }, [currentQuestion])

  const showCurrentAnswer = useCallback(() => {
    if (!currentQuestion) return
    setShowAnswer(true)
    if (kind === 'fill-blank-questions') {
      const correctAnswers = splitFillAnswers(currentQuestion.answer)
      setFillAnswers(correctAnswers)
      return
    }
    if (kind === 'free-text-questions') {
      const parts = getFreeTextParts(currentQuestion)
      if (parts.length > 0) {
        setFreeTextAnswers(
          parts.reduce<Record<string, string>>((answers, part) => {
            answers[part.letter] = htmlToText(part.answer)
            return answers
          }, {}),
        )
        return
      }
      setFreeTextAnswers({ main: htmlToText(currentQuestion.answer) })
    }
  }, [currentQuestion, kind])

  const checkAnswer = useCallback(() => {
    if (!currentQuestion) return
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
      setShowAnswer(true)
      return
    }

    if (kind === 'free-text-questions') {
      const parts = getFreeTextParts(currentQuestion)
      if (parts.length > 0) {
        const total = parts.length || 1
        const points = parts.reduce((count, part) => (normalizeAnswer(freeTextAnswers[part.letter]) === normalizeAnswer(part.answer) ? count + 1 : count), 0)
        submitResult({ correct: points === total, points, total })
        return
      }

      const correct = normalizeAnswer(freeTextAnswers.main) === normalizeAnswer(currentQuestion.answer)
      submitResult({ correct, points: correct ? 1 : 0, total: 1 })
    }
  }, [currentQuestion, fillAnswers, freeTextAnswers, kind, selectedChoice, submitResult])

  const finishOrNext = useCallback(() => {
    if (currentIndex >= questions.length - 1) {
      setFinished(true)
      return
    }
    goToQuestion(currentIndex + 1)
  }, [currentIndex, goToQuestion, questions.length])

  const restartExam = useCallback(() => {
    setResults({})
    setFinished(false)
    goToQuestion(0)
  }, [goToQuestion])

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      const element = target as HTMLElement | null
      return element?.tagName === 'INPUT' || element?.tagName === 'TEXTAREA' || element?.isContentEditable
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (isTypingTarget(event.target)) return

      const key = event.key.toLowerCase()

      if (finished) {
        if (key === 'r') {
          event.preventDefault()
          restartExam()
        }
        return
      }

      if ((event.key === 'ArrowLeft' || key === 'p') && currentIndex > 0) {
        event.preventDefault()
        goToQuestion(currentIndex - 1)
        return
      }
      if (event.key === 'ArrowRight' || key === 'n') {
        event.preventDefault()
        finishOrNext()
        return
      }
      if (key === 'a') {
        event.preventDefault()
        showCurrentAnswer()
        return
      }
      if (key === 'c') {
        event.preventDefault()
        checkAnswer()
        return
      }
      if (key === 'e' && hasExplanation) {
        event.preventDefault()
        setShowExplanation((value) => !value)
        return
      }
      if (kind === 'multiple-choice-questions' && ['1', '2', '3', '4'].includes(key)) {
        event.preventDefault()
        const option = mcqOptions[Number(key) - 1]
        if (option) setSelectedChoice(option)
      }
      if (kind === 'true-false-questions' && (key === 't' || key === 'f')) {
        event.preventDefault()
        setSelectedChoice(key === 't' ? 'TRUE' : 'FALSE')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [checkAnswer, currentIndex, finishOrNext, finished, goToQuestion, hasExplanation, kind, onClose, restartExam, showCurrentAnswer])

  if (!currentQuestion) {
    return null
  }

  return (
    <div className="question-exam" role="dialog" aria-modal="true" aria-label={title}>
      <div className="question-exam__topbar">
        <div>
          <div className="question-exam__eyebrow">{title}</div>
          <h2>{finished ? 'Score' : progressLabel}</h2>
        </div>
        <button type="button" className="question-exam__close" onClick={onClose} aria-label={`${t('vocabulary.close')} (Esc)`} title="Esc">x</button>
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
            <button type="button" className="question-exam__secondary" onClick={restartExam}>Restart <kbd>R</kbd></button>
            <button type="button" className="question-exam__primary" onClick={onClose}>{t('vocabulary.close')} <kbd>Esc</kbd></button>
          </div>
        </div>
      ) : (
        <>
          <div className="question-exam__progress">
            <div style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
          </div>

          <div className="question-exam__body">
            {kind !== 'fill-blank-questions' ? (
              <div className="question-exam__question" dangerouslySetInnerHTML={renderHtml(currentQuestion.question || currentQuestion.description)} />
            ) : null}

            {kind === 'multiple-choice-questions' ? (
              <div className="question-exam__choices">
                {mcqOptions.map((letter) => {
                  const value = currentQuestion[`option${letter}` as keyof EduQuestion] as string | null | undefined
                  if (!value) return null
                  const isCorrect = (currentResult || showAnswer) && currentQuestion.answer === letter
                  const isWrongSelection = currentResult && selectedChoice === letter && currentQuestion.answer !== letter
                  const shortcut = String(mcqOptions.indexOf(letter) + 1)
                  return (
                    <button
                      key={letter}
                      type="button"
                      className={`question-exam__choice ${selectedChoice === letter ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrongSelection ? 'incorrect' : ''}`}
                      title={shortcut}
                      onClick={() => setSelectedChoice(letter)}
                    >
                      <span>{letter}<kbd>{shortcut}</kbd></span>
                      <div dangerouslySetInnerHTML={renderHtml(value)} />
                    </button>
                  )
                })}
              </div>
            ) : null}

            {kind === 'true-false-questions' ? (
              <div className="question-exam__choices question-exam__choices--two">
                {(['TRUE', 'FALSE'] as const).map((value) => {
                  const isCorrect = (currentResult || showAnswer) && currentQuestion.answer === value
                  const isWrongSelection = currentResult && selectedChoice === value && currentQuestion.answer !== value
                  const shortcut = value === 'TRUE' ? 'T' : 'F'
                  return (
                    <button
                      key={value}
                      type="button"
                      className={`question-exam__choice ${selectedChoice === value ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrongSelection ? 'incorrect' : ''}`}
                      title={shortcut}
                      onClick={() => setSelectedChoice(value)}
                    >
                      <span>{value === 'TRUE' ? 'T' : 'F'}<kbd>{shortcut}</kbd></span>
                      <div>{value === 'TRUE' ? 'True' : 'False'}</div>
                    </button>
                  )
                })}
              </div>
            ) : null}

            {kind === 'fill-blank-questions' ? (
              <FillBlankExam question={currentQuestion} values={fillAnswers} onChange={setFillAnswers} />
            ) : null}

            {kind === 'free-text-questions' ? (
              <FreeTextExam
                question={currentQuestion}
                values={freeTextAnswers}
                onChange={setFreeTextAnswers}
              />
            ) : null}

            {currentResult ? (
              <div className={`question-exam__feedback ${currentResult.correct ? 'correct' : 'incorrect'}`}>
                {currentResult.correct ? t('edu.correct') : 'Incorrect'}: {currentResult.points} / {currentResult.total}
              </div>
            ) : null}

            {showExplanation && currentQuestion.explanation ? (
              <div className="question-exam__explanation">
                <h3>{t('edu.explanation')}</h3>
                <div dangerouslySetInnerHTML={renderHtml(currentQuestion.explanation)} />
              </div>
            ) : null}
          </div>

          <div className="question-exam__footer">
            <button
              type="button"
              className="question-exam__secondary question-exam__icon-button"
              onClick={() => goToQuestion(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              aria-label={`${t('vocabulary.previous')} (P / ArrowLeft)`}
              title={`${t('vocabulary.previous')} (P / ArrowLeft)`}
            >
              <IconButtonContent icon="previous" shortcut="P" />
            </button>
            <div className="question-exam__footer-main">
              <button
                type="button"
                className="question-exam__secondary question-exam__icon-button"
                onClick={showCurrentAnswer}
                aria-label={`${t('edu.show_answer')} (A)`}
                title={`${t('edu.show_answer')} (A)`}
              >
                <IconButtonContent icon="answer" shortcut="A" />
              </button>
              <button
                type="button"
                className="question-exam__primary question-exam__icon-button"
                onClick={checkAnswer}
                disabled={Boolean(currentResult) || (isObjectiveChoice && !selectedChoice)}
                aria-label="Check answer (C)"
                title="Check answer (C)"
              >
                <IconButtonContent icon="check" shortcut="C" />
              </button>
              <button
                type="button"
                className="question-exam__secondary question-exam__icon-button"
                onClick={() => setShowExplanation((value) => !value)}
                disabled={!hasExplanation}
                aria-label={`${t('edu.explanation')} (E)`}
                title={`${t('edu.explanation')} (E)`}
              >
                <IconButtonContent icon="explanation" shortcut="E" />
              </button>
            </div>
            <button
              type="button"
              className="question-exam__primary question-exam__icon-button"
              onClick={finishOrNext}
              aria-label={`${currentIndex >= questions.length - 1 ? 'Finish' : t('vocabulary.next')} (N / ArrowRight)`}
              title={`${currentIndex >= questions.length - 1 ? 'Finish' : t('vocabulary.next')} (N / ArrowRight)`}
            >
              <IconButtonContent icon="next" shortcut="N" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const FillBlankExam = ({
  onChange,
  question,
  values,
}: {
  onChange: (values: string[]) => void
  question: EduQuestion
  values: string[]
}) => {
  let blankIndex = 0
  const renderBlank = (blank: number) => (
    <input
      key={`blank-${blank}`}
      value={values[blank] || ''}
      placeholder="____"
      aria-label={`Blank ${blank + 1}`}
      onChange={(event) => onChange(Array.from({ length: blankIndex }, (_, itemIndex) => (itemIndex === blank ? event.target.value : values[itemIndex] || '')))}
    />
  )

  const renderTextWithBlanks = (text: string, keyPrefix: string) =>
    text.split(/(____)/g).map((part, index) => {
      if (part === '____') {
        const blank = blankIndex
        blankIndex += 1
        return renderBlank(blank)
      }
      return part ? <span key={`${keyPrefix}-text-${index}`}>{part}</span> : null
    })

  const renderNode = (node: ChildNode, keyPrefix: string): ReactNode => {
    if (node.nodeType === Node.TEXT_NODE) {
      return renderTextWithBlanks(node.textContent || '', keyPrefix)
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return null

    const element = node as HTMLElement
    const props = Array.from(element.attributes).reduce<Record<string, string>>((current, attribute) => {
      if (attribute.name === 'style') return current
      current[attribute.name === 'class' ? 'className' : attribute.name] = attribute.value
      return current
    }, { key: keyPrefix })
    const tagName = element.tagName.toLowerCase()
    if (voidHtmlElements.has(tagName)) {
      return createElement(tagName, props)
    }
    const children = Array.from(element.childNodes).map((child, index) => renderNode(child, `${keyPrefix}-${index}`))
    return createElement(tagName, props, children)
  }

  const sanitizedQuestion = DOMPurify.sanitize(question.question || question.description || '')
  const content =
    typeof DOMParser === 'undefined'
      ? renderTextWithBlanks(htmlToText(sanitizedQuestion), 'fallback')
      : Array.from(new DOMParser().parseFromString(`<div>${sanitizedQuestion}</div>`, 'text/html').body.firstElementChild?.childNodes || []).map((node, index) =>
          renderNode(node, `node-${index}`),
        )

  return (
    <div className="question-exam__question question-exam__fill">
      {content}
    </div>
  )
}

const FreeTextExam = ({
  onChange,
  question,
  values,
}: {
  onChange: (values: Record<string, string>) => void
  question: EduQuestion
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
              value={values[part.letter] || ''}
              placeholder={t('vocabulary.your_answer')}
              onChange={(event) => onChange({ ...values, [part.letter]: event.target.value })}
            />
          </section>
        ))}
      </div>
    )
  }

  return (
    <div className="question-exam__free-main">
      <textarea
        value={values.main || ''}
        placeholder={t('vocabulary.your_answer')}
        onChange={(event) => onChange({ ...values, main: event.target.value })}
      />
    </div>
  )
}

export default QuestionExam
