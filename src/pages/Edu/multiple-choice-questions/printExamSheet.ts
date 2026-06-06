import DOMPurify from 'dompurify'
import type { EduQuestion } from '../../../shared/data/types'
import type { LanguageCode } from '../../../shared/contexts/UIContext'

interface PrintExamSheetOptions {
  questions: EduQuestion[]
  title: string
  language: LanguageCode
  showAnswer?: boolean
  showExplanation?: boolean
}

export function generatePrintExamSheet({ questions, title, language, showAnswer = false, showExplanation = false }: PrintExamSheetOptions): string {
  const sanitize = (value?: string | null) => DOMPurify.sanitize(value ?? '')
  const text = (value?: string | null) => DOMPurify.sanitize(value ?? '', { ALLOWED_TAGS: [] }).replace(/\s+/g, ' ').trim()

  return `
<!DOCTYPE html>
<html lang="${language === 'ZH' ? 'zh-CN' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${text(title)}</title>
  <style>
    @page {
      size: A4;
      margin: 2.5cm 2cm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      background: white;
      width: auto;
      margin: 0;
      padding: 0;
    }
    
    .header {
      text-align: center;
      margin-bottom: 1.5cm;
      border-bottom: 2px solid #000;
      padding-bottom: 0.5cm;
    }
    
    .header h1 {
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 0.3cm;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .header .date {
      font-size: 10pt;
      color: #333;
    }

    .screen-wrapper {
      max-width: 1000px;
      margin: 24px auto;
      padding: 20px;
      background: #ffffff;
      box-shadow: 0 6px 18px rgba(0,0,0,0.06);
      border-radius: 6px;
    }
    
    .student-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 1cm 0;
      padding: 0.5cm 0;
      border-bottom: 1px solid #ccc;
      font-size: 11pt;
    }
    
    .student-info-item {
      display: flex;
      align-items: center;
      gap: 0.3cm;
    }
    
    .student-info-item .label {
      font-weight: 600;
    }
    
    .student-info-item .underline {
      border-bottom: 1px solid #000;
      min-width: 4cm;
      display: inline-block;
    }
    
    .question-block {
      margin-bottom: 1.5cm;
      page-break-inside: auto;
      break-inside: auto;
    }
    
    .question-number {
      font-weight: bold;
      font-size: 12pt;
      margin-bottom: 0.3cm;
      display: inline-block;
    }
    
    .question-content {
      margin-left: 0;
    }
    
    .question-text {
      margin-bottom: 0.5cm;
      font-size: 12pt;
      line-height: 1.8;
    }
    
    .question-text p {
      margin: 0.3cm 0;
    }
    
    .question-text img {
      max-width: 100%;
      height: auto;
      margin: 0.5cm 0;
      display: block;
    }
    
    .options {
      margin-left: 0.5cm;
      margin-top: 0.5cm;
    }
    
    .option {
      margin-bottom: 0.4cm;
      display: flex;
      align-items: baseline;
      gap: 0.3cm;
    }
    
    .option-label {
      font-weight: 600;
      min-width: 1cm;
    }
    
    .option-text {
      flex: 1;
      line-height: 1.6;
    }
    
    .option-checkbox {
      width: 0.5cm;
      height: 0.5cm;
      border: 1px solid #666;
      display: inline-block;
      margin-right: 0.3cm;
    }
    
    .option-checkbox.checked {
      background: #0369a1;
      position: relative;
    }
    
    .option-checkbox.checked::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 10pt;
      font-weight: bold;
    }
    
    .answer-section {
      margin-top: 0.5cm;
      padding: 0.4cm;
      background: #f0f9ff;
      border-left: 3px solid #0369a1;
      font-size: 11pt;
    }
    
    .explanation-section {
      margin-top: 0.5cm;
      padding: 0.4cm;
      font-size: 11pt;
      line-height: 1.7;
    }
    
    .footer {
      margin-top: 2cm;
      padding-top: 0.5cm;
      border-top: 1px solid #ccc;
      text-align: center;
      font-size: 9pt;
      color: #666;
    }
    
    @media print {
      body {
        padding: 0;
      }
      
      .no-print {
        display: none !important;
      }
      
      .page-break {
        page-break-after: always;
      }

      .screen-wrapper {
        margin: 0;
        padding: 0;
        box-shadow: none;
        border-radius: 0;
        background: transparent;
      }
    }
  </style>
</head>
<body>
  <div class="screen-wrapper">

  <div class="questions-container">
    ${questions.map((q, index) => {
      let questionHtml = `<div class="question-block">`

      questionHtml += `<div class="question-content">`

      const numHtml = `<span class="question-number">${index + 1}.</span>`

      // Main question
      let qtext = sanitize(q.question)
      if (/^\s*<p(\s[^>]*)?>/i.test(qtext)) {
        qtext = qtext.replace(/^\s*<p(\s[^>]*)?>/i, (m) => m + numHtml + ' ')
      } else {
        qtext = numHtml + ' ' + qtext
      }
      questionHtml += `<div class="question-text">${qtext}</div>`
      
      // Options
      const optionsList = [
        { label: 'A', text: q.optionA },
        { label: 'B', text: q.optionB },
        { label: 'C', text: q.optionC },
        { label: 'D', text: q.optionD }
      ]
      
      questionHtml += `<div class="options">`
      optionsList.forEach(opt => {
        if (!opt.text) return
        const isCorrectOption = showAnswer && q.answer === opt.label
        questionHtml += `
          <div class="option">
            <span class="option-checkbox${isCorrectOption ? ' checked' : ''}"></span>
            <span class="option-label">${opt.label}.</span>
            <span class="option-text">${text(opt.text)}</span>
          </div>`
      })
      questionHtml += `</div>`
      
      if (showExplanation && q.explanation) {
        questionHtml += `<div class="explanation-section"><strong>${language === 'ZH' ? '解释' : 'Explanation'}:</strong> ${text(q.explanation)}</div>`
      }
      
      questionHtml += `</div>` // question-content
      questionHtml += `</div>` // question-block
      
      return questionHtml
    }).join('')}
  </div>

  <div class="footer">
    ${language === 'ZH' ? '总分' : 'Total Score'}: __________ / ${questions.length}
  </div>

  
  </div>

</body>
</html>
  `
}

export function openPrintWindow(htmlContent: string): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    console.error('Failed to open print window. Please check popup blocker settings.')
    return
  }
  
  printWindow.document.write(htmlContent)
  printWindow.document.close()
}
