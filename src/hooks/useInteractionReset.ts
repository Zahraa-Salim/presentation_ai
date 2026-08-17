import { useEffect, useRef } from 'react'

/**
 * Escape clears an interaction so it can be re-run with another class.
 *
 * Kept out of the shared key map on purpose: `escape` is already a NavIntent
 * with its own job, and every interaction needs to reset *its own* local state,
 * which a global intent cannot reach. Extracted as a hook so the five
 * interactions that need it share one listener instead of five copies.
 *
 * The reset callback is read through a ref, so the listener is attached once.
 */
export function useInteractionReset(onReset: () => void): void {
  const latest = useRef(onReset)
  useEffect(() => {
    latest.current = onReset
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') latest.current()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
