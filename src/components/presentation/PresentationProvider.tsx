import { useEffect, useMemo, useReducer, type ReactNode } from 'react'
import {
  PresentationActionsContext,
  PresentationStateContext,
} from '@/components/presentation/presentationContext'
import { readSceneFromHash, subscribeToHash, writeSceneToHash } from '@/lib/hash'
import {
  initialPresentationState,
  presentationReducer,
} from '@/lib/presentationReducer'
import type { PresentationActions } from '@/types'

interface PresentationProviderProps {
  children: ReactNode
}

/**
 * Owns presentation state for the whole experience.
 *
 * Headless: no keyboard bindings (Task 04), no UI (Task 05), no transitions
 * (Task 06).
 */
export function PresentationProvider({ children }: PresentationProviderProps) {
  const [state, dispatch] = useReducer(
    presentationReducer,
    // Start wherever the URL points, so a reload during rehearsal resumes.
    readSceneFromHash() ?? 0,
    initialPresentationState,
  )

  // dispatch is stable, so these are created once and never invalidate.
  const actions = useMemo<PresentationActions>(
    () => ({
      next: () => dispatch({ type: 'NEXT' }),
      prev: () => dispatch({ type: 'PREV' }),
      nextScene: () => dispatch({ type: 'NEXT_SCENE' }),
      prevScene: () => dispatch({ type: 'PREV_SCENE' }),
      jumpToScene: (sceneIndex: number) =>
        dispatch({ type: 'JUMP_TO_SCENE', sceneIndex }),
      first: () => dispatch({ type: 'FIRST' }),
      last: () => dispatch({ type: 'LAST' }),
    }),
    [],
  )

  // Keep the URL current. Idempotent, so StrictMode's double-invoke is a no-op.
  useEffect(() => {
    writeSceneToHash(state.sceneIndex)
  }, [state.sceneIndex])

  // React to the URL being edited by hand.
  useEffect(
    () =>
      subscribeToHash((sceneIndex) =>
        dispatch({ type: 'JUMP_TO_SCENE', sceneIndex }),
      ),
    [],
  )

  return (
    <PresentationStateContext.Provider value={state}>
      <PresentationActionsContext.Provider value={actions}>
        {children}
      </PresentationActionsContext.Provider>
    </PresentationStateContext.Provider>
  )
}
