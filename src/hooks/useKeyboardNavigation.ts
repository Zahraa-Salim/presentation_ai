import { useEffect, useRef } from 'react'
import { usePresentationActions } from '@/hooks/usePresentation'
import { resolveKeyIntent } from '@/lib/keymap'
import type { NavIntent, PresentationActions } from '@/types'

export interface KeyboardNavigationOptions {
  /** Set false to suspend input — used by transitions and presenter mode. */
  enabled?: boolean
  onFullscreen?: () => void
  onEscape?: () => void
  onPresenter?: () => void
  /** Fires for every resolved intent. Used by the dev harness readout. */
  onIntent?: (intent: NavIntent) => void
}

/**
 * Presenter keyboard control.
 *
 * The listener sits on `window`, not on a focused element: the presenter must
 * be able to drive the deck without clicking the page first.
 *
 * It is attached once and reads the latest actions and options through a ref,
 * so advancing a beat does not detach and reattach the listener.
 */
export function useKeyboardNavigation(
  options: KeyboardNavigationOptions = {},
): void {
  const actions = usePresentationActions()

  const latest = useRef<{
    actions: PresentationActions
    options: KeyboardNavigationOptions
  }>({ actions, options })

  useEffect(() => {
    latest.current = { actions, options }
  })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { actions: current, options: opts } = latest.current
      if (opts.enabled === false) return

      const intent = resolveKeyIntent(event)
      if (!intent) return

      // Escape is left alone: browsers own it for exiting fullscreen.
      if (intent !== 'escape') event.preventDefault()

      opts.onIntent?.(intent)

      switch (intent) {
        case 'next':
          current.next()
          break
        case 'prev':
          current.prev()
          break
        case 'nextScene':
          current.nextScene()
          break
        case 'prevScene':
          current.prevScene()
          break
        case 'first':
          current.first()
          break
        case 'last':
          current.last()
          break
        case 'fullscreen':
          opts.onFullscreen?.()
          break
        case 'escape':
          opts.onEscape?.()
          break
        case 'presenter':
          opts.onPresenter?.()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
