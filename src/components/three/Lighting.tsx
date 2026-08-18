import type { QualitySettings } from '@/types'

interface LightingProps {
  quality: QualitySettings
}

/**
 * The shared light rig — the part that is the same everywhere.
 *
 * Deliberately cheap: ambient plus two directional lights. No area lights, no
 * environment maps. Shadows are the expensive part and only run on the high
 * tier.
 *
 * ⚠️ **The directional lights must stay at the canvas root.** A directional
 * light shines from its position toward its target, and the target defaults to
 * the world origin. The environments are laid out along X out to x = 110, so
 * moving these inside a scene's anchor group would leave their target at the
 * origin and swing their direction from "above and in front" to almost
 * entirely −X. Every world past AI Lab would be lit edge-on.
 *
 * The accent light is a *point* light, which is positional, and it does travel
 * — see AccentLight below.
 */
export function Lighting({ quality }: LightingProps) {
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
    </>
  )
}

/**
 * The world accent light — what makes each environment feel like its own place.
 *
 * **Must be rendered inside the scene's anchor group.** It used to sit at the
 * canvas root at a fixed world position with a 30-unit falloff, while the
 * environments run from x = 0 to x = 110. Study Lab, Privacy and Future City
 * are all well past that reach, so for 23 of the 33 scenes this light — the one
 * carrying the world's colour — contributed nothing at all. Rendered inside the
 * group, its position is local and it travels with the scene, which is what the
 * original comment always claimed it did.
 *
 * `worlds.test.ts` keeps it there.
 */
export function AccentLight({ accent }: { accent: string }) {
  return (
    <pointLight position={[0, 1.5, 4]} intensity={18} distance={30} color={accent} />
  )
}
