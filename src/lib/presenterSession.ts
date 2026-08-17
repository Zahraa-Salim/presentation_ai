/**
 * The presenter's session clock.
 *
 * Elapsed time is not React state — it is a reading of two timestamps. Holding
 * them in module scope means the clock keeps accumulating while the overlay is
 * closed, and can be started without rendering anything: a `setState` here
 * would re-render App and, with it, the whole 3D canvas.
 *
 * `performance.now()` rather than `Date.now()` — monotonic, so a clock
 * correction part-way through the lesson cannot make the timer jump.
 *
 * Every mutator is idempotent, so React StrictMode's double-invoked effects are
 * harmless.
 */

let startedAtMs: number | null = null
let sceneEnteredAtMs: number | null = null

export interface PresenterSessionReading {
  isRunning: boolean
  /** Whole seconds since the session started. */
  elapsedSec: number
  /** Whole seconds since the current scene was entered. */
  sceneElapsedSec: number
}

/**
 * Starts the clock on the presenter's first navigation.
 *
 * Not on page load: the deck usually sits on the projector while the class
 * settles, and arriving six minutes "behind" before you have spoken makes the
 * pacing badge worthless for the rest of the session. Not on `P` either —
 * checking your notes beforehand should not start anything.
 */
export function startPresenterSessionIfIdle(): void {
  if (startedAtMs !== null) return
  const now = performance.now()
  startedAtMs = now
  sceneEnteredAtMs = now
}

/** Restart at zero, still running. The escape hatch for a clock started early. */
export function resetPresenterSession(): void {
  const now = performance.now()
  startedAtMs = now
  sceneEnteredAtMs = now
}

export function markSceneEntered(): void {
  if (startedAtMs === null) return
  sceneEnteredAtMs = performance.now()
}

export function readPresenterSession(): PresenterSessionReading {
  if (startedAtMs === null) {
    return { isRunning: false, elapsedSec: 0, sceneElapsedSec: 0 }
  }

  const now = performance.now()
  return {
    isRunning: true,
    elapsedSec: Math.floor((now - startedAtMs) / 1000),
    sceneElapsedSec: Math.floor((now - (sceneEnteredAtMs ?? startedAtMs)) / 1000),
  }
}
