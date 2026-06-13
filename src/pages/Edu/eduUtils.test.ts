/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { hasSelectedTags, splitTags } from './eduUtils'

describe('splitTags', () => {
  it('splits comma-separated tag values and trims empty entries', () => {
    expect(splitTags('P4, English, School,')).toEqual(['P4', 'English', 'School'])
  })
})

describe('hasSelectedTags', () => {
  it('matches when all selected tags are present in a comma-separated tag value', () => {
    expect(hasSelectedTags('P4,English,School', ['P4', 'School'])).toBe(true)
  })

  it('normalizes tag case and whitespace', () => {
    expect(hasSelectedTags(' P4, English, School ', ['p4', ' school '])).toBe(true)
  })

  it('rejects items missing any selected tag', () => {
    expect(hasSelectedTags('P4,English', ['P4', 'School'])).toBe(false)
  })
})
