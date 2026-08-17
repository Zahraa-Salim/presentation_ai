import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
} from 'three'
import { WORLDS } from '@/data/worlds'
import { usePresentation } from '@/hooks/usePresentation'
import { getFinaleConvergence } from '@/lib/finaleConvergence'
import { getWorldAccent } from '@/lib/worldAccent'
import type { Scene3DProps } from '@/components/three/sceneRegistry'

/**
 * The finale.
 *
 * Five lights, one per world the class has just travelled through, each still
 * carrying its own accent. As the four closing lines land they draw together,
 * and on the last one they arrive as a single core.
 *
 * That is the shape of the argument rather than a flourish: not magic, not a
 * mind reader, not a replacement — one thing, a tool. The five stay
 * individually coloured right until they meet, so the convergence is legible
 * as five becoming one and not as a light simply getting brighter.
 *
 * Accents are read from the stylesheet, so the worlds keep the exact colours
 * the class saw them in.
 */

const START_RADIUS = 4.2

export function FinaleWorld({ quality }: Scene3DProps) {
  const { scene, beat } = usePresentation()

  const groupRef = useRef<Group>(null)
  const coreRef = useRef<Mesh>(null)
  const lightRefs = useRef<(Group | null)[]>([])
  const converged = useRef(0)

  const lights = useMemo(
    () =>
      WORLDS.map((world, index) => {
        const angle = (index / WORLDS.length) * Math.PI * 2 - Math.PI / 2
        return {
          id: world.id,
          color: getWorldAccent(world.id),
          from: [
            Math.cos(angle) * START_RADIUS,
            Math.sin(angle) * START_RADIUS * 0.55,
            Math.sin(angle) * 1.2,
          ] as [number, number, number],
        }
      }),
    [],
  )

  const target = getFinaleConvergence(scene.id, beat)

  useFrame((_, delta) => {
    const rate = quality.reducedMotion ? 1 : 1 - Math.exp(-1.5 * delta)
    converged.current += (target - converged.current) * rate
    const t = converged.current

    lights.forEach((light, index) => {
      const node = lightRefs.current[index]
      if (!node) return
      // Straight in toward the centre. Each keeps its colour the whole way.
      node.position.set(
        light.from[0] * (1 - t),
        light.from[1] * (1 - t),
        light.from[2] * (1 - t),
      )
      node.scale.setScalar(1 - t * 0.55)
    })

    if (coreRef.current) {
      const material = coreRef.current.material as MeshStandardMaterial
      // The core is nothing until they arrive, then it is the only thing.
      material.emissiveIntensity = t * t * 3.2
      coreRef.current.scale.setScalar(0.12 + t * 0.75)
    }

    if (groupRef.current && !quality.reducedMotion) {
      groupRef.current.rotation.z += delta * 0.05 * (1 - t)
    }
  })

  return (
    <group ref={groupRef}>
      {lights.map((light, index) => (
        <group
          key={light.id}
          ref={(node) => {
            lightRefs.current[index] = node
          }}
          position={light.from}
        >
          <mesh>
            <sphereGeometry args={[0.34, 20, 20]} />
            <meshStandardMaterial
              color={light.color}
              emissive={light.color}
              emissiveIntensity={1.5}
              roughness={0.3}
              metalness={0.3}
            />
          </mesh>

          {quality.tier !== 'low' && (
            <mesh>
              <sphereGeometry args={[0.62, 16, 16]} />
              <meshBasicMaterial
                color={light.color}
                transparent
                opacity={0.18}
                blending={AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          )}
        </group>
      ))}

      {/* What they become. */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
    </group>
  )
}
