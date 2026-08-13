import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import { ParticleField } from '@/components/three/ParticleField'
import { getCameraPose } from '@/lib/cameraPoses'
import { seedFromString } from '@/lib/random'
import type { QualitySettings, Scene3DId } from '@/types'

interface PlaceholderSceneProps {
  scene3d: Scene3DId
  quality: QualitySettings
  accent: string
}

/**
 * The stand-in every Scene3DId maps to until its real world is built.
 *
 * It exists to prove the pipeline — camera, lighting, particles, disposal — not
 * to look like anything. Phases 5–9 replace registry entries one at a time.
 *
 * Glow comes from an emissive material and additive particles rather than a
 * bloom pass, which would cost 4–8ms per frame on integrated graphics.
 */
export function PlaceholderScene({
  scene3d,
  quality,
  accent,
}: PlaceholderSceneProps) {
  const meshRef = useRef<Mesh>(null)
  const pose = getCameraPose(scene3d)

  // Anchor the placeholder at the scene's camera target so each 3D key sits in
  // its own part of the world and camera moves are actually visible.
  const [x, y, z] = pose.target

  useFrame((_, delta) => {
    if (!meshRef.current || quality.reducedMotion) return
    meshRef.current.rotation.y += delta * 0.25
    meshRef.current.rotation.x += delta * 0.1
  })

  return (
    <group position={[x, y, z]}>
      <mesh ref={meshRef} castShadow={quality.shadows}>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.6}
          roughness={0.35}
          metalness={0.4}
          wireframe
        />
      </mesh>

      <ParticleField
        quality={quality}
        color={accent}
        center={[0, 0, 0]}
        spread={14}
        seed={seedFromString(scene3d)}
      />
    </group>
  )
}
