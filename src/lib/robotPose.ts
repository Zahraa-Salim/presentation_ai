import {
  getExpression,
  toStillExpression,
  type NovaExpression,
} from '@/lib/novaExpressions'
import type { NovaEmotion } from '@/types'

/**
 * How each of NOVA's twelve states reads on a body.
 *
 * The expressions in `novaExpressions.ts` were written for an abstract form —
 * a lens and two orbit rings. This translates them for a character with a head,
 * eyes and limbs **without inventing a second set of states**: every field below
 * is derived from an existing one, so the twelve stay exactly as distinguishable
 * as `nova.test.ts` already proves them to be, and reduced motion keeps working
 * through the same `toStillExpression`.
 *
 * The two translations worth naming, because they are not obvious:
 *
 * - `ringSeparation` becomes **arm spread**. Rings drifting apart while thinking
 *   becomes arms opening out; rings drawing tight under warning becomes arms
 *   tucked in. Same idea, same numbers, legible on a body.
 * - `ringSpeed` becomes **sway speed**, and its sign survives: `confused` is the
 *   one state with a negative ring speed, and it becomes the one state that
 *   sways the wrong way.
 *
 * Pure, so the twelve can be tested without mounting anything.
 */
export interface RobotPose {
  /** 0 = shut, 1 = wide. Drives the eyes' vertical scale. */
  eyeOpenness: number
  /** Radians. Head tilt — this is where confusion lives. */
  headTilt: number
  /** Radians away from the body. Arms out when open, tucked when sharp. */
  armSpread: number
  /** Signed. Negative sways the wrong way, which is the point on `confused`. */
  swaySpeed: number
  bobAmplitude: number
  bobSpeed: number
  /** Emissive strength of the eyes and the antenna bulb. */
  glow: number
  /** null inherits the world accent, keeping the character part of the world. */
  hue: string | null
  burst: boolean
  blinks: boolean
}

/** Arms rest slightly out from the body even when fully tucked. */
const ARM_REST = 0.16
/** How far a unit of ring separation opens the arms, in radians. */
const ARM_SPREAD_PER_UNIT = 0.42

export function toRobotPose(expression: NovaExpression): RobotPose {
  return {
    eyeOpenness: expression.lensOpenness,
    headTilt: expression.lensTilt,
    armSpread: ARM_REST + expression.ringSeparation * ARM_SPREAD_PER_UNIT,
    swaySpeed: expression.ringSpeed,
    bobAmplitude: expression.bobAmplitude,
    bobSpeed: expression.bobSpeed,
    glow: expression.pulse,
    hue: expression.hue,
    burst: expression.burst,
    blinks: expression.blinks,
  }
}

/**
 * The pose for an emotion, already stilled if the viewer asked for that.
 *
 * Reduced motion keeps everything that carries meaning — eye shape, head tilt,
 * arm spread, hue, glow — and drops everything that only moves. A completely
 * still character is still a legible one.
 */
export function getRobotPose(
  emotion: NovaEmotion,
  reducedMotion = false,
): RobotPose {
  const expression = getExpression(emotion)
  return toRobotPose(reducedMotion ? toStillExpression(expression) : expression)
}
