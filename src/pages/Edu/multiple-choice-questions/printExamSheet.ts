import DOMPurify from 'dompurify'
import type { EduQuestion } from '../../../shared/data/types'
import type { LanguageCode } from '../../../shared/contexts/UIContext'

const text = (value?: string | null) => DOMPurify.sanitize(value ?? '', { ALLOWED_TAGS: [] }).replace(/\s+/g, ' ').trim()

export const generatePrintExamSheet = ({ questions, title, language, showAnswer, showExplanation }: { questions: EduQuestion[]; title: string; language: LanguageCode; showAnswer: boolean; showExplanation: boolean }) => `<!doctype html>
<html lang="${language === 'ZH' ? 'zh-CN' : 'en'}"><head><meta charset="utf-8"><title>${title}</title><style>@page{size:A4;margin:1.6cm}body{font-family:Arial,sans-serif;color:#000}.q{break-inside:avoid;margin:0 0 .8cm}.opt{margin:.15cm 0 0 .4cm}.answer{margin-top:.2cm;font-weight:700}</style></head><body><h1>${title}</h1>${questions.map((q, i) => `<div class="q"><strong>${i + 1}.</strong> ${text(q.question)}${(['A','B','C','D'] as const).map((letter) => q[`option${letter}`] ? `<div class="opt">${letter}. ${text(q[`option${letter}`])}</div>` : '').join('')}${showAnswer ? `<div class="answer">${language === 'ZH' ? '答案' : 'Answer'}: ${text(q.answer)}</div>` : ''}${showExplanation && q.explanation ? `<div>${text(q.explanation)}</div>` : ''}</div>`).join('')}</body></html>`

export const openPrintWindow = (content: string) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  printWindow.document.write(content)
  printWindow.document.close()
}

