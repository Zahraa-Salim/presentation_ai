import { motion } from 'motion/react'
import { usePresentation } from '@/hooks/usePresentation'
import { getStatementPhase } from '@/lib/transitions'
import type { SceneDef } from '@/types'

/**
 * One sentence, maximum weight.
 *
 * Presenter-stepped: the scene arrives dark with only the sentence, and holds
 * there for as long as the room needs. The next press blooms the visual behind
 * it. That pause is the whole point of these moments, which is why the phase is
 * driven by the presenter rather than a timer.
 */
export function StatementScene({ scene }: { scene: SceneDef }) {
  const { beat } = usePresentation()
  const phase = getStatementPhase(scene, beat)
  const revealed = phase === 'revealed'

  const { statement, note } = scene.content

  return (
    <div className="flex h-full flex-col items-center justify-center gap-12 text-center">
      <motion.h2
        initial={false}
        animate={{ scale: revealed ? 1 : 0.97, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="text-display max-w-5xl font-bold text-balance text-bright glow-text"
      >
        {statement ?? scene.title}
      </motion.h2>

      {note && (
        <motion.p
          initial={false}
          animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 12 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden={!revealed}
          className="text-lead max-w-3xl text-soft"
        >
          {note}
        </motion.p>
      )}
    </div>
  )
}
