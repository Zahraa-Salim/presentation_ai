import { useMemo } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import {
  detectQualityTier,
  getQualitySettings,
  isQualityTier,
  type HardwareProbe,
} from '@/lib/quality'
import type { QualitySettings, QualityTier } from '@/types'

/**
 * Reads the renderer string the browser is willing to expose.
 * Chrome and Edge still support WEBGL_debug_renderer_info; where it is blocked
 * this returns null and detection falls back to a conservative tier.
 */
function probeRenderer(): string | null {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    if (!gl) return null

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = debugInfo
      ? (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string)
      : gl.getParameter(gl.RENDERER)

    // Release the probe context immediately — browsers cap how many exist.
    gl.getExtension('WEBGL_lose_context')?.loseContext()

    return typeof renderer === 'string' ? renderer : null
  } catch {
    return null
  }
}

function readOverride(): QualityTier | null {
  const value = new URLSearchParams(window.location.search).get('quality')
  return isQualityTier(value) ? value : null
}

/**
 * The session's rendering budget.
 *
 * Probed once and memoised: the tier is deliberately locked so quality never
 * visibly shifts mid-presentation. Override with ?quality=low|medium|high.
 */
export function useQualityTier(): QualitySettings {
  const reducedMotion = useReducedMotion()

  return useMemo(() => {
    const navigatorWithMemory = navigator as Navigator & {
      deviceMemory?: number
    }

    const probe: HardwareProbe = {
      renderer: probeRenderer(),
      cores: navigator.hardwareConcurrency ?? null,
      memoryGb: navigatorWithMemory.deviceMemory ?? null,
      reducedMotion,
      override: readOverride(),
    }

    return getQualitySettings(detectQualityTier(probe), reducedMotion)
    // Intentionally re-derived only when the reduced-motion preference flips.
  }, [reducedMotion])
}
