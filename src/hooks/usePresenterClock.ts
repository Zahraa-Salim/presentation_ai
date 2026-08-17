import { useEffect, useState } from 'react'
import { readPresenterSession } from '@/lib/presenterSession'

/**
 * Ticks the presenter clock — and nothing else.
 *
 * Must only be called from the smallest component that actually renders digits.
 * Called any higher and every tick re-renders the 3D canvas, for 45 minutes.
 *
 * Samples at 500ms but stores whole seconds, so half the samples produce an
 * identical value and React bails out of re-rendering. Sampling faster than the
 * displayed resolution is what keeps the seconds from visibly skipping: a plain
 * 1000ms interval drifts, and over 45 minutes you watch it jump 12:03 → 12:05.
 *
 * The three values are separate `useState` calls on purpose — one state object
 * would allocate a new reference every sample and defeat the bail-out.
 */
export function usePresenterClock(active: boolean) {
  const initial = readPresenterSession()
  const [isRunning, setIsRunning] = useState(initial.isRunning)
  const [elapsedSec, setElapsedSec] = useState(initial.elapsedSec)
  const [sceneElapsedSec, setSceneElapsedSec] = useState(initial.sceneElapsedSec)

  useEffect(() => {
    // No interval at all while the panel is closed. Accumulation is unaffected:
    // elapsed is derived from timestamps, so reopening reads correctly at once.
    if (!active) return

    const sample = () => {
      const reading = readPresenterSession()
      setIsRunning(reading.isRunning)
      setElapsedSec(reading.elapsedSec)
      setSceneElapsedSec(reading.sceneElapsedSec)
    }

    sample()
    const id = window.setInterval(sample, 500)
    return () => window.clearInterval(id)
  }, [active])

  return { isRunning, elapsedSec, sceneElapsedSec }
}
