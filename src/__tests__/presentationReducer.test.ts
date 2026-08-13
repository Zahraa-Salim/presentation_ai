import { describe, expect, it } from 'vitest'
import { SCENES } from '@/data/scenes'
import { getSceneBeatCount, getTotalBeats } from '@/lib/beats'
import {
  initialPresentationState,
  presentationReducer as reduce,
} from '@/lib/presentationReducer'
import { readSceneFromHash } from '@/lib/hash'
import type { PresentationState } from '@/types'

const beats = SCENES.map(getSceneBeatCount)
const key = (s: PresentationState) => `${s.sceneIndex}:${s.beat}`
const LAST = SCENES.length - 1

describe('beat counts', () => {
  it('totals 59 beats across the deck', () => {
    expect(getTotalBeats()).toBe(59)
  })

  it('gives the finale 6 beats — 4 steps plus its statement', () => {
    expect(beats[32]).toBe(6)
  })

  it('gives the opening 2 beats — statementReveal is presenter-stepped', () => {
    expect(beats[0]).toBe(2)
  })

  it('gives the prompt-lab scene 5 beats — one per build stage', () => {
    expect(beats[17]).toBe(5)
  })

  it('gives the pipeline scene 6 beats — one per stage', () => {
    expect(beats[8]).toBe(6)
  })

  it('gives a plain fade scene with no steps a single beat', () => {
    expect(beats[2]).toBe(1)
  })

  it('never produces a scene with zero beats', () => {
    expect(beats.every((b) => b >= 1)).toBe(true)
  })

  it('gives all 5 statementReveal scenes at least 2 beats', () => {
    const statements = SCENES.filter((s) => s.transition === 'statementReveal')
    expect(statements).toHaveLength(5)
    expect(statements.every((s) => getSceneBeatCount(s) >= 2)).toBe(true)
  })
})

describe('walking the deck', () => {
  const walk = (from: PresentationState, action: 'NEXT' | 'PREV') => {
    const visited = [key(from)]
    let state = from
    for (let guard = 0; guard < 5000; guard++) {
      const next = reduce(state, { type: action })
      if (next === state) break
      state = next
      visited.push(key(state))
    }
    return { state, visited }
  }

  it('reaches the last beat of the last scene going forward', () => {
    const { state } = walk(initialPresentationState(0), 'NEXT')
    expect(state.sceneIndex).toBe(LAST)
    expect(state.beat).toBe(beats[LAST] - 1)
  })

  it('visits exactly getTotalBeats() distinct states, skipping none', () => {
    const { visited } = walk(initialPresentationState(0), 'NEXT')
    expect(visited).toHaveLength(getTotalBeats())
    expect(new Set(visited).size).toBe(visited.length)
  })

  it('mirrors the forward path exactly when walking back', () => {
    const forward = walk(initialPresentationState(0), 'NEXT')
    const backward = walk(forward.state, 'PREV')
    expect(backward.visited.reverse()).toEqual(forward.visited)
  })

  it('returns to the very start going back', () => {
    const forward = walk(initialPresentationState(0), 'NEXT')
    expect(key(walk(forward.state, 'PREV').state)).toBe('0:0')
  })
})

describe('bounds — the deck never wraps', () => {
  it('ignores NEXT at the very end', () => {
    const end = { sceneIndex: LAST, beat: beats[LAST] - 1, direction: 1 as const }
    expect(reduce(end, { type: 'NEXT' })).toBe(end)
  })

  it('ignores PREV at the very start', () => {
    const start = initialPresentationState(0)
    expect(reduce(start, { type: 'PREV' })).toBe(start)
  })

  it('ignores NEXT_SCENE on the last scene', () => {
    const state = initialPresentationState(LAST)
    expect(reduce(state, { type: 'NEXT_SCENE' })).toBe(state)
  })
})

describe('going back shows a scene fully revealed', () => {
  it('lands on the previous scene at its last beat, not its first', () => {
    const state = reduce(initialPresentationState(1), { type: 'PREV' })
    expect(state.sceneIndex).toBe(0)
    expect(state.beat).toBe(beats[0] - 1)
  })
})

describe('scene-level navigation skips beats', () => {
  it('PREV_SCENE lands at beat 0 of the previous scene', () => {
    let state = initialPresentationState(32)
    state = reduce(state, { type: 'NEXT' })
    state = reduce(state, { type: 'NEXT' })
    expect(state.beat).toBe(2)
    expect(key(reduce(state, { type: 'PREV_SCENE' }))).toBe('31:0')
  })
})

describe('jump, first and last', () => {
  const base = initialPresentationState(0)

  it('jumps to a scene at beat 0', () => {
    expect(key(reduce(base, { type: 'JUMP_TO_SCENE', sceneIndex: 26 }))).toBe(
      '26:0',
    )
  })

  it('sets direction forward or backward from the jump', () => {
    const forward = reduce(base, { type: 'JUMP_TO_SCENE', sceneIndex: 26 })
    expect(forward.direction).toBe(1)
    expect(
      reduce(forward, { type: 'JUMP_TO_SCENE', sceneIndex: 4 }).direction,
    ).toBe(-1)
  })

  it('clamps out-of-range jumps instead of breaking', () => {
    expect(
      reduce(base, { type: 'JUMP_TO_SCENE', sceneIndex: 999 }).sceneIndex,
    ).toBe(LAST)
    expect(
      reduce(base, { type: 'JUMP_TO_SCENE', sceneIndex: -5 }).sceneIndex,
    ).toBe(0)
  })

  it('sends FIRST to the start and LAST to the fully-revealed end', () => {
    expect(key(reduce(base, { type: 'FIRST' }))).toBe('0:0')
    expect(key(reduce(base, { type: 'LAST' }))).toBe(`${LAST}:${beats[LAST] - 1}`)
  })
})

describe('hash deep-linking', () => {
  it.each([
    ['#/scene/27', 26],
    ['#/scene/1', 0],
    ['#/scene/33', 32],
  ])('parses %s to index %i', (hash, expected) => {
    expect(readSceneFromHash(hash)).toBe(expected)
  })

  it.each(['#/scene/99', '#/scene/0', '#/scene/abc', '#/scene/', '', '#/nonsense', '#/scene/2.5'])(
    'rejects %s rather than producing a bad scene',
    (hash) => {
      expect(readSceneFromHash(hash)).toBeNull()
    },
  )
})
