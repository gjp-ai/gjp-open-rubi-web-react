import type { ReactNode } from 'react'

export const AnswerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const ExplanationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 22h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8.5 14.5c-1.6-1.1-2.5-2.9-2.5-4.8A6 6 0 0 1 12 3.8a6 6 0 0 1 6 5.9c0 1.9-.9 3.7-2.5 4.8-.7.5-1.1 1.2-1.2 2H9.7c-.1-.8-.5-1.5-1.2-2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const QuestionTools = ({ children }: { children: ReactNode }) => (
  <div className="edu-question-tools">{children}</div>
)

export const QuestionToolButton = ({
  active,
  children,
  disabled,
  label,
  onClick,
}: {
  active: boolean
  children: ReactNode
  disabled?: boolean
  label: string
  onClick: () => void
}) => (
  <button
    type="button"
    className={`edu-question-tool-btn ${active ? 'active' : ''}`}
    aria-label={label}
    title={label}
    aria-pressed={active}
    disabled={disabled}
    onClick={(event) => {
      event.stopPropagation()
      onClick()
    }}
  >
    {children}
  </button>
)
