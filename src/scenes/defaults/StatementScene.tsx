import { motion } from 'motion/react'
import { RevealText } from '@/components/ui'
import { usePresentation } from '@/hooks/usePresentation'
import { getBeatLayout } from '@/lib/beats'
import { getStatementPhase } from '@/lib/transitions'
import type { SceneDef } from '@/types'

/**
 * One sentence, maximum weight.
 *
 * Presenter-stepped: the scene arrives dark with only the sentence, and holds
 * there for as long as the room needs. The next press blooms the visual behind
 * it. That pause is the whole point of these moments, which is why the phase is
 * driven by the presenter rather than a timer.
 *
 * Optional steps build first, so a scene can ask its questions and then land on
 * the sentence — the shape scene 28 needs.
 */
export function StatementScene({ scene }: { scene: SceneDef }) {
  const { beat } = usePresentation()
  const layout = getBeatLayout(scene)
  const phase = getStatementPhase(scene, beat)
  const revealed = phase === 'revealed'

  const { statement, steps, note } = scene.content

  return (
    <div className="flex h-full flex-col items-center justify-center gap-12 text-center">
      {steps && steps.length > 0 && (
        <div className="flex flex-col items-center gap-4">
          {steps.map((step, index) => (
            <RevealText
              key={step.id}
              step={layout.stepsStart + index}
              emphasis={step.emphasis}
            >
              {step.text}
            </RevealText>
          ))}
        </div>
      )}

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
