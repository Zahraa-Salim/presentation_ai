import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ChoiceCard, QuestionCard } from '@/components/ui'
import { useChoiceKeys } from '@/hooks/useChoiceKeys'
import { usePresentation } from '@/hooks/usePresentation'
import { getBeatLayout } from '@/lib/beats'
import { getPollWeights } from '@/lib/pollWeights'
import { isTodo } from '@/lib/todo'
import type { InteractionDef, SceneDef } from '@/types'

interface PollProps {
  scene: SceneDef
  interaction: InteractionDef
}

/**
 * Interaction A — the opening poll.
 *
 * Entirely presenter-driven: the class raises hands, the presenter clicks or
 * presses the number of the option that dominated, and the bars settle at
 * relative lengths.
 *
 * No count or percentage is ever shown. The bars carry relative weight only —
 * inventing statistics would undercut a lesson about not taking AI output at
 * face value. Escape clears the selection so the poll can be re-run.
 */
export function Poll({ scene, interaction }: PollProps) {
  const { beat } = usePresentation()
  const [selected, setSelected] = useState<number | null>(null)

  const layout = getBeatLayout(scene)
  const resolved =
    layout.interactionStart !== null && beat >= layout.interactionStart

  useChoiceKeys(setSelected, { count: interaction.options.length })

  // Local Escape handling so the poll can be reset without disturbing the
  // global key map.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const weights = getPollWeights(interaction.options.length, selected)

  return (
    <QuestionCard
      question={interaction.promptAr}
      hint={
        selected === null
          ? 'ارفعوا إيديكن — بعدين اضغط الخيار الأكبر'
          : undefined
      }
    >
      <div className="flex flex-col gap-4">
        {interaction.options.map((option, index) => (
          <div key={option.id} className="flex flex-col gap-2">
            <ChoiceCard
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

            {/* Relative weight only — never a number. Grows from the
                inline-start edge, which is the right under RTL. */}
            <div className="h-2 w-full overflow-hidden rounded-pill bg-surface-2">
              <motion.div
                initial={false}
                animate={{ width: `${weights[index] * 100}%` }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={`h-full rounded-pill ${
                  selected === index ? 'bg-accent glow-sm' : 'bg-line'
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      {resolved &&
        interaction.facilitationAr.map((line) => (
          <p
            key={line}
            className={`text-body mt-6 ${isTodo(line) ? 'text-warning' : 'text-soft'}`}
          >
            {line}
          </p>
        ))}
    </QuestionCard>
  )
}
