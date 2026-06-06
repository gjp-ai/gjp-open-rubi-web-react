import { lazy } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from './layouts/PublicLayout'
import { NotFoundPage } from '../shared/components/NotFoundPage'

// Lazy-loaded page components for route-level code splitting
const WebsitesPage = lazy(() => import('../pages/cms/websites/WebsitesPage').then((m) => ({ default: m.WebsitesPage })))
const QuestionsPage = lazy(() => import('../pages/cms/questions/QuestionsPage').then((m) => ({ default: m.QuestionsPage })))
const ArticlesPage = lazy(() => import('../pages/cms/articles/ArticlesPage').then((m) => ({ default: m.ArticlesPage })))
const ArticleDetailPage = lazy(() =>
  import('../pages/cms/articles/ArticleDetailPage').then((m) => ({ default: m.ArticleDetailPage })),
)
const ImagesPage = lazy(() => import('../pages/cms/images/ImagesPage').then((m) => ({ default: m.ImagesPage })))
const AudiosPage = lazy(() => import('../pages/cms/audios/AudiosPage').then((m) => ({ default: m.AudiosPage })))
const VideosPage = lazy(() => import('../pages/cms/videos/VideosPage').then((m) => ({ default: m.VideosPage })))
const FilesPage = lazy(() => import('../pages/cms/files/FilesPage').then((m) => ({ default: m.FilesPage })))
const EduVocabulariesPage = lazy(() => import('../pages/edu/vocabularies/VocabulariesPage').then((m) => ({ default: m.EduVocabulariesPage })))
const EduPhrasesPage = lazy(() => import('../pages/edu/phrases/PhrasesPage').then((m) => ({ default: m.EduPhrasesPage })))
const EduSentencesPage = lazy(() => import('../pages/edu/sentences/SentencesPage').then((m) => ({ default: m.EduSentencesPage })))
const EduMultipleChoiceQuestionsPage = lazy(() => import('../pages/edu/multiple-choice-questions/MultipleChoiceQuestionsPage').then((m) => ({ default: m.EduMultipleChoiceQuestionsPage })))
const EduFillBlankQuestionsPage = lazy(() => import('../pages/edu/fill-blank-questions/FillBlankQuestionsPage').then((m) => ({ default: m.EduFillBlankQuestionsPage })))
const EduFreeTextQuestionsPage = lazy(() => import('../pages/edu/free-text-questions/FreeTextQuestionsPage').then((m) => ({ default: m.EduFreeTextQuestionsPage })))
const EduTrueFalseQuestionsPage = lazy(() => import('../pages/edu/true-false-questions/TrueFalseQuestionsPage').then((m) => ({ default: m.EduTrueFalseQuestionsPage })))
const EduQuestionImagesPage = lazy(() => import('../pages/edu/question-images/QuestionImagesPage').then((m) => ({ default: m.EduQuestionImagesPage })))

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
        { path: '/edu/vocabularies', element: <EduVocabulariesPage /> },
        { path: '/edu/phrases', element: <EduPhrasesPage /> },
        { path: '/edu/sentences', element: <EduSentencesPage /> },
        { path: '/edu/multiple-choice-questions', element: <EduMultipleChoiceQuestionsPage /> },
        { path: '/edu/fill-blank-questions', element: <EduFillBlankQuestionsPage /> },
        { path: '/edu/free-text-questions', element: <EduFreeTextQuestionsPage /> },
        { path: '/edu/true-false-questions', element: <EduTrueFalseQuestionsPage /> },
        { path: '/edu/question-images', element: <EduQuestionImagesPage /> },
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
