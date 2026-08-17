import { SCENE_BY_ID } from '@/data/scenes'
import { getBeatLayout } from '@/lib/beats'

/**
 * How far the finale has drawn its five worlds together, 0 = apart, 1 = one.
 *
 * Scene 33 builds four lines and then lands the message the whole lesson is
 * for. The five worlds the class has travelled through converge as those lines
 * arrive, so the last thing on screen is one thing rather than five — which is
 * the shape of the argument: not magic, not a mind reader, not a replacement,
 * a tool.
 *
 * Derived from the beat layout, so adding or cutting a closing line re-paces
 * the convergence instead of desynchronising it.
 *
 * Pure so the mapping is testable rather than buried inside useFrame.
 */
const FINALE_SCENE = 'final'

export function getFinaleConvergence(sceneId: string, beat: number): number {
  if (sceneId !== FINALE_SCENE) return 0

  const scene = SCENE_BY_ID.get(sceneId)
  if (!scene) return 0

  const layout = getBeatLayout(scene)
  // The statement is the arrival: fully converged the moment it blooms.
  const arrival = layout.statementBeat ?? layout.stepsStart + layout.stepCount
  if (arrival <= 0) return 1

  return clamp01(beat / arrival)
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(Math.max(value, 0), 1)
}
