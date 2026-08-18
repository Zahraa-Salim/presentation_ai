import { CORE_RULES } from '@/data/coreRules'
import { SCENES } from '@/data/scenes'
import { getSceneBeatCount } from '@/lib/beats'
import type { PresentationAction, PresentationState } from '@/types'

const LAST_SCENE_INDEX = SCENES.length - 1

/**
 * The coda's last position — the fifth rule revealed.
 */
const LAST_CODA_STEP = CORE_RULES.length

/**
 * The coda sits between the careers scene and the closing message: press on
 * from the last beat of scene 32 and the five rules arrive, then scene 33 has
 * the last word.
 *
 * It was originally past scene 33. Moving it here means the deck ends on
 * `خلي AI يساعدك، مش يفكّر بدالك.` rather than on a summary of it, which is the
 * right shape — a recap belongs before the closing line, not after it.
 */
const CODA_AFTER_SCENE_INDEX = LAST_SCENE_INDEX - 1

/** The scene the coda hands over to. */
const CODA_NEXT_SCENE_INDEX = LAST_SCENE_INDEX

const clampScene = (index: number): number =>
  Math.min(Math.max(index, 0), LAST_SCENE_INDEX)

const beatsAt = (sceneIndex: number): number =>
  getSceneBeatCount(SCENES[clampScene(sceneIndex)])

const isAtDeckEnd = (state: PresentationState): boolean =>
  state.sceneIndex >= LAST_SCENE_INDEX &&
  state.beat >= beatsAt(LAST_SCENE_INDEX) - 1

/** The one place in the deck the coda opens from. */
const opensCoda = (state: PresentationState): boolean =>
  state.sceneIndex === CODA_AFTER_SCENE_INDEX &&
  state.beat >= beatsAt(CODA_AFTER_SCENE_INDEX) - 1

export function initialPresentationState(sceneIndex = 0): PresentationState {
  return { sceneIndex: clampScene(sceneIndex), beat: 0, direction: 1, coda: null }
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
 *
 * Between the careers scene and the closing message sits the **coda** — the
 * five core rules, which belong to no scene because the 33 already total
 * exactly 45 minutes. It is reached by pressing on and never landed on by a
 * jump: `End` goes to the closing message, not to the summary before it.
 */
export function presentationReducer(
  state: PresentationState,
  action: PresentationAction,
): PresentationState {
  switch (action.type) {
    case 'NEXT': {
      if (state.coda !== null) {
        if (state.coda < LAST_CODA_STEP) {
          return { ...state, coda: state.coda + 1, direction: 1 }
        }
        // Past the fifth rule the deck resumes, at the closing message.
        return {
          sceneIndex: CODA_NEXT_SCENE_INDEX,
          beat: 0,
          direction: 1,
          coda: null,
        }
      }
      if (state.beat < beatsAt(state.sceneIndex) - 1) {
        return { ...state, beat: state.beat + 1, direction: 1 }
      }
      if (opensCoda(state)) {
        return { ...state, coda: 0, direction: 1 }
      }
      if (state.sceneIndex >= LAST_SCENE_INDEX) return state
      return {
        sceneIndex: state.sceneIndex + 1,
        beat: 0,
        direction: 1,
        coda: null,
      }
    }

    case 'PREV': {
      if (state.coda !== null) {
        // Leaving the coda returns to the careers scene fully revealed, not
        // rebuilt from beat 0.
        if (state.coda === 0) {
          return {
            sceneIndex: CODA_AFTER_SCENE_INDEX,
            beat: beatsAt(CODA_AFTER_SCENE_INDEX) - 1,
            direction: -1,
            coda: null,
          }
        }
        return { ...state, coda: state.coda - 1, direction: -1 }
      }
      // Backing out of the closing message returns to the coda, fully revealed
      // — the same rule the deck follows between scenes.
      if (state.beat === 0 && state.sceneIndex === CODA_NEXT_SCENE_INDEX) {
        return {
          sceneIndex: CODA_AFTER_SCENE_INDEX,
          beat: beatsAt(CODA_AFTER_SCENE_INDEX) - 1,
          direction: -1,
          coda: LAST_CODA_STEP,
        }
      }
      if (state.beat > 0) {
        return { ...state, beat: state.beat - 1, direction: -1 }
      }
      if (state.sceneIndex <= 0) return state
      const target = state.sceneIndex - 1
      return {
        sceneIndex: target,
        beat: beatsAt(target) - 1,
        direction: -1,
        coda: null,
      }
    }

    case 'NEXT_SCENE': {
      // Skipping forward out of the coda lands on the closing message.
      if (state.coda !== null) {
        return {
          sceneIndex: CODA_NEXT_SCENE_INDEX,
          beat: 0,
          direction: 1,
          coda: null,
        }
      }
      if (state.sceneIndex >= LAST_SCENE_INDEX) return state
      return {
        sceneIndex: state.sceneIndex + 1,
        beat: 0,
        direction: 1,
        coda: null,
      }
    }

    case 'PREV_SCENE': {
      if (state.coda !== null) {
        return {
          sceneIndex: CODA_AFTER_SCENE_INDEX,
          beat: 0,
          direction: -1,
          coda: null,
        }
      }
      if (state.sceneIndex <= 0) return state
      return {
        sceneIndex: state.sceneIndex - 1,
        beat: 0,
        direction: -1,
        coda: null,
      }
    }

    case 'JUMP_TO_SCENE': {
      const target = clampScene(action.sceneIndex)
      if (target === state.sceneIndex && state.beat === 0 && state.coda === null) {
        return state
      }
      return {
        sceneIndex: target,
        beat: 0,
        direction: target >= state.sceneIndex ? 1 : -1,
        coda: null,
      }
    }

    case 'FIRST':
      if (state.sceneIndex === 0 && state.beat === 0 && state.coda === null) {
        return state
      }
      return { sceneIndex: 0, beat: 0, direction: -1, coda: null }

    case 'LAST': {
      const beat = beatsAt(LAST_SCENE_INDEX) - 1
      if (isAtDeckEnd(state) && state.coda === null) return state
      return { sceneIndex: LAST_SCENE_INDEX, beat, direction: 1, coda: null }
    }

    default:
      return state
  }
}
