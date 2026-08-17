import { motion } from 'motion/react'
import { Card } from '@/components/ui'
import { usePresentation } from '@/hooks/usePresentation'
import { getBeatLayout } from '@/lib/beats'
import { latinClass } from '@/lib/direction'
import { isTodo } from '@/lib/todo'
import { REVEAL_PRESET } from '@/lib/transitions'
import type { InteractionDef, SceneDef } from '@/types'

interface MindReaderProps {
  scene: SceneDef
  interaction: InteractionDef
}

/**
 * Interaction B — `AI مش قارئ أفكار.`
 *
 * `أنا متوتر.` sits alone while you ask the class whether AI knows why. On
 * reveal the deck answers flatly — `لا.` — and explains that nobody gave it the
 * one fact that would make the sentence mean anything. That sets up scene 7,
 * `Context`.
 *
 * Nothing here is selectable. The answer is stated, not chosen: offering
 * options would suggest the class could reason their way to what AI knows,
 * when the point is that it knows nothing it was not told.
 */
export function MindReader({ scene, interaction }: MindReaderProps) {
  const { beat } = usePresentation()
  const layout = getBeatLayout(scene)
  const revealed =
    layout.interactionStart !== null && beat >= layout.interactionStart

  const [statement, answer] = interaction.options

  return (
    <div className="flex flex-col gap-10">
      {/* What the student said. Nothing else. */}
      <Card surface="panel" className="self-start px-10 py-8">
        <p
          className={`text-headline font-semibold text-bright ${latinClass(statement?.label ?? '')}`}
        >
          {statement?.label}
        </p>
      </Card>

      <p
        className={`text-title font-medium text-accent ${latinClass(interaction.promptAr)}`}
      >
        {interaction.promptAr}
      </p>

      <motion.div
        initial={false}
        animate={revealed ? REVEAL_PRESET.animate : REVEAL_PRESET.initial}
        transition={{
          duration: REVEAL_PRESET.durationSec,
          ease: REVEAL_PRESET.ease,
        }}
        aria-hidden={!revealed}
        className="flex flex-col gap-6"
      >
        {answer && (
          <p
            className={`text-display font-bold ${latinClass(answer.label)} ${
              isTodo(answer.label) ? 'text-warning' : 'text-bright glow-text'
            }`}
          >
            {answer.label}
          </p>
        )}

        {interaction.facilitationAr.map((line) => (
          <p
            key={line}
            className={`text-lead max-w-4xl ${latinClass(line)} ${
              isTodo(line) ? 'text-warning' : 'text-soft'
            }`}
          >
            {line}
          </p>
        ))}
      </motion.div>
    </div>
  )
}
