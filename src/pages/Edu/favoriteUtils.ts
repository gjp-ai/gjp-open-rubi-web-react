import type { EduLearningItem, EduQuestion } from '../../shared/data/types'
import { splitTags } from './eduUtils'

type FavoriteItem = Pick<EduLearningItem | EduQuestion, 'lang' | 'tags'>

export const getFavoriteTag = (lang: FavoriteItem['lang']) => (lang === 'ZH' ? '收藏' : 'Favourite')

const getFavoriteTagAliases = (lang: FavoriteItem['lang']) => (lang === 'ZH' ? ['收藏'] : ['Favourite', 'Favorite'])

export const hasFavoriteTag = (item: FavoriteItem) =>
  splitTags(item.tags).some((tag) =>
    getFavoriteTagAliases(item.lang).some((favoriteTag) => tag.toLowerCase() === favoriteTag.toLowerCase()),
  )
