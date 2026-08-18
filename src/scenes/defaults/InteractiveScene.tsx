import { createElement } from 'react'
import { getInteractionComponent } from '@/components/interactions/interactionRegistry'
import { RevealText, SectionTitle } from '@/components/ui'
import { INTERACTION_BY_ID } from '@/data/interactions'
import { getBeatLayout } from '@/lib/beats'
import type { SceneDef } from '@/types'

/**
 * Hosts one of the nine classroom interactions — 9 of the 33 scenes.
 *
 * Dispatch goes through the interaction registry, so the remaining unbuilt
 * interactions render a visible note instead of crashing and the deck stays
 * walkable end to end.
 */
export function InteractiveScene({ scene }: { scene: SceneDef }) {
  const interaction = scene.interaction
    ? INTERACTION_BY_ID[scene.interaction]
    : undefined

  const Interaction = scene.interaction
    ? getInteractionComponent(scene.interaction)
    : undefined

  const layout = getBeatLayout(scene)
  const { headline, subheadline, steps, keyMessage } = scene.content

  return (
    <div className="flex h-full flex-col justify-center gap-10">
      {/* No eyebrow: the chrome already names the world. */}
      <SectionTitle lead={subheadline}>{headline ?? scene.title}</SectionTitle>

      {/*
        Interactive scenes can carry reveal steps too — scene 27 lists the five
        Cybersecurity threats before asking its question. This was missing, so
        those five steps consumed five beats and displayed nothing: five presses
        that did visibly nothing, and a scene whose 3D had no words to explain it.
      */}
      {steps && steps.length > 0 && (
        <div className="flex flex-col gap-4">
          {steps.map((step, index) => (
            <RevealText
              key={step.id}
              stepIndex={index}
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

      {interaction && Interaction ? (
        createElement(Interaction, { scene, interaction })
      ) : (
        <p className="text-lead text-warning">
          ⟦ interaction “{scene.interaction}” — لسا ما انبنت ⟧
        </p>
      )}

      {/* The takeaway the interaction exists to produce, so it lands on the
          final beat — after the class has answered, not while they decide. */}
      {keyMessage && layout.keyMessageBeat !== null && (
        <RevealText step={layout.keyMessageBeat} emphasis="strong">
          {keyMessage}
        </RevealText>
      )}
    </div>
  )
}
