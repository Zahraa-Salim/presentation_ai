import { useContext, useMemo } from 'react'
import {
  PresentationActionsContext,
  PresentationStateContext,
} from '@/components/presentation/presentationContext'
import { SCENES } from '@/data/scenes'
import { WORLD_BY_ID } from '@/data/worlds'
import { getSceneBeatCount } from '@/lib/beats'
import type {
  PresentationActions,
  SceneDef,
  WorldDef,
} from '@/types'

export interface PresentationView {
  scene: SceneDef
  world: WorldDef
  /** 1-based, as shown to the presenter. */
  sceneNumber: number
  totalScenes: number

  beat: number
  beatCount: number
  isSceneFullyRevealed: boolean

  isFirstScene: boolean
  isLastScene: boolean
  isFirstBeat: boolean
  isLastBeat: boolean
  canGoNext: boolean
  canGoPrev: boolean

  /** 0..1 across the deck, scene-granular — matches the "12 / 33" chrome. */
  progress: number
  /** 0..1 through the current scene's beats. */
  sceneProgress: number
  direction: 1 | -1
}

/**
 * Current presentation state plus everything derived from it, so components
 * never recompute scene lookups or progress themselves.
 */
export function usePresentation(): PresentationView {
  const state = useContext(PresentationStateContext)
  if (!state) {
    throw new Error('usePresentation must be used inside <PresentationProvider>.')
  }

  return useMemo(() => {
    const scene = SCENES[state.sceneIndex]
    const beatCount = getSceneBeatCount(scene)
    const totalScenes = SCENES.length

    const isFirstScene = state.sceneIndex === 0
    const isLastScene = state.sceneIndex === totalScenes - 1
    const isFirstBeat = state.beat === 0
    const isLastBeat = state.beat >= beatCount - 1

    return {
      scene,
      world: WORLD_BY_ID[scene.world],
      sceneNumber: state.sceneIndex + 1,
      totalScenes,

      beat: state.beat,
      beatCount,
      isSceneFullyRevealed: isLastBeat,

      isFirstScene,
      isLastScene,
      isFirstBeat,
      isLastBeat,
      canGoNext: !(isLastScene && isLastBeat),
      canGoPrev: !(isFirstScene && isFirstBeat),

      progress: (state.sceneIndex + 1) / totalScenes,
      sceneProgress: beatCount > 1 ? state.beat / (beatCount - 1) : 1,
      direction: state.direction,
    }
  }, [state])
}

/**
 * Navigation actions only. This context never changes, so components using
 * just this hook do not re-render when the beat advances.
 */
export function usePresentationActions(): PresentationActions {
  const actions = useContext(PresentationActionsContext)
  if (!actions) {
    throw new Error(
      'usePresentationActions must be used inside <PresentationProvider>.',
    )
  }
  return actions
}
