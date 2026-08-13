import type { WorldId } from '@/types'

/**
 * The accent colour tokens live in globals.css. Three.js needs real colour
 * values, not CSS variables, so they are read back from the stylesheet at
 * runtime rather than duplicated here — otherwise the 3D worlds and the DOM
 * would drift apart the first time a colour is tuned.
 */
const ACCENT_VAR: Record<WorldId, string> = {
  'ai-world': '--color-aiworld',
  'ai-lab': '--color-ailab',
  'study-lab': '--color-studylab',
  privacy: '--color-privacy',
  future: '--color-future',
}

/** Used only if the stylesheet has not applied yet. */
const FALLBACK: Record<WorldId, string> = {
  'ai-world': '#4f9dff',
  'ai-lab': '#a855f7',
  'study-lab': '#2dd4a7',
  privacy: '#f59e0b',
  future: '#ff9d4f',
}

export function getWorldAccent(world: WorldId): string {
  if (typeof window === 'undefined') return FALLBACK[world]

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(ACCENT_VAR[world])
    .trim()

  return value || FALLBACK[world]
}
