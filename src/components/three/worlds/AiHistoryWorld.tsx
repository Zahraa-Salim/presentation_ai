import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import {
  AdditiveBlending,
  Color,
  type Group,
  type MeshBasicMaterial,
  type MeshStandardMaterial,
} from 'three'
import { AI_HISTORY } from '@/data/aiHistory'
import { ParticleField } from '@/components/three/ParticleField'
import { usePresentation } from '@/hooks/usePresentation'
import { getBeatLayout } from '@/lib/beats'
import { seedFromString } from '@/lib/random'
import type { QualitySettings } from '@/types'
import type { Scene3DProps } from '@/components/three/sceneRegistry'

/**
 * World 1 timeline — `AI مش جديد`.
 *
 * Five milestone orbs on a level spine, sitting directly above the matching DOM
 * columns in HistoryScene. Abstract geometry only: the Arabic labels live in
 * the DOM, so nothing here needs Arabic text shaping.
 *
 * THE ALIGNMENT CONTRACT — four things hold the row parallel to the labels.
 * Break any one and it reads as a diagonal rather than a timeline:
 *
 *  1. The `aiHistory` camera pose is head-on (see src/lib/cameraPoses.ts). A
 *     line along X only projects level and evenly spaced when the view axis is
 *     perpendicular to it. An oblique pose makes the line recede: it renders as
 *     a slope, spacing compresses toward the far end, and each orb drifts
 *     further off its label than the last.
 *  2. The orbs are centred on the local origin. ExperienceCanvas anchors this
 *     world at the camera target, so laying them out from the origin leftward
 *     puts the whole row half a span off-centre.
 *  3. Nothing rotates. Not even a little: any rotation.y lifts the orbs out of
 *     the constant-depth plane, which re-introduces the slope. The Y bob below
 *     is safe because it translates every orb equally — the row moves, but it
 *     stays level.
 *  4. Orb radius is uniform. State is carried by colour and brightness, never
 *     by size. A single orb rendered larger than its neighbours reads as a
 *     rendering fault rather than emphasis, and scaling the active orb breaks
 *     the even rhythm the row depends on.
 *
 * THE GRADIENT is built from nested shells rather than a bloom pass: an opaque
 * hot core, a translucent shell over it, and additive halos outside. Stacking
 * additive falloff is what produces the core→rim ramp. Post-processing would
 * cost 4–8ms a frame on integrated graphics, which is the whole reason the
 * project renders glow this way.
 */

const SPACING = 2.8
const SPAN = (AI_HISTORY.length - 1) * SPACING

/** Identical for every milestone — see point 4 of the contract above. */
const CORE_RADIUS = 0.1
const ORB_RADIUS = 0.22
const INNER_HALO = 0.34
const OUTER_HALO = 0.52

/**
 * Lifts the row into the band between HistoryScene's headline and its year
 * row. A visual value, verified on screen at 1366×768 — re-check it if that
 * component's spacing changes.
 *
 * The conversion, if it needs retuning: at the `aiHistory` pose the half-height
 * is 9.7 · tan(25°) ≈ 4.52 world units, which is half the viewport, so one
 * world unit ≈ 85px at 768p. Screen y = 384 − ROW_Y · 85.
 */
const ROW_Y = 1.05

/** Module scope: an inline array would invalidate ParticleField's geometry memo
 *  on every render, rebuilding the point cloud on every beat. */
const FIELD_CENTER: [number, number, number] = [0, 0, 0]

type OrbState = 'waiting' | 'reached' | 'active'

/**
 * Colours are derived from the world accent rather than hard-coded, so the
 * timeline still reads correctly if World 1's ramp is retuned — and so this
 * component stays reusable if another world ever borrows it.
 */
function useOrbPalette(accent: string) {
  return useMemo(() => {
    const base = new Color(accent)
    return {
      /** Near-white with an accent cast — the centre of an active orb. */
      hot: base.clone().lerp(new Color('#ffffff'), 0.78),
      /** Lifted accent, for the body of an orb already covered. */
      lit: base.clone().lerp(new Color('#ffffff'), 0.32),
      base,
      /** Sunk toward the void colour: still legible as an orb, clearly not
       *  yet reached. Too dark and the row stops reading as five milestones
       *  at beat 0, which is when the presenter is introducing it. */
      dormant: base.clone().lerp(new Color('#070a16'), 0.72),
    }
  }, [accent])
}

interface MilestoneOrbProps {
  state: OrbState
  palette: ReturnType<typeof useOrbPalette>
  quality: QualitySettings
}

