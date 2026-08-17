import { SCENE_BY_ID } from '@/data/scenes'
import { getBeatLayout } from '@/lib/beats'

/**
 * Whether a scene's interaction has been resolved yet, 0 = not yet, 1 = shown.
 *
 * Several environments hold a neutral state until the class has answered and
 * then show the consequence: the Privacy Vault sorts, Cyber City exposes which
 * of its nodes were forged. All of them want the same question — has the
 * presenter reached the interaction beat — so they ask it in one place.
 *
 * Beat-driven rather than selection-driven on purpose. The 3D reads
 * presentation state and nothing else, so a world can never disagree with the
 * DOM in front of a class, and the reveal lands when the presenter chooses.
 *
 * Pure so the mapping is testable rather than buried inside useFrame.
 */
export function getInteractionReveal(sceneId: string, beat: number): number {
  const scene = SCENE_BY_ID.get(sceneId)
  if (!scene) return 0

  const { interactionStart } = getBeatLayout(scene)
  if (interactionStart === null) return 0

  return beat >= interactionStart ? 1 : 0
}
