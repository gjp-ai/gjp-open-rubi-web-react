import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAppSettings } from '../../contexts/AppSettings'
import { useT } from '../../i18n'
import { LanguageToggle } from '../../ui/LanguageToggle'
import { ThemeColorPicker } from '../../ui/ThemeColorPicker'
import { ThemeToggle } from '../../ui/ThemeToggle'
import { MenuIcon } from './MenuIcon'
import { SectionIcon } from './sectionIcons'
import { siteHeaderLinks } from './siteHeaderLinks'

export const SiteHeader = () => {
  const location = useLocation()
  const { getTags } = useAppSettings()
  const t = useT()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  return (
    <>
      <header className="site-header">
        <button
          type="button"
          className="site-header__menu-toggle"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <MenuIcon open={mobileMenuOpen} />
        </button>

        <NavLink to="/websites" className="site-logo">
          <img src={`${import.meta.env.BASE_URL}favicon.ico`} alt="Site logo" className="site-logo__img" />
          <span className="site-logo__wordmark">
            <span className="site-logo__ai">Rubi</span>
          </span>
        </NavLink>

        <nav className="site-header__sections" aria-label="Main navigation">
          {siteHeaderLinks.map((link) => {
            const tags = getTags(link.tagsKey)
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `section-link${isActive ? ' section-link--active' : ''}`}
                title={tags.length > 0 ? tags.join(', ') : undefined}
              >
                <span className="section-link__icon" aria-hidden>
                  <SectionIcon tagsKey={link.tagsKey} />
                </span>
                <span className="section-link__label">{t(link.labelKey)}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="site-header__actions">
          <ThemeToggle />
          <ThemeColorPicker />
          <LanguageToggle />
        </div>
      </header>

      {mobileMenuOpen ? (
        <>
          <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
          <nav className="mobile-menu" aria-label="Mobile navigation">
            <div className="mobile-menu__content">
              {siteHeaderLinks.map((link) => {
                const tags = getTags(link.tagsKey)
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) => `mobile-menu__link${isActive ? ' mobile-menu__link--active' : ''}`}
                    title={tags.length > 0 ? tags.join(', ') : undefined}
                  >
                    <span className="mobile-menu__icon" aria-hidden>
                      <SectionIcon tagsKey={link.tagsKey} />
                    </span>
                    <span className="mobile-menu__label">{t(link.labelKey)}</span>
                  </NavLink>
                )
              })}
            </div>
          </nav>
        </>
      ) : null}
    </>
  )
}
