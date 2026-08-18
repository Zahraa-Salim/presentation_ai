import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  type Group,
  type Mesh,
} from 'three'
import { usePresentation } from '@/hooks/usePresentation'
import { makeRandom, seedFromString } from '@/lib/random'
import { getInteractionReveal } from '@/lib/worldReveal'
import type { Scene3DProps } from '@/components/three/sceneRegistry'

/**
 * World 4 — Cyber City, for `AI + Cybersecurity`.
 *
 * A **network**, not a scattering. The links are the point: an account or a
 * message is suspicious because of what it connects to, and a ring of floating
 * shapes with nothing between them communicates none of that — it just looks
 * like shapes. Phishing, fake accounts and impersonation are all relationship
 * problems, so the relationships have to be on screen.
 *
 * At rest **nothing distinguishes the forged nodes.** That is the whole lesson:
 * `مش كل شي بيبين حقيقي… حقيقي.` A city that marked the fakes from the start
 * would be teaching that fakes look fake.
 *
 * On the reveal beat the forged nodes give themselves away four ways at once —
 * they dim, they shrink, they jitter, and **their links break up into loose
 * fragments** while the genuine ones stay solid. Four signals, so the tell
 * survives a washed-out projector and never rests on colour.
 *
 * Which nodes are forged is seeded: the same ones are fake every run, so you
 * can rehearse against it.
 */

const NODE_COUNT = 18
const SPREAD_X = 7.2
const SPREAD_Y = 3.4
/** Roughly a third: enough to find, not so many that it reads as noise. */
const FORGED_RATE = 0.33
/** Links per node. Two reads as a network; more reads as a cage. */
const LINKS_PER_NODE = 2

export function CyberCityWorld({ quality, accent }: Scene3DProps) {
  const { scene, beat } = usePresentation()

  const groupRef = useRef<Group>(null)
  const nodeRefs = useRef<(Mesh | null)[]>([])

  const exposed = getInteractionReveal(scene.id, beat)

  const { nodes, genuineLinks, forgedLinks } = useMemo(() => {
    const random = makeRandom(seedFromString('cyberCity'))

    const built = Array.from({ length: NODE_COUNT }, (_, i) => ({
      id: i,
      forged: random() < FORGED_RATE,
      position: [
        (random() - 0.5) * SPREAD_X * 2,
        (random() - 0.5) * SPREAD_Y,
        (random() - 0.5) * 3.2,
      ] as [number, number, number],
      // Independent phases, so the forged nodes never pulse in unison — that
      // would read as a deliberate effect rather than as something wrong.
      phase: random() * Math.PI * 2,
    }))

    /* Each node links to its nearest neighbours, which is what makes the shape
       read as a network rather than as arbitrary lines. Links are split into
       two geometries so the forged half can be styled apart on reveal. */
    const genuine: number[] = []
    const forged: number[] = []

    built.forEach((node, i) => {
      const nearest = built
        .map((other, j) => ({ j, other }))
        .filter(({ j }) => j !== i)
        .sort((a, b) => distance(node.position, a.other.position) - distance(node.position, b.other.position))
        .slice(0, LINKS_PER_NODE)

      for (const { other } of nearest) {
        const into = node.forged || other.forged ? forged : genuine
        into.push(...node.position, ...other.position)
      }
    })

    return {
      nodes: built,
      genuineLinks: toLineGeometry(genuine),
      forgedLinks: toLineGeometry(forged),
    }
  }, [])

  useFrame((state, delta) => {
    if (groupRef.current && !quality.reducedMotion) {
      groupRef.current.rotation.y += delta * 0.04
    }

    if (quality.reducedMotion || exposed === 0) return

    // The tell: a forged node cannot hold still once you know to look.
    const t = state.clock.elapsedTime
    nodes.forEach((node, i) => {
      const mesh = nodeRefs.current[i]
      if (!mesh || !node.forged) return
      mesh.position.x = node.position[0] + Math.sin(t * 9 + node.phase) * 0.07
      mesh.position.y = node.position[1] + Math.cos(t * 11 + node.phase) * 0.05
    })
  })

  return (
    <group ref={groupRef}>
      {/* Links between genuine nodes — solid throughout. */}
      <lineSegments geometry={genuineLinks}>
        <lineBasicMaterial
          color={accent}
          transparent
          opacity={0.34}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Links touching a forged node — indistinguishable until they break. */}
      <lineSegments geometry={forgedLinks}>
        <lineBasicMaterial
          color={accent}
          transparent
          opacity={exposed ? 0.07 : 0.34}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {nodes.map((node, i) => {
        const revealedFake = node.forged && exposed === 1
        const radius = revealedFake ? 0.14 : 0.23

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
                emissiveIntensity={revealedFake ? 0.1 : 1.25}
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
                  opacity={0.13}
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

function distance(a: readonly number[], b: readonly number[]): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
}

function toLineGeometry(points: number[]): BufferGeometry {
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(points), 3))
  return geometry
}
