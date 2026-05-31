import { useUIContext } from '../contexts/UIContext'
import { useT } from '../i18n'

export const LanguageToggle = () => {
  const { language, toggleLanguage } = useUIContext()
  const t = useT()

  const label = t('toggle.language.toChinese')

  return (
    <button
      className="icon-toggle-button icon-toggle-button--language"
      type="button"
      onClick={toggleLanguage}
      aria-label={label}
      title={label}
    >
      <div className="icon-toggle-button__wrapper">
        <svg
          className="icon-toggle-button__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15 15 0 010 20" />
        </svg>
        <span className="icon-toggle-button__badge" aria-hidden>
          {language === 'ZH' ? '中' : 'EN'}
        </span>
      </div>
    </button>
  )
}
