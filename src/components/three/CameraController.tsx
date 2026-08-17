import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Vector3 } from 'three'
import { usePresentation } from '@/hooks/usePresentation'
import { getCameraPose } from '@/lib/cameraPoses'
import type { QualitySettings } from '@/types'

interface CameraControllerProps {
  quality: QualitySettings
}

/**
 * Eases the camera toward the current scene's pose.
 *
 * All per-frame work mutates the camera directly inside useFrame — driving
 * this from state would re-render the React tree sixty times a second.
 *
 * Reduced motion snaps instead of easing: the camera still gets where it needs
 * to be, it just stops travelling.
 */
/* A hundredth of a degree of field of view is not visible on any projector. */
const FOV_EPSILON = 0.01

export function CameraController({ quality }: CameraControllerProps) {
  const { scene } = usePresentation()

  const targetPosition = useRef(new Vector3())
  const targetLookAt = useRef(new Vector3())
  const currentLookAt = useRef(new Vector3())
  const initialised = useRef(false)

  // The camera comes from the per-frame state, not from useThree: three.js
  // objects are mutable by design and this is the R3F way to drive them.
  useFrame((state, delta) => {
    const { camera } = state
    const pose = getCameraPose(scene.scene3d)

    targetPosition.current.set(...pose.position)
    targetLookAt.current.set(...pose.target)

    const snap = !initialised.current || quality.reducedMotion
    // Frame-rate independent easing: the same visual speed at 30 or 60fps.
    const alpha = snap ? 1 : 1 - Math.pow(0.0015, delta)

    if (snap) {
      camera.position.copy(targetPosition.current)
      currentLookAt.current.copy(targetLookAt.current)
      initialised.current = true
    } else {
      camera.position.lerp(targetPosition.current, alpha)
      currentLookAt.current.lerp(targetLookAt.current, alpha)
    }

    camera.lookAt(currentLookAt.current)

    if (camera instanceof PerspectiveCamera) {
      const gap = pose.fov - camera.fov

      /*
        Two bugs lived in the old `camera.fov += gap * 0.05`.

        It used a fixed factor while the position lerp above was already
        frame-rate independent, so the field of view arrived on a different
        schedule at 30fps than at 60 — the camera move and the zoom drifted
        apart on exactly the weak hardware this deck has to run on.

        And asymptotic easing never lands exactly, so `fov !== pose.fov` stayed
        true forever and rebuilt the projection matrix every frame for the whole
        session. Snapping inside a tolerance ends it.
      */
      if (Math.abs(gap) > FOV_EPSILON) {
        camera.fov += gap * alpha
        camera.updateProjectionMatrix()
      } else if (camera.fov !== pose.fov) {
        camera.fov = pose.fov
        camera.updateProjectionMatrix()
      }
    }
  })

  return null
}
