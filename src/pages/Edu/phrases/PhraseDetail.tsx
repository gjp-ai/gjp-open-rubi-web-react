import { useCallback, useEffect, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { EduLearningItem } from '../../../shared/data/types'
import { useT } from '../../../shared/i18n'
import { FavoriteToggleButton } from '../FavoriteToggleButton'
import { hasFavoriteTag } from '../favoriteUtils'
import { toggleEduLearningFavoriteTag } from '../eduApi'
import { htmlToText, renderHtml, splitTags } from '../eduUtils'
import { getPhrasePronunciations, hasPhraseMeta, hasText, hasVisiblePhraseLearningContent } from './phraseLearningContentUtils'

type PhraseLearningContentProps = {
  phrase: EduLearningItem
  hiddenFieldKeys?: string[]
  onPlayAudio?: (audioUrl?: string | null) => void
  className?: string
}

const getPhraseContentRows = (phrase: EduLearningItem, t: ReturnType<typeof useT>, hiddenFieldKeys: string[]) => [
  { key: 'translation', label: t('vocabulary.translation'), value: phrase.translation },
  { key: 'meaningClue', label: t('vocabulary.meaning_clue'), value: phrase.meaningClue },
  { key: 'meaning', label: t('vocabulary.meaning'), value: phrase.meaning },
  { key: 'sentenceTwo', label: t('vocabulary.sentence_two'), value: phrase.sentenceTwo },
  { key: 'explanation', label: t('edu.explanation'), value: phrase.explanation },
  { key: 'additionalInfo', label: t('vocabulary.additional_info'), value: phrase.additionalInfo },
].filter((field) => hasText(field.value) && !hiddenFieldKeys.includes(field.key))

export const PhraseLearningContent = ({ phrase, hiddenFieldKeys = [], onPlayAudio, className = '' }: PhraseLearningContentProps) => {
  const t = useT()
  const pronunciations = getPhrasePronunciations(phrase)
  const tags = splitTags(phrase.tags)
  const hasMeta = hasPhraseMeta(phrase)
  const rows = getPhraseContentRows(phrase, t, hiddenFieldKeys)
  const hasVisibleTitle = !hiddenFieldKeys.includes('title')
  const hasVisiblePronunciation = pronunciations.length > 0 && !hiddenFieldKeys.includes('subtitle')
  const hasVisibleEasyMeaning = hasText(phrase.easyMeaning) && !hiddenFieldKeys.includes('easyMeaning')
  const hasVisibleSentenceOne = hasText(phrase.sentenceOne) && !hiddenFieldKeys.includes('sentenceOne')
  const hasVisibleMeta = hasMeta && !hiddenFieldKeys.includes('meta')

  if (!hasVisiblePhraseLearningContent(phrase, hiddenFieldKeys)) return null

  return (
    <div className={`edu-play-detail-content${className ? ` ${className}` : ''}`}>
      {(hasVisibleTitle || hasVisiblePronunciation || hasVisibleEasyMeaning || hasVisibleSentenceOne) ? (
        <div className="edu-play-detail-intro">
          {hasVisibleTitle ? <h1 className="edu-play-detail-title" dangerouslySetInnerHTML={renderHtml(phrase.name)} /> : null}
          {hasVisiblePronunciation ? (
            <div className="edu-play-detail-pronunciations">
              {pronunciations.map((item) => (
                <div className="edu-play-detail-pronunciation" key={`${item.label}-${item.value}`}>
                  <span>{item.label}</span>
                  <span>/{htmlToText(item.value)}/</span>
                  {item.audioUrl && onPlayAudio ? (
                    <button className="edu-play-detail-audio" onClick={() => onPlayAudio(item.audioUrl)} title={`${t('vocabulary.play_pronunciation')} ${item.label}`} type="button">
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
          {(hasVisibleEasyMeaning || hasVisibleSentenceOne) ? (
            <section className="edu-play-detail-highlight">
              {hasVisibleEasyMeaning ? (
                <div className="edu-play-detail-highlight-item edu-play-detail-highlight-item--primary">
                  <span className="edu-play-detail-icon" aria-label={t('vocabulary.easy_meaning')} title={t('vocabulary.easy_meaning')}>
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 3a6 6 0 0 0-3.6 10.8c.37.28.6.7.6 1.16V16h6v-1.04c0-.46.23-.88.6-1.16A6 6 0 0 0 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      <path d="M9.5 19h5M10 22h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div dangerouslySetInnerHTML={renderHtml(phrase.easyMeaning)} />
                </div>
              ) : null}
              {hasVisibleSentenceOne ? (
                <div className="edu-play-detail-highlight-item">
                  <span className="edu-play-detail-icon edu-play-detail-icon--sentence" aria-label={t('vocabulary.sentence_one')} title={t('vocabulary.sentence_one')}>
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 5h14v10H8l-3 3V5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      <path d="M8 9h8M8 12h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div dangerouslySetInnerHTML={renderHtml(phrase.sentenceOne)} />
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      ) : null}
      <div className="edu-play-detail-rows">
        {hasVisibleMeta ? (
          <section className="edu-play-detail-row">
            <h3>{t('vocabulary.meta')}</h3>
            <div className="edu-play-detail-row-body edu-play-detail-meta">
              {phrase.term ? <span className="edu-play-detail-chip">{t('vocabulary.term')} {phrase.term}</span> : null}
              {phrase.week ? <span className="edu-play-detail-chip">{t('vocabulary.week')} {phrase.week}</span> : null}
              {phrase.difficultyLevel ? <span className="edu-play-detail-chip edu-play-detail-chip--difficulty">{phrase.difficultyLevel}</span> : null}
              {tags.map((tag) => <span key={tag} className="edu-play-detail-chip">{tag}</span>)}
            </div>
          </section>
        ) : null}
        {rows.map((field) => (
          <section className="edu-play-detail-row" key={field.key}>
            <h3>{field.label}</h3>
            <div className="edu-play-detail-row-body" dangerouslySetInnerHTML={renderHtml(String(field.value ?? ''))} />
          </section>
        ))}
      </div>
    </div>
  )
}

const getAutoPlayAudioUrl = (item: EduLearningItem) => item.phoneticUsAudioUrl || item.phoneticAudioUrl || item.phoneticUkAudioUrl

export const PhraseDetail = ({
  phrase,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  onFavoriteUpdated,
}: {
  phrase: EduLearningItem
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
  hasPrevious: boolean
  hasNext: boolean
  onFavoriteUpdated?: (item: EduLearningItem) => void
}) => {
  const t = useT()
  const [currentPhrase, setCurrentPhrase] = useState(phrase)
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isFavourite = hasFavoriteTag(currentPhrase)

  const playAudio = useCallback((audioUrl?: string | null) => {
    if (!audioUrl) return
    audioRef.current?.pause()
    audioRef.current = new Audio(audioUrl)
    audioRef.current.play().catch((error) => console.error('Audio playback failed:', error))
  }, [])

  const handleToggleFavorite = useCallback(async () => {
    setIsTogglingFavorite(true)
    try {
      const response = await toggleEduLearningFavoriteTag('phrases', currentPhrase.id)
      setCurrentPhrase(response.data)
      onFavoriteUpdated?.(response.data)
    } finally {
      setIsTogglingFavorite(false)
    }
  }, [currentPhrase.id, onFavoriteUpdated])

  useEffect(() => {
    setCurrentPhrase(phrase)
  }, [phrase])

  useEffect(() => {
    if (!autoPlayEnabled) return undefined
    const audioUrl = getAutoPlayAudioUrl(currentPhrase)
    if (!audioUrl) return undefined
    const timer = window.setTimeout(() => playAudio(audioUrl), 180)
    return () => window.clearTimeout(timer)
  }, [autoPlayEnabled, currentPhrase, playAudio])

  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement
    modalRef.current?.focus()
    return () => previousActiveElement.current?.focus()
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft' && hasPrevious) onPrevious()
      if (event.key === 'ArrowRight' && hasNext) onNext()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [hasNext, hasPrevious, onClose, onNext, onPrevious])

  useEffect(
    () => () => {
      audioRef.current?.pause()
      audioRef.current = null
    },
    [],
  )

  return (
    <div className="phrase-detail-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="phrase-detail-modal phrase-detail-modal--learning" ref={modalRef} tabIndex={-1}>
        <div className="detail-actions">
          <button type="button" className="detail-action-btn detail-close-btn" onClick={onClose} aria-label={t('vocabulary.close')}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6 18 18M18 6 6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </button>
          <FavoriteToggleButton
            active={isFavourite}
            className="detail-action-btn"
            disabled={isTogglingFavorite}
            onClick={handleToggleFavorite}
          />
        </div>

        <PhraseLearningContent phrase={currentPhrase} onPlayAudio={playAudio} className="edu-play-detail-content--modal" />

        <div className="detail-navigation">
          <button type="button" className="detail-nav-btn detail-nav-icon-btn" onClick={onPrevious} disabled={!hasPrevious} title={t('vocabulary.previous')}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <AutoPlayControls
            autoPlayEnabled={autoPlayEnabled}
            setAutoPlayEnabled={setAutoPlayEnabled}
          />
          <button type="button" className="detail-nav-btn detail-nav-icon-btn" onClick={onNext} disabled={!hasNext} title={t('vocabulary.next')}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

const AutoPlayControls = ({
  autoPlayEnabled,
  setAutoPlayEnabled,
}: {
  autoPlayEnabled: boolean
  setAutoPlayEnabled: Dispatch<SetStateAction<boolean>>
}) => {
  const t = useT()
  return (
    <div className="detail-autoplay-controls">
      <button className={`detail-autoplay-toggle${autoPlayEnabled ? ' active' : ''}`} onClick={() => setAutoPlayEnabled((value) => !value)} type="button" aria-pressed={autoPlayEnabled} aria-label={t('vocabulary.auto_play')} title={t('vocabulary.auto_play')}>
        <span className="detail-autoplay-switch" aria-hidden="true" />
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M11 5 6 9H2v6h4l5 4V5Z" fill="currentColor" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07M18.07 5.93a9 9 0 0 1 0 12.73" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
