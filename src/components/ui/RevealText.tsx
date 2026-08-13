import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { usePresentation } from '@/hooks/usePresentation'
import { REVEAL_PRESET } from '@/lib/transitions'
import type { RevealEmphasis } from '@/types'

const EMPHASIS: Record<RevealEmphasis, string> = {
  quiet: 'text-body text-muted',
  normal: 'text-lead text-soft',
  strong: 'text-title font-semibold text-bright',
}

interface RevealTextProps {
  /** Beat at which this appears. 1 is the first step after the scene at rest. */
  step: number
  emphasis?: RevealEmphasis
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
  emphasis = 'normal',
  children,
  className = '',
}: RevealTextProps) {
  const { beat } = usePresentation()
  const revealed = beat >= step

  return (
    <motion.p
      initial={false}
      animate={revealed ? REVEAL_PRESET.animate : REVEAL_PRESET.initial}
      transition={{
        duration: REVEAL_PRESET.durationSec,
        ease: REVEAL_PRESET.ease,
      }}
      // Kept in the layout while hidden so revealing never shifts the page.
      aria-hidden={!revealed}
      className={`${EMPHASIS[emphasis]} ${revealed ? '' : 'pointer-events-none'} ${className}`}
    >
      {children}
    </motion.p>
  )
}
