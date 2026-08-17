import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Mesh } from 'three'
import type { Scene3DProps } from '@/components/three/sceneRegistry'

/**
 * World 3 — the Study Lab.
 *
 * The quietest environment in the deck, and deliberately so. Scenes 19–21 are
 * the reading-heavy ones — five companion roles, a list of things to say
 * instead of "give me the answer", and the difference between AI helping you
 * learn and AI learning for you. Anything moving behind that text competes
 * with it, and the priority order puts educational clarity above visual
 * quality.
 *
 * So the composition carries the argument instead of the motion:
 *
 *   the work sits at the centre, large and lit
 *   the companion sits BESIDE it, smaller, and never in front
 *
 * `أنت بتضل الطالب. AI هو المساعد.` — a companion orb placed between the
 * viewer and the work would say the opposite, however good it looked. This is
 * also the one scene family where NOVA must not encourage dependency, so the
 * geometry keeps its distance.
 *
 * The offset is negative X: inline-start is the right under RTL, so the
 * assistant sits where a right-handed student's helper would, not across the
 * page from them.
 */

const WORK_SIZE = 2.6
const COMPANION_OFFSET_X = -2.35
const COMPANION_RADIUS = 0.42

export function StudyLabWorld({ quality, accent }: Scene3DProps) {
  const companionRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (!companionRef.current || quality.reducedMotion) return
    // A slow breath, and nothing else. Present, not animated.
    companionRef.current.position.y =
      0.35 + Math.sin(state.clock.elapsedTime * 0.7) * 0.06
  })

  return (
    <group>
      {/* The work. Centred, and the largest thing on screen. */}
      <mesh rotation={[-Math.PI / 2.6, 0, 0]} position={[0.4, 0, 0]}>
        <planeGeometry args={[WORK_SIZE, WORK_SIZE * 0.72]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.35}
          roughness={0.55}
          metalness={0.15}
          side={2}
        />
      </mesh>

      {/* Its edge glow, so the plane reads as lit rather than as a flat card. */}
      {quality.tier !== 'low' && (
        <mesh rotation={[-Math.PI / 2.6, 0, 0]} position={[0.4, 0, -0.02]}>
          <planeGeometry args={[WORK_SIZE * 1.14, WORK_SIZE * 0.86]} />
          <meshBasicMaterial
            color={accent}
            transparent
            opacity={0.1}
            blending={AdditiveBlending}
            depthWrite={false}
            side={2}
          />
        </mesh>
      )}

      {/* The companion. Beside the work, smaller, and set back from it. */}
      <mesh ref={companionRef} position={[COMPANION_OFFSET_X, 0.35, 0.5]}>
        <sphereGeometry args={[COMPANION_RADIUS, 24, 24]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={1.1}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>

      {quality.tier !== 'low' && (
        <mesh position={[COMPANION_OFFSET_X, 0.35, 0.5]}>
          <sphereGeometry args={[COMPANION_RADIUS * 1.7, 16, 16]} />
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
}
