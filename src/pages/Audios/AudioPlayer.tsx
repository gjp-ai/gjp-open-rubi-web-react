import { useEffect, useMemo, useRef, useState } from 'react'
import type { MediaItem } from '../../shared/data/types'
import { useT } from '../../shared/i18n'
import { sanitizeHtml } from '../../shared/security/sanitizeHtml'
import { getSafeUrl } from '../../shared/security/safeUrl'

interface AudioPlayerProps {
  item: MediaItem
  onPrevious: () => void
  onNext: () => void
  onEnded: () => void
  showSubtitle: boolean
  onToggleSubtitle: (show: boolean) => void
}

export const AudioPlayer = ({
  item,
  onPrevious,
  onNext,
  onEnded,
  showSubtitle,
  onToggleSubtitle,
}: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const t = useT()
  const safeSubtitle = useMemo(() => (item.subtitle ? sanitizeHtml(item.subtitle) : ''), [item.subtitle])
  const safeAudioUrl = useMemo(() => getSafeUrl(item.url, { allowRelative: false }), [item.url])
  const safeCaptionsUrl = useMemo(() => getSafeUrl(item.captionsUrl, { allowRelative: false }), [item.captionsUrl])

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current

      // Reset state
      setCurrentTime(0)
      setDuration(0)

      // With key={item.id}, we have a fresh element, so we don't need load()
      // Just attempt to play
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('Playback failed:', error)
          }
        })
      }
    }
  }, [item.id])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('Toggle play failed:', error)
          })
        }
      }
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="audio-card__player-wrapper">
      {showSubtitle && safeSubtitle ? (
        <div className="audio-card__subtitle-container">
          <button
            type="button"
            className="audio-card__subtitle-close"
            onClick={() => onToggleSubtitle(false)}
            aria-label="Close subtitles"
            title="Close subtitles"
          >
            ✕
          </button>
          <div className="audio-card__subtitle-content" dangerouslySetInnerHTML={{ __html: safeSubtitle }} />
        </div>
      ) : null}

      <div className="audio-card__player-progress">
        <span className="audio-card__time">{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="audio-card__progress-bar"
          style={{
            backgroundSize: `${(currentTime / duration) * 100}% 100%`,
          }}
        />
        <span className="audio-card__time">{formatTime(duration)}</span>
      </div>

      <div className="audio-card__player-controls-row">
        <div className="audio-card__player-buttons">
          <button
            type="button"
            className="audio-card__control-button"
            onClick={onPrevious}
            aria-label="Previous song"
            title="Previous song"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>
          <button
            type="button"
            className="audio-card__control-button audio-card__play-pause"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            className="audio-card__control-button"
            onClick={onNext}
            aria-label="Next song"
            title="Next song"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        <div className="audio-card__player-info">
          <span className="audio-card__player-title">{item.title ?? item.name ?? t('untitled.audio')}</span>
          {item.artist && <span className="audio-card__player-artist"> • {item.artist}</span>}
        </div>

        <div className="audio-card__player-extras">
          {safeSubtitle ? (
            <button
              type="button"
              className="audio-card__control-button"
              onClick={() => onToggleSubtitle(!showSubtitle)}
              aria-pressed={showSubtitle}
              aria-label={showSubtitle ? 'Hide subtitles' : 'Show subtitles'}
              title={showSubtitle ? 'Hide subtitles' : 'Show subtitles'}
            >
              CC
            </button>
          ) : (
            <div style={{ width: 40 }} />
          )}
        </div>
      </div>

      <audio
        key={item.id}
        ref={audioRef}
        src={safeAudioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="auto"
      >
        {safeCaptionsUrl ? <track kind="captions" srcLang="en" src={safeCaptionsUrl} /> : null}
      </audio>
    </div>
  )
}
