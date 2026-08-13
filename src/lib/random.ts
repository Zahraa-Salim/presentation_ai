/**
 * Deterministic pseudo-random numbers for procedural scenes.
 *
 * Two reasons this is seeded rather than using Math.random():
 *  - The presentation should look identical every run. A particle field that
 *    reshuffles between rehearsal and the real lesson is not reviewable.
 *  - Math.random() during render is non-idempotent, so React's purity rules
 *    correctly reject it.
 *
 * mulberry32 — small, fast, good enough for scattering points.
 */
export function makeRandom(seed: number): () => number {
  let state = seed >>> 0

  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Stable seed from a string, so each scene scatters differently but repeatably. */
export function seedFromString(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}
