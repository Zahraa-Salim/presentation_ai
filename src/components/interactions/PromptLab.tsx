import { motion } from 'motion/react'
import { Card, QuestionCard } from '@/components/ui'
import { usePresentation } from '@/hooks/usePresentation'
import { getBeatLayout } from '@/lib/beats'
import { isTodo } from '@/lib/todo'
import { REVEAL_PRESET } from '@/lib/transitions'
import type { InteractionDef, SceneDef } from '@/types'

interface PromptLabProps {
  scene: SceneDef
  interaction: InteractionDef
}

/**
 * Interaction C — building a prompt one piece at a time.
 *
 * The only interaction that spans more than one beat: `اشرحلي Biology.` sits
 * alone, then Context, Goal, Constraints and Output arrive one press each, so
 * the class watches the question get better rather than being shown a finished
 * one. Each stage carries the question it answers, from the deck.
 *
 * It deliberately does NOT print a rewritten prompt at each step. The deck
 * supplies the four stages and their questions, not four intermediate prompts,
 * and writing those would be inventing the lesson's content. Scene 17 already
 * shows the finished strong prompt two scenes earlier — this scene names the
 * parts it was built from.
 */
export function PromptLab({ scene, interaction }: PromptLabProps) {
  const { beat } = usePresentation()
  const layout = getBeatLayout(scene)

  return (
    <QuestionCard question={interaction.promptAr}>
      <ol className="grid gap-3 md:grid-cols-2">
        {interaction.options.map((option, index) => {
          const stageBeat = (layout.interactionStart ?? 1) + index
          const revealed = beat >= stageBeat
          const active = beat === stageBeat
          // One question per stage, in the same order as the options.
          const question = interaction.facilitationAr[index]

          return (
            <motion.li
              key={option.id}
              initial={false}
              animate={
                revealed ? REVEAL_PRESET.animate : REVEAL_PRESET.initial
              }
              transition={{
                duration: REVEAL_PRESET.durationSec,
                ease: REVEAL_PRESET.ease,
              }}
              aria-hidden={!revealed}
            >
              <Card surface="panel" active={active} className="h-full">
                <p className="text-caption mb-2 flex items-center gap-3 text-muted">
                  <span
                    className={`flex size-7 items-center justify-center rounded-pill border latin ${
                      active
                        ? 'border-accent bg-accent text-void'
                        : 'border-line'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-lead font-semibold text-bright latin">
                    {option.label}
                  </span>
                </p>

                {question && (
                  <p
                    className={`text-body ${
                      isTodo(question) ? 'text-warning' : 'text-soft'
                    }`}
                  >
                    {question}
                  </p>
                )}
              </Card>
            </motion.li>
          )
        })}
      </ol>
    </QuestionCard>
  )
}
