import { lazy } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from './layouts/PublicLayout'
import { NotFoundPage } from '../shared/components/NotFoundPage'

// Lazy-loaded page components for route-level code splitting
const WebsitesPage = lazy(() => import('../pages/Websites/WebsitesPage').then((m) => ({ default: m.WebsitesPage })))
const QuestionsPage = lazy(() => import('../pages/Questions/QuestionsPage').then((m) => ({ default: m.QuestionsPage })))
const ArticlesPage = lazy(() => import('../pages/Articles/ArticlesPage').then((m) => ({ default: m.ArticlesPage })))
const ArticleDetailPage = lazy(() =>
  import('../pages/Articles/ArticleDetailPage').then((m) => ({ default: m.ArticleDetailPage })),
)
const ImagesPage = lazy(() => import('../pages/Images/ImagesPage').then((m) => ({ default: m.ImagesPage })))
const AudiosPage = lazy(() => import('../pages/Audios/AudiosPage').then((m) => ({ default: m.AudiosPage })))
const VideosPage = lazy(() => import('../pages/Videos/VideosPage').then((m) => ({ default: m.VideosPage })))
const FilesPage = lazy(() => import('../pages/Files/FilesPage').then((m) => ({ default: m.FilesPage })))

export const router = createBrowserRouter(
  [
    {
      path: '',
      element: <PublicLayout />,
      children: [
        {
          index: true,
          element: <Navigate to="/websites" replace />,
        },
        {
          path: '/websites',
          element: <WebsitesPage />,
        },
        {
          path: '/questions',
          element: <QuestionsPage />,
        },
        {
          path: '/articles',
          element: <ArticlesPage />,
        },
        {
          path: '/articles/:id',
          element: <ArticleDetailPage />,
        },
        {
          path: '/images',
          element: <ImagesPage />,
        },
        {
          path: '/audios',
          element: <AudiosPage />,
        },
        {
          path: '/videos',
          element: <VideosPage />,
        },
        {
          path: '/files',
          element: <FilesPage />,
        },
      ],
    },
    {
      path: '*',
      element: <NotFoundPage />,
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
)
