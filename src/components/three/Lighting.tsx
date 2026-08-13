import type { QualitySettings } from '@/types'

interface LightingProps {
  quality: QualitySettings
  /** Current world's accent colour, so each world reads differently. */
  accent: string
}

/**
 * The shared light rig.
 *
 * Deliberately cheap: two directional lights and an accent point light. No
 * area lights, no environment maps. Shadows are the expensive part and only
 * run on the high tier.
 */
export function Lighting({ quality, accent }: LightingProps) {
  return (
    <>
      <ambientLight intensity={0.35} />

      <directionalLight
        position={[4, 8, 6]}
        intensity={1.1}
        castShadow={quality.shadows}
      />

      {/* Cool rim from behind, so silhouettes read against the dark background. */}
      <directionalLight position={[-6, 3, -8]} intensity={0.4} color="#4f9dff" />

      {/* Follows the world accent — this is what makes each world feel different. */}
      <pointLight position={[0, 1.5, 4]} intensity={18} distance={30} color={accent} />
    </>
  )
}
