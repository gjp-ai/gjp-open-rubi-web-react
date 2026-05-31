import { useUIContext } from '../contexts/UIContext'
import { useT } from '../i18n'

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useUIContext()
  const t = useT()
  const isDark = theme === 'dark'
  const label = isDark ? t('toggle.theme.light') : t('toggle.theme.dark')

  return (
    <button className="icon-toggle-button" type="button" onClick={toggleTheme} aria-label={label} title={label}>
      <div className="icon-toggle-button__wrapper">
        {isDark ? (
          // Sun icon for light mode (when currently dark)
          <svg
            className="icon-toggle-button__icon icon-toggle-button__icon--sun"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        ) : (
          // Moon icon for dark mode (when currently light)
          <svg
            className="icon-toggle-button__icon icon-toggle-button__icon--moon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        )}
      </div>
    </button>
  )
}
