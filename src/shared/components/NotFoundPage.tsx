import { Link } from 'react-router-dom'
import { useT } from '../i18n'

export const NotFoundPage = () => {
  const t = useT()

  return (
    <main className="page page--centered">
      <div className="card card--elevated not-found-card">
        <h1 className="page__title">{t('notfound.title')}</h1>
        <p className="page__subtitle">{t('notfound.subtitle')}</p>
        <Link className="button" to="/websites">
          {t('notfound.back')}
        </Link>
      </div>
    </main>
  )
}
