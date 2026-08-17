import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Group } from 'three'
import { INTERACTION_BY_ID } from '@/data/interactions'
import { usePresentation } from '@/hooks/usePresentation'
import { getInteractionReveal } from '@/lib/worldReveal'
import type { Scene3DProps } from '@/components/three/sceneRegistry'

/**
 * World 5 — Future City.
 *
 * One tower per career, read from the careers interaction's own options so the
 * skyline can never disagree with the list beside it. Each tower is built in
 * two parts: a base, and a crown above it.
 *
 * At rest they are one solid colour — a job is a job. On scene 32's reveal the
 * base dims and the crown stays lit: the part AI takes on, and the part that
 * stays human. Every career keeps its crown, because none of the deck's six is
 * a job AI does instead of a person — which is the scene's own conclusion,
 * `المنافس مش دائماً AI. أحياناً المنافس هو شخص بيعرف يشتغل مع AI.`
 *
 * The split is deliberately equal across all six. Claiming one profession
 * loses more of itself than another would be a claim the deck does not make.
 */

const SPACING = 1.9
const BASE_HEIGHT = 1.5
const CROWN_HEIGHT = 1.0

export function FutureCityWorld({ quality, accent }: Scene3DProps) {
  const { scene, beat } = usePresentation()
  const groupRef = useRef<Group>(null)

  const careers = INTERACTION_BY_ID.career.options
  const span = (careers.length - 1) * SPACING

  const exposed =
    scene.id === 'future-jobs' ? getInteractionReveal(scene.id, beat) : 0

  useFrame((state) => {
    if (!groupRef.current || quality.reducedMotion) return
    // Translation only: a rotating skyline slides out from under its labels.
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.32) * 0.06
  })

  return (
    <group ref={groupRef}>
      {careers.map((career, index) => {
        // Right to left, matching the order the labels read in.
        const x = span / 2 - index * SPACING

        return (
          <group key={career.id} position={[x, 0, 0]}>
            {/* What AI takes on. */}
            <mesh position={[0, BASE_HEIGHT / 2 - 1.4, 0]}>
              <boxGeometry args={[0.7, BASE_HEIGHT, 0.7]} />
              <meshStandardMaterial
                color={accent}
                emissive={accent}
                emissiveIntensity={exposed ? 0.1 : 0.85}
                roughness={0.45}
                metalness={0.4}
              />
            </mesh>

            {/* What stays human. Never dims. */}
            <mesh
              position={[0, BASE_HEIGHT + CROWN_HEIGHT / 2 - 1.4, 0]}
            >
              <boxGeometry args={[0.7, CROWN_HEIGHT, 0.7]} />
              <meshStandardMaterial
                color={accent}
                emissive={accent}
                emissiveIntensity={exposed ? 1.9 : 0.85}
                roughness={0.35}
                metalness={0.35}
              />
            </mesh>

            {quality.tier !== 'low' && exposed === 1 && (
              <mesh position={[0, BASE_HEIGHT + CROWN_HEIGHT / 2 - 1.4, 0]}>
                <boxGeometry args={[1.05, CROWN_HEIGHT * 1.3, 1.05]} />
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
