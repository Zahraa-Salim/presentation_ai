import { useState } from 'react'
import { motion } from 'motion/react'
import { ChoiceCard, QuestionCard } from '@/components/ui'
import { useChoiceKeys } from '@/hooks/useChoiceKeys'
import { useInteractionReset } from '@/hooks/useInteractionReset'
import { usePresentation } from '@/hooks/usePresentation'
import { getBeatLayout } from '@/lib/beats'
import { isTodo } from '@/lib/todo'
import { REVEAL_PRESET } from '@/lib/transitions'
import type { InteractionDef, SceneDef } from '@/types'

interface RealOrFakeProps {
  scene: SceneDef
  interaction: InteractionDef
}

/**
 * Interaction G — `مين الحقيقي؟`
 *
 * Two messages, one genuine and one forged, deliberately hard to separate. The
 * class votes, the presenter selects, and only the next press marks which was
 * which — then lists the tells that gave it away.
 *
 * **The verdict is withheld until the reveal on purpose.** If the card flipped
 * the moment it was chosen, a wrong guess would be corrected before anyone had
 * to defend it, and being briefly and publicly fooled is the part that sticks.
 *
 * Verdict wording comes from the interaction data — `حقيقي` / `مزوّر`, not
 * right and wrong. A student who picked the scam was not bad at a quiz; they
 * were phished, which is the point.
 *
 * The tells matter more than the answer, so they are what stays on screen.
 */
export function RealOrFake({ scene, interaction }: RealOrFakeProps) {
  const { beat } = usePresentation()
  const [selected, setSelected] = useState<number | null>(null)

  const layout = getBeatLayout(scene)
  const revealed =
    layout.interactionStart !== null && beat >= layout.interactionStart

  useChoiceKeys(setSelected, { count: interaction.options.length })
  useInteractionReset(() => setSelected(null))

  return (
    <QuestionCard
      question={interaction.promptAr}
      hint={revealed ? undefined : 'خلي الصف يصوّت — بعدين اضغط اللي اختاروه'}
    >
      <div className="flex flex-col gap-4">
        {interaction.options.map((option, index) => (
          <ChoiceCard
            key={option.id}
            label={option.label}
            choiceKey={index + 1}
            verdictLabels={interaction.verdictAr}
            state={
              revealed
                ? option.correct
                  ? 'correct'
                  : 'incorrect'
                : selected === index
                  ? 'selected'
                  : selected === null
                    ? 'idle'
                    : 'dimmed'
            }
            onSelect={() => setSelected(index)}
            disabled={revealed}
          />
        ))}
      </div>

      {revealed && (
        <motion.div
          initial={REVEAL_PRESET.initial}
          animate={REVEAL_PRESET.animate}
          transition={{
            duration: REVEAL_PRESET.durationSec,
            ease: REVEAL_PRESET.ease,
          }}
          className="mt-8 flex flex-col gap-3"
        >
          {interaction.facilitationAr.map((line) => (
            <p
              key={line}
              className={`text-body max-w-4xl ${
                isTodo(line) ? 'text-warning' : 'text-soft'
              }`}
            >
              {line}
            </p>
          ))}
        </motion.div>
      )}
    </QuestionCard>
  )
}
