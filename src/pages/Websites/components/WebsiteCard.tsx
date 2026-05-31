import { useState } from 'react'
import type { Website } from '../../../shared/data/types'
import { getSafeUrl } from '../../../shared/security/safeUrl'

interface WebsiteCardProps {
  website: Website
}

const DefaultLogoIcon = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style={{ color: 'var(--color-primary)' }}
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
      fill="currentColor"
    />
  </svg>
)

export const WebsiteCard = ({ website }: WebsiteCardProps) => {
  const [imageError, setImageError] = useState(false)

  const description = website.description?.trim()
  const safeLogoUrl = getSafeUrl(website.logoUrl)
  const safeWebsiteUrl = getSafeUrl(website.url, { allowRelative: false })
  const hasLogo = safeLogoUrl && !imageError

  const cardBody = (
    <div className="website-card__layout">
      <div className="website-card__main">
        <div className="website-card__logo" aria-hidden={!hasLogo}>
          {hasLogo ? (
            <img src={safeLogoUrl} alt={website.name} loading="lazy" onError={() => setImageError(true)} />
          ) : (
            <DefaultLogoIcon />
          )}
        </div>
        <div className="website-card__content">
          <h3 className="website-card__title" title={website.name}>
            {website.name}
          </h3>
          {description ? (
            <p className="website-card__description" title={description}>
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )

  return (
    <article className="card website-card" aria-label={website.name}>
      {safeWebsiteUrl ? (
        <a className="website-card__link" href={safeWebsiteUrl} target="_blank" rel="noopener noreferrer">
          {cardBody}
        </a>
      ) : (
        cardBody
      )}
    </article>
  )
}

export default WebsiteCard
