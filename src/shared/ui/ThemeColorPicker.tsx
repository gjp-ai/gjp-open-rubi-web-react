import { useState, useRef, useEffect } from 'react'
import { useUIContext } from '../contexts/UIContext'
import type { ThemeColor } from '../contexts/UIContext'

const colorOptions: { value: ThemeColor; label: string; hex: string }[] = [
  { value: 'blue', label: 'Blue', hex: '#3b82f6' },
  { value: 'purple', label: 'Purple', hex: '#a855f7' },
  { value: 'green', label: 'Green', hex: '#10b981' },
  { value: 'orange', label: 'Orange', hex: '#f97316' },
  { value: 'red', label: 'Red', hex: '#ef4444' },
]

export const ThemeColorPicker = () => {
  const { themeColor, setThemeColor } = useUIContext()
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement | null>(null)

  const togglePicker = () => {
    setShowPicker((prev) => !prev)
  }

  const handleColorSelect = (color: ThemeColor) => {
    setThemeColor(color)
    setShowPicker(false)
  }

  // Close picker when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (pickerRef.current && !pickerRef.current.contains(target)) {
        setShowPicker(false)
      }
    }

    if (showPicker) {
      document.addEventListener('click', onDocClick)
      return () => document.removeEventListener('click', onDocClick)
    }
    return undefined
  }, [showPicker])

  const currentColor = colorOptions.find((c) => c.value === themeColor) ?? colorOptions[0]

  return (
    <div className="theme-color-picker" ref={pickerRef}>
      <button
        type="button"
        className="icon-toggle-button theme-color-picker__button"
        onClick={togglePicker}
        aria-label={`Theme color: ${currentColor.label}`}
        aria-expanded={showPicker}
      >
        <div className="theme-color-picker__icon-wrapper">
          <svg
            className="theme-color-picker__icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10c.395 0 .78-.034 1.152-.098a1 1 0 00.597-1.603l-.845-.845a2 2 0 01-.586-1.414v-1.04a2 2 0 012-2h1.04a2 2 0 011.414.586l.845.845a1 1 0 001.603-.597C21.966 15.78 22 15.395 22 15c0-5.523-4.477-10-10-10z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="7.5" cy="10.5" r="1.5" fill="currentColor" />
            <circle cx="12" cy="7.5" r="1.5" fill="currentColor" />
            <circle cx="16.5" cy="10.5" r="1.5" fill="currentColor" />
          </svg>
          <span className="theme-color-picker__badge" style={{ backgroundColor: currentColor.hex }} />
        </div>
      </button>

      {showPicker && (
        <div className="theme-color-picker__dropdown" role="menu">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              type="button"
              className={`theme-color-picker__option${themeColor === color.value ? ' theme-color-picker__option--active' : ''}`}
              onClick={() => handleColorSelect(color.value)}
              role="menuitem"
              aria-label={color.label}
            >
              <span className="theme-color-picker__swatch" style={{ backgroundColor: color.hex }} />
              <span className="theme-color-picker__label">{color.label}</span>
              {themeColor === color.value && (
                <svg
                  className="theme-color-picker__check"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
