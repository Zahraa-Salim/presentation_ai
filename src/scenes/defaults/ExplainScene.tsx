import { RevealText, SectionTitle } from '@/components/ui'
import { getBeatLayout } from '@/lib/beats'
import type { SceneDef } from '@/types'

/**
 * The workhorse renderer — 19 of the 33 scenes.
 *
 * Headline plus staged reveals, bound to beats by RevealText so this component
 * does no beat arithmetic. Content comes entirely from the scene definition;
 * nothing is inlined.
 */
export function ExplainScene({ scene }: { scene: SceneDef }) {
  const layout = getBeatLayout(scene)
  const { headline, subheadline, steps, note } = scene.content

  return (
    <div className="flex h-full flex-col justify-center gap-10">
      <SectionTitle eyebrow={scene.id} lead={subheadline}>
        {headline ?? scene.title}
      </SectionTitle>

      {steps && steps.length > 0 && (
        <div className="flex flex-col gap-5">
          {steps.map((step, index) => (
            <RevealText
              key={step.id}
              step={layout.stepsStart + index}
              emphasis={step.emphasis}
            >
              {step.text}
            </RevealText>
          ))}
        </div>
      )}

      {note && <p className="text-lead max-w-4xl text-muted">{note}</p>}
    </div>
  )
}
