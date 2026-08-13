import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { Card, type CardSurface } from '@/components/ui/Card'
import { usePresentation } from '@/hooks/usePresentation'
import { REVEAL_PRESET } from '@/lib/transitions'

interface RevealCardProps {
  /** Beat at which this card appears. */
  step: number
  surface?: CardSurface
  active?: boolean
  children: ReactNode
  className?: string
}

/** A Card that appears on a beat. Same binding rule as RevealText. */
export function RevealCard({
  step,
  surface,
  active,
  children,
  className = '',
}: RevealCardProps) {
  const { beat } = usePresentation()
  const revealed = beat >= step

  return (
    <motion.div
      initial={false}
      animate={revealed ? REVEAL_PRESET.animate : REVEAL_PRESET.initial}
      transition={{
        duration: REVEAL_PRESET.durationSec,
        ease: REVEAL_PRESET.ease,
      }}
      aria-hidden={!revealed}
      className={revealed ? '' : 'pointer-events-none'}
    >
      <Card surface={surface} active={active} className={className}>
        {children}
      </Card>
    </motion.div>
  )
}
