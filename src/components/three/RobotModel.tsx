import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  CapsuleGeometry,
  CircleGeometry,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type MeshStandardMaterial,
} from 'three'
import { getRobotPose } from '@/lib/robotPose'
import { makeRandom } from '@/lib/random'
import type { NovaEmotion, QualitySettings } from '@/types'

/**
 * NOVA's body.
 *
 * A rounded head that is deliberately too big for its body — that proportion is
 * most of what makes a shape read as friendly rather than as equipment — set on
 * a small capsule torso with stub limbs and a single antenna.
 *
 * The face is **one dark visor with two glowing eyes inside it**, not two
 * eyeballs with pupils. That is the choice that keeps it from looking like a
 * stock robot: the visor gives it a single futuristic surface, and the eyes are
 * light rather than anatomy, so they can blink, narrow and tilt without ever
 * becoming a cartoon face. Nothing here is humanoid beyond the silhouette.
 *
 * It carries no text, in any language — the DOM layer above the canvas owns
 * every word in this presentation.
 *
 * Behaviour comes from `robotPose.ts`, which translates the same twelve states
 * the abstract NOVA uses. This component owns the shape and the frame loop,
 * never the meaning.
 *
 * All per-frame work mutates refs and allocates nothing.
 */

/** Local units. The model spans roughly ±0.92, matching AICharacter, so the
 *  placement constants in `robotPlacement.ts` hold for either body. */
const SHELL = '#ced5ee'
const VISOR = '#0b0f20'

interface RobotModelProps {
  emotion?: NovaEmotion
  quality: QualitySettings
  /** World accent, used by any pose whose hue is null. */
  accent: string
  /** Multiplier on everything that emits light. See SCRIM_COMPENSATION. */
  brightness?: number
}

/** Frame-rate independent easing toward a target. */
const ease = (current: number, target: number, delta: number, rate = 6) =>
  current + (target - current) * (1 - Math.exp(-rate * delta))

