import { type CSSProperties, useEffect, useState } from 'react'
import { useT } from '../../shared/i18n'
import { FavoriteBadge, FavoriteToggleButton } from './FavoriteToggleButton'
import { renderHtml } from './eduUtils'
import './eduPlayBar.css'

export type EduPlayOrder = 'sequence' | 'random'
export type EduPlayPronunciation = 'us' | 'uk'
export interface EduPlayField {
  key?: string
  label: string
  value?: string | number | null
}

export const EDU_PLAY_INTERVALS = [2000, 5000, 10000, 15000, 20000, 25000] as const

interface EduPlayBarProps {
  currentIndex: number
  total: number
  interval: number
  order: EduPlayOrder
  pronunciation?: EduPlayPronunciation
  isPaused: boolean
  currentTitle: string
  currentSubtitle?: string
  currentDescription?: string
  currentMeta?: string
  heroFields?: EduPlayField[]
  fullScreenFields?: EduPlayField[]
  fullScreenTitlePlacement?: 'hero' | 'stage'
  fullScreenVariant?: 'default' | 'sentence'
  hiddenFieldKeys?: string[]
  startFullScreen?: boolean
  progress?: number
  isFavourite?: boolean
  isFavoriteTogglePending?: boolean
  onStop: () => void
  onPrevious?: () => void
  onRepeat?: () => void
  onNext?: () => void
  onTogglePause: () => void
  onHiddenFieldKeysChange?: (fieldKeys: string[]) => void
  onToggleFieldVisibility?: (fieldKey: string) => void
  onProgressSeek?: (progress: number) => void
  onToggleFavorite?: () => void
  onIntervalChange: (interval: number) => void
  onOrderChange: (order: EduPlayOrder) => void
  onPronunciationChange?: (pronunciation: EduPlayPronunciation) => void
}

