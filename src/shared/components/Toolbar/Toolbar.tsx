import { type ChangeEvent, useEffect, useRef, useState } from 'react'
import { useT } from '../../i18n'
import './Toolbar.css'

type Props = {
  sectionTags: string[]
  selectedTag: string | null
  onSelectTag: (tag: string | null) => void
  searchQuery: string
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void
  onClearSearch: () => void
  sortOrder: 'displayOrder' | 'alpha' | 'recent'
  setSortOrder: (v: 'displayOrder' | 'alpha' | 'recent') => void
  namespace: string // 'websites' or 'articles'
}

export const Toolbar = ({
  sectionTags,
  selectedTag,
  onSelectTag,
  searchQuery,
  onSearchChange,
  onClearSearch,
  sortOrder,
  setSortOrder,
  namespace,
}: Props) => {
  const t = useT()
  const [showSortMenu, setShowSortMenu] = useState(false)
  const actionsRef = useRef<HTMLDivElement | null>(null)

  const toggleSortMenu = () => setShowSortMenu((s) => !s)

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (actionsRef.current && !actionsRef.current.contains(target)) {
        setShowSortMenu(false)
      }
    }

    if (showSortMenu) {
      document.addEventListener('click', onDocClick)
      return () => document.removeEventListener('click', onDocClick)
    }

    return undefined
  }, [showSortMenu])

  return (
    <div className="toolbar">
      <div className="toolbar__search">
        <svg
          className="toolbar__search-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="m20 20-3.5-3.5M16 10.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <input
          className="toolbar__search-input"
          type="search"
          value={searchQuery}
          placeholder={t(`${namespace}.search_placeholder`)}
          aria-label={t(`${namespace}.search_placeholder`)}
          onChange={onSearchChange}
        />
        {searchQuery ? (
          <button
            type="button"
            className="toolbar__clear"
            onClick={onClearSearch}
            aria-label={t(`${namespace}.search_clear`)}
          >
            ×
          </button>
        ) : null}
      </div>

      <div className="toolbar__filters">
        {sectionTags.length > 0 ? (
          <div className="toolbar__tags" aria-label={t(`${namespace}.tags_filter`)}>
            <button
              type="button"
              className={`chip${selectedTag === null ? ' chip--active' : ''}`}
              onClick={() => onSelectTag(null)}
            >
              {t(`${namespace}.filters.all`)}
            </button>
            {sectionTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`chip${selectedTag === tag ? ' chip--active' : ''}`}
                onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="toolbar__actions" ref={actionsRef}>
        <div className="toolbar-sort-menu">
          <button
            type="button"
            aria-label={t(`${namespace}.sort_label`)}
            className="toolbar-sort-button"
            onClick={toggleSortMenu}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M3 6h18M6 12h12M10 18h4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{t(`${namespace}.sort_label`)}</span>
          </button>
          {showSortMenu ? (
            <div className="sort-menu" role="menu">
              <button
                type="button"
                className={`sort-menu__item${sortOrder === 'displayOrder' ? ' active' : ''}`}
                onClick={() => {
                  setSortOrder('displayOrder')
                  setShowSortMenu(false)
                }}
              >
                {t(`${namespace}.sort.displayOrder`)}
              </button>
              <button
                type="button"
                className={`sort-menu__item${sortOrder === 'alpha' ? ' active' : ''}`}
                onClick={() => {
                  setSortOrder('alpha')
                  setShowSortMenu(false)
                }}
              >
                {t(`${namespace}.sort.alpha`)}
              </button>
              <button
                type="button"
                className={`sort-menu__item${sortOrder === 'recent' ? ' active' : ''}`}
                onClick={() => {
                  setSortOrder('recent')
                  setShowSortMenu(false)
                }}
              >
                {t(`${namespace}.sort.recency`)}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default Toolbar
