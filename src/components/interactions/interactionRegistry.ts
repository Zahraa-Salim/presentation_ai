import type { ComponentType } from 'react'
import { MindReader } from '@/components/interactions/MindReader'
import { Poll } from '@/components/interactions/Poll'
import type { InteractionDef, InteractionId, SceneDef } from '@/types'

export interface InteractionProps {
  scene: SceneDef
  interaction: InteractionDef
}

export type InteractionComponent = ComponentType<InteractionProps>

/**
 * The nine classroom interactions, as they get built.
 *
 * Sparse on purpose: an id with no entry falls back to a visible note rather
 * than crashing, so the whole deck stays walkable while the remaining seven
 * are still to come.
 */
export const INTERACTION_COMPONENTS: Partial<
  Record<InteractionId, InteractionComponent>
> = {
  'opening-poll': Poll, // Task 11
  'mind-reader': MindReader, // Task 12
}

export function getInteractionComponent(
  id: InteractionId,
): InteractionComponent | undefined {
  return INTERACTION_COMPONENTS[id]
}
