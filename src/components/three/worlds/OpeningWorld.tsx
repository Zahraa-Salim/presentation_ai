import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  type Mesh,
  type MeshStandardMaterial,
  type Points as PointsType,
} from 'three'
import { usePresentation } from '@/hooks/usePresentation'
import { makeRandom, seedFromString } from '@/lib/random'
import type { Scene3DProps } from '@/components/three/sceneRegistry'

/**
 * World 1 opening — the brief's `particle → AI → world reveal`.
 *
 * Beat 0: particles scattered wide, core dormant, near-darkness.
 * Beat 1: particles converge inward, the core ignites, the ring blooms.
 *
 * One eased `formation` value drives all of it, so the whole sequence is a
 * single interpolation rather than a timeline to keep in sync. Positions are
 * precomputed for both states and blended per frame.
 */
export function OpeningWorld({ quality, accent }: Scene3DProps) {
  const { beat } = usePresentation()

  const pointsRef = useRef<PointsType>(null)
  const coreRef = useRef<Mesh>(null)
  const ringRef = useRef<Mesh>(null)
  const formation = useRef(0)

  const count = Math.floor(quality.particleBudget * 0.9)

  // Two position sets: scattered and gathered. Blending between them is
  // cheaper and steadier than simulating attraction every frame.
  const { geometry, scattered, gathered } = useMemo(() => {
    const random = makeRandom(seedFromString('opening'))
    const scatteredPositions = new Float32Array(count * 3)
    const gatheredPositions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const theta = random() * Math.PI * 2
      const phi = Math.acos(2 * random() - 1)

      const farRadius = 14 + random() * 12
      scatteredPositions[i * 3] = farRadius * Math.sin(phi) * Math.cos(theta)
      scatteredPositions[i * 3 + 1] =
        farRadius * Math.sin(phi) * Math.sin(theta) * 0.5
      scatteredPositions[i * 3 + 2] = farRadius * Math.cos(phi)

      // Gathered: a thin shell just outside the core.
      const nearRadius = 2.2 + random() * 1.4
      gatheredPositions[i * 3] = nearRadius * Math.sin(phi) * Math.cos(theta)
      gatheredPositions[i * 3 + 1] =
        nearRadius * Math.sin(phi) * Math.sin(theta) * 0.7
      gatheredPositions[i * 3 + 2] = nearRadius * Math.cos(phi)
    }

    const geo = new BufferGeometry()
    geo.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(scatteredPositions), 3),
    )

    return {
      geometry: geo,
      scattered: scatteredPositions,
      gathered: gatheredPositions,
    }
  }, [count])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((_, delta) => {
    const target = beat >= 1 ? 1 : 0
    const rate = quality.reducedMotion ? 1 : 1 - Math.exp(-2.2 * delta)
    formation.current += (target - formation.current) * rate

    const t = formation.current
    const attribute = geometry.getAttribute('position') as BufferAttribute
    const array = attribute.array as Float32Array

    for (let i = 0; i < array.length; i++) {
      array[i] = scattered[i] + (gathered[i] - scattered[i]) * t
    }
    attribute.needsUpdate = true

    if (pointsRef.current && !quality.reducedMotion) {
      pointsRef.current.rotation.y += delta * 0.03
    }

    if (coreRef.current) {
      const material = coreRef.current.material as MeshStandardMaterial
      material.emissiveIntensity = t * 1.6
      coreRef.current.scale.setScalar(0.2 + t * 0.9)
    }

    if (ringRef.current) {
      ringRef.current.scale.setScalar(0.4 + t * 1.1)
      if (!quality.reducedMotion) ringRef.current.rotation.z += delta * 0.25
    }
  })

  return (
    <group>
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          size={quality.tier === 'low' ? 0.1 : 0.07}
          color={accent}
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>

      <mesh ref={coreRef}>
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      <mesh ref={ringRef} rotation={[Math.PI / 2.2, 0.2, 0]}>
        <torusGeometry args={[2.6, 0.02, 8, 96]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.5}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