export function RobotModel({
  emotion = 'idle',
  quality,
  accent,
  brightness = 1,
}: RobotModelProps) {
  const rootRef = useRef<Group>(null)
  const headRef = useRef<Group>(null)
  const eyeLeftRef = useRef<Mesh>(null)
  const eyeRightRef = useRef<Mesh>(null)
  const armLeftRef = useRef<Group>(null)
  const armRightRef = useRef<Group>(null)
  const bulbRef = useRef<Mesh>(null)

  const current = useRef({ openness: 0.7, tilt: 0, spread: 0.6 })
  const clock = useRef(0)
  const blink = useRef({ timer: 2, closing: 0 })
  /** 1 → 0 over roughly half a second after a bursting state arrives. */
  const burst = useRef(0)

  // Seeded, so blinking is identical in rehearsal and on the day and never
  // syncs with the beat.
  const random = useMemo(() => makeRandom(0x4e4f5632), [])

  /*
    Shared geometries for the parts that come in pairs. Two eyes, two arms and
    two legs are six meshes built from three geometries — and they are disposed
    together, which matters across a 45-minute session.
  */
  const geometries = useMemo(() => {
    const eye = new CircleGeometry(0.115, 20)
    const limb = new CapsuleGeometry(0.075, 0.16, 4, 8)
    const leg = new CapsuleGeometry(0.085, 0.1, 4, 8)
    return { eye, limb, leg }
  }, [])

  useEffect(
    () => () => {
      geometries.eye.dispose()
      geometries.limb.dispose()
      geometries.leg.dispose()
    },
    [geometries],
  )

  const pose = getRobotPose(emotion, quality.reducedMotion)
  const hue = pose.hue ?? accent

  /*
    Fired from an effect rather than compared per frame, so re-entering the same
    state does not re-trigger it and a held celebration does not hop forever.
  */
  useEffect(() => {
    if (!quality.reducedMotion && getRobotPose(emotion).burst) burst.current = 1
  }, [emotion, quality.reducedMotion])

  useFrame((_, delta) => {
    const root = rootRef.current
    if (!root) return

    clock.current += delta
    if (burst.current > 0) burst.current = Math.max(0, burst.current - delta * 2.2)
    const flare = burst.current * burst.current

    const c = current.current
    c.tilt = ease(c.tilt, pose.headTilt, delta)
    c.spread = ease(c.spread, pose.armSpread, delta)

    // ---- blinking ---------------------------------------------------------
    let openness = pose.eyeOpenness
    if (pose.blinks) {
      blink.current.timer -= delta
      if (blink.current.timer <= 0) {
        blink.current.closing = 0.14
        // Irregular gaps read as alive; a fixed interval reads mechanical.
        blink.current.timer = 2.4 + random() * 3.4
      }
      if (blink.current.closing > 0) {
        blink.current.closing -= delta
        openness = 0.04
      }
    }
    c.openness = ease(c.openness, openness, delta, 18)

    // ---- breathing, plus a hop on a burst ---------------------------------
    root.position.y =
      Math.sin(clock.current * pose.bobSpeed) * pose.bobAmplitude + flare * 0.16

    // ---- head -------------------------------------------------------------
    if (headRef.current) {
      headRef.current.rotation.z = c.tilt
      // A trace of head movement, so a resting character is not a frozen one.
      headRef.current.rotation.y =
        Math.sin(clock.current * 0.4) * 0.06 * (pose.bobAmplitude > 0 ? 1 : 0)
    }

    // ---- eyes -------------------------------------------------------------
    const eyeScale = Math.max(0.05, c.openness)
    if (eyeLeftRef.current) eyeLeftRef.current.scale.y = eyeScale
    if (eyeRightRef.current) eyeRightRef.current.scale.y = eyeScale

    // ---- arms -------------------------------------------------------------
    // The sway keeps its sign: `confused` is the one state that sways the wrong
    // way, which is exactly the state that should look wrong.
    const sway = Math.sin(clock.current * pose.swaySpeed * 2) * 0.12
    const raise = flare * 1.1
    if (armLeftRef.current) armLeftRef.current.rotation.z = c.spread + sway + raise
    if (armRightRef.current) {
      armRightRef.current.rotation.z = -(c.spread - sway + raise)
    }

    // ---- glow -------------------------------------------------------------
    const glow = (pose.glow + flare * 1.4) * brightness
    if (bulbRef.current) {
      const material = bulbRef.current.material as MeshStandardMaterial
      material.emissiveIntensity =
        glow * (0.9 + Math.sin(clock.current * 2.4) * 0.1)
    }
    for (const eye of [eyeLeftRef.current, eyeRightRef.current]) {
      if (!eye) continue
      ;(eye.material as MeshBasicMaterial).opacity = Math.min(1, 0.55 + glow * 0.4)
    }
  })

  const showGlow = quality.tier !== 'low'

  return (
    <group ref={rootRef}>
      {/* ── legs ───────────────────────────────────────────────────────── */}
      {[-0.19, 0.19].map((x) => (
        <mesh key={x} geometry={geometries.leg} position={[x, -0.78, 0]}>
          <meshStandardMaterial color={SHELL} roughness={0.42} metalness={0.12} />
        </mesh>
      ))}

      {/* ── torso ──────────────────────────────────────────────────────── */}
      <mesh position={[0, -0.32, 0]} scale={[1.02, 0.88, 0.94]}>
        <sphereGeometry args={[0.4, 24, 18]} />
        <meshStandardMaterial color={SHELL} roughness={0.38} metalness={0.14} />
      </mesh>

      {/* ── arms: pivoted at the shoulder so rotation reads as a swing ──── */}
      <group ref={armLeftRef} position={[-0.36, -0.2, 0]}>
        <mesh geometry={geometries.limb} position={[-0.06, -0.12, 0]}>
          <meshStandardMaterial color={SHELL} roughness={0.42} metalness={0.12} />
        </mesh>
      </group>
      <group ref={armRightRef} position={[0.36, -0.2, 0]}>
        <mesh geometry={geometries.limb} position={[0.06, -0.12, 0]}>
          <meshStandardMaterial color={SHELL} roughness={0.42} metalness={0.12} />
        </mesh>
      </group>

      {/* ── head: oversized on purpose ─────────────────────────────────── */}
      <group ref={headRef} position={[0, 0.34, 0]}>
        <mesh>
          <sphereGeometry args={[0.48, 28, 20]} />
          <meshStandardMaterial color={SHELL} roughness={0.32} metalness={0.16} />
        </mesh>

        {/* Visor. Inset into the head rather than sitting on it, so the face is
            one surface instead of features stuck to a ball. */}
        <mesh position={[0, -0.02, 0.1]} scale={[0.94, 0.62, 0.62]}>
          <sphereGeometry args={[0.47, 24, 16]} />
          <meshStandardMaterial color={VISOR} roughness={0.12} metalness={0.55} />
        </mesh>

        {/* Eyes: light inside the visor, not anatomy on top of it. */}
        <mesh
          ref={eyeLeftRef}
          geometry={geometries.eye}
          position={[-0.16, -0.01, 0.4]}
        >
          <meshBasicMaterial color={hue} transparent opacity={0.9} />
        </mesh>
        <mesh
          ref={eyeRightRef}
          geometry={geometries.eye}
          position={[0.16, -0.01, 0.4]}
        >
          <meshBasicMaterial color={hue} transparent opacity={0.9} />
        </mesh>

        {/* Antenna — the one futuristic flourish, and the second thing after
            the eyes that carries the world's colour. */}
        <mesh position={[0, 0.58, 0]}>
          <cylinderGeometry args={[0.014, 0.02, 0.2, 6]} />
          <meshStandardMaterial color={SHELL} roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh ref={bulbRef} position={[0, 0.72, 0]}>
          <sphereGeometry args={[0.062, 14, 12]} />
          <meshStandardMaterial
            color={hue}
            emissive={hue}
            emissiveIntensity={0.8}
            roughness={0.25}
          />
        </mesh>

        {/* A soft halo instead of a bloom pass, which costs 4–8ms a frame. */}
        {showGlow && (
          <mesh position={[0, 0.72, 0]}>
            <sphereGeometry args={[0.16, 12, 10]} />
            <meshBasicMaterial
              color={hue}
              transparent
              opacity={Math.min(1, 0.16 * brightness)}
              blending={AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>
    </group>
  )
}
