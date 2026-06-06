import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAppSettings } from '../../contexts/AppSettings'
import { useT } from '../../i18n'
import { LanguageToggle } from '../../ui/LanguageToggle'
import { ThemeColorPicker } from '../../ui/ThemeColorPicker'
import { ThemeToggle } from '../../ui/ThemeToggle'
import { MenuIcon } from './MenuIcon'
import { SectionIcon } from './sectionIcons'
import { siteHeaderGroups, siteHeaderLinks, type SiteHeaderLink } from './siteHeaderLinks'

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

  const renderDesktopLink = (link: SiteHeaderLink) => {
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
  }

  const renderMobileLink = (link: SiteHeaderLink) => {
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
  }

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
          {siteHeaderLinks.map(renderDesktopLink)}
          {siteHeaderGroups.map((group) => {
            const isActive = group.links.some((link) => location.pathname.startsWith(link.path))
            return (
              <div key={group.labelKey} className="section-group">
                <button type="button" className={`section-link section-group__button${isActive ? ' section-link--active' : ''}`}>
                  <span className="section-link__icon" aria-hidden>
                    <SectionIcon tagsKey={group.tagsKey} />
                  </span>
                  <span className="section-link__label">{t(group.labelKey)}</span>
                  <span className="section-group__chevron" aria-hidden>⌄</span>
                </button>
                <div className="section-group__menu">
                  {group.links.map(renderDesktopLink)}
                </div>
              </div>
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
              {siteHeaderGroups.map((group) => (
                <div key={group.labelKey} className="mobile-menu__group">
                  <div className="mobile-menu__group-title">
                    <span className="mobile-menu__icon" aria-hidden>
                      <SectionIcon tagsKey={group.tagsKey} />
                    </span>
                    {t(group.labelKey)}
                  </div>
                  {group.links.map(renderMobileLink)}
                </div>
              ))}
              <div className="mobile-menu__group">
                <div className="mobile-menu__group-title">{t('nav.content')}</div>
                {siteHeaderLinks.map(renderMobileLink)}
              </div>
            </div>
          </nav>
        </>
      ) : null}
    </>
  )
}
