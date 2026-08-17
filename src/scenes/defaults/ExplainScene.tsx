import { CompareGroups, RevealText, SectionTitle } from '@/components/ui'
import { getBeatLayout } from '@/lib/beats'
import type { SceneDef } from '@/types'

/**
 * The workhorse renderer — most of the 33 scenes.
 *
 * Headline, an optional quoted example, staged reveals, comparison columns and
 * the line the scene lands on. Everything is bound to beats by the components
 * themselves, so this does no beat arithmetic beyond reading the layout.
 * Content comes entirely from the scene definition; nothing is inlined.
 */
export function ExplainScene({ scene }: { scene: SceneDef }) {
  const layout = getBeatLayout(scene)
  const { headline, subheadline, example, steps, groups, keyMessage, note } =
    scene.content

  return (
    <div className="flex h-full flex-col justify-center gap-10">
      {/* No eyebrow: the chrome already names the world, and a second label
          here would only compete with the headline. */}
      <SectionTitle lead={subheadline}>{headline ?? scene.title}</SectionTitle>

      {/*
        The example is what the scene is arguing about — a prompt, a message.
        Quoted and set apart so it never reads as the presenter's own words.
      */}
      {example && (
        <blockquote className="text-title border-accent/60 bg-surface/60 rounded-card border-s-4 px-6 py-4 text-bright">
          {example}
        </blockquote>
      )}

      {steps && steps.length > 0 && (
        <div className="flex flex-col gap-5">
          {steps.map((step, index) => (
            <RevealText
              key={step.id}
              step={layout.stepsStart + index}
              emphasis={step.emphasis}
            >
              {step.label && (
                <span className="text-caption me-3 font-semibold text-accent latin">
                  {step.label}
                </span>
              )}
              {step.text}
            </RevealText>
          ))}
        </div>
      )}

      {groups && groups.length > 0 && layout.groupsStart !== null && (
        <CompareGroups groups={groups} startBeat={layout.groupsStart} />
      )}

      {/* The line the scene lands on — always the last beat, so it arrives
          after everything it is a conclusion of. */}
      {keyMessage && layout.keyMessageBeat !== null && (
        <RevealText step={layout.keyMessageBeat} emphasis="strong">
          {keyMessage}
        </RevealText>
      )}

      {note && <p className="text-lead max-w-4xl text-muted">{note}</p>}
    </div>
  )
}
