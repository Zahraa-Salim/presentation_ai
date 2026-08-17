import { useContext, useEffect } from 'react'
import { PresentationStateContext } from '@/components/presentation/presentationContext'
import { markSceneEntered } from '@/lib/presenterSession'

/**
 * Records when each scene was entered. Renders nothing.
 *
 * A component rather than a hook inside AppInner, because AppInner does not
 * subscribe to presentation state today — and must not start. It sits above
 * ExperienceCanvas, so subscribing it would re-render the whole 3D tree on
 * every beat.
 *
 * Mounted unconditionally, not alongside the overlay: the panel is usually
 * closed, and if scene entries were only recorded while it was open the
 * per-scene timer would be wrong every time you reopened it. This also covers
 * the two ways a scene can change without a key press — the harness jump grid
 * and a `#/scene/N` hash change.
 *
 * Subscribes to the raw state context rather than usePresentation(), whose
 * memoised view recomputes far more than this needs.
 */
export function PresenterClockTracker() {
  const state = useContext(PresentationStateContext)
  const sceneIndex = state?.sceneIndex ?? 0

  useEffect(() => {
    markSceneEntered()
  }, [sceneIndex])

  return null
}
