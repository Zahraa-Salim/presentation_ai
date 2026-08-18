import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { usePresentation } from '@/hooks/usePresentation'
import { getStepTiming } from '@/lib/beats'
import { REVEAL_PRESET } from '@/lib/transitions'
import type { RevealEmphasis } from '@/types'

const EMPHASIS: Record<RevealEmphasis, string> = {
  quiet: 'text-body text-muted',
  normal: 'text-lead text-soft',
  strong: 'text-title font-semibold text-bright',
}

/**
 * One step up the scale, for the two cinematic scenes.
 *
 * The opening and the finale are the only moments with almost nothing else on
 * screen, and the finale's four closing lines are the last thing the class
 * reads — at `text-lead` in `text-soft` they were sitting too quietly against
 * a full-screen 3D backdrop. The gap between `normal` and `strong` is kept, so
 * `AI أداة.` still arrives as the largest line of the deck.
 */
const EMPHASIS_CINEMATIC: Record<RevealEmphasis, string> = {
  quiet: 'text-lead text-muted',
  normal: 'text-title text-text',
  strong: 'text-headline font-semibold text-bright',
}

export type RevealScale = 'default' | 'cinematic'

interface RevealTextProps {
  /**
   * Beat at which this appears. For landings — a statement, a keyMessage —
   * which are always presenter-driven whatever the scene's pacing.
   */
  step?: number
  /**
   * Index into the scene's `content.steps`. Use this for list items: it
   * respects the scene's `pacing`, cascading them in automatically unless the
   * scene is one of the four that need each line driven by hand.
   */
  stepIndex?: number
  emphasis?: RevealEmphasis
  /** `cinematic` steps the type up one level. See EMPHASIS_CINEMATIC. */
  scale?: RevealScale
  children: ReactNode
  className?: string
}

/**
 * Content that appears on a given beat.
 *
 * Reads the current beat from context so scene components stay declarative and
 * never do beat arithmetic:
 *
 *   {steps.map((s, i) => <RevealText key={s.id} step={i + 1}>{s.text}</RevealText>)}
 *
 * Already-revealed content stays visible — going back to a scene shows it
 * fully revealed, matching the navigation rule from Task 03.
 */
export function RevealText({
  step,
  stepIndex,
  emphasis = 'normal',
  scale = 'default',
  children,
  className = '',
}: RevealTextProps) {
  const { scene, beat } = usePresentation()

  const { revealed, delaySec } =
    stepIndex !== undefined
      ? getStepTiming(scene, beat, stepIndex)
      : { revealed: beat >= (step ?? 0), delaySec: 0 }

  return (
    <motion.p
      initial={false}
      animate={revealed ? REVEAL_PRESET.animate : REVEAL_PRESET.initial}
      transition={{
        duration: REVEAL_PRESET.durationSec,
        ease: REVEAL_PRESET.ease,
        delay: revealed ? delaySec : 0,
      }}
      // Kept in the layout while hidden so revealing never shifts the page.
      aria-hidden={!revealed}
      className={`${
        scale === 'cinematic' ? EMPHASIS_CINEMATIC[emphasis] : EMPHASIS[emphasis]
      } ${revealed ? '' : 'pointer-events-none'} ${className}`}
    >
      {children}
    </motion.p>
  )
}
