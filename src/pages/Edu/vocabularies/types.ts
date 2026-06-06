import type { EduLearningItem } from '../../../shared/data/types'

export type PronunciationVariant = 'us' | 'uk'

export interface VocabularyItem extends EduLearningItem {
  imageUrl?: string | null
  definition?: string | null
  example?: string | null
  nounPluralForm?: string | null
  verbSimplePastTense?: string | null
  verbPastPerfectTense?: string | null
  verbPresentParticiple?: string | null
  adjectiveComparativeForm?: string | null
  adjectiveSuperlativeForm?: string | null
  nounForm?: string | null
  nounMeaning?: string | null
  nounExample?: string | null
  verbForm?: string | null
  verbMeaning?: string | null
  verbExample?: string | null
  adjectiveForm?: string | null
  adjectiveMeaning?: string | null
  adjectiveExample?: string | null
  adverbForm?: string | null
  adverbMeaning?: string | null
  adverbExample?: string | null
}