export const EduPlayBar = ({
  currentIndex,
  total,
  interval,
  order,
  pronunciation,
  isPaused,
  currentTitle,
  currentSubtitle,
  currentDescription,
  currentMeta,
  heroFields = [],
  fullScreenFields = [],
  fullScreenTitlePlacement = 'hero',
  fullScreenVariant = 'default',
  hiddenFieldKeys = [],
  startFullScreen = false,
  progress,
  isFavourite = false,
  isFavoriteTogglePending = false,
  onStop,
  onPrevious,
  onRepeat,
  onNext,
  onTogglePause,
  onHiddenFieldKeysChange,
  onToggleFieldVisibility,
  onProgressSeek,
  onToggleFavorite,
  onIntervalChange,
  onOrderChange,
  onPronunciationChange,
}: EduPlayBarProps) => {
  const t = useT()
  const [isFullScreen, setIsFullScreen] = useState(startFullScreen)
  const [showFieldSettings, setShowFieldSettings] = useState(false)
  const safeTotal = Math.max(total, 0)
  const safeCurrent = safeTotal === 0 ? 0 : Math.min(currentIndex + 1, safeTotal)
  const safeProgress = Math.max(0, Math.min(progress ?? 0, 100))
  const hiddenFieldSet = new Set(hiddenFieldKeys)
  const isFieldVisible = (fieldKey: string) => !hiddenFieldSet.has(fieldKey)
  const baseFullScreenFields: EduPlayField[] = [
    { key: 'title', label: t('vocabulary.title'), value: currentTitle },
    { key: 'meta', label: t('vocabulary.meta'), value: currentMeta },
    { key: 'subtitle', label: t('vocabulary.phonetic'), value: currentSubtitle },
    { key: 'description', label: t('vocabulary.description'), value: currentDescription },
    ...heroFields,
  ]
  const visibleHeroFields = heroFields
    .map((field) => ({ ...field, key: field.key ?? field.label }))
    .filter((field) => field.value !== undefined && field.value !== null && String(field.value).trim() !== '' && isFieldVisible(field.key))
  const availableFullScreenFields = [...baseFullScreenFields, ...fullScreenFields]
    .map((field) => ({ ...field, key: field.key ?? field.label }))
    .filter((field) => field.value !== undefined && field.value !== null && String(field.value).trim() !== '')
  const availableFieldKeys = availableFullScreenFields.map((field) => field.key)
  const visibleFullScreenFields = fullScreenFields
    .map((field) => ({ ...field, key: field.key ?? field.label }))
    .filter((field) => field.value !== undefined && field.value !== null && String(field.value).trim() !== '' && isFieldVisible(field.key))
  const showStageTitle = fullScreenTitlePlacement === 'stage' && currentTitle && isFieldVisible('title')
  const showHeroTitle = fullScreenTitlePlacement === 'hero' && currentTitle && isFieldVisible('title')
  const isFocusOnlyMode = availableFullScreenFields.length > 0 && availableFullScreenFields.every((field) => !isFieldVisible(field.key))

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const tagName = target?.tagName.toLowerCase()
      if (tagName === 'input' || tagName === 'select' || tagName === 'textarea' || target?.isContentEditable) return

      if (event.code === 'Space') {
        event.preventDefault()
        onTogglePause()
      } else if (event.key.toLowerCase() === 's') {
        event.preventDefault()
        onStop()
      } else if (event.key === 'ArrowLeft' && onPrevious && currentIndex > 0) {
        event.preventDefault()
        onPrevious()
      } else if (event.key === 'Enter' && onRepeat) {
        event.preventDefault()
        onRepeat()
      } else if (event.key === 'ArrowRight' && onNext && currentIndex < safeTotal - 1) {
        event.preventDefault()
        onNext()
      } else if (event.key.toLowerCase() === 'f') {
        event.preventDefault()
        setIsFullScreen((value) => !value)
      } else if (event.key.toLowerCase() === 'r') {
        event.preventDefault()
        onOrderChange(order === 'random' ? 'sequence' : 'random')
      } else if (event.key === 'Escape' && isFullScreen) {
        event.preventDefault()
        setIsFullScreen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, isFullScreen, onNext, onOrderChange, onPrevious, onRepeat, onStop, onTogglePause, order, safeTotal])

  const playPauseLabel = isPaused ? t('vocabulary.resume_auto_play') : t('vocabulary.pause_auto_play')
  const renderControls = () => (
    <div className="edu-play-bar__controls">
      {onPrevious ? (
        <button className="edu-play-bar__control" disabled={currentIndex <= 0} onClick={onPrevious} type="button" aria-label={t('vocabulary.play_previous')} title={`${t('vocabulary.play_previous')} (←)`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 5v14L9 12l10-7ZM7 5v14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <kbd>←</kbd>
        </button>
      ) : null}
      <button className="edu-play-bar__control edu-play-bar__control--primary" onClick={onTogglePause} type="button" aria-label={playPauseLabel} title={`${playPauseLabel} (Space)`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {isPaused ? <path d="M8 5v14l11-7Z" fill="currentColor" /> : <path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" />}
        </svg>
        <kbd>Space</kbd>
      </button>
      {onRepeat ? (
        <button className="edu-play-bar__control" onClick={onRepeat} type="button" aria-label={t('vocabulary.play_repeat')} title={`${t('vocabulary.play_repeat')} (Enter)`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <kbd>Enter</kbd>
        </button>
      ) : null}
      <button className="edu-play-bar__control" onClick={onStop} type="button" aria-label={t('vocabulary.stop_auto_play')} title={`${t('vocabulary.stop_auto_play')} (S)`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor" />
        </svg>
        <kbd>S</kbd>
      </button>
      {onNext ? (
        <button className="edu-play-bar__control" disabled={currentIndex >= safeTotal - 1} onClick={onNext} type="button" aria-label={t('vocabulary.play_next')} title={`${t('vocabulary.play_next')} (→)`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 5v14l10-7L5 5ZM17 5v14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <kbd>→</kbd>
        </button>
      ) : null}
    </div>
  )
  const renderProgressControl = (className = 'edu-play-bar__progress') => onProgressSeek ? (
    <label className={className}>
      <span>{t('vocabulary.audio_progress')}</span>
      <input
        aria-label={t('vocabulary.audio_progress')}
        max="100"
        min="0"
        onChange={(event) => onProgressSeek(Number(event.target.value))}
        step="0.1"
        style={{ '--play-progress': `${safeProgress}%` } as CSSProperties}
        type="range"
        value={safeProgress}
      />
    </label>
  ) : null

  return (
    <>
      {isFullScreen ? (
        <div className="edu-play-fullscreen" role="dialog" aria-modal="true" aria-label={t('vocabulary.full_screen_learning')}>
          <div className="edu-play-fullscreen__top">
            <div>
              <span>{t('vocabulary.play_all')}</span>
              <strong>
                {safeCurrent}/{safeTotal}
                {isFavourite ? <FavoriteBadge className="edu-play-fullscreen__favorite-badge" /> : null}
              </strong>
            </div>
            <div className="edu-play-fullscreen__actions">
              {onToggleFavorite ? (
                <FavoriteToggleButton
                  active={isFavourite}
                  className="edu-play-bar__control edu-play-fullscreen__favorite-toggle"
                  disabled={isFavoriteTogglePending}
                  onClick={onToggleFavorite}
                />
              ) : null}
              {onToggleFieldVisibility ? (
                <div className="edu-play-fullscreen__field-menu">
                  <button className={`edu-play-bar__control${showFieldSettings ? ' active' : ''}`} onClick={() => setShowFieldSettings((value) => !value)} type="button" aria-label={t('vocabulary.field_visibility')} title={t('vocabulary.field_visibility')} aria-expanded={showFieldSettings}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" fill="none" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                  {showFieldSettings ? (
                    <div className="edu-play-fullscreen__field-panel">
                      <strong>{t('vocabulary.field_visibility')}</strong>
                      {onHiddenFieldKeysChange ? (
                        <div className="edu-play-fullscreen__field-panel-actions">
                          <button className="edu-play-fullscreen__bulk-btn edu-play-fullscreen__bulk-btn--select" onClick={() => onHiddenFieldKeysChange([])} type="button">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
                            </svg>
                            <span>{t('vocabulary.select_all')}</span>
                          </button>
                          <button className="edu-play-fullscreen__bulk-btn edu-play-fullscreen__bulk-btn--unselect" onClick={() => onHiddenFieldKeysChange(availableFieldKeys)} type="button">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.3A9.5 9.5 0 0 1 12 5c6 0 9.5 7 9.5 7a16.9 16.9 0 0 1-2.3 3.1M6.2 6.4C3.8 8.1 2.5 12 2.5 12S6 19 12 19a9.4 9.4 0 0 0 4-.9" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                            </svg>
                            <span>{t('vocabulary.unselect_all')}</span>
                          </button>
                        </div>
                      ) : null}
                      <div className="edu-play-fullscreen__field-panel-list">
                        {availableFullScreenFields.map((field) => (
                          <label key={field.key}>
                            <input checked={isFieldVisible(field.key)} onChange={() => onToggleFieldVisibility(field.key)} type="checkbox" />
                            <span>{field.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <button className="edu-play-bar__control" onClick={() => setIsFullScreen(false)} type="button" aria-label={t('vocabulary.exit_full_screen')} title={t('vocabulary.exit_full_screen')}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 4H4v4M4 4l6 6M16 4h4v4M20 4l-6 6M8 20H4v-4M4 20l6-6M16 20h4v-4M20 20l-6-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <kbd>Esc</kbd>
              </button>
            </div>
          </div>
          <div className={`edu-play-fullscreen__content${fullScreenTitlePlacement === 'stage' ? ' edu-play-fullscreen__content--stage-title' : ''}${fullScreenVariant === 'sentence' ? ' edu-play-fullscreen__content--sentence' : ''}`}>
            {showStageTitle ? (
              fullScreenVariant === 'sentence' ? (
                <div className="edu-play-fullscreen__sentence-title" dangerouslySetInnerHTML={renderHtml(currentTitle)} />
              ) : (
                <h2 className="edu-play-fullscreen__stage-title" dangerouslySetInnerHTML={renderHtml(currentTitle)} />
              )
            ) : null}
            {isFocusOnlyMode ? (
              <div className="edu-play-fullscreen__focus-empty">
                <div className="edu-play-fullscreen__focus-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <span>{t('vocabulary.focus_mode')}</span>
                <p>{t('vocabulary.focus_mode_description')}</p>
                {onHiddenFieldKeysChange ? (
                  <button onClick={() => onHiddenFieldKeysChange([])} type="button">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
                    </svg>
                    {t('vocabulary.restore_fields')}
                  </button>
                ) : null}
              </div>
            ) : (
            <div className="edu-play-fullscreen__stage">
              <div className="edu-play-fullscreen__hero">
                {currentMeta && isFieldVisible('meta') ? <span className="edu-play-fullscreen__meta">{currentMeta}</span> : null}
                {showHeroTitle ? <h2 dangerouslySetInnerHTML={renderHtml(currentTitle)} /> : null}
                {isFavourite ? <FavoriteBadge className="edu-play-fullscreen__stage-favorite" /> : null}
                {currentSubtitle && isFieldVisible('subtitle') ? <p className="edu-play-fullscreen__subtitle">{currentSubtitle}</p> : null}
                {visibleHeroFields.length > 0 ? (
                  <div className="edu-play-fullscreen__hero-fields">
                    {visibleHeroFields.map((field) => (
                      <section key={field.key}>
                        <span>{field.label}</span>
                        <div dangerouslySetInnerHTML={renderHtml(String(field.value ?? ''))} />
                      </section>
                    ))}
                  </div>
                ) : null}
              </div>
              {visibleFullScreenFields.length > 0 ? (
                <div className="edu-play-fullscreen__fields">
                  {visibleFullScreenFields.map((field) => (
                    <section className="edu-play-fullscreen__field" key={field.key}>
                      <div className="edu-play-fullscreen__field-heading">
                        <span>{field.label}</span>
                        {onToggleFieldVisibility ? (
                          <button onClick={() => onToggleFieldVisibility(field.key)} type="button" aria-label={`${t('vocabulary.hide_field')} ${field.label}`} title={t('vocabulary.hide_field')}>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.3A9.5 9.5 0 0 1 12 5c6 0 9.5 7 9.5 7a16.9 16.9 0 0 1-2.3 3.1M6.2 6.4C3.8 8.1 2.5 12 2.5 12S6 19 12 19a9.4 9.4 0 0 0 4-.9" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                            </svg>
                          </button>
                        ) : null}
                      </div>
                      <div dangerouslySetInnerHTML={renderHtml(String(field.value ?? ''))} />
                    </section>
                  ))}
                </div>
              ) : currentDescription && isFieldVisible('description') ? (
                <div className="edu-play-fullscreen__description" dangerouslySetInnerHTML={renderHtml(currentDescription)} />
              ) : null}
            </div>
            )}
            {renderProgressControl('edu-play-bar__progress edu-play-fullscreen__progress')}
          </div>
          <div className="edu-play-fullscreen__controls">
            {renderControls()}
            <button className="edu-play-bar__control" onClick={() => onOrderChange(order === 'random' ? 'sequence' : 'random')} type="button" aria-label={t('vocabulary.play_order')} title={`${t('vocabulary.play_order')} (R)`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {order === 'random' ? (
                  <path d="M16 3h5v5M4 7h3.5c2.5 0 3.8 1.5 5 5s2.5 5 5 5H20M20 17l-4-4M20 17l-4 4M4 17h3.5c1.2 0 2.1-.4 2.9-1.3M14.2 8.3A4 4 0 0 1 17.5 7H21" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                ) : (
                  <path d="M4 7h12M13 4l3 3-3 3M4 17h12M13 14l3 3-3 3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                )}
              </svg>
              <kbd>R</kbd>
            </button>
            {onPronunciationChange && pronunciation ? (
              <div className="edu-play-fullscreen__option-group" role="group" aria-label={t('vocabulary.play_phonetics')}>
                {(['us', 'uk'] as EduPlayPronunciation[]).map((value) => (
                  <button key={value} className={`edu-play-bar__segment${pronunciation === value ? ' active' : ''}`} onClick={() => onPronunciationChange(value)} type="button">
                    {value.toUpperCase()}
                  </button>
                ))}
              </div>
            ) : null}
            <label className="edu-play-fullscreen__interval">
              <select value={interval} onChange={(event) => onIntervalChange(Number(event.target.value))} aria-label={t('vocabulary.play_interval')}>
                {EDU_PLAY_INTERVALS.map((value) => (
                  <option key={value} value={value}>
                    {value / 1000} {t('vocabulary.seconds')}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ) : null}

      <div className="edu-play-bar" role="region" aria-label={t('vocabulary.play_all')}>
        {renderControls()}

        <div className="edu-play-bar__status">
          <strong>{isPaused ? t('vocabulary.paused') : t('vocabulary.play_all')}</strong>
          <span>
            {safeCurrent}/{safeTotal}
          </span>
        </div>

        <div className="edu-play-bar__now">
          <strong>
            {currentTitle}
            {isFavourite ? <FavoriteBadge className="edu-play-bar__favorite-badge" /> : null}
          </strong>
          {currentSubtitle ? <span>{currentSubtitle}</span> : null}
        </div>

        {renderProgressControl()}

        {onPronunciationChange && pronunciation ? (
          <div className="edu-play-bar__group" role="group" aria-label={t('vocabulary.play_phonetics')}>
            {(['us', 'uk'] as EduPlayPronunciation[]).map((value) => (
              <button key={value} className={`edu-play-bar__segment${pronunciation === value ? ' active' : ''}`} onClick={() => onPronunciationChange(value)} type="button">
                {value.toUpperCase()}
              </button>
            ))}
          </div>
        ) : null}

        <label className="edu-play-bar__field">
          <select value={interval} onChange={(event) => onIntervalChange(Number(event.target.value))} aria-label={t('vocabulary.play_interval')}>
            {EDU_PLAY_INTERVALS.map((value) => (
              <option key={value} value={value}>
                {value / 1000} {t('vocabulary.seconds')}
              </option>
            ))}
          </select>
        </label>

        <div className="edu-play-bar__group" role="group" aria-label={t('vocabulary.play_order')}>
          {([
            ['sequence', t('vocabulary.play_sequence')],
            ['random', t('vocabulary.play_random')],
          ] as const).map(([value, label]) => (
            <button key={value} className={`edu-play-bar__segment${order === value ? ' active' : ''}`} onClick={() => onOrderChange(value)} type="button">
              {label}
            </button>
          ))}
        </div>

        <button className="edu-play-bar__control" onClick={() => setIsFullScreen(true)} type="button" aria-label={t('vocabulary.full_screen_learning')} title={`${t('vocabulary.full_screen_learning')} (F)`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 4H4v4M4 4l6 6M16 4h4v4M20 4l-6 6M8 20H4v-4M4 20l6-6M16 20h4v-4M20 20l-6-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <kbd>F</kbd>
        </button>
      </div>
    </>
  )
}
