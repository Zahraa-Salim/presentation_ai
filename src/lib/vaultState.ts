import { getInteractionReveal } from '@/lib/worldReveal'

/**
 * How far the Privacy Vault has sorted its information, 0 = drifting, 1 = sorted.
 *
 * World 4's whole argument, made physically: some things can go in, and some
 * things are stopped at the barrier. At 0 every item drifts outside without
 * distinction — which is how a student treats a chat box before this lesson.
 * At 1 the safe ones have passed through and the rest have been pushed back.
 *
 * Only scene 26 sorts, and only once the class has answered: the separation is
 * the interaction's payoff, so showing it early would answer the question the
 * scene is asking. Every other scene in the world holds at 0 — the vault is
 * present and closed, but nothing has been decided yet.
 *
 * Pure so the mapping is testable rather than buried inside useFrame.
 */

const SORTING_SCENE = 'what-not-to-share'

export function getVaultSeparation(sceneId: string, beat: number): number {
  // Only scene 26 sorts. Every other scene in the world shares this
  // environment but has not asked the question yet.
  if (sceneId !== SORTING_SCENE) return 0
  return getInteractionReveal(sceneId, beat)
}
