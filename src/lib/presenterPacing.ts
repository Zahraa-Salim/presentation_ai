import { SCENES } from '@/data/scenes'

/**
 * Time maths for presenter mode.
 *
 * Pure and dependency-free so the whole pacing model can be exercised in Node —
 * the clock itself is `performance.now()` and an interval, neither of which is
 * worth testing. Everything that could actually be wrong lives here.
 */

/** Either side of this and the badge still reads "on time". */
export const ON_TRACK_TOLERANCE_SEC = 30

export type PacingStatus = 'ahead' | 'onTrack' | 'behind'

export interface PacingView {
  /** Where the presenter should be, in seconds from the start. */
  expectedSec: number
  /** Magnitude only, always ≥ 0 — `status` carries the sign. See below. */
  driftSec: number
  status: PacingStatus
  sceneDurationSec: number
  /** 0..1, clamped. Drives the scene-budget bar. */
  sceneBudgetUsed: number
  sceneOverrun: boolean
}

/*
  Prefix sum built once: PREFIX[i] is the budget for everything before scene i,
  so PREFIX has one more entry than SCENES. Computed at module load rather than
  per tick — this is read once a second for 45 minutes.
*/
const PREFIX: readonly number[] = (() => {
  const sums = [0]
  for (const scene of SCENES) sums.push(sums[sums.length - 1] + scene.durationSec)
  return Object.freeze(sums)
})()

export const TOTAL_BUDGET_SEC = PREFIX[PREFIX.length - 1]

/** Budget for every scene *before* this one. Clamped, so a bad index is safe. */
export function cumulativeBudgetSec(sceneIndex: number): number {
  if (!Number.isFinite(sceneIndex)) return 0
  const clamped = Math.min(Math.max(Math.floor(sceneIndex), 0), SCENES.length)
  return PREFIX[clamped]
}

/**
 * How far ahead or behind the presenter is running.
 *
 *   expected = budget before this scene + min(time in scene, scene's budget)
 *
 * The `min` clamp is the part that matters. Without it the drift sawtooths:
 * it climbs all through a scene, then drops by a whole `durationSec` the moment
 * the scene changes. With it, `expected` grows at exactly the rate `elapsed`
 * grows while you are still inside the scene's budget — so the number sits
 * still while you talk, and only moves when something actually changed.
 *
 * Overrun freezes `expected` and drift climbs, which is correct. Finishing a
 * scene early banks the saved time the instant you move on — the only jump, and
 * it is in the presenter's favour.
 *
 * Read plainly: drift is total time overspent minus total time banked.
 *
 * Navigating backwards lowers the cumulative budget and so reads as suddenly
 * behind. That is correct — you are re-covering material — not a bug.
 */
export function getPacing(input: {
  elapsedSec: number
  sceneIndex: number
  sceneElapsedSec: number
}): PacingView {
  const { elapsedSec, sceneIndex, sceneElapsedSec } = input

  const clampedIndex = Math.min(
    Math.max(Math.floor(sceneIndex) || 0, 0),
    SCENES.length - 1,
  )
  const sceneDurationSec = SCENES[clampedIndex].durationSec
  const inScene = Math.max(sceneElapsedSec, 0)

  const expectedSec =
    cumulativeBudgetSec(clampedIndex) + Math.min(inScene, sceneDurationSec)

  const drift = elapsedSec - expectedSec
  const status: PacingStatus =
    Math.abs(drift) <= ON_TRACK_TOLERANCE_SEC
      ? 'onTrack'
      : drift > 0
        ? 'behind'
        : 'ahead'

  return {
    expectedSec,
    driftSec: Math.abs(drift),
    status,
    sceneDurationSec,
    sceneBudgetUsed: Math.min(inScene / sceneDurationSec, 1),
    sceneOverrun: inScene > sceneDurationSec,
  }
}

/**
 * Seconds as `M:SS`, or `MM:SS` past ten minutes.
 *
 * Deliberately does not roll over to hours: a presenter 25 minutes over needs
 * to read `70:15` at a glance, not `1:10:15`.
 */
export function formatClock(totalSec: number): string {
  const safe = Number.isFinite(totalSec) ? Math.max(Math.floor(totalSec), 0) : 0
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
