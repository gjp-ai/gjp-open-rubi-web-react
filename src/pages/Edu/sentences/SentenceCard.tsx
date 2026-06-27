import { useEffect, useRef, useState } from 'react'
import type { EduLearningItem } from '../../../shared/data/types'
import { useT } from '../../../shared/i18n'
import { FavoriteBadge } from '../FavoriteToggleButton'
import { hasFavoriteTag } from '../favoriteUtils'
import { htmlToText, renderHtml } from '../eduUtils'
import { SentenceDetail } from './SentenceDetail'

const getPronunciations = (item: EduLearningItem) => {
  return [
    { label: 'US', value: item.phoneticUs, audioUrl: item.phoneticUsAudioUrl || item.phoneticAudioUrl },
    { label: 'UK', value: item.phoneticUk, audioUrl: item.phoneticUkAudioUrl },
  ].filter((row) => row.value)
}

export const SentenceCard = ({
  sentence,
  sentences,
  currentIndex,
  onFavoriteUpdated,
}: {
  sentence: EduLearningItem
  sentences: EduLearningItem[]
  currentIndex: number
  onFavoriteUpdated?: (item: EduLearningItem) => void
}) => {
  const t = useT()
  const [showDetail, setShowDetail] = useState(false)
  const [activeIndex, setActiveIndex] = useState(currentIndex)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const pronunciations = getPronunciations(sentence)
  const primaryAudioUrl = pronunciations[0]?.audioUrl

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
        className="sentence-card"
        onClick={openDetail}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openDetail()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`${t('vocabulary.view_details')} ${htmlToText(sentence.name)}`}
      >
        <div className="sentence-card-body">
          <div className="sentence-card-sentence">
            <span dangerouslySetInnerHTML={renderHtml(sentence.name)} />
            {hasFavoriteTag(sentence) ? <FavoriteBadge className="edu-card-favourite" /> : null}
          </div>
          {pronunciations.length ? (
            <div className="sentence-card-phonetics">
              {pronunciations.map((item) => (
                <span key={`${item.label}-${item.value}`}>
                  <strong>{item.label}</strong> /{htmlToText(item.value ?? '')}/
                </span>
              ))}
              {primaryAudioUrl ? (
                <button type="button" className="sentence-card-audio" onClick={(event) => playAudio(event, primaryAudioUrl)} aria-label={t('vocabulary.play_pronunciation')}>
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M11 5 6 9H2v6h4l5 4V5Z" fill="currentColor" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07M18.07 5.93a9 9 0 0 1 0 12.73" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </article>
      {showDetail ? (
        <SentenceDetail
          key={sentences[activeIndex]?.id ?? sentence.id}
          sentence={sentences[activeIndex] ?? sentence}
          onClose={() => setShowDetail(false)}
          onPrevious={() => setActiveIndex((index) => Math.max(0, index - 1))}
          onNext={() => setActiveIndex((index) => Math.min(sentences.length - 1, index + 1))}
          hasPrevious={activeIndex > 0}
          hasNext={activeIndex < sentences.length - 1}
          onFavoriteUpdated={onFavoriteUpdated}
        />
      ) : null}
    </>
  )
}
