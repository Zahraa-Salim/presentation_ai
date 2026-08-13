/**
 * NOVA's expression states.
 *
 * Character rule: NOVA is helpful, never a substitute for a friend.
 * It says "أنا موجود لأساعدك" — never "أنا أفضل صديق إلك".
 * The presentation itself teaches AI boundaries, so the character must
 * model them.
 */
export const NOVA_EMOTIONS = [
  'idle',
  'float',
  'look',
  'blink',
  'talk',
  'happy',
  'confused',
  'surprised',
  'thinking',
  'warning',
  'sad',
  'celebrate',
] as const

export type NovaEmotion = (typeof NOVA_EMOTIONS)[number]
