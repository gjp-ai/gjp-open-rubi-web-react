import curriculumOptions from './curriculum-options.json'

type CurriculumOptions = Record<string, Record<string, string[]>>

const options = curriculumOptions as CurriculumOptions

export const gradeOptions = Object.keys(options)

export const getSubjectOptions = (grade?: string) => {
  if (grade && options[grade]) return Object.keys(options[grade])
  return Array.from(new Set(Object.values(options).flatMap((subjects) => Object.keys(subjects)))).sort()
}

export const getTopicOptions = (grade?: string, subject?: string) => {
  if (grade && subject) return options[grade]?.[subject] ?? []
  if (grade) return Array.from(new Set(Object.values(options[grade] ?? {}).flat())).sort()
  if (subject) return Array.from(new Set(Object.values(options).flatMap((subjects) => subjects[subject] ?? []))).sort()
  return Array.from(new Set(Object.values(options).flatMap((subjects) => Object.values(subjects).flat()))).sort()
}
