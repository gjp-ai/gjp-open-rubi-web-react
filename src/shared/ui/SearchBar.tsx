import type { ChangeEvent } from 'react'
import { useT } from '../i18n'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const t = useT()
  const placeholder = t('search.placeholder')

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <input
      className="search-input"
      type="search"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      aria-label={placeholder}
    />
  )
}
