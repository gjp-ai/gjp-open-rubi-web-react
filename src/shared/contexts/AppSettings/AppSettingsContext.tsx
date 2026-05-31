import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AppSetting } from '../../data/types'
import type { LanguageCode } from '../UIContext'
import { useUIContext } from '../UIContext'
import { useT } from '../../i18n'
import { getAppSettings } from './appSettingsApi'
import { AppSettingsContext, type AppSettingsContextValue } from './appSettingsContextCore'
import { APP_SETTINGS_CACHE_KEY, APP_SETTINGS_FETCHED_FLAG } from './appSettingsStorageKeys'

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
  const { language } = useUIContext()
  const t = useT()
  const [settings, setSettings] = useState<AppSetting[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const writeSettingsCache = useCallback((nextSettings: AppSetting[]) => {
    try {
      localStorage.setItem(APP_SETTINGS_CACHE_KEY, JSON.stringify(nextSettings))
    } catch {
      // Ignore storage write errors.
    }

    try {
      sessionStorage.setItem(APP_SETTINGS_FETCHED_FLAG, '1')
    } catch {
      // Ignore storage write errors.
    }
  }, [])

  const fetchAndCacheSettings = useCallback(async () => {
    const response = await getAppSettings()
    setSettings(response.data)
    writeSettingsCache(response.data)
  }, [writeSettingsCache])

  const loadSettings = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      try {
        const cached = localStorage.getItem(APP_SETTINGS_CACHE_KEY)
        if (cached) {
          const parsed = JSON.parse(cached) as AppSetting[]
          setSettings(parsed)
        }
      } catch {
        // JSON parse error or localStorage access error: ignore and continue to fetch.
      }

      if (!sessionStorage.getItem(APP_SETTINGS_FETCHED_FLAG)) {
        await fetchAndCacheSettings()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t('failed_to_load')
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [fetchAndCacheSettings, t])

  useEffect(() => {
    void loadSettings()
  }, [loadSettings])

  const groupedSettings = useMemo(() => {
    const groups = new Map<string, Map<LanguageCode, string>>()

    settings.forEach((setting) => {
      if (!groups.has(setting.name)) {
        groups.set(setting.name, new Map())
      }

      groups.get(setting.name)?.set(setting.lang, setting.value)
    })

    return groups
  }, [settings])

  const getValue = useCallback(
    (name: string, lang: LanguageCode = language) => groupedSettings.get(name)?.get(lang),
    [groupedSettings, language],
  )

  const getValues = useCallback(
    (name: string) => {
      const map = groupedSettings.get(name)

      if (!map) {
        return {}
      }

      const result: Partial<Record<LanguageCode, string>> = {}
      map.forEach((value, langKey) => {
        result[langKey] = value
      })
      return result
    },
    [groupedSettings],
  )

  const getTags = useCallback(
    (name: string, lang: LanguageCode = language) => {
      const value = getValue(name, lang)

      if (!value) {
        return []
      }

      return value
        .replace(/[“”]/g, '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    },
    [getValue, language],
  )

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      await fetchAndCacheSettings()
    } catch (err) {
      const message = err instanceof Error ? err.message : t('failed_to_load')
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [fetchAndCacheSettings, t])

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      settings,
      loading,
      error,
      getValue,
      getValues,
      getTags,
      reload,
    }),
    [settings, loading, error, getValue, getValues, getTags, reload],
  )

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>
}
