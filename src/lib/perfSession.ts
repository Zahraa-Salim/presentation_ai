import type { WorldId } from '@/types'

/**
 * Per-world frame-rate accumulation for the rehearsal.
 *
 * A rehearsal instrument, not a presentation feature — nothing here runs unless
 * the build is DEV or the URL carries `?perf=1`.
 *
 * Held in module scope for the same reason as `presenterSession.ts`: the
 * presenter is talking for 45 minutes and cannot also be reading a corner
 * readout, so the run has to record itself — but accumulating a sample a second
 * into React state would reconcile `ExperienceCanvas` and the whole 3D tree
 * 2700 times over the lesson. Only the summary *view* renders, and only when
 * the presenter opens it.
 *
 * The averages are unweighted across one-second windows, which is what a
 * once-a-second sampler can honestly claim. `minFps` and `worstFrameMs` are the
 * numbers that actually matter: a world that averages 58 but drops to 24 at a
 * transition is a world with a stutter, and the average hides it.
 */

/**
 * Longest gap that can still be a rendered frame, in seconds.
 *
 * Nothing in this deck takes a second to draw — the worst real hitch measured
 * is about 113ms. A gap past this means the browser stopped drawing entirely:
 * the tab went to the background, the laptop idled, or the window was hidden.
 * requestAnimationFrame simply pauses, and the first frame back reports the
 * whole absence as one `delta`.
 *
 * Recorded rather than discarded, that produced a 198-second "worst frame" and
 * a minimum of 0 fps in the first rehearsal — numbers that look like a
 * catastrophic stall and mean only that someone alt-tabbed.
 *
 * The cost of the threshold is that a genuine freeze longer than a second is
 * thrown away too. That is the right trade: a freeze that long is not something
 * a summary table needs to tell you about, because you will have watched it
 * happen.
 */
export const MAX_PLAUSIBLE_FRAME_SEC = 1

/** False when the browser stopped drawing rather than drew slowly. */
export function isPlausibleFrame(deltaSec: number): boolean {
  return deltaSec > 0 && deltaSec <= MAX_PLAUSIBLE_FRAME_SEC
}

export interface WorldPerfStats {
  worldId: WorldId
  /** One-second windows recorded in this world. */
  samples: number
  avgFps: number
  minFps: number
  maxFps: number
  /** Longest single frame seen, in milliseconds. */
  worstFrameMs: number
  /** Highest draw-call count seen — the lever that usually explains the rest. */
  maxCalls: number
}

interface Accumulator {
  samples: number
  fpsTotal: number
  minFps: number
  maxFps: number
  worstFrameMs: number
  maxCalls: number
}

export interface PerfObservation {
  fps: number
  worstFrameMs: number
  calls: number
}

const worlds = new Map<WorldId, Accumulator>()

export function recordPerfSample(
  worldId: WorldId,
  observation: PerfObservation,
): void {
  const existing = worlds.get(worldId)

  if (!existing) {
    worlds.set(worldId, {
      samples: 1,
      fpsTotal: observation.fps,
      minFps: observation.fps,
      maxFps: observation.fps,
      worstFrameMs: observation.worstFrameMs,
      maxCalls: observation.calls,
    })
    return
  }

  existing.samples += 1
  existing.fpsTotal += observation.fps
  existing.minFps = Math.min(existing.minFps, observation.fps)
  existing.maxFps = Math.max(existing.maxFps, observation.fps)
  existing.worstFrameMs = Math.max(existing.worstFrameMs, observation.worstFrameMs)
  existing.maxCalls = Math.max(existing.maxCalls, observation.calls)
}

/**
 * Insertion-ordered, which is traversal order — the presenter reads the table
 * in the order they walked the deck, not alphabetically.
 */
export function readPerfSummary(): WorldPerfStats[] {
  return [...worlds.entries()].map(([worldId, acc]) => ({
    worldId,
    samples: acc.samples,
    // One decimal: the difference between 57.4 and 58.2 is the difference
    // between "fine" and "fine", and rounding to integers hides neither.
    avgFps: Math.round((acc.fpsTotal / acc.samples) * 10) / 10,
    minFps: acc.minFps,
    maxFps: acc.maxFps,
    worstFrameMs: Math.round(acc.worstFrameMs * 10) / 10,
    maxCalls: acc.maxCalls,
  }))
}

export function resetPerfSession(): void {
  worlds.clear()
}

/**
 * Plain text for pasting into the rehearsal notes. Deliberately not JSON: this
 * gets read by a person immediately after a 45-minute run, and the point is
 * that the bad row is visible without parsing anything.
 */
export function formatPerfSummary(
  stats: readonly WorldPerfStats[],
  context: string,
): string {
  if (stats.length === 0) return 'No frames recorded.'

  const header = ['world', 'avg', 'min', 'max', 'worst ms', 'calls', 'samples']
  const rows = stats.map((s) => [
    s.worldId,
    String(s.avgFps),
    String(s.minFps),
    String(s.maxFps),
    String(s.worstFrameMs),
    String(s.maxCalls),
    String(s.samples),
  ])

  const widths = header.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => r[i].length)),
  )
  const line = (cells: string[]) =>
    cells.map((c, i) => c.padEnd(widths[i])).join('  ').trimEnd()

  return [context, '', line(header), ...rows.map(line)].join('\n')
}
