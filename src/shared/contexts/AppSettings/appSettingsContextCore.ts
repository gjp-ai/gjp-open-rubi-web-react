import { createContext } from 'react'
import type { AppSetting } from '../../data/types'
import type { LanguageCode } from '../UIContext'

export interface AppSettingsContextValue {
  settings: AppSetting[]
  loading: boolean
  error: string | null
  getValue: (name: string, lang?: LanguageCode) => string | undefined
  getValues: (name: string) => Partial<Record<LanguageCode, string>>
  getTags: (name: string, lang?: LanguageCode) => string[]
  reload: () => Promise<void>
}

export const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(undefined)
