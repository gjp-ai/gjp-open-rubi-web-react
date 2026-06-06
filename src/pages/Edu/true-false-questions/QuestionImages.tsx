import { useEffect, useState } from 'react'
import type { EduQuestionImage } from '../../../shared/data/types'
import { getEduQuestionImages } from '../eduApi'

export const QuestionImages = ({
  questionId,
  referenceKey,
  lang,
}: {
  questionId: string
  referenceKey: 'multipleChoiceQuestionId' | 'freeTextQuestionId' | 'trueFalseQuestionId' | 'fillBlankQuestionId'
  lang: string
}) => {
  const [images, setImages] = useState<EduQuestionImage[]>([])

  useEffect(() => {
    const controller = new AbortController()
    getEduQuestionImages(referenceKey, questionId, lang, controller.signal)
      .then((response) => setImages(response.data ?? []))
      .catch((error) => {
        if (!controller.signal.aborted) console.error('Failed to load question images:', error)
      })
    return () => controller.abort()
  }, [questionId, referenceKey, lang])

  if (images.length === 0) return null

  return (
    <div className="edu-question-images">
      {images.slice(0, 2).map((image) => (
        <img key={image.id} src={image.fileUrl || image.originalUrl || ''} alt={image.filename} loading="lazy" />
      ))}
    </div>
  )
}
