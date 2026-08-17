import { motion } from 'motion/react'
import { RevealText, SectionTitle } from '@/components/ui'
import { AI_PIPELINE } from '@/data/aiPipeline'
import { usePresentation } from '@/hooks/usePresentation'
import { getBeatLayout } from '@/lib/beats'
import { isTodo } from '@/lib/todo'
import type { SceneDef } from '@/types'

/**
 * Scene 9 — `كيف يعمل؟`
 *
 * Earns its own component because the five stages advance one press at a time
 * alongside the 3D lattice, and the stage names are Latin technical terms sat
 * beside Arabic explanations.
 *
 * Stage order comes from AI_PIPELINE; the beat that reveals each comes from the
 * scene's own steps. Their ids are asserted to match in the test suite.
 */
export function HowAiWorksScene({ scene }: { scene: SceneDef }) {
  const { beat } = usePresentation()
  const layout = getBeatLayout(scene)

  return (
    <div className="flex h-full flex-col justify-center gap-12">
      {/* No eyebrow: the chrome already names the world. */}
      <SectionTitle>{scene.content.headline ?? scene.title}</SectionTitle>

      <ol className="flex flex-wrap items-start gap-x-3 gap-y-8">
        {AI_PIPELINE.map((stage, index) => {
          const stepBeat = layout.stepsStart + index
          const revealed = beat >= stepBeat
          const active = beat === stepBeat
          const caption = scene.content.steps?.[index]?.text ?? stage.captionAr

          return (
            <motion.li
              key={stage.id}
              initial={false}
              animate={{
                opacity: revealed ? 1 : 0.2,
                y: revealed ? 0 : 10,
              }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="flex min-w-44 flex-1 flex-col gap-2"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-caption flex size-7 items-center justify-center rounded-pill border latin ${
                    active
                      ? 'border-accent bg-accent text-void'
                      : 'border-line text-muted'
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`text-lead font-semibold latin ${
                    active ? 'text-bright glow-text' : 'text-soft'
                  }`}
                >
                  {stage.label}
                </span>
              </div>

              <span
                className={`text-caption ${
                  isTodo(caption) ? 'text-warning' : 'text-soft'
                }`}
              >
                {caption}
              </span>
            </motion.li>
          )
        })}
      </ol>

      {/* `AI بيتوقع، مش بيفكّر مثل الإنسان.` — the conclusion the five stages
          exist to earn, so it lands only once they have all been shown. */}
      {scene.content.keyMessage && layout.keyMessageBeat !== null && (
        <RevealText step={layout.keyMessageBeat} emphasis="strong">
          {scene.content.keyMessage}
        </RevealText>
      )}
    </div>
  )
}
