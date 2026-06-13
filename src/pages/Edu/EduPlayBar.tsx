import { type CSSProperties, useEffect, useState } from 'react'
import { useT } from '../../shared/i18n'
import { renderHtml } from './eduUtils'
import './eduPlayBar.css'

export type EduPlayOrder = 'sequence' | 'random'
export type EduPlayPronunciation = 'us' | 'uk'

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
  progress?: number
  onStop: () => void
  onTogglePause: () => void
  onProgressSeek?: (progress: number) => void
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
  progress,
  onStop,
  onTogglePause,
  onProgressSeek,
  onIntervalChange,
  onOrderChange,
  onPronunciationChange,
}: EduPlayBarProps) => {
  const t = useT()
  const [isFullScreen, setIsFullScreen] = useState(false)
  const safeTotal = Math.max(total, 0)
  const safeCurrent = safeTotal === 0 ? 0 : Math.min(currentIndex + 1, safeTotal)
  const safeProgress = Math.max(0, Math.min(progress ?? 0, 100))

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
  }, [isFullScreen, onOrderChange, onStop, onTogglePause, order])

  const playPauseLabel = isPaused ? t('vocabulary.resume_auto_play') : t('vocabulary.pause_auto_play')
  const controls = (
    <>
      <button className="edu-play-bar__control edu-play-bar__control--primary" onClick={onTogglePause} type="button" aria-label={playPauseLabel} title={`${playPauseLabel} (Space)`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {isPaused ? <path d="M8 5v14l11-7Z" fill="currentColor" /> : <path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" />}
        </svg>
      </button>
      <button className="edu-play-bar__control" onClick={onStop} type="button" aria-label={t('vocabulary.stop_auto_play')} title={`${t('vocabulary.stop_auto_play')} (S)`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor" />
        </svg>
      </button>
    </>
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
              </strong>
            </div>
            <button className="edu-play-bar__control" onClick={() => setIsFullScreen(false)} type="button" aria-label={t('vocabulary.exit_full_screen')} title={t('vocabulary.exit_full_screen')}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 4H4v4M4 4l6 6M16 4h4v4M20 4l-6 6M8 20H4v-4M4 20l6-6M16 20h4v-4M20 20l-6-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
          </div>
          <div className="edu-play-fullscreen__content">
            {currentMeta ? <span className="edu-play-fullscreen__meta">{currentMeta}</span> : null}
            <h2>{currentTitle}</h2>
            {currentSubtitle ? <p className="edu-play-fullscreen__subtitle">{currentSubtitle}</p> : null}
            {currentDescription ? <div className="edu-play-fullscreen__description" dangerouslySetInnerHTML={renderHtml(currentDescription)} /> : null}
            {renderProgressControl('edu-play-bar__progress edu-play-fullscreen__progress')}
          </div>
          <div className="edu-play-fullscreen__controls">
            {controls}
            <div className="edu-play-fullscreen__shortcuts">
              <span><kbd>Space</kbd> {isPaused ? t('vocabulary.resume') : t('vocabulary.pause')}</span>
              <span><kbd>S</kbd> {t('vocabulary.stop')}</span>
              <span><kbd>F</kbd> {t('vocabulary.full_screen')}</span>
              <span><kbd>R</kbd> {t('vocabulary.play_order')}</span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="edu-play-bar" role="region" aria-label={t('vocabulary.play_all')}>
        {controls}

        <div className="edu-play-bar__status">
          <strong>{isPaused ? t('vocabulary.paused') : t('vocabulary.play_all')}</strong>
          <span>
            {safeCurrent}/{safeTotal}
          </span>
        </div>

        <div className="edu-play-bar__now">
          <strong>{currentTitle}</strong>
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
        </button>
      </div>
    </>
  )
}
