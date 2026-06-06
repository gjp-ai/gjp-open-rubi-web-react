import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useT } from '../../../shared/i18n'
import { getSafeUrl } from '../../../shared/security/safeUrl'
import { htmlToText, renderHtml, splitTags } from '../eduUtils'
import type { PronunciationVariant, VocabularyItem } from './types'

type ToggleSection =
  | 'translation'
  | 'synonyms'
  | 'meaningClue'
  | 'easyMeaning'
  | 'meaning'
  | 'sentenceOne'
  | 'sentenceTwo'
  | 'additionalInfo'

type Pronunciation = {
  label: string
  value: string
  audioUrl?: string | null
}

const initialToggleStates: Record<ToggleSection, boolean> = {
  translation: true,
  synonyms: true,
  meaningClue: true,
  easyMeaning: true,
  meaning: true,
  sentenceOne: true,
  sentenceTwo: true,
  additionalInfo: true,
}

const getPronunciations = (vocabulary: VocabularyItem): Pronunciation[] => {
  const pronunciations: Pronunciation[] = []

  if (vocabulary.phoneticUs) {
    pronunciations.push({ label: 'US', value: vocabulary.phoneticUs, audioUrl: vocabulary.phoneticUsAudioUrl || vocabulary.phoneticAudioUrl })
  }

  if (vocabulary.phoneticUk) {
    pronunciations.push({ label: 'UK', value: vocabulary.phoneticUk, audioUrl: vocabulary.phoneticUkAudioUrl })
  }

  if (pronunciations.length || !vocabulary.phonetic) return pronunciations
  return [{ label: 'IPA', value: vocabulary.phonetic, audioUrl: vocabulary.phoneticAudioUrl }]
}

const getAutoPlayAudioUrl = (vocabulary: VocabularyItem, variant: PronunciationVariant) =>
  variant === 'uk'
    ? vocabulary.phoneticUkAudioUrl || vocabulary.phoneticAudioUrl || vocabulary.phoneticUsAudioUrl
    : vocabulary.phoneticUsAudioUrl || vocabulary.phoneticAudioUrl || vocabulary.phoneticUkAudioUrl

