import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Group, type Mesh } from 'three'
import { usePresentation } from '@/hooks/usePresentation'
import { makeRandom, seedFromString } from '@/lib/random'
import { getInteractionReveal } from '@/lib/worldReveal'
import type { Scene3DProps } from '@/components/three/sceneRegistry'

/**
 * World 4 — Cyber City, for `AI + Cybersecurity`.
 *
 * A network where some nodes are genuine and some are forged, and **nothing on
 * screen distinguishes them** until the presenter reveals it. That indistinct
 * first state is the entire point: `مش كل شي بيبين حقيقي… حقيقي.` A world that
 * marked the fakes from the start would be teaching that fakes look fake.
 *
 * On the reveal beat the forged nodes desaturate, shrink and start to jitter —
 * three signals, not one, so the difference survives a washed-out projector and
 * does not rest on colour.
 *
 * Which nodes are forged is seeded, so the same ones are fake every run and the
 * presenter can rehearse against it.
 */

const NODE_COUNT = 14
const RADIUS = 3.2
/** Roughly a third forged: enough to find, not so many that it reads as noise. */
const FORGED_RATE = 0.35

export function CyberCityWorld({ quality, accent }: Scene3DProps) {
  const { scene, beat } = usePresentation()
  const groupRef = useRef<Group>(null)
  const nodeRefs = useRef<(Mesh | null)[]>([])

  const exposed = getInteractionReveal(scene.id, beat)

  const nodes = useMemo(() => {
    const random = makeRandom(seedFromString('cyberCity'))
    return Array.from({ length: NODE_COUNT }, (_, i) => {
      const angle = (i / NODE_COUNT) * Math.PI * 2 + random() * 0.3
      const distance = RADIUS * (0.55 + random() * 0.45)
      return {
        id: i,
        forged: random() < FORGED_RATE,
        position: [
          Math.cos(angle) * distance,
          (random() - 0.5) * 2.4,
          Math.sin(angle) * distance * 0.6,
        ] as [number, number, number],
        // Each forged node jitters on its own phase, so they never pulse in
        // unison — which would read as a deliberate effect rather than a fault.
        phase: random() * Math.PI * 2,
      }
    })
  }, [])

  useFrame((state, delta) => {
    if (groupRef.current && !quality.reducedMotion) {
      groupRef.current.rotation.y += delta * 0.05
    }

    if (quality.reducedMotion || exposed === 0) return

    // The tell: forged nodes cannot hold still once you know to look.
    const t = state.clock.elapsedTime
    nodes.forEach((node, i) => {
      const mesh = nodeRefs.current[i]
      if (!mesh || !node.forged) return
      mesh.position.x = node.position[0] + Math.sin(t * 9 + node.phase) * 0.06
      mesh.position.y = node.position[1] + Math.cos(t * 11 + node.phase) * 0.05
    })
  })

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => {
        const revealedFake = node.forged && exposed === 1
        // Three signals at once: size, brightness, and the jitter above.
        const radius = revealedFake ? 0.15 : 0.24

        return (
          <group key={node.id}>
            <mesh
              ref={(mesh) => {
                nodeRefs.current[i] = mesh
              }}
              position={node.position}
            >
              <octahedronGeometry args={[radius, 0]} />
              <meshStandardMaterial
                color={accent}
                emissive={accent}
                emissiveIntensity={revealedFake ? 0.12 : 1.2}
                roughness={0.35}
                metalness={0.5}
                flatShading
              />
            </mesh>

            {/* Only the genuine nodes keep their halo once exposed. */}
            {quality.tier !== 'low' && !revealedFake && (
              <mesh position={node.position}>
                <sphereGeometry args={[radius * 1.9, 12, 12]} />
                <meshBasicMaterial
                  color={accent}
                  transparent
                  opacity={0.14}
                  blending={AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}
