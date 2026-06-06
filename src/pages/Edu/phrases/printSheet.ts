import DOMPurify from 'dompurify'
import type { EduLearningItem } from '../../../shared/data/types'
import type { LanguageCode } from '../../../shared/contexts/UIContext'

const text = (value?: string | null) => DOMPurify.sanitize(value ?? '', { ALLOWED_TAGS: [] }).replace(/\s+/g, ' ').trim()

export const generatePrintSheet = ({ phrases, title, language }: { phrases: EduLearningItem[]; title: string; language: LanguageCode }) => `<!doctype html>
<html lang="${language === 'ZH' ? 'zh-CN' : 'en'}"><head><meta charset="utf-8"><title>${title}</title><style>
@page{size:A4;margin:2cm 1.5cm}body{font-family:Georgia,serif;color:#000}.item{break-inside:avoid;border-bottom:1px solid #ddd;padding:.35cm 0}.name{font-size:14pt;font-weight:700}.meta{color:#666;font-size:10pt}.row{margin-top:.15cm}
</style></head><body><h1>${title}</h1>${phrases.map((item) => `<div class="item"><div class="name">${text(item.name)}</div>${item.phonetic ? `<div class="meta">/${text(item.phonetic)}/</div>` : ''}<div class="row">${text(item.translation)}</div><div class="row">${text(item.explanation ?? item.meaning ?? item.easyMeaning)}</div></div>`).join('')}</body></html>`

export const openPrintWindow = (content: string) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  printWindow.document.write(content)
  printWindow.document.close()
}

