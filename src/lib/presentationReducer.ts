import { SCENES } from '@/data/scenes'
import { getSceneBeatCount } from '@/lib/beats'
import type { PresentationAction, PresentationState } from '@/types'

const LAST_SCENE_INDEX = SCENES.length - 1

const clampScene = (index: number): number =>
  Math.min(Math.max(index, 0), LAST_SCENE_INDEX)

const beatsAt = (sceneIndex: number): number =>
  getSceneBeatCount(SCENES[clampScene(sceneIndex)])

export function initialPresentationState(sceneIndex = 0): PresentationState {
  return { sceneIndex: clampScene(sceneIndex), beat: 0, direction: 1 }
}

/**
 * Pure navigation logic for the presentation.
 *
 * Two rules drive everything:
 *  - Forward moves reveal beat by beat, then step to the next scene at rest.
 *  - Backward moves land on the previous scene **fully revealed**, so the
 *    presenter does not have to click through a build they already showed.
 *
 * Never wraps: the first and last beats are hard stops. Reaching the end of
 * the deck mid-sentence and looping back to the opening would be worse than
 * nothing happening.
 */
export function presentationReducer(
  state: PresentationState,
  action: PresentationAction,
): PresentationState {
  switch (action.type) {
    case 'NEXT': {
      if (state.beat < beatsAt(state.sceneIndex) - 1) {
        return { ...state, beat: state.beat + 1, direction: 1 }
      }
      if (state.sceneIndex >= LAST_SCENE_INDEX) return state
      return { sceneIndex: state.sceneIndex + 1, beat: 0, direction: 1 }
    }

    case 'PREV': {
      if (state.beat > 0) {
        return { ...state, beat: state.beat - 1, direction: -1 }
      }
      if (state.sceneIndex <= 0) return state
      const target = state.sceneIndex - 1
      return { sceneIndex: target, beat: beatsAt(target) - 1, direction: -1 }
    }

    case 'NEXT_SCENE': {
      if (state.sceneIndex >= LAST_SCENE_INDEX) return state
      return { sceneIndex: state.sceneIndex + 1, beat: 0, direction: 1 }
    }

    case 'PREV_SCENE': {
      if (state.sceneIndex <= 0) return state
      return { sceneIndex: state.sceneIndex - 1, beat: 0, direction: -1 }
    }

    case 'JUMP_TO_SCENE': {
      const target = clampScene(action.sceneIndex)
      if (target === state.sceneIndex && state.beat === 0) return state
      return {
        sceneIndex: target,
        beat: 0,
        direction: target >= state.sceneIndex ? 1 : -1,
      }
    }

    case 'FIRST':
      if (state.sceneIndex === 0 && state.beat === 0) return state
      return { sceneIndex: 0, beat: 0, direction: -1 }

    case 'LAST': {
      const beat = beatsAt(LAST_SCENE_INDEX) - 1
      if (state.sceneIndex === LAST_SCENE_INDEX && state.beat === beat) {
        return state
      }
      return { sceneIndex: LAST_SCENE_INDEX, beat, direction: 1 }
    }

    default:
      return state
  }
}
