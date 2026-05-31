import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { AppSettingsProvider } from '../shared/contexts/AppSettings'
import { UIProvider } from '../shared/contexts/UIContext'
import { ErrorBoundary } from '../shared/components/ErrorBoundary'
import { router } from './routes'

const LoadingFallback = () => (
  <div className="loading-spinner">
    <div className="loading-spinner__ring" />
  </div>
)

const App = () => (
  <ErrorBoundary>
    <UIProvider>
      <AppSettingsProvider>
        <Suspense fallback={<LoadingFallback />}>
          <RouterProvider router={router} />
        </Suspense>
      </AppSettingsProvider>
    </UIProvider>
  </ErrorBoundary>
)

export default App
