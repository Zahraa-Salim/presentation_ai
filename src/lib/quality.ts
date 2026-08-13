import { QUALITY_TIERS } from '@/types'
import type { QualitySettings, QualityTier } from '@/types'

/**
 * Rendering budget for unknown hardware.
 *
 * The presentation laptop is not finalised, so the tier is probed once at boot
 * and then locked for the session. Quality visibly changing mid-lesson reads to
 * a classroom as the machine struggling, which is worse than running
 * consistently at a lower setting.
 *
 * Pure functions, no browser APIs — the hook collects the probe, this decides.
 */

export interface HardwareProbe {
  /** WEBGL_debug_renderer_info string, when the browser exposes it. */
  renderer: string | null
  /** navigator.hardwareConcurrency */
  cores: number | null
  /** navigator.deviceMemory, in GB */
  memoryGb: number | null
  reducedMotion: boolean
  /** ?quality=low|medium|high */
  override: QualityTier | null
}

/** Software rasterisers — no real GPU behind them. */
const SOFTWARE_RENDERERS = [
  'swiftshader',
  'llvmpipe',
  'software',
  'microsoft basic render',
  'mesa offscreen',
]

/** Integrated graphics common in school laptops. Capable, but not fast. */
const WEAK_INTEGRATED = [
  'intel hd',
  'intel(r) hd',
  'uhd graphics',
  'intel uhd',
  'hd graphics',
  'gma',
  'apple m1', // fine, but shares memory bandwidth — cap rather than assume
]

const RANK: Record<QualityTier, number> = { low: 0, medium: 1, high: 2 }

const lower = (tier: QualityTier, cap: QualityTier): QualityTier =>
  RANK[tier] <= RANK[cap] ? tier : cap

export function isQualityTier(value: unknown): value is QualityTier {
  return (
    typeof value === 'string' &&
    (QUALITY_TIERS as readonly string[]).includes(value)
  )
}

/**
 * Picks a tier from whatever signals the browser gave us.
 *
 * Every signal is optional: on a locked-down browser the renderer string is
 * hidden and deviceMemory is undefined, so unknown inputs must degrade to a
 * safe middle rather than throw or assume the best.
 */
export function detectQualityTier(probe: HardwareProbe): QualityTier {
  // An explicit choice always wins, including over reduced motion — it is how
  // the presenter forces a known-good setting on the actual machine.
  if (probe.override) return probe.override

  if (probe.reducedMotion) return 'low'

  const renderer = probe.renderer?.toLowerCase() ?? ''

  if (SOFTWARE_RENDERERS.some((marker) => renderer.includes(marker))) {
    return 'low'
  }

  // No renderer string is not evidence of a good GPU — start conservative.
  let tier: QualityTier = renderer === '' ? 'medium' : 'high'

  if (WEAK_INTEGRATED.some((marker) => renderer.includes(marker))) {
    tier = lower(tier, 'medium')
  }

  if (probe.cores !== null) {
    if (probe.cores <= 2) tier = lower(tier, 'low')
    else if (probe.cores <= 4) tier = lower(tier, 'medium')
  }

  if (probe.memoryGb !== null) {
    if (probe.memoryGb <= 2) tier = lower(tier, 'low')
    else if (probe.memoryGb <= 4) tier = lower(tier, 'medium')
  }

  return tier
}

const TIER_SETTINGS: Record<
  QualityTier,
  Omit<QualitySettings, 'tier' | 'reducedMotion'>
> = {
  low: {
    dpr: [1, 1],
    particleBudget: 400,
    postProcessing: false,
    shadows: false,
  },
  medium: {
    dpr: [1, 1.5],
    particleBudget: 1200,
    postProcessing: false,
    shadows: false,
  },
  high: {
    dpr: [1, 2],
    particleBudget: 3000,
    // Deferred: bloom costs 4-8ms/frame on integrated graphics, half a 60fps
    // budget spent before drawing anything. Glow comes from emissive materials
    // and additive sprites instead. A specific scene can turn this on later.
    postProcessing: false,
    shadows: true,
  },
}

export function getQualitySettings(
  tier: QualityTier,
  reducedMotion: boolean,
): QualitySettings {
  return { tier, reducedMotion, ...TIER_SETTINGS[tier] }
}
