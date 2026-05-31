import { useMemo } from 'react'
import { useAppSettings } from '../contexts/AppSettings'
import { useT } from '../i18n'

export const Footer = () => {
  const { getValue } = useAppSettings()
  const t = useT()
  const company = getValue('app_company') ?? 'GJP Technology'
  const appName = getValue('app_name') ?? 'GJP Blog System'
  const appVersion = getValue('app_version') ?? '1.0.0'

  const currentYear = useMemo(() => new Date().getFullYear(), [])
  const copyLabel = t('footer.copy', {
    year: currentYear,
    company,
    appName,
    version: appVersion,
  })

  return (
    <footer className="site-footer">
      <p className="site-footer__text">{copyLabel}</p>
    </footer>
  )
}
