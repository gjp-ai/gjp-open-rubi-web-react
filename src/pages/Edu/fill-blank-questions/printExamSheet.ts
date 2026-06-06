import DOMPurify from 'dompurify'
import type { EduQuestion } from '../../../shared/data/types'
import type { LanguageCode } from '../../../shared/contexts/UIContext'

const text = (value?: string | null) => DOMPurify.sanitize(value ?? '', { ALLOWED_TAGS: [] }).replace(/\s+/g, ' ').trim()

export const generatePrintExamSheet = ({ questions, title, language, showAnswer, showExplanation }: { questions: EduQuestion[]; title: string; language: LanguageCode; showAnswer: boolean; showExplanation: boolean }) => `<!doctype html><html lang="${language === 'ZH' ? 'zh-CN' : 'en'}"><head><meta charset="utf-8"><title>${title}</title><style>@page{size:A4;margin:1.6cm}body{font-family:Arial,sans-serif}.q{break-inside:avoid;margin-bottom:.8cm}.answer{font-weight:700}</style></head><body><h1>${title}</h1>${questions.map((q, i) => `<div class="q"><strong>${i + 1}.</strong> ${text(q.question)}${showAnswer ? `<div class="answer">${text(q.answer)}</div>` : ''}${showExplanation ? `<div>${text(q.explanation)}</div>` : ''}</div>`).join('')}</body></html>`

export const openPrintWindow = (content: string) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  printWindow.document.write(content)
  printWindow.document.close()
}

