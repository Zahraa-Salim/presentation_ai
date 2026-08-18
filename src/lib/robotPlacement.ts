import type { RobotCorner } from '@/lib/robotBehavior'

/**
 * Where the companion sits in the frame, as pure maths.
 *
 * Separated from the component for the reason every other calculation in this
 * project is: the suites run in Node with no DOM, and importing an R3F
 * component into one is what tripled the test run time the last time it was
 * tried. Everything here is arithmetic on numbers.
 */

/**
 * How far in front of the camera the companion rides, in world units.
 *
 * **The value is free to choose, which is the point.** Scale is derived from
 * `halfHeight`, and `halfHeight` is proportional to this distance, so it
 * cancels out of the projection entirely:
 *
 *   NDC x    = (halfHeight·aspect·INSET_X) / (d·tan(fov/2)·aspect) = INSET_X
 *   NDC size = (local·halfHeight·HEIGHT_FRACTION) / (d·tan(fov/2))
 *            = local·HEIGHT_FRACTION
 *
 * Neither depends on `d`. So the distance is chosen purely to settle depth
 * ordering: near enough that no world's geometry can ever intersect the
 * companion. The closest camera-to-world distance in the deck is `studyLab` at
 * 8.12 units, so at 3 the margin is more than five units — and
 * `robot.test.ts` recomputes that against `CAMERA_POSES` rather than trusting
 * this comment.
 */
export const ROBOT_DISTANCE = 3

/**
 * Height of the companion as a fraction of the visible frame.
 *
 * A fraction rather than a fixed scale because the deck eases `fov` between 40
 * and 60 across the eleven environments; at a fixed scale the companion would
 * visibly swell and shrink at every world change.
 */
export const HEIGHT_FRACTION = 0.13

/**
 * Corner insets, as a fraction of the half-frame — so they are also NDC
 * coordinates, which is what makes them testable against the screen directly.
 *
 * Chosen to clear both pieces of chrome: `PresentationChrome` runs the full
 * width along the bottom, and `PresenterOverlay` is bottom-centred at up to
 * 46rem. At 1536px that leaves roughly the outer 400px of each side free.
 */
export const INSET_X = 0.82
export const INSET_Y = 0.68

/**
 * Compensation for the scrim, which veils the canvas but not the DOM above it.
 *
 * `scene-scrim` in globals.css is a vertical gradient; at the companion's
 * `INSET_Y` it composites at ~0.412 alpha, so the companion reads at 59% of its
 * intended brightness. 1 / (1 − 0.412) ≈ 1.7 restores it.
 *
 * Derived from that gradient, not chosen by eye — and `robot.test.ts` parses
 * the gradient out of the stylesheet and recomputes it, so retinting the scrim
 * says so rather than quietly leaving the companion mis-lit.
 */
export const SCRIM_COMPENSATION = 1.7

const CORNER_SIGN: Record<RobotCorner, number> = {
  'bottom-right': 1,
  'bottom-left': -1,
}

/** +1 for the right-hand corner, −1 for the left. */
export function cornerSide(corner: RobotCorner = 'bottom-right'): number {
  return CORNER_SIGN[corner]
}

/**
 * Which corner a world's scenes use.
 *
 * Alternating by world means the companion crosses the screen exactly four
 * times in the whole lesson — once per world change — rather than hopping
 * about at random. Rare enough to read as an event, and it always coincides
 * with the moment the class is being taken somewhere new.
 */
export function cornerForWorld(order: number): RobotCorner {
  return order % 2 === 1 ? 'bottom-right' : 'bottom-left'
}

/**
 * How far the companion drifts while it is holding a corner, as a fraction of
 * the half-frame.
 *
 * Small on purpose. This is the difference between a character waiting and an
 * ornament stuck to the glass, and it stops there — anything larger and the
 * corner of the eye starts reporting movement while the presenter is talking.
 */
export const DRIFT_X = 0.05
export const DRIFT_Y = 0.035

/** Peak lift of the arc while crossing between corners. */
export const FLIGHT_ARC = 0.22

/**
 * The idle wander, as unit values in −1 … 1.
 *
 * Two sines at unrelated frequencies, so the path never visibly repeats. Pure
 * and time-based rather than random, so it is identical in rehearsal and on
 * the day — the same reason everything else in this deck is seeded.
 */
export function getRobotDrift(timeSec: number): { x: number; y: number } {
  return {
    x: Math.sin(timeSec * 0.31),
    y: Math.sin(timeSec * 0.47 + 1.3),
  }
}

/**
 * Height of the arc at a given point of a crossing.
 *
 * `side` runs from one corner to the other through zero, so this peaks exactly
 * halfway: the companion lifts as it leaves, and settles as it arrives. It is
 * what makes the move read as flying rather than sliding along the floor.
 */
export function getFlightArc(side: number): number {
  return Math.max(0, 1 - Math.abs(side)) * FLIGHT_ARC
}

export interface RobotPlacement {
  /** Camera-space offsets, in world units. */
  x: number
  y: number
  z: number
  scale: number
}

/**
 * Camera-space placement for a given frame shape.
 *
 * The caller applies these relative to the camera's own transform, which is
 * what keeps the companion pinned to the frame while the world slides past.
 */
export interface RobotMotion {
  /** −1 … 1. Between the two corners; intermediate values are mid-flight. */
  side: number
  scaleMultiplier?: number
  /** Unit drift from getRobotDrift. Omit for none. */
  drift?: { x: number; y: number }
}

export function getRobotPlacement(
  fov: number,
  aspect: number,
  motion: RobotMotion,
): RobotPlacement {
  const halfHeight = Math.tan((fov * Math.PI) / 360) * ROBOT_DISTANCE
  const halfWidth = halfHeight * aspect
  const drift = motion.drift ?? { x: 0, y: 0 }

  return {
    x: halfWidth * (INSET_X * motion.side + DRIFT_X * drift.x),
    // The arc lifts, so it always moves the companion away from the chrome
    // along the bottom rather than toward it.
    y:
      halfHeight *
      (-INSET_Y + DRIFT_Y * drift.y + getFlightArc(motion.side)),
    z: -ROBOT_DISTANCE,
    scale: halfHeight * HEIGHT_FRACTION * (motion.scaleMultiplier ?? 1),
  }
}

/**
 * Where the companion lands on screen, in normalised device coordinates
 * (−1 … 1, y up). Exists so the tests can assert screen position and apparent
 * size directly, rather than re-deriving the projection and possibly repeating
 * whatever mistake the implementation made.
 */
export function projectRobot(
  fov: number,
  aspect: number,
  motion: RobotMotion = { side: 1 },
): { ndcX: number; ndcY: number; ndcHeight: number } {
  const placement = getRobotPlacement(fov, aspect, motion)
  const halfHeight = Math.tan((fov * Math.PI) / 360) * ROBOT_DISTANCE

  return {
    ndcX: placement.x / (halfHeight * aspect),
    ndcY: placement.y / halfHeight,
    // Expressed per unit of local model height.
    ndcHeight: placement.scale / halfHeight,
  }
}
