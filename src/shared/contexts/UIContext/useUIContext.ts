import { useContext } from 'react'
import { UIContext } from './uiContextCore'

export const useUIContext = () => {
  const context = useContext(UIContext)

  if (!context) {
    throw new Error('useUIContext must be used within a UIProvider')
  }

  return context
}
