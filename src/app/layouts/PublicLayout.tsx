import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from '../../shared/components/Footer'
import { SiteHeader } from '../../shared/components/SiteHeader'

export const PublicLayout = () => {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return (
    <div className="layout">
      <SiteHeader />
      <main className="layout__content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
