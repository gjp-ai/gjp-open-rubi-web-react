import { useEffect, useMemo, useRef } from 'react'
import 'highlight.js/styles/github.css'
import { hljs } from '../../../shared/highlight/highlight'
import { sanitizeHtml } from '../../../shared/security/sanitizeHtml'
import { getSafeYoutubeEmbedUrl } from '../../../shared/security/safeUrl'

type Props = {
  answer: string
  className?: string
  id?: string
}

export const QuestionAnswer = ({ answer, className = 'question-card__answer', id }: Props) => {
  const answerRef = useRef<HTMLDivElement>(null)
  const safeAnswer = useMemo(() => sanitizeHtml(answer), [answer])

  useEffect(() => {
    if (!answerRef.current) {
      return
    }

    requestAnimationFrame(() => {
      try {
        answerRef.current?.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block as HTMLElement)
        })
      } catch (e) {
        console.error('highlight.js error', e)
      }

      const videoEmbeds = answerRef.current?.querySelectorAll('.video-embed[data-provider="youtube"]')
      videoEmbeds?.forEach((div) => {
        const src = getSafeYoutubeEmbedUrl(div.getAttribute('src'))
        const width = div.getAttribute('width') || '600'
        const height = div.getAttribute('height') || '400'

        if (src && div instanceof HTMLElement) {
          const iframe = document.createElement('iframe')
          iframe.src = src
          iframe.width = width
          iframe.height = height
          iframe.className = div.className
          iframe.setAttribute('frameborder', '0')
          iframe.setAttribute(
            'allow',
            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          )
          iframe.setAttribute('allowfullscreen', 'true')
          iframe.setAttribute('loading', 'lazy')
          iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin')
          iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation')

          div.parentNode?.replaceChild(iframe, div)
        }
      })
    })
  }, [safeAnswer])

  return <div id={id} className={className} ref={answerRef} dangerouslySetInnerHTML={{ __html: safeAnswer }} />
}

export default QuestionAnswer
