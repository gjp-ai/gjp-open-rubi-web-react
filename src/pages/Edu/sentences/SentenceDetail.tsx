import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import type { EduLearningItem } from '../../../shared/data/types'
import { useT } from '../../../shared/i18n'
import { htmlToText, renderHtml, splitTags } from '../eduUtils'

type ToggleSection = 'translation' | 'meaningClue' | 'easyMeaning' | 'meaning' | 'sentenceOne' | 'sentenceTwo' | 'additionalInfo'

type Pronunciation = {
  label: string
  value: string
  audioUrl?: string | null
}

const initialOpen: Record<ToggleSection, boolean> = {
  translation: true,
  meaningClue: true,
  easyMeaning: true,
  meaning: true,
  sentenceOne: true,
  sentenceTwo: true,
  additionalInfo: true,
}

const getPronunciations = (item: EduLearningItem): Pronunciation[] => {
  const rows: Pronunciation[] = []
  if (item.phoneticUs) rows.push({ label: 'US', value: item.phoneticUs, audioUrl: item.phoneticUsAudioUrl || item.phoneticAudioUrl })
  if (item.phoneticUk) rows.push({ label: 'UK', value: item.phoneticUk, audioUrl: item.phoneticUkAudioUrl })
  return rows
}

const getAutoPlayAudioUrl = (item: EduLearningItem) => item.phoneticUsAudioUrl || item.phoneticAudioUrl || item.phoneticUkAudioUrl

export const SentenceDetail = ({
  sentence,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: {
  sentence: EduLearningItem
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
  hasPrevious: boolean
  hasNext: boolean
}) => {
  const t = useT()
  const [open, setOpen] = useState(initialOpen)
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const pronunciations = useMemo(() => getPronunciations(sentence), [sentence])
  const allOpen = Object.values(open).every(Boolean)
  const tags = splitTags(sentence.tags)
  const hasMeta = tags.length > 0 || sentence.term || sentence.week || sentence.difficultyLevel

  const playAudio = useCallback((audioUrl?: string | null) => {
    if (!audioUrl) return
    audioRef.current?.pause()
    audioRef.current = new Audio(audioUrl)
    audioRef.current.play().catch((error) => console.error('Audio playback failed:', error))
  }, [])

  useEffect(() => {
    if (!autoPlayEnabled) return undefined
    const audioUrl = getAutoPlayAudioUrl(sentence)
    if (!audioUrl) return undefined
    const timer = window.setTimeout(() => playAudio(audioUrl), 180)
    return () => window.clearTimeout(timer)
  }, [autoPlayEnabled, playAudio, sentence])

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

  const section = (key: ToggleSection, title: string, content?: string | null) =>
    content?.trim() ? (
      <DetailSection title={title} isOpen={open[key]} onToggle={() => setOpen((current) => ({ ...current, [key]: !current[key] }))}>
        <div className="detail-html" dangerouslySetInnerHTML={renderHtml(content)} />
      </DetailSection>
    ) : null

  return (
    <div className="sentence-detail-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="sentence-detail-modal sentence-detail-modal--learning" ref={modalRef} tabIndex={-1}>
        <div className="detail-actions">
          <button type="button" className="detail-action-btn detail-close-btn" onClick={onClose} aria-label={t('vocabulary.close')}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6 18 18M18 6 6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </button>
          <button type="button" className="detail-action-btn" onClick={() => setOpen(Object.fromEntries(Object.keys(initialOpen).map((key) => [key, !allOpen])) as Record<ToggleSection, boolean>)} title={allOpen ? t('vocabulary.collapse_all') : t('vocabulary.expand_all')}>
            {allOpen ? '−' : '+'}
          </button>
        </div>

        <div className="detail-content">
          <div className="detail-hero">
            <div className="detail-hero__main">
              <p className="detail-eyebrow">{t('nav.edu_sentences')}</p>
              <div className="detail-word" dangerouslySetInnerHTML={renderHtml(sentence.name)} />
              {pronunciations.length ? (
                <div className="detail-pronunciation-list">
                  {pronunciations.map((item) => (
                    <div className="detail-pronunciation-card" key={`${item.label}-${item.value}`}>
                      <span className="detail-pronunciation-label">{item.label}</span>
                      <span className="detail-phonetic">/{htmlToText(item.value)}/</span>
                      {item.audioUrl ? (
                        <button className="detail-audio-btn detail-audio-btn--large" onClick={() => playAudio(item.audioUrl)} title={`${t('vocabulary.play_pronunciation')} ${item.label}`} type="button">
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
            </div>
          </div>

          {hasMeta ? (
            <div className="detail-meta-info detail-meta-info--row">
              {sentence.term ? <span className="detail-meta-item">{t('vocabulary.term')} {sentence.term}</span> : null}
              {sentence.week ? <span className="detail-meta-item">{t('vocabulary.week')} {sentence.week}</span> : null}
              {sentence.difficultyLevel ? <span className="detail-difficulty">{sentence.difficultyLevel}</span> : null}
              {tags.map((tag) => <span key={tag} className="detail-tag">{tag}</span>)}
            </div>
          ) : null}

          <div className="detail-section-grid">
            {section('translation', t('vocabulary.translation'), sentence.translation)}
            {section('meaningClue', t('vocabulary.meaning_clue'), sentence.meaningClue)}
            {section('easyMeaning', t('vocabulary.easy_meaning'), sentence.easyMeaning)}
            {section('meaning', t('vocabulary.meaning'), sentence.meaning ?? sentence.explanation)}
            {section('sentenceOne', t('vocabulary.sentence_one'), sentence.sentenceOne)}
            {section('sentenceTwo', t('vocabulary.sentence_two'), sentence.sentenceTwo)}
            {section('additionalInfo', t('vocabulary.additional_info'), sentence.additionalInfo)}
          </div>
        </div>

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

const DetailSection = ({ title, isOpen, onToggle, children }: { title: string; isOpen: boolean; onToggle: () => void; children: ReactNode }) => (
  <section className="sentence-detail-section">
    <div className="section-header">
      <h3>{title}</h3>
      <ToggleButton isOpen={isOpen} onClick={onToggle} />
    </div>
    {isOpen ? <div className="detail-section-body">{children}</div> : null}
  </section>
)

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

const ToggleButton = memo(({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => {
  const t = useT()
  return (
    <button className="toggle-btn" type="button" onClick={onClick} aria-label={isOpen ? t('vocabulary.hide') : t('vocabulary.show')}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
