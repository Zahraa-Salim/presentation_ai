import { useState } from 'react'
import { motion } from 'motion/react'
import { ChoiceCard, QuestionCard } from '@/components/ui'
import { useChoiceKeys } from '@/hooks/useChoiceKeys'
import { useInteractionReset } from '@/hooks/useInteractionReset'
import { usePresentation } from '@/hooks/usePresentation'
import { getBeatLayout } from '@/lib/beats'
import { latinClass } from '@/lib/direction'
import { isTodo } from '@/lib/todo'
import { REVEAL_PRESET } from '@/lib/transitions'
import type { InteractionDef, SceneDef } from '@/types'

interface ChoiceRevealProps {
  scene: SceneDef
  interaction: InteractionDef
}

/**
 * Pick one of N, then see the line that belongs to it.
 *
 * Four interactions share this shape, so they share this component rather than
 * four near-identical files: the Tool Explorer, the Study Companion, the
 * dependency question and the careers question. What differs between them is
 * entirely data — the options and one facilitation line per option.
 *
 * Selection and reveal are deliberately separate. The class answers, the
 * presenter selects, and the consequence lands only on the next press — so the
 * room gets the pause before the answer rather than losing it to a click.
 *
 * Escape clears the selection so the same question can be re-run.
 */
export function ChoiceReveal({ scene, interaction }: ChoiceRevealProps) {
  const { beat } = usePresentation()
  const [selected, setSelected] = useState<number | null>(null)

  const layout = getBeatLayout(scene)
  const revealed =
    layout.interactionStart !== null && beat >= layout.interactionStart

  useChoiceKeys(setSelected, { count: interaction.options.length })
  useInteractionReset(() => setSelected(null))

  /*
    One line per option, in the same order. A shorter list is not an error —
    the deck has not supplied every interaction's lines yet — so a missing one
    falls back to nothing rather than to the wrong option's consequence.
  */
  const consequence =
    selected === null ? undefined : interaction.facilitationAr[selected]

  return (
    <QuestionCard
      question={interaction.promptAr}
      hint={selected === null ? 'اختر واحد — بالرقم أو بالضغط عليه' : undefined}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {interaction.options.map((option, index) => (
          <ChoiceCard
            key={option.id}
            label={option.label}
            choiceKey={index + 1}
            state={
              selected === null
                ? 'idle'
                : selected === index
                  ? 'selected'
                  : 'dimmed'
            }
            onSelect={() => setSelected(index)}
          />
        ))}
      </div>

      {consequence && (
        <motion.p
          initial={false}
          animate={revealed ? REVEAL_PRESET.animate : REVEAL_PRESET.initial}
          transition={{
            duration: REVEAL_PRESET.durationSec,
            ease: REVEAL_PRESET.ease,
          }}
          aria-hidden={!revealed}
          className={`text-lead mt-8 max-w-4xl ${latinClass(consequence)} ${
            isTodo(consequence) ? 'text-warning' : 'text-soft'
          }`}
        >
          {consequence}
        </motion.p>
      )}
    </QuestionCard>
  )
}