function MilestoneOrb({ state, palette, quality }: MilestoneOrbProps) {
  const coreRef = useRef<MeshBasicMaterial>(null)
  const outerRef = useRef<MeshBasicMaterial>(null)
  const bodyRef = useRef<MeshStandardMaterial>(null)

  const active = state === 'active'
  const reached = state !== 'waiting'

  /*
    Only the orb being spoken about breathes, and only through brightness —
    scaling it would break the uniform-radius rule above. Mutating material
    values in useFrame keeps this off the React render path entirely.
  */
  useFrame((frame) => {
    if (!active || quality.reducedMotion) return
    const pulse = 0.5 + Math.sin(frame.clock.elapsedTime * 2.1) * 0.5

    if (bodyRef.current) bodyRef.current.emissiveIntensity = 2.1 + pulse * 0.9
    if (coreRef.current) coreRef.current.opacity = 0.9 + pulse * 0.1
    if (outerRef.current) outerRef.current.opacity = 0.16 + pulse * 0.1
  })

  const coreColor = active ? palette.hot : reached ? palette.lit : palette.dormant
  const bodyColor = reached ? palette.base : palette.dormant

  return (
    <group>
      {/*
        Opaque hot centre. Renders in the opaque pass, so every translucent
        shell below blends over it — that ordering is what makes the gradient
        read from the middle outward rather than as a flat disc.
      */}
      <mesh>
        <sphereGeometry args={[CORE_RADIUS, 16, 16]} />
        <meshBasicMaterial
          ref={coreRef}
          color={coreColor}
          transparent
          opacity={reached ? 0.95 : 0.5}
          toneMapped={false}
        />
      </mesh>

      {/* Lit shell — takes the rig light so the orb reads as a sphere. */}
      <mesh>
        <sphereGeometry args={[ORB_RADIUS, 24, 24]} />
        <meshStandardMaterial
          ref={bodyRef}
          color={bodyColor}
          emissive={reached ? palette.base : palette.dormant}
          emissiveIntensity={active ? 2.4 : reached ? 0.85 : 0.06}
          roughness={0.16}
          metalness={0.6}
          transparent
          opacity={reached ? 0.62 : 0.9}
          depthWrite={false}
        />
      </mesh>

      {/* Additive falloff. Two shells on high, one on medium, none on low. */}
      {quality.tier !== 'low' && reached && (
        <mesh>
          <sphereGeometry args={[INNER_HALO, 16, 16]} />
          <meshBasicMaterial
            color={active ? palette.hot : palette.lit}
            transparent
            opacity={active ? 0.3 : 0.15}
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {quality.tier === 'high' && reached && (
        <mesh>
          <sphereGeometry args={[OUTER_HALO, 16, 16]} />
          <meshBasicMaterial
            ref={outerRef}
            color={palette.base}
            transparent
            opacity={active ? 0.18 : 0.07}
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/*
        The glitter. Each instance is one GPU-animated Points draw with no
        per-frame CPU cost, so the row can afford one per revealed orb — but
        only the live one gets the full field. Waiting orbs stay bare, which
        makes the reveal itself feel like something igniting.

        High tier only, and off under reduced motion: the whole effect is
        movement, so damping it would leave a static speckle that reads as
        dirt on the projector lens.
      */}
      {reached && quality.tier === 'high' && !quality.reducedMotion && (
        <Sparkles
          count={active ? 26 : 12}
          scale={active ? 1.7 : 1.25}
          size={active ? 7 : 4}
          speed={active ? 0.4 : 0.18}
          noise={0.6}
          opacity={active ? 1 : 0.45}
          color={active ? palette.hot : palette.lit}
        />
      )}
    </group>
  )
}

export function AiHistoryWorld({ quality, accent }: Scene3DProps) {
  const groupRef = useRef<Group>(null)
  const { scene, beat } = usePresentation()
  const palette = useOrbPalette(accent)

  /*
    Scene 4 reveals one milestone per press, so the orbs step with the labels
    above them. Scene 5 shares this environment but is past the history, so it
    inherits the finished timeline rather than a half-built one.
  */
  const layout = getBeatLayout(scene)
  const stepping = scene.id === 'ai-is-not-new'
  const activeIndex = stepping ? beat - layout.stepsStart : -1

  useFrame((frame) => {
    if (!groupRef.current || quality.reducedMotion) return
    /*
      Translation only. The previous `rotation.y += delta * 0.01` accumulated:
      identical for a few seconds, then over scene 4's fifty seconds it turned
      the row nearly 30° and slid the orbs out from under their labels, with
      scene 5 inheriting the drift. Oscillating instead of accumulating bounds
      the error but does not remove it — any Y rotation tilts the row off the
      constant-depth plane. So there is none.
    */
    groupRef.current.position.y =
      ROW_Y + Math.sin(frame.clock.elapsedTime * 0.4) * 0.06
  })

  return (
    <group ref={groupRef} position={[0, ROW_Y, 0]}>
      {/* The spine, centred on the origin like the orbs it connects. */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, SPAN + SPACING, 6]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.3}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {AI_HISTORY.map((milestone, index) => {
        // Right to left: the earliest milestone sits furthest right, matching
        // the RTL flow of the labels beneath it. Centred, so the midpoint of
        // the row is the origin the camera is aimed at.
        const x = SPAN / 2 - index * SPACING

        // Same three states as the pipeline in scene 9: waiting, reached, and
        // the one being spoken about right now.
        const state: OrbState = !stepping
          ? 'reached'
          : index === activeIndex
            ? 'active'
            : index < activeIndex
              ? 'reached'
              : 'waiting'

        return (
          <group key={milestone.id} position={[x, 0, 0]}>
            <MilestoneOrb state={state} palette={palette} quality={quality} />
          </group>
        )
      })}

      {quality.tier === 'high' && (
        <ParticleField
          quality={quality}
          color={accent}
          density={0.35}
          spread={16}
          center={FIELD_CENTER}
          seed={seedFromString('aiHistory')}
        />
      )}
    </group>
  )
}
