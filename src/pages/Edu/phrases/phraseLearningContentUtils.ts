import type { EduLearningItem } from '../../../shared/data/types'
import { splitTags } from '../eduUtils'

export type PhrasePronunciation = {
  label: string
  value: string
  audioUrl?: string | null
}

export const getPhrasePronunciations = (item: EduLearningItem): PhrasePronunciation[] => {
  const rows: PhrasePronunciation[] = []
  if (item.phoneticUs) rows.push({ label: 'US', value: item.phoneticUs, audioUrl: item.phoneticUsAudioUrl || item.phoneticAudioUrl })
  if (item.phoneticUk) rows.push({ label: 'UK', value: item.phoneticUk, audioUrl: item.phoneticUkAudioUrl })
  return rows.length || !item.phonetic ? rows : [{ label: 'IPA', value: item.phonetic, audioUrl: item.phoneticAudioUrl }]
}

export const hasPhraseMeta = (phrase: EduLearningItem) => splitTags(phrase.tags).length > 0 || phrase.term || phrase.week || phrase.difficultyLevel

export const hasText = (value?: string | number | null) => value !== undefined && value !== null && String(value).trim() !== ''

export const hasVisiblePhraseLearningContent = (phrase: EduLearningItem, hiddenFieldKeys: string[] = []) => {
  const pronunciations = getPhrasePronunciations(phrase)
  return (
    !hiddenFieldKeys.includes('title') ||
    (pronunciations.length > 0 && !hiddenFieldKeys.includes('subtitle')) ||
    (hasText(phrase.easyMeaning) && !hiddenFieldKeys.includes('easyMeaning')) ||
    (hasText(phrase.sentenceOne) && !hiddenFieldKeys.includes('sentenceOne')) ||
    (hasPhraseMeta(phrase) && !hiddenFieldKeys.includes('meta')) ||
    [
      { key: 'translation', value: phrase.translation },
      { key: 'meaningClue', value: phrase.meaningClue },
      { key: 'meaning', value: phrase.meaning },
      { key: 'sentenceTwo', value: phrase.sentenceTwo },
      { key: 'explanation', value: phrase.explanation },
      { key: 'additionalInfo', value: phrase.additionalInfo },
    ].some((field) => hasText(field.value) && !hiddenFieldKeys.includes(field.key))
  )
}
