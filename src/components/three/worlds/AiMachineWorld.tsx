import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  type Mesh,
  type MeshStandardMaterial,
  type Points as PointsType,
} from 'three'
import { usePresentation } from '@/hooks/usePresentation'
import { useBlendedPositions } from '@/hooks/useBlendedPositions'
import { getPromptFocus } from '@/lib/promptFocus'
import { makeRandom, seedFromString } from '@/lib/random'
import type { Scene3DProps } from '@/components/three/sceneRegistry'

/**
 * World 3 — the AI Machine, for the prompting scenes.
 *
 * A prompt enters on the inline-start side, passes through the machine, and
 * comes out the other end. The machine never changes. Only the output does:
 * scattered wide when the question was vague, gathered onto the target once it
 * has been given Context, Goal, Constraints and Output.
 *
 * That constancy is the argument. Scene 17's line is `نفس AI. بس السؤال صار
 * أوضح.` — if the machine visibly improved too, the 3D would be contradicting
 * the sentence underneath it.
 *
 * Two precomputed point sets blended by one value, so no simulation and no
 * per-frame allocation. See useBlendedPositions.
 */

/** Where the beam ends. The output plane sits here. */
const OUTPUT_X = -3.6
/** Where the prompt enters. */
const INPUT_X = 3.6

export function AiMachineWorld({ quality, accent }: Scene3DProps) {
  const { scene, beat } = usePresentation()

  const pointsRef = useRef<PointsType>(null)
  const coreRef = useRef<Mesh>(null)

  const count = Math.floor(quality.particleBudget * 0.7)

  const { scattered, focused } = useMemo(() => {
    const random = makeRandom(seedFromString('aiMachine'))
    const scatteredPositions = new Float32Array(count * 3)
    const focusedPositions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      // Travel is along X, from input to output. Each particle keeps its place
      // in the queue in both states, so the blend reads as the same stream
      // tightening rather than as one cloud swapped for another.
      const progress = i / count
      const x = INPUT_X + (OUTPUT_X - INPUT_X) * progress

      // Spread grows with distance travelled: at the machine everything is
      // still together, and the difference only shows in what comes out.
      const angle = random() * Math.PI * 2
      const wide = 2.6 * progress * (0.35 + 0.65 * random())
      const tight = 0.16 * progress * (0.4 + 0.6 * random())

      scatteredPositions[i * 3] = x
      scatteredPositions[i * 3 + 1] = Math.sin(angle) * wide
      scatteredPositions[i * 3 + 2] = Math.cos(angle) * wide * 0.6

      focusedPositions[i * 3] = x
      focusedPositions[i * 3 + 1] = Math.sin(angle) * tight
      focusedPositions[i * 3 + 2] = Math.cos(angle) * tight * 0.6
    }

    return { scattered: scatteredPositions, focused: focusedPositions }
  }, [count])

  const { geometry, formation } = useBlendedPositions({
    from: scattered,
    to: focused,
    target: getPromptFocus(scene.id, beat),
    speed: 2.4,
    reducedMotion: quality.reducedMotion,
  })

  useFrame((_, delta) => {
    const focus = formation.current

    if (pointsRef.current && !quality.reducedMotion) {
      // The stream churns while it is unfocused and steadies as it lands.
      pointsRef.current.rotation.x += delta * 0.35 * (1 - focus)
    }

    if (coreRef.current) {
      const material = coreRef.current.material as MeshStandardMaterial
      material.emissiveIntensity = 0.5 + focus * 1.6
    }
  })

  return (
    <group>
      {/* The machine. Identical in every scene — see the doc above. */}
      <mesh ref={coreRef}>
        <boxGeometry args={[1.1, 1.1, 1.1]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.5}
          roughness={0.35}
          metalness={0.5}
          wireframe
        />
      </mesh>

      {/* Where the prompt goes in. */}
      <mesh position={[INPUT_X, 0, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={1.2}
          roughness={0.3}
        />
      </mesh>

      {/* The target the output is trying to land on. */}
      <mesh position={[OUTPUT_X, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <ringGeometry args={[0.5, 0.56, 40]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.5}
          blending={AdditiveBlending}
          depthWrite={false}
          side={2}
        />
      </mesh>

      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          size={quality.tier === 'low' ? 0.07 : 0.045}
          color={accent}
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  )
}
