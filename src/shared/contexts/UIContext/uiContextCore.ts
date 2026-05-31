import { createContext } from 'react'

export type ThemeMode = 'light' | 'dark'
export type LanguageCode = 'EN' | 'ZH'
export type ThemeColor = 'blue' | 'purple' | 'green' | 'orange' | 'red'

export interface UIContextValue {
  theme: ThemeMode
  setTheme: (mode: ThemeMode) => void
  toggleTheme: () => void
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  toggleLanguage: () => void
  themeColor: ThemeColor
  setThemeColor: (color: ThemeColor) => void
}

export const UIContext = createContext<UIContextValue | undefined>(undefined)
