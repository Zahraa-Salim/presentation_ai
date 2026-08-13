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

    if (!initialised.current || quality.reducedMotion) {
      camera.position.copy(targetPosition.current)
      currentLookAt.current.copy(targetLookAt.current)
      initialised.current = true
    } else {
      // Frame-rate independent easing: the same visual speed at 30 or 60fps.
      const alpha = 1 - Math.pow(0.0015, delta)
      camera.position.lerp(targetPosition.current, alpha)
      currentLookAt.current.lerp(targetLookAt.current, alpha)
    }

    camera.lookAt(currentLookAt.current)

    if (camera instanceof PerspectiveCamera && camera.fov !== pose.fov) {
      camera.fov += (pose.fov - camera.fov) * 0.05
      camera.updateProjectionMatrix()
    }
  })

  return null
}