export const VocabularyDetail = ({
  vocabulary,
  onClose,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  autoPlayPronunciation = 'us',
}: {
  vocabulary: VocabularyItem
  onClose: () => void
  onPrevious?: () => void
  onNext?: () => void
  hasPrevious?: boolean
  hasNext?: boolean
  autoPlayPronunciation?: PronunciationVariant
}) => {
  const t = useT()
  const [toggleStates, setToggleStates] = useState(initialToggleStates)
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true)
  const [selectedAutoPlayPronunciation, setSelectedAutoPlayPronunciation] = useState<PronunciationVariant>(autoPlayPronunciation)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const allExpanded = Object.values(toggleStates).every(Boolean)
  const imageUrl = getSafeUrl(vocabulary.imageUrl)
  const dictionaryUrl = getSafeUrl(vocabulary.dictionaryUrl)
  const pronunciations = useMemo(() => getPronunciations(vocabulary), [vocabulary])
  const tags = splitTags(vocabulary.tags)
  const hasMeta = tags.length > 0 || vocabulary.term || vocabulary.week || vocabulary.difficultyLevel || vocabulary.partOfSpeech

  const toggleSection = useCallback((section: ToggleSection) => {
    setToggleStates((current) => ({ ...current, [section]: !current[section] }))
  }, [])

  const handleToggleAll = useCallback(() => {
    const next = !allExpanded
    setToggleStates(Object.fromEntries(Object.keys(initialToggleStates).map((key) => [key, next])) as Record<ToggleSection, boolean>)
  }, [allExpanded])

  const playAudio = useCallback((audioUrl?: string | null) => {
    if (!audioUrl) return
    audioRef.current?.pause()
    audioRef.current = new Audio(audioUrl)
    audioRef.current.play().catch((error) => console.error('Audio playback failed:', error))
  }, [])

  useEffect(() => {
    if (!autoPlayEnabled) return undefined

    const audioUrl = getAutoPlayAudioUrl(vocabulary, selectedAutoPlayPronunciation)
    if (!audioUrl) return

    const timer = window.setTimeout(() => playAudio(audioUrl), 180)
    return () => window.clearTimeout(timer)
  }, [autoPlayEnabled, playAudio, selectedAutoPlayPronunciation, vocabulary])

  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement
    modalRef.current?.focus()
    return () => previousActiveElement.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      } else if (event.key === 'ArrowLeft' && hasPrevious) {
        event.preventDefault()
        onPrevious?.()
      } else if (event.key === 'ArrowRight' && hasNext) {
        event.preventDefault()
        onNext?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [hasNext, hasPrevious, onClose, onNext, onPrevious])

  useEffect(
    () => () => {
      audioRef.current?.pause()
      audioRef.current = null
    },
    [],
  )

  const renderHtmlSection = (section: ToggleSection, title: string, content?: string | null) => {
    if (!content?.trim()) return null
    return (
      <DetailSection section={section} title={title} isOpen={toggleStates[section]} onToggle={() => toggleSection(section)}>
        <div className="detail-html" dangerouslySetInnerHTML={renderHtml(content)} />
      </DetailSection>
    )
  }

  return (
    <div className="vocabulary-detail-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="vocabulary-detail-modal vocabulary-detail-modal--learning" ref={modalRef} tabIndex={-1}>
        <div className="detail-actions">
          <button className="detail-action-btn detail-close-btn" onClick={onClose} aria-label={t('vocabulary.close')} type="button">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6 18 18M18 6 6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </button>
          <button className="detail-action-btn" onClick={handleToggleAll} title={allExpanded ? t('vocabulary.collapse_all') : t('vocabulary.expand_all')} type="button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {allExpanded ? (
                <path d="m8 5 4 4 4-4M8 19l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="m8 9 4-4 4 4M8 15l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        </div>

        <div className="detail-content">
          <div className="detail-hero">
            <div className="detail-hero__main">
              <p className="detail-eyebrow">{t('nav.edu_vocabularies')}</p>
              <h1 className="detail-word">{htmlToText(vocabulary.name)}</h1>
              {pronunciations.length ? (
                <div className="detail-pronunciation-list">
                  {pronunciations.map((item) => (
                    <div className="detail-pronunciation-card" key={`${item.label}-${item.value}`}>
                      <span className="detail-pronunciation-label">{item.label}</span>
                      <span className="detail-phonetic">/{htmlToText(item.value)}/</span>
                      {item.audioUrl ? (
                        <button className="detail-audio-btn detail-audio-btn--large" onClick={() => playAudio(item.audioUrl)} title={`${t('vocabulary.play_pronunciation')} ${item.label}`} type="button">
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
            </div>
            {imageUrl ? (
              <div className="detail-image-container">
                <img src={imageUrl} alt={htmlToText(vocabulary.name)} />
              </div>
            ) : null}
          </div>

          {hasMeta ? (
            <div className="detail-meta-info detail-meta-info--row">
              {vocabulary.partOfSpeech ? <span className="detail-meta-item">{vocabulary.partOfSpeech}</span> : null}
              {vocabulary.term ? <span className="detail-meta-item">{t('vocabulary.term')} {vocabulary.term}</span> : null}
              {vocabulary.week ? <span className="detail-meta-item">{t('vocabulary.week')} {vocabulary.week}</span> : null}
              {vocabulary.difficultyLevel ? <span className="detail-difficulty" data-level={vocabulary.difficultyLevel.toLowerCase()}>{vocabulary.difficultyLevel}</span> : null}
              {tags.map((tag) => <span key={tag} className="detail-tag">{tag}</span>)}
            </div>
          ) : null}

          <div className="detail-section-grid">
            {renderHtmlSection('translation', t('vocabulary.translation'), vocabulary.translation)}
            {vocabulary.synonyms?.trim() ? (
              <DetailSection section="synonyms" title={t('vocabulary.synonyms')} isOpen={toggleStates.synonyms} onToggle={() => toggleSection('synonyms')}>
                <div className="detail-synonym-list">
                  {vocabulary.synonyms.split(/[,;，；]/).map((synonym) => synonym.trim()).filter(Boolean).map((synonym) => (
                    <span className="detail-synonym" key={synonym}>{synonym}</span>
                  ))}
                </div>
              </DetailSection>
            ) : null}
            {renderHtmlSection('meaningClue', t('vocabulary.meaning_clue'), vocabulary.meaningClue)}
            {renderHtmlSection('easyMeaning', t('vocabulary.easy_meaning'), vocabulary.easyMeaning)}
            {renderHtmlSection('meaning', t('vocabulary.meaning'), vocabulary.meaning)}
            {renderHtmlSection('sentenceOne', t('vocabulary.sentence_one'), vocabulary.sentenceOne)}
            {renderHtmlSection('sentenceTwo', t('vocabulary.sentence_two'), vocabulary.sentenceTwo)}
            {renderHtmlSection('additionalInfo', t('vocabulary.additional_info'), vocabulary.additionalInfo)}
          </div>

          {dictionaryUrl ? (
            <div className="detail-footer">
              <a href={dictionaryUrl} target="_blank" rel="noopener noreferrer" className="detail-dictionary-link">
                {t('vocabulary.view_dictionary')}
              </a>
            </div>
          ) : null}
        </div>

        {(hasPrevious || hasNext) ? (
          <div className="detail-navigation">
            <button className="detail-nav-btn detail-nav-icon-btn" onClick={onPrevious} disabled={!hasPrevious} title={t('vocabulary.previous')} type="button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="detail-autoplay-controls">
              <button
                className={`detail-autoplay-toggle${autoPlayEnabled ? ' active' : ''}`}
                onClick={() => setAutoPlayEnabled((value) => !value)}
                type="button"
                aria-pressed={autoPlayEnabled}
                aria-label={t('vocabulary.auto_play')}
                title={t('vocabulary.auto_play')}
              >
                <span className="detail-autoplay-switch" aria-hidden="true" />
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M11 5 6 9H2v6h4l5 4V5Z" fill="currentColor" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07M18.07 5.93a9 9 0 0 1 0 12.73" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <div className="detail-autoplay-segmented" role="group" aria-label={t('vocabulary.auto_play_phonetics')}>
                {(['us', 'uk'] as PronunciationVariant[]).map((variant) => (
                  <button
                    key={variant}
                    className={`detail-autoplay-segment${selectedAutoPlayPronunciation === variant ? ' active' : ''}`}
                    onClick={() => setSelectedAutoPlayPronunciation(variant)}
                    type="button"
                    aria-pressed={selectedAutoPlayPronunciation === variant}
                  >
                    {variant.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <button className="detail-nav-btn detail-nav-icon-btn" onClick={onNext} disabled={!hasNext} title={t('vocabulary.next')} type="button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

const DetailSection = ({
  section,
  title,
  isOpen,
  onToggle,
  children,
}: {
  section: ToggleSection
  title: string
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
}) => (
  <section className={`detail-section-toggle detail-section-toggle--${section}`}>
    <div className="section-header">
      <h3>{title}</h3>
      <ToggleButton isOpen={isOpen} onClick={onToggle} />
    </div>
    {isOpen ? <div className="detail-section-body">{children}</div> : null}
  </section>
)

const ToggleButton = memo(({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => {
  const t = useT()
  return (
    <button className="toggle-btn" onClick={onClick} type="button" aria-label={isOpen ? t('vocabulary.hide') : t('vocabulary.show')}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {isOpen ? (
          <path d="m19 9-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  )
})

ToggleButton.displayName = 'ToggleButton'
