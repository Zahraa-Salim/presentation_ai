import type { ComponentType } from 'react'
import { ChoiceReveal } from '@/components/interactions/ChoiceReveal'
import { MindReader } from '@/components/interactions/MindReader'
import { Poll } from '@/components/interactions/Poll'
import { PrivacySorter } from '@/components/interactions/PrivacySorter'
import { PromptLab } from '@/components/interactions/PromptLab'
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
 * than crashing, so the deck stays walkable while any are still to come.
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
  'dependency': ChoiceReveal, // Task 21
  'career': ChoiceReveal, // Task 22
  // 'real-or-fake' — Task 19, blocked: the deck supplies no pair to compare.
}

export function getInteractionComponent(
  id: InteractionId,
): InteractionComponent | undefined {
  return INTERACTION_COMPONENTS[id]
}
