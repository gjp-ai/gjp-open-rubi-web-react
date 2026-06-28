import DOMPurify from 'dompurify'
import type { LanguageCode } from '../../../shared/contexts/UIContext'
import type { VocabularyItem } from './types'

const stripHtml = (value?: string | null) =>
  DOMPurify.sanitize(value ?? '', { ALLOWED_TAGS: [] })
    .replace(/\s+/g, ' ')
    .trim()

const row = (label: string, value?: string | null) => {
  const text = stripHtml(value)
  if (!text) return ''
  return `<div class="vocab-row"><span class="vocab-label">${label}:</span><span class="vocab-value">${text}</span></div>`
}

export const generatePrintSheet = ({
  vocabularies,
  title,
  language,
}: {
  vocabularies: VocabularyItem[]
  title: string
  language: LanguageCode
}) => {
  const labels =
    language === 'ZH'
      ? {
          translation: '翻译',
          synonyms: '同义词',
          definition: '定义',
          example: '例句',
          plural: '复数形式',
          verbTenses: '动词变化形式',
          comparative: '比较级/最高级',
          meaning: '含义',
        }
      : {
          translation: 'Translation',
          synonyms: 'Synonyms',
          definition: 'Definition',
          example: 'Example',
          plural: 'Plural',
          verbTenses: 'Simple Past / Past Perfect / Present Participle',
          comparative: 'Comparative / Superlative',
          meaning: 'Meaning',
        }

  return `<!doctype html>
<html lang="${language === 'ZH' ? 'zh-CN' : 'en'}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    @page { size: A4; margin: 2cm 1.5cm; }
    * { box-sizing: border-box; }
    body { font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif; font-size: 11pt; line-height: 1.5; color: #000; background: #fff; }
    .screen-wrapper { max-width: 1000px; margin: 20px auto; padding: 20px; }
    .header { border-bottom: 2px solid #000; margin-bottom: 1.2cm; padding-bottom: .4cm; }
    h1 { font-size: 16pt; margin: 0; text-transform: uppercase; }
    .vocabulary-list { display: grid; gap: .8cm; }
    .vocabulary-item { break-inside: avoid; border-bottom: 1px solid #ddd; padding-bottom: .4cm; }
    .vocabulary-header { display: flex; align-items: baseline; gap: .4cm; margin-bottom: .2cm; }
    .vocabulary-name { font-size: 13pt; font-weight: 700; }
    .vocabulary-phonetic { color: #555; font-style: italic; }
    .vocabulary-pos { color: #666; background: #f0f0f0; padding: .1cm .25cm; border-radius: 3px; }
    .vocabulary-content { margin-top: .3cm; padding-left: .3cm; }
    .vocab-row { margin-bottom: .2cm; }
    .vocab-label { font-weight: 600; color: #333; margin-right: .2cm; }
    .vocab-value { color: #000; }
    .footer { margin-top: 1.5cm; padding-top: .4cm; border-top: 1px solid #ccc; text-align: center; font-size: 8pt; color: #666; }
    @media print { .screen-wrapper { margin: 0; padding: 0; } }
  </style>
</head>
<body>
  <div class="screen-wrapper">
    <div class="header"><h1>${title}</h1></div>
    <div class="vocabulary-list">
      ${vocabularies
        .map((vocabulary) => {
          const verbTenses = [vocabulary.verbSimplePastTense, vocabulary.verbPastPerfectTense, vocabulary.verbPresentParticiple]
            .filter(Boolean)
            .join(', ')
          const comparison = [vocabulary.adjectiveComparativeForm, vocabulary.adjectiveSuperlativeForm].filter(Boolean).join(' / ')
          return `<div class="vocabulary-item">
            <div class="vocabulary-header">
              <span class="vocabulary-name">${stripHtml(vocabulary.name)}</span>
              ${vocabulary.phonetic ? `<span class="vocabulary-phonetic">/${stripHtml(vocabulary.phonetic)}/</span>` : ''}
              ${vocabulary.partOfSpeech ? `<span class="vocabulary-pos">${stripHtml(vocabulary.partOfSpeech)}</span>` : ''}
            </div>
            <div class="vocabulary-content">
              ${row(labels.translation, vocabulary.translation)}
              ${row(labels.synonyms, vocabulary.synonyms)}
              ${row(labels.definition, vocabulary.definition ?? vocabulary.easyMeaning ?? vocabulary.meaning)}
              ${row(labels.example, vocabulary.example ?? vocabulary.sentenceOne)}
              ${row(labels.plural, vocabulary.nounPluralForm)}
              ${row(labels.verbTenses, verbTenses)}
              ${row(labels.comparative, comparison)}
              ${row(labels.meaning, vocabulary.nounMeaning ?? vocabulary.verbMeaning ?? vocabulary.adjectiveMeaning ?? vocabulary.adverbMeaning)}
            </div>
          </div>`
        })
        .join('')}
    </div>
    <div class="footer">${vocabularies.length} ${language === 'ZH' ? '个单词' : 'words'}</div>
  </div>
</body>
</html>`
}

export const openPrintWindow = (content: string) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  printWindow.document.write(content)
  printWindow.document.close()
}

