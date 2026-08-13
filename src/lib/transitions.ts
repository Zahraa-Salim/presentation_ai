import type { TargetAndTransition } from 'motion/react'
import { getBeatLayout } from '@/lib/beats'
import type { SceneDef, TransitionId } from '@/types'

/**
 * The transition system.
 *
 * One preset per TransitionId, defined here and nowhere else — scene
 * components pick a preset by name, they never write animation logic.
 */

/**
 * Arabic reads right to left, so the next page comes from the LEFT: advancing
 * brings new content in from negative x while the old exits to positive x.
 *
 * Motion animates physical `x`, not logical properties, so the mirroring has
 * to be explicit. Flip this one constant to reverse the whole system.
 */
export const RTL_SIGN = -1

export type CubicBezier = [number, number, number, number]

export const EASE_OUT_EXPO: CubicBezier = [0.16, 1, 0.3, 1]
export const EASE_IN_OUT_QUART: CubicBezier = [0.76, 0, 0.24, 1]

/** Matches --dur-* in globals.css. Kept in sync deliberately. */
export const DURATIONS = {
  fast: 0.18,
  base: 0.32,
  slow: 0.62,
  scene: 0.45,
  world: 0.9,
} as const

/** Motion's own target type — it carries the CSS-variable index signature. */
type MotionTarget = TargetAndTransition

export interface TransitionPreset {
  /** Entering, before animating in. `direction` is 1 forward, -1 backward. */
  initial: (direction: number) => MotionTarget
  animate: MotionTarget
  /** Leaving. */
  exit: (direction: number) => MotionTarget
  durationSec: number
  ease: CubicBezier
}

const settled: MotionTarget = { opacity: 1, x: 0, y: 0, scale: 1 }

export const TRANSITION_PRESETS: Record<TransitionId, TransitionPreset> = {
  // The workhorse: 17 of the 33 scenes.
  fade: {
    initial: (direction) => ({
      opacity: 0,
      x: RTL_SIGN * direction * 40,
      y: 12,
    }),
    animate: settled,
    exit: (direction) => ({
      opacity: 0,
      x: RTL_SIGN * direction * -40,
      y: -12,
    }),
    durationSec: DURATIONS.scene,
    ease: EASE_OUT_EXPO,
  },

  fadeUp: {
    initial: () => ({ opacity: 0, y: 32 }),
    animate: settled,
    exit: () => ({ opacity: 0, y: -32 }),
    durationSec: DURATIONS.scene,
    ease: EASE_OUT_EXPO,
  },

  // A DOM stand-in until the real camera move lands in Phase 3.
  cameraPush: {
    initial: () => ({ opacity: 0, scale: 1.04 }),
    animate: settled,
    exit: () => ({ opacity: 0, scale: 0.98 }),
    durationSec: 0.55,
    ease: EASE_OUT_EXPO,
  },

  // The heaviest change — crossing into a new world.
  worldShift: {
    initial: (direction) => ({
      opacity: 0,
      x: RTL_SIGN * direction * 90,
      scale: 1.06,
    }),
    animate: settled,
    exit: (direction) => ({
      opacity: 0,
      x: RTL_SIGN * direction * -90,
      scale: 0.96,
    }),
    durationSec: DURATIONS.world,
    ease: EASE_IN_OUT_QUART,
  },

  // Darkness → sentence. No movement: the sentence simply exists.
  statementReveal: {
    initial: () => ({ opacity: 0 }),
    animate: { opacity: 1 },
    exit: () => ({ opacity: 0 }),
    durationSec: 0.7,
    ease: EASE_OUT_EXPO,
  },
}

/**
 * Reduced-motion variant of a preset: the fade survives, everything that moves
 * or scales is dropped. Content still changes clearly, it just stops moving.
 */
export function toReducedMotion(preset: TransitionPreset): TransitionPreset {
  return {
    initial: () => ({ opacity: 0 }),
    animate: { opacity: 1 },
    exit: () => ({ opacity: 0 }),
    durationSec: DURATIONS.fast,
    ease: preset.ease,
  }
}

export function getTransitionPreset(
  id: TransitionId,
  reducedMotion = false,
): TransitionPreset {
  const preset = TRANSITION_PRESETS[id]
  return reducedMotion ? toReducedMotion(preset) : preset
}

/**
 * Beat-level reveal, used by staged content within a scene.
 * Exported for RevealText to consume in Task 07.
 */
export const REVEAL_PRESET = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  durationSec: DURATIONS.base,
  ease: EASE_OUT_EXPO,
} as const

/* ────────────────────────────────────────────────────────────────────────────
   STATEMENT SCENES
   ──────────────────────────────────────────────────────────────────────────── */

export type StatementPhase = 'sentence' | 'revealed'

export function isStatementScene(scene: SceneDef): boolean {
  return scene.transition === 'statementReveal'
}

/**
 * Which half of a statement scene is showing.
 *
 * The visual blooms at the scene's statement beat, which is *after* any reveal
 * steps — scene 33 builds its four closing lines first, then lands the final
 * message. Returns null for scenes that are not statement scenes, so components
 * never do beat arithmetic themselves.
 */
export function getStatementPhase(
  scene: SceneDef,
  beat: number,
): StatementPhase | null {
  if (!isStatementScene(scene)) return null

  const { statementBeat } = getBeatLayout(scene)
  if (statementBeat === null) return null

  return beat < statementBeat ? 'sentence' : 'revealed'
}
