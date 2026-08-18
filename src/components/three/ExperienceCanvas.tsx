import { createElement, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraController } from '@/components/three/CameraController'
import { CanvasErrorBoundary } from '@/components/three/CanvasErrorBoundary'
import { AccentLight, Lighting } from '@/components/three/Lighting'
import {
  PerfMeter,
  PerfReadout,
  type PerfSample,
} from '@/components/three/PerfMeter'
import { PresentationRobot } from '@/components/three/PresentationRobot'
import { getScene3DComponent } from '@/components/three/sceneRegistry'
import { usePresentation } from '@/hooks/usePresentation'
import { useQualityTier } from '@/hooks/useQualityTier'
import { getWorldAccent } from '@/lib/worldAccent'
import { RobotModel } from '@/components/three/RobotModel'
import { getCameraPose } from '@/lib/cameraPoses'
import type { NovaEmotion } from '@/types'

/**
 * The one and only WebGL canvas.
 *
 * Mounted once for the whole session and never unmounted: a canvas per scene
 * would destroy and recreate a WebGL context on every navigation, and browsers
 * silently kill the oldest context once past their cap.
 *
 * It is a backdrop and nothing else — pointer-events are off so click-to-advance
 * and every interaction keep receiving their clicks, and no Arabic text ever
 * renders inside it, because Three.js cannot shape or bidi Arabic correctly.
 */
interface ExperienceCanvasProps {
  /**
   * TEMPORARY. Lets the dev harness drive NOVA so all 12 states can be
   * reviewed as the class will see them, without walking to their scenes.
   */
  demoEmotion?: NovaEmotion
}

export function ExperienceCanvas({ demoEmotion }: ExperienceCanvasProps = {}) {
  const quality = useQualityTier()
  const { scene, world } = usePresentation()
  const [sample, setSample] = useState<PerfSample | null>(null)

  const accent = useMemo(() => getWorldAccent(world.id), [world.id])

  const showPerf =
    import.meta.env.DEV ||
    new URLSearchParams(window.location.search).has('perf')

  return (
    <CanvasErrorBoundary>
      {/*
        Hidden from assistive technology entirely. The canvas is decorative by
        rule — no Arabic text ever renders inside WebGL, so every word on screen
        is already in the DOM layer above it. Left exposed, a screen reader
        announces a canvas that can tell it nothing.
      */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[var(--z-canvas)]"
      >
        <Canvas
          dpr={quality.dpr}
          shadows={quality.shadows}
          camera={{ position: [0, 0.5, 14], fov: 55 }}
          gl={{
            antialias: quality.tier !== 'low',
            powerPreference: 'high-performance',
          }}
        >
          <CameraController quality={quality} />
          <Lighting quality={quality} />
          {/*
            Worlds are authored around their own local origin; this anchors them
            at the scene's camera target so each one sits in its own part of the
            traversal. Without it a world built at the origin falls outside the
            frustum of any camera pose further out along X — a black screen.

            The registry holds stable module-level components; createElement
            keeps that obvious rather than assigning one to a local, which
            reads to the linter as building a component during render.
          */}
          <group position={getCameraPose(scene.scene3d).target}>
            {/* Inside the group on purpose: a point light is positional, and
                out here its 30-unit falloff never reached the three worlds
                past x = 48. See Lighting.tsx. */}
            <AccentLight accent={accent} />

            {createElement(getScene3DComponent(scene.scene3d), {
              scene3d: scene.scene3d,
              quality,
              accent,
            })}
          </group>

          {/* The harness drives the shipping body, so all twelve states can be
              reviewed as the class will actually see them. */}
          {demoEmotion && (
            <group
              position={[
                getCameraPose(scene.scene3d).target[0] + 2.6,
                getCameraPose(scene.scene3d).target[1] - 0.4,
                getCameraPose(scene.scene3d).target[2] + 2,
              ]}
              scale={1.6}
            >
              <RobotModel
                emotion={demoEmotion}
                quality={quality}
                accent={accent}
              />
            </group>
          )}
          {/*
            NOVA rides the corner of the frame for the whole lesson. Anchored to
            the camera rather than to the world, so it stays put while the world
            slides past — see PresentationRobot. Behaviour is data keyed by
            scene id; this places it and nothing more.
          */}
          <PresentationRobot quality={quality} accent={accent} />

          {showPerf && (
            <PerfMeter
              quality={quality}
              worldId={world.id}
              onSample={setSample}
            />
          )}
        </Canvas>
      </div>

      {showPerf && <PerfReadout quality={quality} sample={sample} />}
    </CanvasErrorBoundary>
  )
}
