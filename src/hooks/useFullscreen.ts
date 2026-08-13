import { useCallback, useEffect, useState } from 'react'

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void
}

interface FullscreenDocument extends Document {
  webkitExitFullscreen?: () => Promise<void> | void
  webkitFullscreenElement?: Element | null
}

function currentFullscreenElement(): Element | null {
  const doc = document as FullscreenDocument
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null
}

export interface FullscreenApi {
  isFullscreen: boolean
  isSupported: boolean
  enter: () => void
  exit: () => void
  toggle: () => void
}

/**
 * Fullscreen for the presentation.
 *
 * The state is driven by the browser's `fullscreenchange` event rather than by
 * our own calls, because Escape exits fullscreen without going through this
 * code — without the listener the button icon would lie about the real state.
 */
export function useFullscreen(): FullscreenApi {
  const [isFullscreen, setIsFullscreen] = useState(
    () => currentFullscreenElement() !== null,
  )

  const isSupported =
    typeof document !== 'undefined' &&
    (document.fullscreenEnabled ||
      typeof (document.documentElement as FullscreenElement)
        .webkitRequestFullscreen === 'function')

  useEffect(() => {
    const sync = () => setIsFullscreen(currentFullscreenElement() !== null)

    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('webkitfullscreenchange', sync)
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('webkitfullscreenchange', sync)
    }
  }, [])

  const enter = useCallback(() => {
    const element = document.documentElement as FullscreenElement
    // Rejects when not triggered by a user gesture; that is not an error worth
    // surfacing mid-presentation, so it is swallowed.
    void Promise.resolve(
      element.requestFullscreen?.() ?? element.webkitRequestFullscreen?.(),
    ).catch(() => undefined)
  }, [])

  const exit = useCallback(() => {
    if (currentFullscreenElement() === null) return
    const doc = document as FullscreenDocument
    void Promise.resolve(
      doc.exitFullscreen?.() ?? doc.webkitExitFullscreen?.(),
    ).catch(() => undefined)
  }, [])

  const toggle = useCallback(() => {
    if (currentFullscreenElement() === null) enter()
    else exit()
  }, [enter, exit])

  return { isFullscreen, isSupported, enter, exit, toggle }
}
