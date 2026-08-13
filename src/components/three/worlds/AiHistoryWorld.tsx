import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Group } from 'three'
import { AI_HISTORY } from '@/data/aiHistory'
import { ParticleField } from '@/components/three/ParticleField'
import { seedFromString } from '@/lib/random'
import type { Scene3DProps } from '@/components/three/sceneRegistry'

/**
 * World 1 timeline — `AI مش جديد`.
 *
 * Glowing milestone nodes strung along a receding line, with a connecting
 * spine. Abstract geometry only: the Arabic labels live in the DOM scene
 * component, so nothing here needs Arabic text shaping, and no 3D-to-screen
 * projection is required.
 *
 * Laid out along -X so it reads right to left, matching the Arabic flow of the
 * labels above it.
 */
export function AiHistoryWorld({ quality, accent }: Scene3DProps) {
  const groupRef = useRef<Group>(null)

  const spacing = 2.8
  const span = (AI_HISTORY.length - 1) * spacing

  useFrame((state, delta) => {
    if (!groupRef.current || quality.reducedMotion) return
    // A slow drift keeps the timeline alive without pulling focus from the
    // labels being read above it.
    groupRef.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.4) * 0.08
    groupRef.current.rotation.y += delta * 0.01
  })

  return (
    <group ref={groupRef}>
      {/* the spine */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[-span / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, span + spacing, 6]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.35}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {AI_HISTORY.map((milestone, index) => {
        // Right to left: the earliest milestone sits furthest right.
        const x = -index * spacing
        const isLatest = index === AI_HISTORY.length - 1

        return (
          <group key={milestone.id} position={[x, 0, 0]}>
            <mesh>
              <sphereGeometry args={[isLatest ? 0.3 : 0.19, 20, 20]} />
              <meshStandardMaterial
                color={accent}
                emissive={accent}
                emissiveIntensity={isLatest ? 1.4 : 0.7}
                roughness={0.3}
                metalness={0.4}
              />
            </mesh>

            {quality.tier !== 'low' && (
              <mesh>
                <sphereGeometry args={[isLatest ? 0.55 : 0.36, 16, 16]} />
                <meshBasicMaterial
                  color={accent}
                  transparent
                  opacity={0.16}
                  blending={AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
            )}
          </group>
        )
      })}

      {quality.tier === 'high' && (
        <ParticleField
          quality={quality}
          color={accent}
          density={0.35}
          spread={16}
          center={[-span / 2, 0, 0]}
          seed={seedFromString('aiHistory')}
        />
      )}
    </group>
  )
}
