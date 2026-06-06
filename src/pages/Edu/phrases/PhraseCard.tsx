import { useEffect, useRef, useState } from 'react'
import type { EduLearningItem } from '../../../shared/data/types'
import { useT } from '../../../shared/i18n'
import { htmlToText, renderHtml } from '../eduUtils'
import { PhraseDetail } from './PhraseDetail'

const getPronunciations = (item: EduLearningItem) => {
  const rows = [
    { label: 'US', value: item.phoneticUs, audioUrl: item.phoneticUsAudioUrl || item.phoneticAudioUrl },
    { label: 'UK', value: item.phoneticUk, audioUrl: item.phoneticUkAudioUrl },
  ].filter((row) => row.value)

  return rows.length || !item.phonetic ? rows : [{ label: 'IPA', value: item.phonetic, audioUrl: item.phoneticAudioUrl }]
}

export const PhraseCard = ({
  phrase,
  phrases,
  currentIndex,
  expanded,
}: {
  phrase: EduLearningItem
  phrases: EduLearningItem[]
  currentIndex: number
  expanded: boolean
}) => {
  const t = useT()
  const [showDetail, setShowDetail] = useState(false)
  const [activeIndex, setActiveIndex] = useState(currentIndex)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const pronunciations = getPronunciations(phrase)

  useEffect(
    () => () => {
      audioRef.current?.pause()
      audioRef.current = null
    },
    [],
  )

  const playAudio = (event: React.MouseEvent, audioUrl?: string | null) => {
    event.preventDefault()
    event.stopPropagation()
    if (!audioUrl) return
    audioRef.current?.pause()
    audioRef.current = new Audio(audioUrl)
    audioRef.current.play().catch((error) => console.error('Audio playback failed:', error))
  }

  const openDetail = () => {
    setActiveIndex(currentIndex)
    setShowDetail(true)
  }

  return (
    <>
      <article
        className={`phrase-card ${expanded ? 'expanded' : 'compact'}`}
        onClick={openDetail}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openDetail()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`${t('vocabulary.view_details')} ${htmlToText(phrase.name)}`}
      >
        <h2 dangerouslySetInnerHTML={renderHtml(phrase.name)} />
        {expanded && pronunciations.length ? (
          <div className="phrase-card__phonetics">
            {pronunciations.map((item) => (
              <div className="phrase-card__phonetic" key={`${item.label}-${item.value}`}>
                <span className="phrase-card__phonetic-label">{item.label}</span>
                <span>/{htmlToText(item.value ?? '')}/</span>
                {item.audioUrl ? (
                  <button type="button" className="edu-audio" onClick={(event) => playAudio(event, item.audioUrl)} aria-label={`${t('vocabulary.play_pronunciation')} ${item.label}`}>
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M11 5 6 9H2v6h4l5 4V5Z" fill="currentColor" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07M18.07 5.93a9 9 0 0 1 0 12.73" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </article>

      {showDetail ? (
        <PhraseDetail
          phrase={phrases[activeIndex] ?? phrase}
          onClose={() => setShowDetail(false)}
          onPrevious={() => setActiveIndex((index) => Math.max(0, index - 1))}
          onNext={() => setActiveIndex((index) => Math.min(phrases.length - 1, index + 1))}
          hasPrevious={activeIndex > 0}
          hasNext={activeIndex < phrases.length - 1}
        />
      ) : null}
    </>
  )
}
