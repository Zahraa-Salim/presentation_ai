/**
 * Rendering quality tiers.
 *
 * The presentation laptop's GPU is unknown, so every 3D system reads its
 * budget from here instead of hard-coding counts. Detected automatically,
 * overridable by the presenter, and forced to 'low' when the user has
 * prefers-reduced-motion enabled.
 */
export const QUALITY_TIERS = ['low', 'medium', 'high'] as const

export type QualityTier = (typeof QUALITY_TIERS)[number]

export interface QualitySettings {
  tier: QualityTier
  /** Clamped device pixel ratio — the single biggest fill-rate lever. */
  dpr: [number, number]
  /** Upper bound on particles in any one scene. */
  particleBudget: number
  /** Bloom and other post-processing. Off by default on weak hardware. */
  postProcessing: boolean
  shadows: boolean
  /** Damp camera movement and heavy transitions. */
  reducedMotion: boolean
}
