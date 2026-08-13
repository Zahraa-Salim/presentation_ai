import { useEffect, useRef } from 'react'
import { resolveChoiceKey } from '@/lib/keymap'

/**
 * Number-key selection for interactions.
 *
 * Lets the presenter drive a poll or the Tool Explorer from the keyboard
 * instead of aiming a mouse at the projector. Only mounted on scenes that have
 * an interaction, and `enabled` gates it further.
 *
 * `onChoose` receives a 0-based index, matching the options array.
 */
export function useChoiceKeys(
  onChoose: (index: number) => void,
  options: { enabled?: boolean; count?: number } = {},
): void {
  const { enabled = true, count } = options

  const latest = useRef({ onChoose, enabled, count })
  useEffect(() => {
    latest.current = { onChoose, enabled, count }
  })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const current = latest.current
      if (!current.enabled) return

      const choice = resolveChoiceKey(event)
      if (choice === null) return
      if (current.count !== undefined && choice > current.count) return

      event.preventDefault()
      current.onChoose(choice - 1)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
