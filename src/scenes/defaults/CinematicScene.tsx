import { motion } from 'motion/react'
import { RevealText } from '@/components/ui'
import { usePresentation } from '@/hooks/usePresentation'
import { getStatementPhase } from '@/lib/transitions'
import type { SceneDef } from '@/types'

/**
 * The opening and the finale.
 *
 * Both are statement scenes with a build: the title holds alone in darkness,
 * then the world blooms behind it. The 3D does the heavy lifting — this
 * component stays deliberately sparse so it never competes with it.
 */
export function CinematicScene({ scene }: { scene: SceneDef }) {
  const { beat } = usePresentation()
  const phase = getStatementPhase(scene, beat)
  const revealed = phase === null || phase === 'revealed'

  const { headline, statement, steps, note } = scene.content

  /*
    Compare against what is actually on screen, not the raw headline. The
    finale has no headline and falls back to its title — which IS its
    statement — so guarding on `headline` printed the closing line twice, with
    the punchline visible from beat 0 while the four lines built toward it.
  */
  const displayed = headline ?? scene.title

  return (
    <div className="flex h-full flex-col items-center justify-center gap-10 text-center">
      <motion.h1
        initial={false}
        animate={{ opacity: 1, letterSpacing: revealed ? '0em' : '0.04em' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="text-display max-w-5xl font-bold text-balance text-bright glow-text"
      >
        {displayed}
      </motion.h1>

      {steps && steps.length > 0 && (
        <div className="flex flex-col items-center gap-5">
          {steps.map((step, index) => (
            <RevealText
              key={step.id}
              stepIndex={index}
              emphasis={step.emphasis}
              /* The finale's closing lines are the last thing the class reads
                 and there is nothing else on screen competing with them. */
              scale="cinematic"
            >
              {step.text}
            </RevealText>
          ))}
        </div>
      )}

      {statement && statement !== displayed && (
        <motion.p
          initial={false}
          animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 16 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden={!revealed}
          className="text-headline max-w-4xl font-semibold text-balance text-accent"
        >
          {statement}
        </motion.p>
      )}

      {note && (
        <motion.p
          initial={false}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          aria-hidden={!revealed}
          className="text-body max-w-3xl text-muted"
        >
          {note}
        </motion.p>
      )}
    </div>
  )
}
