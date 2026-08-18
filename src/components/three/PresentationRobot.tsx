import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { Group, PerspectiveCamera } from 'three'
import { AICharacter } from '@/components/three/AICharacter'
import { usePresentation } from '@/hooks/usePresentation'
import { getRobotBehavior } from '@/lib/robotBehavior'
import {
  SCRIM_COMPENSATION,
  cornerForWorld,
  cornerSide,
  getRobotDrift,
  getRobotPlacement,
} from '@/lib/robotPlacement'
import type { QualitySettings } from '@/types'

/** Frame-rate independent easing toward a target. */
const ease = (current: number, target: number, delta: number, rate = 5) =>
  current + (target - current) * (1 - Math.exp(-rate * delta))

const isPerspective = (camera: unknown): camera is PerspectiveCamera =>
  (camera as PerspectiveCamera).isPerspectiveCamera === true

/**
 * NOVA, riding the corner of the frame for the whole lesson.
 *
 * The companion is anchored to the **camera**, not to the world: it copies the
 * camera's position and orientation every frame and then steps out to a corner
 * of the frustum. The world slides past underneath during a `worldShift` while
 * the companion sits perfectly still, which is what makes it read as a
 * character travelling with the class rather than an object left behind in
 * scene 4.
 *
 * Behaviour is data, keyed by scene id — see `robotBehavior.ts`. This component
 * decides *where*, never *what*.
 *
 * All per-frame work mutates refs. No state, so a 45-minute lesson never
 * re-renders the 3D tree on the companion's account.
 */
export function PresentationRobot({
  quality,
  accent,
}: {
  quality: QualitySettings
  accent: string
}) {
  const { scene, world } = usePresentation()
  const camera = useThree((state) => state.camera)

  const groupRef = useRef<Group>(null)
  /** 0 → 1 presence, so appearing and leaving are not cuts. */
  const presence = useRef(0)
  /** −1 … 1 between the corners. Eased, so a change of corner is a crossing. */
  const side = useRef(1)
  const clock = useRef(0)

  const behavior = getRobotBehavior(scene.id)
  const target = behavior.hidden ? 0 : 1

  /*
    The corner comes from the world, not the scene: alternating by world means
    the companion crosses the screen exactly four times in the whole lesson,
    always at the moment the class is being taken somewhere new. A per-scene
    override still wins where one is set.
  */
  const targetSide = cornerSide(behavior.corner ?? cornerForWorld(world.order))

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group || !isPerspective(camera)) return

    clock.current += delta

    if (quality.reducedMotion) {
      // No crossing, no drift, no arc. Reduced motion means the companion is
      // somewhere, rather than going somewhere.
      presence.current = target
      side.current = targetSide
    } else {
      presence.current = ease(presence.current, target, delta)
      // Slower than the presence ramp, so a crossing reads as a journey rather
      // than a snap with easing painted on it.
      side.current = ease(side.current, targetSide, delta, 2.2)
    }

    // Fully gone: stop paying for it, including its own useFrame work.
    if (presence.current < 0.001 && target === 0) {
      group.visible = false
      return
    }
    group.visible = true

    // Rigid to the camera. Copied rather than eased on purpose — easing here
    // would make the companion swim across the screen during a camera move.
    group.position.copy(camera.position)
    group.quaternion.copy(camera.quaternion)

    // Recomputed every frame so an easing fov and a window resize are both
    // handled without listening for either. camera.fov is degrees.
    const placement = getRobotPlacement(camera.fov, camera.aspect, {
      side: side.current,
      scaleMultiplier: behavior.scale,
      drift: quality.reducedMotion ? undefined : getRobotDrift(clock.current),
    })

    group.translateX(placement.x)
    group.translateY(placement.y)
    group.translateZ(placement.z)
    group.scale.setScalar(placement.scale * presence.current)
  })

  return (
    <group ref={groupRef}>
      {/*
        Motes are forced off whatever the tier. AICharacter enables a
        ParticleField on high, which earns its place when NOVA is the subject of
        a scene; a companion the size of a thumbnail in the corner spends a draw
        call on something nobody can resolve.

        The brightness lift pays back the scrim, which veils the canvas but not
        the DOM text above it — without it the companion reads at 59% of what it
        was designed to.
      */}
      <AICharacter
        emotion={behavior.emotion}
        quality={quality}
        accent={accent}
        motes={false}
        brightness={SCRIM_COMPENSATION}
      />
    </group>
  )
}
