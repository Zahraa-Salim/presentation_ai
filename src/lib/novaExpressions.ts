import { NOVA_EMOTIONS } from '@/types'
import type { NovaEmotion } from '@/types'

/**
 * How NOVA expresses each state.
 *
 * Pure data so the character has no switch statements buried in render code,
 * and so coverage is testable the same way transition presets and camera poses
 * are — a missing entry should fail in CI, not on the projector.
 *
 * Meaning never rests on colour alone: every state also differs in lens shape,
 * tilt or motion, so it still reads on a washed-out classroom projector.
 */
export interface NovaExpression {
  /** null inherits the current world accent, keeping NOVA part of the world. */
  hue: string | null
  /** 0 = closed, 1 = wide. */
  lensOpenness: number
  /** Radians. The head-tilt analogue — confusion lives here. */
  lensTilt: number
  ringSpeed: number
  /** Rings drift apart while thinking, draw tight when focused. */
  ringSeparation: number
  bobAmplitude: number
  bobSpeed: number
  /** Core emissive intensity. */
  pulse: number
  /** One-shot mote burst on entering the state. */
  burst: boolean
  /** Blinking is suppressed where the lens is deliberately held. */
  blinks: boolean
}

const SAFE = '#2dd4a7'
const WARN = '#ffb020'
const SAD = '#6f7bb0'

export const NOVA_EXPRESSIONS: Record<NovaEmotion, NovaExpression> = {
  // Resting. Everything calm and centred.
  idle: {
    hue: null,
    lensOpenness: 0.72,
    lensTilt: 0,
    ringSpeed: 0.35,
    ringSeparation: 1,
    bobAmplitude: 0.05,
    bobSpeed: 0.9,
    pulse: 0.6,
    burst: false,
    blinks: true,
  },

  // Drifting more freely — used between moments.
  float: {
    hue: null,
    lensOpenness: 0.68,
    lensTilt: 0.05,
    ringSpeed: 0.25,
    ringSeparation: 1.15,
    bobAmplitude: 0.13,
    bobSpeed: 0.55,
    pulse: 0.55,
    burst: false,
    blinks: true,
  },

  // Attention turned outward, toward the class.
  look: {
    hue: null,
    lensOpenness: 0.85,
    lensTilt: 0.18,
    ringSpeed: 0.4,
    ringSeparation: 0.95,
    bobAmplitude: 0.03,
    bobSpeed: 1.1,
    pulse: 0.65,
    burst: false,
    blinks: true,
  },

  // Held mid-blink; the character settles back to idle on its own.
  blink: {
    hue: null,
    lensOpenness: 0.06,
    lensTilt: 0,
    ringSpeed: 0.35,
    ringSeparation: 1,
    bobAmplitude: 0.05,
    bobSpeed: 0.9,
    pulse: 0.6,
    burst: false,
    blinks: false,
  },

  // Speaking. The core pulses in time with the bubble.
  talk: {
    hue: null,
    lensOpenness: 0.78,
    lensTilt: 0.04,
    ringSpeed: 0.6,
    ringSeparation: 0.9,
    bobAmplitude: 0.07,
    bobSpeed: 2.2,
    pulse: 1.1,
    burst: false,
    blinks: true,
  },

  happy: {
    hue: SAFE,
    lensOpenness: 0.95,
    lensTilt: 0,
    ringSpeed: 1.1,
    ringSeparation: 0.8,
    bobAmplitude: 0.16,
    bobSpeed: 2.4,
    pulse: 1.2,
    burst: false,
    blinks: true,
  },

  // Rings fall out of sync and the lens tips over — legible without colour.
  confused: {
    hue: null,
    lensOpenness: 0.5,
    lensTilt: 0.42,
    ringSpeed: -0.5,
    ringSeparation: 1.45,
    bobAmplitude: 0.09,
    bobSpeed: 0.7,
    pulse: 0.5,
    burst: false,
    blinks: true,
  },

  surprised: {
    hue: null,
    lensOpenness: 1,
    lensTilt: 0,
    ringSpeed: 1.6,
    ringSeparation: 1.6,
    bobAmplitude: 0.02,
    bobSpeed: 0.4,
    pulse: 1.35,
    burst: false,
    blinks: false,
  },

  // Lens narrows, rings separate and slow — visibly working something out.
  thinking: {
    hue: null,
    lensOpenness: 0.3,
    lensTilt: 0.22,
    ringSpeed: 0.18,
    ringSeparation: 1.7,
    bobAmplitude: 0.04,
    bobSpeed: 0.5,
    pulse: 0.45,
    burst: false,
    blinks: false,
  },

  // Used in World 4. Deliberately sharp: fast tight rings, hard pulse.
  warning: {
    hue: WARN,
    lensOpenness: 0.55,
    lensTilt: 0,
    ringSpeed: 2.2,
    ringSeparation: 0.65,
    bobAmplitude: 0.02,
    bobSpeed: 3.2,
    pulse: 1.5,
    burst: false,
    blinks: false,
  },

  // Sinks, dims, and looks down. Nothing about it is fast.
  sad: {
    hue: SAD,
    lensOpenness: 0.22,
    lensTilt: -0.3,
    ringSpeed: 0.1,
    ringSeparation: 0.75,
    bobAmplitude: 0.03,
    bobSpeed: 0.35,
    pulse: 0.3,
    burst: false,
    blinks: false,
  },

  // The only state that bursts — a one-shot effect on every change would be
  // exhausting across 45 minutes.
  celebrate: {
    hue: SAFE,
    lensOpenness: 0.9,
    lensTilt: 0,
    ringSpeed: 2.6,
    ringSeparation: 1.3,
    bobAmplitude: 0.24,
    bobSpeed: 3,
    pulse: 1.6,
    burst: true,
    blinks: true,
  },
}

export function getExpression(emotion: NovaEmotion): NovaExpression {
  return NOVA_EXPRESSIONS[emotion] ?? NOVA_EXPRESSIONS.idle
}

/**
 * Reduced-motion variant: everything that moves is zeroed, everything that
 * carries meaning — lens shape, tilt, hue — survives untouched.
 */
export function toStillExpression(
  expression: NovaExpression,
): NovaExpression {
  return {
    ...expression,
    ringSpeed: 0,
    bobAmplitude: 0,
    bobSpeed: 0,
    burst: false,
    blinks: false,
  }
}

export { NOVA_EMOTIONS }
