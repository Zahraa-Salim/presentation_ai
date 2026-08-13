import { createElement } from 'react'
import { getInteractionComponent } from '@/components/interactions/interactionRegistry'
import { SectionTitle } from '@/components/ui'
import { INTERACTION_BY_ID } from '@/data/interactions'
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

  return (
    <div className="flex h-full flex-col justify-center gap-10">
      <SectionTitle eyebrow={scene.id}>
        {scene.content.headline ?? scene.title}
      </SectionTitle>

      {interaction && Interaction ? (
        createElement(Interaction, { scene, interaction })
      ) : (
        <p className="text-lead text-warning">
          ⟦ interaction “{scene.interaction}” — لسا ما انبنت ⟧
        </p>
      )}
    </div>
  )
}
