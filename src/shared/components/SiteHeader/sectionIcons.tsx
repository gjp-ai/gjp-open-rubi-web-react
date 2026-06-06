export const SectionIcon = ({ tagsKey }: { tagsKey: string }) => {
  switch (tagsKey) {
    case 'edu_english_group':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 19.5V5a2 2 0 012-2h7a3 3 0 013 3v14a3 3 0 00-3-3H6a2 2 0 00-2 2.5z" />
          <path d="M16 6h4v13.5a2 2 0 00-2-2.5h-2" />
        </svg>
      )
    case 'edu_questions_group':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 014.8 1.1c0 1.7-2.3 2.3-2.3 3.9" /><path d="M12 17h.01" />
        </svg>
      )
    case 'media_group':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M8 9h3v3H8z" />
          <path d="M14 9h2.5M14 13h2.5M8 16h8.5" />
        </svg>
      )
    case 'vocabulary_tags':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 19.5V5a2 2 0 012-2h7a3 3 0 013 3v14a3 3 0 00-3-3H6a2 2 0 00-2 2.5z" />
          <path d="M16 6h4v13.5a2 2 0 00-2-2.5h-2" />
        </svg>
      )
    case 'phrase_tags':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 7h10M4 12h16M4 17h9" />
          <path d="M17 7h3" />
        </svg>
      )
    case 'sentence_tags':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 6h16M4 11h16M4 16h10" />
          <path d="M18 16h2" />
        </svg>
      )
    case 'edu_mcq_tags':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="7" cy="7" r="2" /><path d="M11 7h9" /><circle cx="7" cy="17" r="2" /><path d="M11 17h9" />
        </svg>
      )
    case 'edu_fill_blank_tags':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 7h6M14 7h6M4 17h4M12 17h8" /><path d="M9 17h2M11 7h2" />
        </svg>
      )
    case 'edu_free_text_tags':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      )
    case 'edu_true_false_tags':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 13l4 4L19 7" /><path d="M6 6l12 12" />
        </svg>
      )
    case 'edu_question_image_tags':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 14l3-3 3 3 2-2 4 4" /><circle cx="9" cy="9" r="1" />
        </svg>
      )
    case 'website_tags':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15 15 0 010 20" />
        </svg>
      )
    case 'question_tags':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      )
    case 'article_tags':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 15V6a2 2 0 00-2-2H7L3 6v9a2 2 0 002 2h14a2 2 0 002-2z" />
          <path d="M7 7h8M7 11h8" />
        </svg>
      )
    case 'image_tags':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      )
    case 'audio_tags':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 9v6a3 3 0 006 0V9" />
        </svg>
      )
    case 'video_tags':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="2" y="5" width="15" height="14" rx="2" />
          <path d="M23 7l-6 5 6 5V7z" />
        </svg>
      )
    case 'file_tags':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      )
    default:
      return null
  }
}
