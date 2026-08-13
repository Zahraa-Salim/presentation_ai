import { motion } from 'motion/react'
import { HelpCircle } from 'lucide-react'
import { Card } from '@/components/ui'
import { usePresentation } from '@/hooks/usePresentation'
import { getBeatLayout } from '@/lib/beats'
import { isTodo } from '@/lib/todo'
import { REVEAL_PRESET } from '@/lib/transitions'
import type { InteractionDef, SceneDef } from '@/types'

interface MindReaderProps {
  scene: SceneDef
  interaction: InteractionDef
}

/**
 * Interaction B — `AI مش قارئ أفكار`.
 *
 * The sentence sits alone while you ask the class why. On reveal, several
 * equally-plausible reasons appear at once — deliberately **not** selectable,
 * because the point is that AI has no way to choose between them. It was never
 * told. That sets up scene 7, `Context`.
 */
export function MindReader({ scene, interaction }: MindReaderProps) {
  const { beat } = usePresentation()
  const layout = getBeatLayout(scene)
  const revealed =
    layout.interactionStart !== null && beat >= layout.interactionStart

  const [statement, ...possibilities] = interaction.options

  return (
    <div className="flex flex-col gap-10">
      {/* What the student said. Nothing else. */}
      <Card surface="panel" className="self-start px-10 py-8">
        <p className="text-headline font-semibold text-bright">
          {statement?.label}
        </p>
      </Card>

      <p className="text-title font-medium text-accent">
        {interaction.promptAr}
      </p>

      <motion.div
        initial={false}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        aria-hidden={!revealed}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-wrap gap-4">
          {possibilities.map((option, index) => (
            <motion.div
              key={option.id}
              initial={false}
              animate={
                revealed ? REVEAL_PRESET.animate : REVEAL_PRESET.initial
              }
              transition={{
                duration: REVEAL_PRESET.durationSec,
                ease: REVEAL_PRESET.ease,
                delay: revealed ? index * 0.09 : 0,
              }}
            >
              {/*
                A plain card, not a ChoiceCard: nothing here is selectable.
                Making these clickable would imply one of them is the answer.
              */}
              <Card
                surface="outline"
                className="flex min-w-52 items-center gap-3 border-dashed"
              >
                <HelpCircle className="size-5 shrink-0 text-muted" aria-hidden />
                <span
                  className={`text-lead ${
                    isTodo(option.label) ? 'text-warning' : 'text-soft'
                  }`}
                >
                  {option.label}
                </span>
              </Card>
            </motion.div>
          ))}
        </div>

        {interaction.facilitationAr.map((line) => (
          <p
            key={line}
            className={`text-body ${isTodo(line) ? 'text-warning' : 'text-soft'}`}
          >
            {line}
          </p>
        ))}
      </motion.div>
    </div>
  )
}
