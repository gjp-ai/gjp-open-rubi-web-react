import { useEffect, useRef, useState } from 'react'
import { useT } from '../../../shared/i18n'
import { htmlToText } from '../eduUtils'
import { VocabularyDetail } from './VocabularyDetail'
import type { PronunciationVariant, VocabularyItem } from './types'

export const VocabularyCard = ({
  vocabulary,
  isExpandedView = true,
  allVocabularies = [],
  currentIndex = 0,
  autoPlayPronunciation = 'us',
}: {
  vocabulary: VocabularyItem
  isExpandedView?: boolean
  allVocabularies?: VocabularyItem[]
  currentIndex?: number
  autoPlayPronunciation?: PronunciationVariant
}) => {
  const t = useT()
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [activeVocabIndex, setActiveVocabIndex] = useState(currentIndex)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const pronunciations = [
    { label: 'US', value: vocabulary.phoneticUs, audioUrl: vocabulary.phoneticUsAudioUrl || vocabulary.phoneticAudioUrl },
    { label: 'UK', value: vocabulary.phoneticUk, audioUrl: vocabulary.phoneticUkAudioUrl },
  ].filter((item) => item.value)
  const fallbackPronunciation = !pronunciations.length && vocabulary.phonetic
    ? [{ label: '', value: vocabulary.phonetic, audioUrl: vocabulary.phoneticAudioUrl }]
    : []
  const pronunciationRows = pronunciations.length ? pronunciations : fallbackPronunciation
  const summary = vocabulary.synonyms

  const playAudio = (event: React.MouseEvent, audioUrl?: string | null) => {
    event.stopPropagation()
    if (!audioUrl) return
    audioRef.current?.pause()
    audioRef.current = new Audio(audioUrl)
    audioRef.current.play().catch((error) => console.error('Audio playback failed:', error))
  }

  useEffect(
    () => () => {
      audioRef.current?.pause()
      audioRef.current = null
    },
    [],
  )

  const currentVocabulary = allVocabularies[activeVocabIndex] ?? vocabulary
  const openDetail = () => {
    setActiveVocabIndex(currentIndex)
    setShowDetailModal(true)
  }

  return (
    <>
      <article
        className={`vocabulary-card ${isExpandedView ? 'expanded' : 'compact'}`}
        onClick={openDetail}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openDetail()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`${t('vocabulary.view_details')} ${htmlToText(vocabulary.name)}`}
      >
        <h3 className="vocab-card-word">{htmlToText(vocabulary.name)}</h3>
        {isExpandedView && pronunciationRows.length ? (
          <div className="vocab-card-phonetics">
            {pronunciationRows.map((item) => (
              <div className="vocab-card-phonetic-row" key={`${item.label}-${item.value}`}>
                {item.label ? <span className="vocab-card-phonetic-label">{item.label}</span> : null}
                <span className="vocab-card-phonetic">/{htmlToText(item.value ?? '')}/</span>
                {item.audioUrl ? (
                  <button className="vocab-card-audio" onClick={(event) => playAudio(event, item.audioUrl)} aria-label={`${t('vocabulary.play_pronunciation')} ${item.label}`} type="button">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M11 5 6 9H2v6h4l5 4V5Z" fill="currentColor" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07M18.07 5.93a9 9 0 0 1 0 12.73" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
        {isExpandedView && summary ? <div className="vocab-card-synonyms">{htmlToText(summary)}</div> : null}
      </article>

      {showDetailModal ? (
        <VocabularyDetail
          vocabulary={currentVocabulary}
          onClose={() => setShowDetailModal(false)}
          onPrevious={() => setActiveVocabIndex((index) => Math.max(0, index - 1))}
          onNext={() => setActiveVocabIndex((index) => Math.min(allVocabularies.length - 1, index + 1))}
          hasPrevious={activeVocabIndex > 0}
          hasNext={activeVocabIndex < allVocabularies.length - 1}
          autoPlayPronunciation={autoPlayPronunciation}
        />
      ) : null}
    </>
  )
}
