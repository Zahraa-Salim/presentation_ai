import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Group, type Mesh, type MeshStandardMaterial } from 'three'
import { ParticleField } from '@/components/three/ParticleField'
import {
  getExpression,
  toStillExpression,
  type NovaExpression,
} from '@/lib/novaExpressions'
import { makeRandom } from '@/lib/random'
import type { NovaEmotion, QualitySettings } from '@/types'

interface AICharacterProps {
  emotion?: NovaEmotion
  quality: QualitySettings
  /** World accent, used by any expression whose hue is null. */
  accent: string
  position?: [number, number, number]
  scale?: number
}

/** Frame-rate independent easing toward a target. */
const ease = (current: number, target: number, delta: number, rate = 6) =>
  current + (target - current) * (1 - Math.exp(-rate * delta))

/**
 * NOVA — the recurring AI companion.
 *
 * A glowing core inside two tilted orbit rings, with a single lens that blinks
 * and tilts. Not a face: readable enough for a sixteen-year-old to grasp in
 * under a second, abstract enough never to become a cartoon mascot.
 *
 * Character rule, enforced by whatever the scene puts in NovaSpeech:
 * NOVA is here to help, never to be a substitute for a friend.
 *
 * All per-frame work mutates refs inside useFrame — no state, no re-renders.
 */
export function AICharacter({
  emotion = 'idle',
  quality,
  accent,
  position = [0, 0, 0],
  scale = 1,
}: AICharacterProps) {
  const groupRef = useRef<Group>(null)
  const coreRef = useRef<Mesh>(null)
  const lensRef = useRef<Mesh>(null)
  const ringARef = useRef<Mesh>(null)
  const ringBRef = useRef<Mesh>(null)

  // Current (eased) values, so emotion changes glide rather than pop.
  const current = useRef({ openness: 0.7, tilt: 0, separation: 1, pulse: 0.6 })
  const clock = useRef(0)
  const blink = useRef({ timer: 2, closing: 0 })

  // Seeded so blinking is deterministic and never syncs with the beat.
  const random = useMemo(() => makeRandom(0x4e4f5641), [])

  const target: NovaExpression = quality.reducedMotion
    ? toStillExpression(getExpression(emotion))
    : getExpression(emotion)

  const hue = target.hue ?? accent

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return

    clock.current += delta

    const c = current.current
    c.tilt = ease(c.tilt, target.lensTilt, delta)
    c.separation = ease(c.separation, target.ringSeparation, delta)
    c.pulse = ease(c.pulse, target.pulse, delta)

    // ---- blinking -------------------------------------------------------
    let openness = target.lensOpenness
    if (target.blinks) {
      blink.current.timer -= delta
      if (blink.current.timer <= 0) {
        blink.current.closing = 0.16
        // Irregular gaps read as alive; a fixed interval reads mechanical.
        blink.current.timer = 2.4 + random() * 3.4
      }
      if (blink.current.closing > 0) {
        blink.current.closing -= delta
        openness = 0.05
      }
    }
    c.openness = ease(c.openness, openness, delta, 18)

    // ---- bob ------------------------------------------------------------
    group.position.y =
      position[1] +
      Math.sin(clock.current * target.bobSpeed) * target.bobAmplitude

    // ---- lens -----------------------------------------------------------
    if (lensRef.current) {
      lensRef.current.scale.y = Math.max(0.04, c.openness)
      lensRef.current.rotation.z = c.tilt
    }

    // ---- core pulse -----------------------------------------------------
    if (coreRef.current) {
      const material = coreRef.current.material as MeshStandardMaterial
      material.emissiveIntensity =
        c.pulse * (0.9 + Math.sin(clock.current * 2.4) * 0.1)
    }

    // ---- rings ----------------------------------------------------------
    if (ringARef.current) {
      ringARef.current.rotation.z += delta * target.ringSpeed
      ringARef.current.scale.setScalar(c.separation)
    }
    if (ringBRef.current) {
      ringBRef.current.rotation.z -= delta * target.ringSpeed * 0.75
      ringBRef.current.scale.setScalar(c.separation * 1.18)
    }
  })

  const showGlow = quality.tier !== 'low'
  const showSecondRing = quality.tier !== 'low'
  const showMotes = quality.tier === 'high'

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={hue}
          emissive={hue}
          emissiveIntensity={0.6}
          roughness={0.25}
          metalness={0.3}
        />
      </mesh>

      {/* glow shell — cheaper than a bloom pass, and tier-gated */}
      {showGlow && (
        <mesh>
          <sphereGeometry args={[0.78, 24, 24]} />
          <meshBasicMaterial
            color={hue}
            transparent
            opacity={0.14}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* lens — the expressive element */}
      <mesh ref={lensRef} position={[0, 0.06, 0.46]}>
        <circleGeometry args={[0.19, 24]} />
        <meshBasicMaterial color="#05060f" />
      </mesh>
      <mesh position={[0, 0.06, 0.44]}>
        <circleGeometry args={[0.23, 24]} />
        <meshBasicMaterial color={hue} transparent opacity={0.85} />
      </mesh>

      {/* orbit rings */}
      <mesh ref={ringARef} rotation={[Math.PI / 2.6, 0.3, 0]}>
        <torusGeometry args={[0.92, 0.018, 8, 64]} />
        <meshBasicMaterial
          color={hue}
          transparent
          opacity={0.7}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {showSecondRing && (
        <mesh ref={ringBRef} rotation={[Math.PI / 1.7, -0.5, 0.4]}>
          <torusGeometry args={[0.92, 0.012, 8, 64]} />
          <meshBasicMaterial
            color={hue}
            transparent
            opacity={0.45}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {showMotes && (
        <ParticleField
          quality={quality}
          color={hue}
          density={0.06}
          spread={2.4}
          seed={0x4e4f5641}
        />
      )}
    </group>
  )
}
