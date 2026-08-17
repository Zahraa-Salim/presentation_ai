import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  type Group,
  type Points as PointsType,
} from 'three'
import { AI_PIPELINE } from '@/data/aiPipeline'
import { usePresentation } from '@/hooks/usePresentation'
import { useBlendedPositions } from '@/hooks/useBlendedPositions'
import { getBeatLayout } from '@/lib/beats'
import { getMindFormation } from '@/lib/mindFormation'
import { makeRandom, seedFromString } from '@/lib/random'
import type { Scene3DProps } from '@/components/three/sceneRegistry'

/**
 * World 2 — the AI Mind.
 *
 * A brain-like cloud that comes apart into a cold lattice of tokens and
 * weights. This is the one place in the deck where the 3D makes the argument
 * rather than illustrating it: leaving a brain on screen would assert that AI
 * thinks, while the narration says it does not.
 *
 * Two precomputed point sets blended by one eased value — the same technique
 * as OpeningWorld, so no simulation and no per-frame allocation.
 */
export function AiMindWorld({ quality, accent }: Scene3DProps) {
  const { scene, beat } = usePresentation()

  const pointsRef = useRef<PointsType>(null)
  const nodesRef = useRef<Group>(null)

  const count = Math.floor(quality.particleBudget * 0.85)
  const span = 9

  const { brain, lattice } = useMemo(() => {
    const random = makeRandom(seedFromString('aiMind'))
    const brainPositions = new Float32Array(count * 3)
    const latticePositions = new Float32Array(count * 3)

    // A lattice wide enough to hold every point in a regular grid.
    const perAxis = Math.ceil(Math.cbrt(count))

    for (let i = 0; i < count; i++) {
      // ---- brain: two clustered lobes, organic and irregular -------------
      const lobe = random() < 0.5 ? -1 : 1
      const r = 2.4 * Math.cbrt(random())
      const theta = random() * Math.PI * 2
      const phi = Math.acos(2 * random() - 1)

      brainPositions[i * 3] =
        lobe * 1.15 + r * Math.sin(phi) * Math.cos(theta) * 1.15
      brainPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.95
      brainPositions[i * 3 + 2] = r * Math.cos(phi) * 0.85

      // ---- lattice: a regular grid, unmistakably machinery ---------------
      const gx = i % perAxis
      const gy = Math.floor(i / perAxis) % perAxis
      const gz = Math.floor(i / (perAxis * perAxis))
      const step = span / perAxis

      latticePositions[i * 3] = (gx - perAxis / 2) * step
      latticePositions[i * 3 + 1] = (gy - perAxis / 2) * step * 0.55
      latticePositions[i * 3 + 2] = (gz - perAxis / 2) * step * 0.55
    }

    return { brain: brainPositions, lattice: latticePositions }
  }, [count, span])

  const { geometry, formation } = useBlendedPositions({
    from: brain,
    to: lattice,
    target: getMindFormation(scene.id, beat),
    speed: 1.8,
    reducedMotion: quality.reducedMotion,
  })

  // Scene 9 lights one pipeline stage per beat.
  const layout = getBeatLayout(scene)
  const activeStage =
    scene.id === 'how-ai-works' ? beat - layout.stepsStart : -1

  useFrame((_, delta) => {
    // The blend itself — including the guard that stops it rewriting the buffer
    // once settled — lives in useBlendedPositions. This is what rides along.
    const t = formation.current

    if (pointsRef.current && !quality.reducedMotion) {
      // The brain drifts organically; the lattice sits still and mechanical.
      pointsRef.current.rotation.y += delta * 0.05 * (1 - t)
    }

    if (nodesRef.current) {
      nodesRef.current.visible = t > 0.6
    }
  })

  return (
    <group>
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          size={quality.tier === 'low' ? 0.075 : 0.05}
          color={accent}
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Pipeline nodes — only meaningful once the lattice has formed. */}
      <group ref={nodesRef}>
        {AI_PIPELINE.map((stage, index) => {
          const active = index === activeStage
          const reached = activeStage >= index

          return (
            <mesh
              key={stage.id}
              position={[(stage.position - 0.5) * span, 0, 0]}
              scale={active ? 1.6 : 1}
            >
              <sphereGeometry args={[0.22, 18, 18]} />
              <meshStandardMaterial
                color={accent}
                emissive={accent}
                emissiveIntensity={active ? 2.2 : reached ? 0.9 : 0.15}
                roughness={0.3}
                metalness={0.5}
              />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}
