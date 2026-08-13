import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { QualitySettings } from '@/types'

export interface PerfSample {
  fps: number
  calls: number
  triangles: number
  /* Wireframe geometry draws as lines and particles as points, so triangles
     alone reads as 0 even when the scene is rendering correctly. */
  lines: number
  points: number
}

/**
 * Rehearsal instrument, not a presentation feature.
 *
 * The quality tier is locked for the session, so this is how we find out during
 * rehearsal whether the boot-time guess was right for the actual laptop —
 * particularly at 1366×768, which is the hardware floor that matters.
 */
export function PerfMeter({
  quality,
  onSample,
}: {
  quality: QualitySettings
  onSample: (sample: PerfSample) => void
}) {
  const gl = useThree((state) => state.gl)
  const frames = useRef(0)
  const elapsed = useRef(0)

  useFrame((_, delta) => {
    frames.current += 1
    elapsed.current += delta

    // Sample once a second — updating state per frame is exactly what the
    // per-frame rule forbids.
    if (elapsed.current < 1) return

    onSample({
      fps: Math.round(frames.current / elapsed.current),
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      lines: gl.info.render.lines,
      points: gl.info.render.points,
    })

    frames.current = 0
    elapsed.current = 0
  })

  void quality
  return null
}

/** DOM readout that pairs with the in-canvas sampler above. */
export function PerfReadout({
  quality,
  sample,
}: {
  quality: QualitySettings
  sample: PerfSample | null
}) {
  return (
    <div
      data-no-advance
      className="text-caption fixed top-4 end-4 z-[var(--z-presenter)] rounded-card border border-line bg-void/85 px-4 py-2 text-muted latin"
    >
      <span className="text-text">{sample ? `${sample.fps} fps` : '— fps'}</span>
      {' · '}
      {quality.tier}
      {' · dpr '}
      {quality.dpr[1]}
      {' · '}
      {quality.particleBudget}p
      {sample
        ? ` · ${sample.calls} calls · ${sample.triangles}t/${sample.lines}l/${sample.points}pt`
        : ''}
      {quality.reducedMotion ? ' · reduced' : ''}
    </div>
  )
}
