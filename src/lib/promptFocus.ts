import { SCENE_BY_ID } from '@/data/scenes'
import { getBeatLayout } from '@/lib/beats'

/**
 * How focused the AI Machine's output is, 0 = scattered, 1 = landing.
 *
 * World 3's prompting scenes argue one thing: the model did not change, the
 * question did. So the machine is constant and only its output spread moves.
 *
 *   scene 16  `Prompt ضعيف.`   stays at 0 — naming what is missing does not
 *                              fix it, and tightening the beam here would say
 *                              the opposite of the scene
 *   scene 17  `Prompt أقوى.`   climbs as each of Context / Goal / Constraints /
 *                              Output is named
 *   scene 18  the framework    climbs again as the Prompt Lab builds it live
 *
 * Pure so the mapping is testable rather than buried inside useFrame, and
 * derived from the beat layout rather than pinned to beat numbers that move
 * whenever the deck gains a line.
 */

/** Names the problem. Never focuses — that is the point of the scene. */
const SCATTERED_SCENE = 'weak-prompt'

/** Focus climbs with the reveal steps. */
const STEPPED_SCENE = 'strong-prompt'

/** Focus climbs with the Prompt Lab's build stages. */
const BUILT_SCENE = 'prompt-framework'

export function getPromptFocus(sceneId: string, beat: number): number {
  const scene = SCENE_BY_ID.get(sceneId)
  if (!scene) return 0
  if (sceneId === SCATTERED_SCENE) return 0

  const layout = getBeatLayout(scene)

  if (sceneId === STEPPED_SCENE && layout.stepCount > 0) {
    return clamp01((beat - layout.stepsStart + 1) / layout.stepCount)
  }

  if (
    sceneId === BUILT_SCENE &&
    layout.interactionStart !== null &&
    layout.interactionBeats > 0
  ) {
    return clamp01(
      (beat - layout.interactionStart + 1) / layout.interactionBeats,
    )
  }

  // Any other scene reaching this environment sits focused — never NaN,
  // because the value feeds straight into geometry interpolation.
  return 1
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(Math.max(value, 0), 1)
}
