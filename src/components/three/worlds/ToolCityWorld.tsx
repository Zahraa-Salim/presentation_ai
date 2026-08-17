import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Group } from 'three'
import { ParticleField } from '@/components/three/ParticleField'
import { usePresentation } from '@/hooks/usePresentation'
import { makeRandom, seedFromString } from '@/lib/random'
import { DISTRICTS, getActiveDistrict } from '@/lib/toolDistricts'
import type { Scene3DProps } from '@/components/three/sceneRegistry'

/**
 * World 3 — Tool City.
 *
 * One district per tool category, laid out along the row. The city argues by
 * separation: these are different districts because they are different jobs,
 * which is the scene's own line — `كل Tool إلها شغلة.`
 *
 * The lit district follows the scene, never the class's selection. Scene 15
 * asks which tool fits which task, and a city that lit the answer would be
 * answering for them.
 *
 * Towers are seeded, so the skyline is identical in rehearsal and on the day.
 */

const SPACING = 3.4
const SPAN = (DISTRICTS.length - 1) * SPACING
const TOWERS_PER_DISTRICT = 4

/** Module scope: an inline array would rebuild ParticleField's geometry. */
const FIELD_CENTER: [number, number, number] = [0, 0, 0]

export function ToolCityWorld({ quality, accent }: Scene3DProps) {
  const { scene } = usePresentation()
  const groupRef = useRef<Group>(null)

  const active = getActiveDistrict(scene.id)

  /* Heights are precomputed rather than random per render: a skyline that
     reshuffled on every beat would read as a glitch, not a city. */
  const towers = useMemo(() => {
    const random = makeRandom(seedFromString('toolCity'))
    return DISTRICTS.map((category, districtIndex) =>
      Array.from({ length: TOWERS_PER_DISTRICT }, (_, towerIndex) => ({
        key: `${category}-${towerIndex}`,
        height: 1.1 + random() * 2.4,
        offsetX: (towerIndex - (TOWERS_PER_DISTRICT - 1) / 2) * 0.62,
        offsetZ: (random() - 0.5) * 1.1,
        // Right to left, matching the reading direction of the labels above.
        districtX: SPAN / 2 - districtIndex * SPACING,
      })),
    )
  }, [])

  useFrame((state) => {
    if (!groupRef.current || quality.reducedMotion) return
    // Translation only — a rotating skyline would slide out from under the
    // headline, the same way the World 1 timeline did.
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
  })

  return (
    <group ref={groupRef}>
      {DISTRICTS.map((category, districtIndex) => {
        const lit = active === category
        // Everything dims when one district is lit, so attention has somewhere
        // to go; with none lit they sit equal, which is scene 11's point.
        const intensity = lit ? 1.6 : active === null ? 0.55 : 0.12

        return (
          <group key={category}>
            {towers[districtIndex].map((tower) => (
              <mesh
                key={tower.key}
                position={[
                  tower.districtX + tower.offsetX,
                  tower.height / 2 - 1.2,
                  tower.offsetZ,
                ]}
              >
                <boxGeometry args={[0.42, tower.height, 0.42]} />
                <meshStandardMaterial
                  color={accent}
                  emissive={accent}
                  emissiveIntensity={intensity}
                  roughness={0.4}
                  metalness={0.45}
                />
              </mesh>
            ))}

            {/* The district's ground glow — the marker that reads at distance. */}
            {quality.tier !== 'low' && (
              <mesh
                position={[towers[districtIndex][0].districtX, -1.25, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <circleGeometry args={[1.5, 28]} />
                <meshBasicMaterial
                  color={accent}
                  transparent
                  opacity={lit ? 0.3 : 0.07}
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
          density={0.3}
          spread={20}
          center={FIELD_CENTER}
          seed={seedFromString('toolCityAir')}
        />
      )}
    </group>
  )
}
