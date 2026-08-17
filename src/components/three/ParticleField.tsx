import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  type Points as PointsType,
} from 'three'
import { makeRandom } from '@/lib/random'
import type { QualitySettings } from '@/types'

interface ParticleFieldProps {
  quality: QualitySettings
  color: string
  /** Fraction of the tier's particle budget to use, 0..1. */
  density?: number
  /** Radius of the cloud. */
  spread?: number
  center?: [number, number, number]
  /** Scatter seed — same seed gives the same field every run. */
  seed?: number
}

/**
 * One additive point cloud.
 *
 * A single THREE.Points draw call rather than one mesh per particle, and the
 * count comes from the quality budget rather than a hard-coded number — this
 * is the component most likely to sink frame rate on integrated graphics.
 */
export function ParticleField({
  quality,
  color,
  density = 1,
  spread = 18,
  center = [0, 0, 0],
  seed = 1337,
}: ParticleFieldProps) {
  const pointsRef = useRef<PointsType>(null)

  const count = Math.max(1, Math.floor(quality.particleBudget * density))

  /*
    Depended on as three numbers, not as the array.

    `center` is an array literal at every call site, so it is a fresh reference
    on every render — and ExperienceCanvas re-renders on every beat. With the
    array in the dependency list this useMemo missed every single time: each key
    press allocated a new Float32Array, built a geometry, uploaded it and threw
    the old one away. PlaceholderScene backs eight of the twelve environments,
    so that was most of the deck, for the whole 45 minutes.
  */
  const [centerX, centerY, centerZ] = center

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    // Seeded, so the field looks identical in rehearsal and on the day.
    const random = makeRandom(seed)

    for (let i = 0; i < count; i++) {
      // Spherical distribution, biased outward so the middle stays readable —
      // Arabic text sits over this area in the DOM layer.
      const radius = spread * (0.35 + 0.65 * Math.cbrt(random()))
      const theta = random() * Math.PI * 2
      const phi = Math.acos(2 * random() - 1)

      positions[i * 3] = centerX + radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] =
        centerY + radius * Math.sin(phi) * Math.sin(theta) * 0.45
      positions[i * 3 + 2] = centerZ + radius * Math.cos(phi)
    }

    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(positions, 3))
    return geo
  }, [count, spread, centerX, centerY, centerZ, seed])

  // Manually created geometry is not auto-disposed. This runs for 45 minutes
  // straight, so a leak here accumulates across every scene change.
  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((_, delta) => {
    if (!pointsRef.current || quality.reducedMotion) return
    // Mutating the ref, never setState — this is a per-frame path.
    pointsRef.current.rotation.y += delta * 0.02
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={quality.tier === 'low' ? 0.09 : 0.06}
        color={color}
        transparent
        opacity={0.75}
        sizeAttenuation
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
