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
export function getRobotPlacement(
  fov: number,
  aspect: number,
  corner: RobotCorner = 'bottom-right',
  scaleMultiplier = 1,
): RobotPlacement {
  const halfHeight = Math.tan((fov * Math.PI) / 360) * ROBOT_DISTANCE
  const halfWidth = halfHeight * aspect

  return {
    x: halfWidth * INSET_X * CORNER_SIGN[corner],
    y: -halfHeight * INSET_Y,
    z: -ROBOT_DISTANCE,
    scale: halfHeight * HEIGHT_FRACTION * scaleMultiplier,
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
  corner: RobotCorner = 'bottom-right',
  scaleMultiplier = 1,
): { ndcX: number; ndcY: number; ndcHeight: number } {
  const placement = getRobotPlacement(fov, aspect, corner, scaleMultiplier)
  const halfHeight = Math.tan((fov * Math.PI) / 360) * ROBOT_DISTANCE

  return {
    ndcX: placement.x / (halfHeight * aspect),
    ndcY: placement.y / halfHeight,
    // Expressed per unit of local model height.
    ndcHeight: placement.scale / halfHeight,
  }
}
