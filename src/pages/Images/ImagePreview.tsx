import { useEffect } from 'react'
import type { MediaItem } from '../../shared/data/types'
import { useT } from '../../shared/i18n'
import { getSafeUrl } from '../../shared/security/safeUrl'

interface ImagePreviewProps {
  image: MediaItem
  allImages: MediaItem[]
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
}

export const ImagePreview = ({ image, allImages, onClose, onNext, onPrevious }: ImagePreviewProps) => {
  const t = useT()
  const currentIndex = allImages.findIndex((img) => img.id === image.id)
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < allImages.length - 1
  const safeImageUrl = getSafeUrl(image.url)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft' && hasPrevious) {
        onPrevious()
      } else if (e.key === 'ArrowRight' && hasNext) {
        onNext()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose, onNext, onPrevious, hasPrevious, hasNext])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="image-preview" onClick={handleBackdropClick} role="presentation">
      <div className="image-preview__container">
        <button
          className="image-preview__close"
          onClick={onClose}
          aria-label={t('image.close_preview') || 'Close preview'}
        >
          ✕
        </button>

        <div className="image-preview__content">
          {safeImageUrl ? (
            <img
              src={safeImageUrl}
              alt={image.altText ?? image.name ?? image.title ?? ''}
              className="image-preview__image"
            />
          ) : null}
        </div>

        <div className="image-preview__controls">
          <button
            className="image-preview__nav image-preview__nav--prev"
            onClick={onPrevious}
            disabled={!hasPrevious}
            aria-label={t('image.previous') || 'Previous image'}
          >
            ‹
          </button>

          <div className="image-preview__info">
            <h3 className="image-preview__title">{image.name ?? image.title ?? 'Untitled'}</h3>
            <p className="image-preview__counter">
              {currentIndex + 1} / {allImages.length}
            </p>
          </div>

          <button
            className="image-preview__nav image-preview__nav--next"
            onClick={onNext}
            disabled={!hasNext}
            aria-label={t('image.next') || 'Next image'}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}
