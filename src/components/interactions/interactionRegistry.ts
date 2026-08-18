import type { ComponentType } from 'react'
import { ChoiceReveal } from '@/components/interactions/ChoiceReveal'
import { MindReader } from '@/components/interactions/MindReader'
import { Poll } from '@/components/interactions/Poll'
import { PrivacySorter } from '@/components/interactions/PrivacySorter'
import { PromptLab } from '@/components/interactions/PromptLab'
import { RealOrFake } from '@/components/interactions/RealOrFake'
import type { InteractionDef, InteractionId, SceneDef } from '@/types'

export interface InteractionProps {
  scene: SceneDef
  interaction: InteractionDef
}

export type InteractionComponent = ComponentType<InteractionProps>

/**
 * The nine classroom interactions, as they get built.
 *
 * All nine are built. The type stays Partial and the fallback stays in place:
 * a missing entry must never take a live presentation down, whatever a future
 * edit does to this map.
 *
 * Four of them share ChoiceReveal — pick one of N, see the line that belongs
 * to it. What separates them is entirely data, so four files would have been
 * four copies of the same component.
 */
export const INTERACTION_COMPONENTS: Partial<
  Record<InteractionId, InteractionComponent>
> = {
  'opening-poll': Poll, // Task 11
  'mind-reader': MindReader, // Task 12
  'prompt-lab': PromptLab, // Task 13
  'tool-explorer': ChoiceReveal, // Task 15 — facilitation lines still TODO
  'study-companion': ChoiceReveal, // Task 16 — facilitation lines still TODO
  'privacy-sorter': PrivacySorter, // Task 18
  'real-or-fake': RealOrFake, // Task 19
  'dependency': ChoiceReveal, // Task 21
  'career': ChoiceReveal, // Task 22
}

export function getInteractionComponent(
  id: InteractionId,
): InteractionComponent | undefined {
  return INTERACTION_COMPONENTS[id]
}
