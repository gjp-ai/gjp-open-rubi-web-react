import { useCallback } from 'react'
import { useUIContext } from './contexts/UIContext'
import websitesTranslations from '../pages/Websites/i18n'
import questionsTranslations from '../pages/Questions/i18n'
import articlesTranslations from '../pages/Articles/i18n'
import imagesTranslations from '../pages/Images/i18n'
import audiosTranslations from '../pages/Audios/i18n'
import videosTranslations from '../pages/Videos/i18n'
import filesTranslations from '../pages/Files/i18n'

type Lang = 'EN' | 'ZH'

type Translations = {
  [key: string]: {
    EN: string
    ZH: string
  }
}

const baseTranslations: Translations = {
  loading: { EN: 'Loading...', ZH: '正在加载...' },
  failed_to_load: { EN: 'Failed to load data', ZH: '加载失败' },

  // Search
  'search.placeholder': { EN: 'Search sites or tags', ZH: '搜索站点或标签' },

  // Navigation
  'nav.websites': { EN: 'Websites', ZH: '网站' },
  'nav.questions': { EN: 'Q&A', ZH: '问答' },
  'nav.articles': { EN: 'Articles', ZH: '文章' },
  'nav.images': { EN: 'Images', ZH: '图片' },
  'nav.audios': { EN: 'Audios', ZH: '音频' },
  'nav.videos': { EN: 'Videos', ZH: '视频' },
  'nav.files': { EN: 'Files', ZH: '文件' },

  // Toggles
  'toggle.theme.light': { EN: 'Switch to light', ZH: '切换到日间' },
  'toggle.theme.dark': { EN: 'Switch to dark', ZH: '切换到夜间' },
  'toggle.language.toChinese': { EN: 'Switch to Chinese', ZH: '切换为英文' },

  // Not found
  'notfound.title': { EN: 'Page Not Found', ZH: '页面未找到' },
  'notfound.subtitle': { EN: 'Sorry, the page you requested does not exist.', ZH: '抱歉，该页面不存在。' },
  'notfound.back': { EN: 'Back to home', ZH: '返回首页' },

  // Footer
  'footer.copy': {
    EN: '© {year} {company} · {appName} · v{version}',
    ZH: '© {year} {company} · {appName} · 版本 {version}',
  },

  // Common card actions
  'website.visit': { EN: 'Visit', ZH: '访问' },
  'common.source': { EN: 'Source', ZH: '来源' },
  'common.close': { EN: 'Close', ZH: '关闭' },
  // Pagination
  'pagination.ariaLabel': { EN: 'Pagination', ZH: '分页' },
  'pagination.prev': { EN: 'Prev', ZH: '上一页' },
  'pagination.next': { EN: 'Next', ZH: '下一页' },
  'pagination.perPage': { EN: 'Per page', ZH: '每页' },
  'pagination.of': { EN: 'of', ZH: '共' },
}

// Merge page-specific translations so pages can own their keys.
const translations: Translations = {
  ...baseTranslations,
  ...websitesTranslations,
  ...questionsTranslations,
  ...articlesTranslations,
  ...imagesTranslations,
  ...audiosTranslations,
  ...videosTranslations,
  ...filesTranslations,
}

export const useT = () => {
  const { language } = useUIContext()

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const entry = translations[key]
      const lang: Lang = language
      let text = entry ? (entry[lang] ?? entry.EN) : key

      if (vars) {
        for (const k of Object.keys(vars)) {
          const v = String(vars[k])
          if (text.replaceAll) {
            text = text.replaceAll(`{${k}}`, v)
          } else {
            text = text.split(`{${k}}`).join(v)
          }
        }
      }

      return text
    },
    [language],
  )

  return t
}

export default translations
