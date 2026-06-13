import type { EduPlayOrder, EduPlayPronunciation } from './EduPlayBar'

export interface EduPlaySettings {
  interval: number
  order: EduPlayOrder
  pronunciation: EduPlayPronunciation
}

const DEFAULT_PLAY_SETTINGS: EduPlaySettings = {
  interval: 5000,
  order: 'sequence',
  pronunciation: 'us',
}

const settingsKey = (kind: string) => `gjp.edu.${kind}.playSettings`

export const readEduPlaySettings = (kind: string): EduPlaySettings => {
  if (typeof window === 'undefined') return DEFAULT_PLAY_SETTINGS

  try {
    const stored = window.localStorage.getItem(settingsKey(kind))
    if (!stored) return DEFAULT_PLAY_SETTINGS
    const parsed = JSON.parse(stored) as Partial<EduPlaySettings>
    return {
      interval: typeof parsed.interval === 'number' && parsed.interval > 0 ? parsed.interval : DEFAULT_PLAY_SETTINGS.interval,
      order: parsed.order === 'random' ? 'random' : DEFAULT_PLAY_SETTINGS.order,
      pronunciation: parsed.pronunciation === 'uk' ? 'uk' : DEFAULT_PLAY_SETTINGS.pronunciation,
    }
  } catch {
    return DEFAULT_PLAY_SETTINGS
  }
}

export const saveEduPlaySettings = (kind: string, settings: EduPlaySettings) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(settingsKey(kind), JSON.stringify(settings))
  } catch {
    // Ignore storage write errors.
  }
}

