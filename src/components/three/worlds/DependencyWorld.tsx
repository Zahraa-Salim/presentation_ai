import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Group, type Mesh } from 'three'
import { usePresentation } from '@/hooks/usePresentation'
import { getInteractionReveal } from '@/lib/worldReveal'
import type { Scene3DProps } from '@/components/three/sceneRegistry'

/**
 * World 5 — the dependency balance.
 *
 * A beam with the student on one side and AI on the other. Level at rest,
 * because scene 29 lays out healthy use and dependency side by side without
 * judging between them — that is the class's to weigh.
 *
 * On scene 30's reveal the beam tips: the AI mass swells, the student's shrinks
 * and rises. Not because using AI is bad, but because that is precisely the
 * failure the scene names — `المشكلة مش إنك تستخدم AI. المشكلة لما ما تعود
 * تعرف تعمل شي بدونه.` The picture is what happens when the skill goes, and it
 * arrives on the beat the presenter chooses, after the class has answered.
 */

const ARM = 2.1
const TIP_ANGLE = 0.28

export function DependencyWorld({ quality, accent }: Scene3DProps) {
  const { scene, beat } = usePresentation()

  const beamRef = useRef<Group>(null)
  const studentRef = useRef<Mesh>(null)
  const aiRef = useRef<Mesh>(null)
  const tilt = useRef(0)

  // Only scene 30 tips. Scene 29 shares the environment but is still asking.
  const target =
    scene.id === 'dependency' ? getInteractionReveal(scene.id, beat) : 0

  useFrame((state, delta) => {
    const rate = quality.reducedMotion ? 1 : 1 - Math.exp(-1.7 * delta)
    tilt.current += (target - tilt.current) * rate
    const t = tilt.current

    if (beamRef.current) {
      // Positive Z rotation drops the inline-start side, where AI sits.
      beamRef.current.rotation.z = -t * TIP_ANGLE
      if (!quality.reducedMotion) {
        beamRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
      }
    }

    // The masses themselves change, so the tilt is not the only signal —
    // a tilted beam alone would read as a camera angle.
    if (studentRef.current) studentRef.current.scale.setScalar(1 - t * 0.45)
    if (aiRef.current) aiRef.current.scale.setScalar(1 + t * 0.5)
  })

  return (
    <group ref={beamRef}>
      {/* the beam */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, ARM * 2, 8]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.45}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* the student — inline-end side, which is the left under RTL */}
      <mesh ref={studentRef} position={[ARM, 0, 0]}>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={1.1}
          roughness={0.35}
          metalness={0.3}
          flatShading
        />
      </mesh>

      {/* AI */}
      <mesh ref={aiRef} position={[-ARM, 0, 0]}>
        <boxGeometry args={[0.85, 0.85, 0.85]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.8}
          roughness={0.4}
          metalness={0.55}
          wireframe
        />
      </mesh>

      {/* the pivot */}
      <mesh position={[0, -0.35, 0]}>
        <coneGeometry args={[0.3, 0.6, 4]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.5}
          roughness={0.5}
          metalness={0.4}
          flatShading
        />
      </mesh>
    </group>
  )
}
