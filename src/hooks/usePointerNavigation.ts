import { useCallback, useRef } from 'react'
import { usePresentationActions } from '@/hooks/usePresentation'
import type { NavIntent } from '@/types'

/**
 * Anything that owns its own click. Advancing on top of these would fire the
 * poll, the sorter or a tool card *and* skip a beat.
 */
const INTERACTIVE_SELECTOR = [
  'button',
  'a',
  'input',
  'select',
  'textarea',
  '[role="button"]',
  '[contenteditable="true"]',
  '[data-no-advance]',
].join(', ')

/** Minimum horizontal travel before a touch counts as a swipe. */
const SWIPE_THRESHOLD_PX = 60

function isInteractive(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(INTERACTIVE_SELECTOR) !== null
}

export interface PointerNavigationOptions {
  enabled?: boolean
  onIntent?: (intent: NavIntent) => void
}

/**
 * Mouse and touch control, returned as props rather than rendered as an
 * overlay — an overlay would swallow clicks meant for the interactions.
 */
export function usePointerNavigation(options: PointerNavigationOptions = {}) {
  const { enabled = true, onIntent } = options
  const actions = usePresentationActions()
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!enabled || isInteractive(event.target)) return
      onIntent?.('next')
      actions.next()
    },
    [enabled, onIntent, actions],
  )

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0]
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null
  }, [])

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      const start = touchStart.current
      touchStart.current = null
      if (!enabled || !start || isInteractive(event.target)) return

      const touch = event.changedTouches[0]
      if (!touch) return

      const dx = touch.clientX - start.x
      const dy = touch.clientY - start.y

      // Ignore vertical drags so scrolling is never hijacked.
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) <= Math.abs(dy)) {
        return
      }

      // RTL: swiping leftward follows the reading direction, so it advances.
      const intent: NavIntent = dx < 0 ? 'next' : 'prev'
      onIntent?.(intent)
      if (intent === 'next') actions.next()
      else actions.prev()
    },
    [enabled, onIntent, actions],
  )

  return {
    onClick: handleClick,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  }
}
