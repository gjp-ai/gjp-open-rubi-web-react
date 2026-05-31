import type { FileItem } from '../../shared/data/types'
import { useT } from '../../shared/i18n'
import { getSafeUrl } from '../../shared/security/safeUrl'

interface FileCardProps {
  item: FileItem
}

export const FileCard = ({ item }: FileCardProps) => {
  const t = useT()
  const downloadLabel = item.name ? `${t('file.download')} ${item.name}` : t('file.download')
  const safeFileUrl = getSafeUrl(item.url)

  return (
    <article className="card file-card">
      <span className="file-card__name" title={item.description ?? undefined}>
        {item.name}
      </span>
      {safeFileUrl ? (
        <a
          className="file-card__download-button"
          href={safeFileUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={downloadLabel}
          title={downloadLabel}
        >
          <span aria-hidden="true">⬇</span>
        </a>
      ) : null}
    </article>
  )
}
