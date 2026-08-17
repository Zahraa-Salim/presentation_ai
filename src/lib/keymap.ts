import type { KeyBinding, NavIntent } from '@/types'

/**
 * The presenter key map, defined once as data so presenter mode and a help
 * overlay can render it rather than keeping a second copy in sync.
 *
 * Physical keys are direction-neutral: ArrowRight advances even though the
 * deck reads right-to-left. Presentation clickers send Right / PageDown for
 * "next" regardless of language, so flipping the arrows would make a clicker
 * run the presentation backwards. On-screen arrow glyphs are still mirrored
 * for RTL — that mirroring is visual only.
 */
export const KEY_BINDINGS: readonly KeyBinding[] = [
  {
    keys: ['ArrowRight', ' ', 'Spacebar', 'PageDown'],
    intent: 'next',
    labelAr: 'التالي',
  },
  { keys: ['ArrowLeft', 'PageUp'], intent: 'prev', labelAr: 'السابق' },
  { keys: ['ArrowDown'], intent: 'nextScene', labelAr: 'المشهد التالي' },
  { keys: ['ArrowUp'], intent: 'prevScene', labelAr: 'المشهد السابق' },
  { keys: ['Home'], intent: 'first', labelAr: 'البداية' },
  { keys: ['End'], intent: 'last', labelAr: 'النهاية' },
  { keys: ['f'], intent: 'fullscreen', labelAr: 'ملء الشاشة' },
  { keys: ['Escape'], intent: 'escape', labelAr: 'إغلاق' },
  { keys: ['p'], intent: 'presenter', labelAr: 'وضع المقدّم' },
] as const

/** The minimal shape `resolveKeyIntent` needs — keeps it testable in Node. */
export interface KeyEventLike {
  key: string
  repeat: boolean
  ctrlKey: boolean
  altKey: boolean
  metaKey: boolean
  target: EventTarget | null
}

const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

/**
 * True when the event came from somewhere the presenter is typing.
 *
 * The Prompt Lab has a text field: pressing Space in it must insert a space,
 * not advance the presentation.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== 'object') return false

  const element = target as {
    tagName?: unknown
    isContentEditable?: unknown
  }

  if (
    typeof element.tagName === 'string' &&
    TYPING_TAGS.has(element.tagName.toUpperCase())
  ) {
    return true
  }

  return element.isContentEditable === true
}

/**
 * Maps a key press to a navigation intent, or null if it should be ignored.
 *
 * Pure and dependency-free so the whole key map can be exercised in Node.
 */
export function resolveKeyIntent(event: KeyEventLike): NavIntent | null {
  // Holding a key down would otherwise machine-gun through the reveals.
  if (event.repeat) return null

  // Leave browser shortcuts (Ctrl+F, Cmd+R, ...) alone.
  if (event.ctrlKey || event.altKey || event.metaKey) return null

  if (isTypingTarget(event.target)) return null

  const binding = KEY_BINDINGS.find((candidate) =>
    candidate.keys.some((key) =>
      key.length === 1
        ? key.toLowerCase() === event.key.toLowerCase()
        : key === event.key,
    ),
  )

  return binding?.intent ?? null
}

/**
 * The longest pick-one list in the deck: six careers.
 *
 * Deliberately not raised for the Privacy Sorter's twelve items. A digit can
 * address ten options at the very most, so no cap makes twelve reachable — and
 * the sorter is not a pick-one anyway. It sorts items into two buckets, so it
 * belongs on the beat model like the Prompt Lab, not on number keys. A test in
 * `content.test.ts` holds every pick-one interaction to this number.
 */
export const MAX_CHOICE_KEY = 6

/**
 * Number-key choice selection, 1..6.
 *
 * Kept separate from `resolveKeyIntent` because NavIntent is a string union and
 * cannot carry which digit was pressed. Shares the same guards, and callers
 * only enable it on scenes that actually have an interaction — so a stray digit
 * can never fire anything on a normal scene.
 *
 * Returns a 1-based choice number, or null.
 */
export function resolveChoiceKey(event: KeyEventLike): number | null {
  if (event.repeat) return null
  if (event.ctrlKey || event.altKey || event.metaKey) return null
  if (isTypingTarget(event.target)) return null

  if (!/^[1-9]$/.test(event.key)) return null

  const choice = Number(event.key)
  return choice <= MAX_CHOICE_KEY ? choice : null
}
