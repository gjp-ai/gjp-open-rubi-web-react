import type { MouseEvent } from 'react'
import { useT } from '../../shared/i18n'
import { getFavoriteTag } from './favoriteUtils'

export const FavoriteIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} aria-hidden="true">
    <path
      d="m12 3.8 2.5 5.1 5.6.8-4.1 4 1 5.6-5-2.6-5 2.6 1-5.6-4.1-4 5.6-.8L12 3.8Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
)

export const FavoriteBadge = ({ className = '' }: { className?: string }) => (
  <span className={`${className} favourite-badge`.trim()} aria-label={getFavoriteTag('EN')} title={getFavoriteTag('EN')}>
    <FavoriteIcon filled />
  </span>
)

export const FavoriteToggleButton = ({
  active,
  className = '',
  disabled,
  onClick,
}: {
  active: boolean
  className?: string
  disabled?: boolean
  onClick: () => void
}) => {
  const t = useT()
  const label = active ? t('edu.remove_favourite') : t('edu.add_favourite')

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onClick()
  }

  return (
    <button
      type="button"
      className={`${className} favourite-toggle-btn ${active ? 'active' : ''}`.trim()}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      title={label}
      onClick={handleClick}
    >
      <FavoriteIcon filled={active} />
    </button>
  )
}
