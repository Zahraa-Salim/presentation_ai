import { useState } from 'react'
import { ChoiceCard, QuestionCard } from '@/components/ui'
import { useInteractionReset } from '@/hooks/useInteractionReset'
import { usePresentation } from '@/hooks/usePresentation'
import { getBeatLayout } from '@/lib/beats'
import { isTodo } from '@/lib/todo'
import type { InteractionDef, SceneDef } from '@/types'

interface PrivacySorterProps {
  scene: SceneDef
  interaction: InteractionDef
}

/**
 * Interaction F — what is safe to share with AI, and what is never.
 *
 * Twelve items, so **not** number keys: a digit can address ten at the very
 * most. The presenter clicks whichever item the class calls out, in whatever
 * order they call it, and that one flips to show its verdict. The interaction
 * beat then settles every remaining item at once and shows the rule.
 *
 * Verdict wording comes from the interaction data, because "right answer" is
 * the wrong idea here — `correct` means safe to share. The word is always
 * shown beside the icon and the tint, so the sorting never rests on colour: at
 * the back of a bright classroom this is the scene where that matters most.
 *
 * Escape clears the board so it can be re-run with another class.
 */
export function PrivacySorter({ scene, interaction }: PrivacySorterProps) {
  const { beat } = usePresentation()
  const [flipped, setFlipped] = useState<ReadonlySet<string>>(new Set())

  const layout = getBeatLayout(scene)
  const settleAll =
    layout.interactionStart !== null && beat >= layout.interactionStart

  useInteractionReset(() => setFlipped(new Set()))

  const flip = (id: string) =>
    setFlipped((current) => new Set(current).add(id))

  return (
    <QuestionCard
      question={interaction.promptAr}
      hint={
        settleAll ? undefined : 'اضغط على كل عنصر لما الصف يقرر — بأي ترتيب'
      }
    >
      <div className="grid gap-3 md:grid-cols-3">
        {interaction.options.map((option) => {
          const shown = settleAll || flipped.has(option.id)

          return (
            <ChoiceCard
              key={option.id}
              label={option.label}
              state={shown ? (option.correct ? 'correct' : 'incorrect') : 'idle'}
              verdictLabels={interaction.verdictAr}
              onSelect={() => flip(option.id)}
              // Once settled there is nothing left to reveal; keeping it
              // clickable would only invite a stray click mid-explanation.
              disabled={settleAll}
            />
          )
        })}
      </div>

      {settleAll &&
        interaction.facilitationAr.map((line) => (
          <p
            key={line}
            className={`text-lead mt-8 max-w-4xl ${
              isTodo(line) ? 'text-warning' : 'text-soft'
            }`}
          >
            {line}
          </p>
        ))}
    </QuestionCard>
  )
}
