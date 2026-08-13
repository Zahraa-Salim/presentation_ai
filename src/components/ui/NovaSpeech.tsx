import { motion } from 'motion/react'
import { usePresentation } from '@/hooks/usePresentation'
import { REVEAL_PRESET } from '@/lib/transitions'

interface NovaSpeechProps {
  /**
   * What NOVA says, in Arabic.
   *
   * CHARACTER RULE — this is the contract every scene must keep:
   *
   *   NOVA says   «أنا موجود لأساعدك»
   *   NOVA never says   «أنا أفضل صديق إلك»
   *
   * World 4 spends ten minutes teaching students that AI is a friend with
   * boundaries. A line here that encourages emotional dependency would
   * undercut the single most important lesson in the deck.
   */
  children: string
  /** Beat at which the line appears. Omit to show immediately. */
  step?: number
  align?: 'start' | 'center'
  className?: string
}

/**
 * NOVA's speech, rendered in the DOM.
 *
 * Not inside the canvas: Three.js cannot shape or bidi Arabic correctly, so
 * every word NOVA says lives in the DOM layer above the 3D — the same rule the
 * rest of the presentation follows.
 */
export function NovaSpeech({
  children,
  step,
  align = 'start',
  className = '',
}: NovaSpeechProps) {
  const { beat } = usePresentation()
  const revealed = step === undefined || beat >= step

  return (
    <motion.div
      initial={false}
      animate={revealed ? REVEAL_PRESET.animate : REVEAL_PRESET.initial}
      transition={{
        duration: REVEAL_PRESET.durationSec,
        ease: REVEAL_PRESET.ease,
      }}
      aria-hidden={!revealed}
      className={`relative max-w-2xl rounded-card border border-accent/40 bg-surface px-7 py-5 shadow-card ${
        align === 'center' ? 'mx-auto text-center' : ''
      } ${revealed ? '' : 'pointer-events-none'} ${className}`}
    >
      {/* Tail pointing down toward NOVA. Mirrors automatically under RTL. */}
      <span
        aria-hidden
        className="absolute -bottom-2 start-10 size-4 rotate-45 border-b border-e border-accent/40 bg-surface"
      />

      <p className="text-lead text-pretty text-text">{children}</p>
    </motion.div>
  )
}
