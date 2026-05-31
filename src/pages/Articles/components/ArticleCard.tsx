import { Link } from 'react-router-dom'
import type { ArticleSummary } from '../../../shared/data/types'
import { getSafeUrl } from '../../../shared/security/safeUrl'

interface ArticleCardProps {
  article: ArticleSummary
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
  const safeCoverImageUrl = getSafeUrl(article.coverImageUrl)
  const tags = article.tags
    ? article.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : []

  return (
    <article className="card article-card">
      <Link to={`/articles/${article.id}`} className="article-card__link">
        <div className="article-card__media">
          {safeCoverImageUrl ? (
            <img src={safeCoverImageUrl} alt={article.title} loading="lazy" />
          ) : (
            <div className="article-card__media-placeholder" aria-hidden="true">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
          )}
        </div>
        <div className="article-card__body">
          <h3 className="article-card__title">{article.title}</h3>
          {article.summary && <p className="article-card__summary">{article.summary}</p>}
          {(tags.length > 0 || article.updatedAt) && (
            <div className="article-card__footer">
              {tags.length > 0 ? (
                <div className="article-card__tags">
                  {tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="article-card__tag">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <span />
              )}
              {article.updatedAt && (
                <time className="article-card__date">{new Date(article.updatedAt).toLocaleDateString()}</time>
              )}
            </div>
          )}
        </div>
      </Link>
    </article>
  )
}

export default ArticleCard
