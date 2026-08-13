import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { usePresentation } from '@/hooks/usePresentation'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { getTransitionPreset } from '@/lib/transitions'

interface SceneTransitionProps {
  children: ReactNode
}

/**
 * Animates between scenes using the preset named by `scene.transition`.
 *
 * Runs in AnimatePresence's default *sync* mode, not mode="wait": waiting
 * would queue the incoming scene behind the outgoing one, so a second key
 * press mid-transition would appear to be swallowed. In sync mode a new
 * transition simply takes over from wherever the current one is.
 *
 * Both scenes are absolutely positioned so they overlap during the crossfade
 * instead of shifting layout.
 */
export function SceneTransition({ children }: SceneTransitionProps) {
  const { scene, direction } = usePresentation()
  const reducedMotion = useReducedMotion()
  const preset = getTransitionPreset(scene.transition, reducedMotion)

  return (
    <div className="relative size-full">
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={scene.id}
          custom={direction}
          variants={{
            initial: preset.initial,
            animate: preset.animate,
            exit: preset.exit,
          }}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: preset.durationSec, ease: preset.ease }}
          className="absolute inset-0"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
