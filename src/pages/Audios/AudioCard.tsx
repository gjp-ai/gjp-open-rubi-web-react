import type { MediaItem } from '../../shared/data/types'
import { useT } from '../../shared/i18n'
import { getSafeUrl } from '../../shared/security/safeUrl'

interface AudioCardProps {
  item: MediaItem
  isActive: boolean
  onTogglePlayer: (item: MediaItem) => void
}

export const AudioCard = ({ item, isActive, onTogglePlayer }: AudioCardProps) => {
  const t = useT()
  const safeCoverImageUrl = getSafeUrl(item.coverImageUrl)

  return (
    <article className="card audio-card">
      <div className="audio-card__content">
        <div className="audio-card__media-wrapper">
          <div className="audio-card__media">
            {safeCoverImageUrl ? (
              <img src={safeCoverImageUrl} alt={item.title ?? t('untitled.audio')} loading="lazy" />
            ) : (
              <div className="audio-card__placeholder">{t('placeholder.audio')}</div>
            )}
          </div>
          <button
            className="audio-card__play-button"
            onClick={() => onTogglePlayer(item)}
            aria-label={isActive ? 'Hide player' : 'Show player'}
          >
            {isActive ? '⏸' : '▶'}
          </button>
        </div>
        <div className="audio-card__info">
          <h3 className="audio-card__title">{item.title ?? item.name ?? t('untitled.audio')}</h3>
          {item.artist && <div className="audio-card__artist">{item.artist}</div>}
        </div>
      </div>
    </article>
  )
}
