import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type Points as PointsType,
} from 'three'
import { INTERACTION_BY_ID } from '@/data/interactions'
import { usePresentation } from '@/hooks/usePresentation'
import { useBlendedPositions } from '@/hooks/useBlendedPositions'
import { makeRandom, seedFromString } from '@/lib/random'
import { getVaultSeparation } from '@/lib/vaultState'
import type { Scene3DProps } from '@/components/three/sceneRegistry'

/**
 * World 4 — the Privacy Vault.
 *
 * The one place in the deck where the 3D is the lesson rather than its
 * backdrop: information drifts around a vault, and when the class decides,
 * the safe items pass through the barrier while the rest are pushed back out.
 * Nobody has to say "this is what happens to your password" — it is on screen.
 *
 * Which items go in and which are stopped is read from the Privacy Sorter's own
 * data, not duplicated here. Change `correct` on an item in interactions.ts and
 * this follows, so the two can never disagree in front of a class.
 *
 * The separation is driven by the beat, not by the sorter's local selections:
 * 3D reads the presentation state and nothing else, the same way every other
 * world does. The payoff lands when the presenter reveals it.
 */

const VAULT_RADIUS = 1.05
const BARRIER_RADIUS = 2.1
/** Motes per sorter item — enough to read as a cluster, cheap enough to ignore. */
const MOTES_PER_ITEM = 26

export function PrivacyVaultWorld({ quality, accent }: Scene3DProps) {
  const { scene, beat } = usePresentation()

  const groupRef = useRef<Group>(null)
  const pointsRef = useRef<PointsType>(null)
  const barrierRef = useRef<Mesh>(null)

  const items = INTERACTION_BY_ID['privacy-sorter'].options

  const { drifting, sorted } = useMemo(() => {
    const random = makeRandom(seedFromString('privacyVault'))
    const count = items.length * MOTES_PER_ITEM
    const driftingPositions = new Float32Array(count * 3)
    const sortedPositions = new Float32Array(count * 3)

    items.forEach((item, itemIndex) => {
      // Each item keeps its own arc of the sphere, so a cluster stays a cluster
      // through the blend instead of the whole cloud reshuffling.
      const arc = (itemIndex / items.length) * Math.PI * 2

      for (let m = 0; m < MOTES_PER_ITEM; m++) {
        const i = itemIndex * MOTES_PER_ITEM + m

        const theta = arc + (random() - 0.5) * 0.5
        const phi = Math.acos(2 * random() - 1)
        const jitter = 0.85 + random() * 0.3

        // Drifting: everything outside, undifferentiated. This is the state a
        // student arrives in — nothing has been decided about any of it.
        const wander = BARRIER_RADIUS * 1.35 * jitter
        driftingPositions[i * 3] = Math.sin(phi) * Math.cos(theta) * wander
        driftingPositions[i * 3 + 1] = Math.cos(phi) * wander * 0.6
        driftingPositions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * wander

        // Sorted: safe items inside the vault, the rest pushed well beyond the
        // barrier — far enough that the gap is unmistakable at the back of a
        // classroom, which is the only distance that matters.
        const radius = item.correct
          ? VAULT_RADIUS * 0.72 * jitter
          : BARRIER_RADIUS * 1.9 * jitter

        sortedPositions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius
        sortedPositions[i * 3 + 1] = Math.cos(phi) * radius * 0.6
        sortedPositions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius
      }
    })

    return { drifting: driftingPositions, sorted: sortedPositions }
  }, [items])

  const { geometry, formation } = useBlendedPositions({
    from: drifting,
    to: sorted,
    target: getVaultSeparation(scene.id, beat),
    speed: 1.6,
    reducedMotion: quality.reducedMotion,
  })

  useFrame((state, delta) => {
    const separation = formation.current

    if (groupRef.current && !quality.reducedMotion) {
      // Slow enough to stay behind the reading, present enough to feel closed.
      groupRef.current.rotation.y += delta * 0.04
    }

    if (barrierRef.current) {
      const material = barrierRef.current.material as MeshBasicMaterial
      // The barrier asserts itself exactly when it is doing something.
      material.opacity =
        0.06 +
        separation * 0.16 +
        (quality.reducedMotion
          ? 0
          : Math.sin(state.clock.elapsedTime * 1.4) * 0.02)
    }
  })

  return (
    <group ref={groupRef}>
      {/* The vault. Closed in every scene — it is not a container you open. */}
      <mesh>
        <icosahedronGeometry args={[VAULT_RADIUS, 0]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.7}
          roughness={0.3}
          metalness={0.55}
          flatShading
        />
      </mesh>

      {/* The barrier — what the unsafe items do not get through. */}
      <mesh ref={barrierRef}>
        <sphereGeometry args={[BARRIER_RADIUS, 32, 24]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.06}
          blending={AdditiveBlending}
          depthWrite={false}
          side={2}
        />
      </mesh>

      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          size={quality.tier === 'low' ? 0.08 : 0.055}
          color={accent}
          transparent
          opacity={0.85}
          sizeAttenuation
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  )
}
