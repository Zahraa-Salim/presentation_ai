import { useEffect, useRef, useState } from 'react'

const DEFAULT_IDLE_MS = 3000

/**
 * Keeps the presentation chrome out of the way.
 *
 * Visible on any presenter input, then fades after a few idle seconds so the
 * statement moments and the finale get a clean screen. `trigger` is any value
 * that should re-show the chrome when it changes — pass the scene or beat.
 */
export function useAutoHideChrome(
  trigger: unknown,
  idleMs: number = DEFAULT_IDLE_MS,
): boolean {
  const [visible, setVisible] = useState(true)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const show = () => {
      setVisible(true)
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setVisible(false), idleMs)
    }

    show()

    window.addEventListener('mousemove', show)
    window.addEventListener('keydown', show)
    window.addEventListener('touchstart', show)

    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
      window.removeEventListener('mousemove', show)
      window.removeEventListener('keydown', show)
      window.removeEventListener('touchstart', show)
    }
  }, [trigger, idleMs])

  return visible
}
