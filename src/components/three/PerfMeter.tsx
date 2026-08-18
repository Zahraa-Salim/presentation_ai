import { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  formatPerfSummary,
  isPlausibleFrame,
  readPerfSummary,
  recordPerfSample,
  resetPerfSession,
} from '@/lib/perfSession'
import type { QualitySettings, WorldId } from '@/types'

export interface PerfSample {
  fps: number
  calls: number
  triangles: number
  /* Wireframe geometry draws as lines and particles as points, so triangles
     alone reads as 0 even when the scene is rendering correctly. */
  lines: number
  points: number
  /** Longest single frame inside the sampled second, in milliseconds. */
  worstFrameMs: number
}

/**
 * Rehearsal instrument, not a presentation feature.
 *
 * The quality tier is locked for the session, so this is how we find out during
 * rehearsal whether the boot-time guess was right for the actual laptop —
 * particularly at 1366×768, which is the hardware floor that matters.
 *
 * It also feeds `perfSession`, which accumulates per world. The presenter is
 * talking for 45 minutes; expecting them to also read this corner and write the
 * number down at each world boundary is how a rehearsal comes back with no
 * usable numbers.
 */
export function PerfMeter({
  quality,
  worldId,
  onSample,
}: {
  quality: QualitySettings
  /** Which world the frames are being spent in — the axis the summary is cut on. */
  worldId: WorldId
  onSample: (sample: PerfSample) => void
}) {
  const gl = useThree((state) => state.gl)
  const frames = useRef(0)
  const elapsed = useRef(0)
  const worstFrame = useRef(0)

  useFrame((_, delta) => {
    /*
      The browser stopped drawing rather than drew slowly — the tab went to the
      background, or the laptop idled. Throw the whole window away instead of
      recording an absence as a frame: the first rehearsal came back reporting a
      198-second worst frame and 0 fps, which was someone alt-tabbing.
    */
    if (!isPlausibleFrame(delta)) {
      frames.current = 0
      elapsed.current = 0
      worstFrame.current = 0
      return
    }

    frames.current += 1
    elapsed.current += delta
    // The average is the reassuring number; this is the honest one. A single
    // 40ms frame at a transition is visible in the room and invisible in a mean.
    worstFrame.current = Math.max(worstFrame.current, delta * 1000)

    // Sample once a second — updating state per frame is exactly what the
    // per-frame rule forbids.
    if (elapsed.current < 1) return

    const sample: PerfSample = {
      fps: Math.round(frames.current / elapsed.current),
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      lines: gl.info.render.lines,
      points: gl.info.render.points,
      worstFrameMs: worstFrame.current,
    }

    recordPerfSample(worldId, {
      fps: sample.fps,
      worstFrameMs: sample.worstFrameMs,
      calls: sample.calls,
    })
    onSample(sample)

    frames.current = 0
    elapsed.current = 0
    worstFrame.current = 0
  })

  void quality
  return null
}

function contextLine(quality: QualitySettings): string {
  const size =
    typeof window === 'undefined'
      ? ''
      : ` · ${window.innerWidth}×${window.innerHeight}`
  return `${quality.tier} · dpr ${quality.dpr[1]} · ${quality.particleBudget}p${size}${
    quality.reducedMotion ? ' · reduced motion' : ''
  }`
}

/**
 * The per-world table, opened by clicking the readout.
 *
 * Deliberately not a key binding: every key in this deck is a key the presenter
 * might hit by accident mid-lesson, and a perf table unfurling over the class
 * would be worse than not having one. A click on a corner element that only
 * exists under `?perf=1` cannot misfire.
 */
function PerfSummaryTable({ quality }: { quality: QualitySettings }) {
  const [copied, setCopied] = useState(false)
  const stats = readPerfSummary()

  const copy = () => {
    const text = formatPerfSummary(stats, contextLine(quality))
    // Clipboard, not network — `offline.test.ts` bans fetch/XHR/beacon and this
    // is none of them.
    void navigator.clipboard?.writeText(text).then(
      () => setCopied(true),
      () => setCopied(false),
    )
  }

  if (stats.length === 0) {
    return <p className="pt-2 text-muted">لم تُسجَّل أي إطارات بعد.</p>
  }

  return (
    <div className="pt-2">
      <table className="w-full border-collapse text-start">
        <thead className="text-muted">
          <tr>
            <th className="pe-3 text-start font-normal">world</th>
            <th className="pe-3 text-start font-normal">avg</th>
            <th className="pe-3 text-start font-normal">min</th>
            <th className="pe-3 text-start font-normal">worst</th>
            <th className="text-start font-normal">calls</th>
          </tr>
        </thead>
        <tbody className="text-text">
          {stats.map((s) => (
            <tr key={s.worldId}>
              <td className="pe-3">{s.worldId}</td>
              <td className="pe-3">{s.avgFps}</td>
              {/* Below 30 is the number worth finding; marked with a glyph as
                  well as colour, per the never-colour-alone rule. */}
              <td className={`pe-3 ${s.minFps < 30 ? 'text-danger' : ''}`}>
                {s.minFps < 30 ? '! ' : ''}
                {s.minFps}
              </td>
              <td className="pe-3">{s.worstFrameMs}ms</td>
              <td>{s.maxCalls}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={copy}
          className="rounded-pill border border-line px-2 py-0.5 text-muted hover:text-text"
        >
          {copied ? 'copied' : 'copy'}
        </button>
        <button
          type="button"
          onClick={() => {
            resetPerfSession()
            setCopied(false)
          }}
          className="rounded-pill border border-line px-2 py-0.5 text-muted hover:text-text"
        >
          reset
        </button>
      </div>
    </div>
  )
}

/** DOM readout that pairs with the in-canvas sampler above. */
export function PerfReadout({
  quality,
  sample,
}: {
  quality: QualitySettings
  sample: PerfSample | null
}) {
  const [open, setOpen] = useState(false)

  return (
    <div
      data-no-advance
      className="text-caption fixed top-4 end-4 z-[var(--z-presenter)] max-w-[min(90vw,26rem)] rounded-card border border-line bg-void/85 px-4 py-2 text-muted latin"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-start"
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
        {' · '}
        <span className="text-text">{open ? '▴' : '▾'}</span>
      </button>

      {open && <PerfSummaryTable quality={quality} />}
    </div>
  )
}
