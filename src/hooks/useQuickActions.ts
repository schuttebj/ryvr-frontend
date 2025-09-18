import { useState, useEffect } from 'react'

export const useQuickActions = () => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+K (or Cmd+K on Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        setIsOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const openQuickActions = () => setIsOpen(true)
  const closeQuickActions = () => setIsOpen(false)

  return {
    isOpen,
    openQuickActions,
    closeQuickActions,
  }
}

export default useQuickActions
