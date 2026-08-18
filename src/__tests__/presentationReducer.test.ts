import { describe, expect, it } from 'vitest'
import { CORE_RULES } from '@/data/coreRules'
import { SCENES } from '@/data/scenes'
import { getSceneBeatCount, getTotalBeats } from '@/lib/beats'
import {
  initialPresentationState,
  presentationReducer as reduce,
} from '@/lib/presentationReducer'
import { readSceneFromHash } from '@/lib/hash'
import type { PresentationState } from '@/types'

const beats = SCENES.map(getSceneBeatCount)
const key = (s: PresentationState) =>
  s.coda === null ? `${s.sceneIndex}:${s.beat}` : `coda:${s.coda}`
const LAST = SCENES.length - 1

describe('beat counts', () => {
  /* Pinned so an accidental change is visible. It moves legitimately as the
     deck is transcribed — each list the deck supplies becomes a reveal step —
     so update it deliberately, never to make a red test go green. */
  it('totals 106 beats across the deck', () => {
    expect(getTotalBeats()).toBe(106)
  })

  it('gives the finale 6 beats — 4 steps plus its statement', () => {
    expect(beats[32]).toBe(6)
  })

  it('gives the opening 2 beats — statementReveal is presenter-stepped', () => {
    expect(beats[0]).toBe(2)
  })

  it('gives the prompt-lab scene 6 beats — one per build stage, then its takeaway', () => {
    expect(beats[17]).toBe(6)
  })

  it('gives the pipeline scene 7 beats — one per stage, then its takeaway', () => {
    expect(beats[8]).toBe(7)
  })

  /* Structural rather than pinned to a scene index: which scenes are bare
     changes as the deck lands, but the rule that a bare scene rests at one
     beat does not. */
  it('gives a scene with nothing to reveal exactly one beat', () => {
    const bare = SCENES.filter(
      (s) =>
        !s.content.steps?.length &&
        !s.content.groups?.length &&
        !s.interaction &&
        s.transition !== 'statementReveal',
    )
    expect(bare.length).toBeGreaterThan(0)
    expect(bare.every((s) => getSceneBeatCount(s) === 1)).toBe(true)
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
  /**
   * Walks the whole deck, *through* the coda but without counting it.
   *
   * The coda sits between scenes 32 and 33 and is not a beat. Counting its
   * presses would make `getTotalBeats()` quietly stop meaning what it says;
   * stopping at it would leave scene 33 unwalked.
   */
  const walk = (from: PresentationState, action: 'NEXT' | 'PREV') => {
    const visited = [key(from)]
    let state = from
    for (let guard = 0; guard < 5000; guard++) {
      const next = reduce(state, { type: action })
      if (next === state) break
      state = next
      if (state.coda === null) visited.push(key(state))
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

const deckEnd: PresentationState = {
  sceneIndex: LAST,
  beat: beats[LAST] - 1,
  direction: 1,
  coda: null,
}

/** The last beat of scene 32 — the one place the coda opens from. */
const beforeCoda: PresentationState = {
  sceneIndex: LAST - 1,
  beat: beats[LAST - 1] - 1,
  direction: 1,
  coda: null,
}

describe('bounds — the deck never wraps', () => {
  it('ignores NEXT at the very end', () => {
    expect(reduce(deckEnd, { type: 'NEXT' })).toBe(deckEnd)
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

describe('the coda — five core rules before the closing message', () => {
  const openCoda = (step: number): PresentationState => ({
    ...beforeCoda,
    coda: step,
  })

  it('opens on pressing past the careers scene, not past the deck', () => {
    expect(reduce(beforeCoda, { type: 'NEXT' }).coda).toBe(0)
    expect(reduce(deckEnd, { type: 'NEXT' }).coda).toBeNull()
  })

  it('does not open one beat early', () => {
    const oneShort: PresentationState = {
      ...beforeCoda,
      beat: beats[LAST - 1] - 2,
    }
    const next = reduce(oneShort, { type: 'NEXT' })
    expect(next.coda).toBeNull()
    expect(next.beat).toBe(beats[LAST - 1] - 1)
  })

  it('reveals one rule per press', () => {
    let state = reduce(beforeCoda, { type: 'NEXT' })
    for (let i = 1; i <= CORE_RULES.length; i++) {
      state = reduce(state, { type: 'NEXT' })
      expect(state.coda).toBe(i)
    }
  })

  /* The whole reason it moved here: the lesson must end on
     `خلي AI يساعدك، مش يفكّر بدالك.`, not on a summary of it. */
  it('hands over to the closing message after the fifth rule', () => {
    const state = reduce(openCoda(CORE_RULES.length), { type: 'NEXT' })
    expect(state.coda).toBeNull()
    expect(key(state)).toBe(`${LAST}:0`)
  })

  it('never moves the scene while it is open', () => {
    let state = reduce(beforeCoda, { type: 'NEXT' })
    for (let i = 0; i < CORE_RULES.length; i++) {
      state = reduce(state, { type: 'NEXT' })
      expect(state.sceneIndex).toBe(LAST - 1)
      expect(state.beat).toBe(beats[LAST - 1] - 1)
    }
  })

  it('walks back out to the careers scene fully revealed', () => {
    let state: PresentationState = openCoda(CORE_RULES.length)
    for (let i = 0; i < CORE_RULES.length + 1; i++) {
      state = reduce(state, { type: 'PREV' })
    }
    expect(state.coda).toBeNull()
    expect(key(state)).toBe(`${LAST - 1}:${beats[LAST - 1] - 1}`)
  })

  it('backing out of the closing message returns to the coda fully revealed', () => {
    const state = reduce(
      { sceneIndex: LAST, beat: 0, direction: 1, coda: null },
      { type: 'PREV' },
    )
    expect(state.coda).toBe(CORE_RULES.length)
  })

  it('is symmetric — forward then back returns every state in reverse', () => {
    const forward: string[] = [key(beforeCoda)]
    let state: PresentationState = beforeCoda
    for (let i = 0; i <= CORE_RULES.length + 1; i++) {
      state = reduce(state, { type: 'NEXT' })
      forward.push(key(state))
    }

    const backward: string[] = [key(state)]
    for (let i = 0; i <= CORE_RULES.length + 1; i++) {
      state = reduce(state, { type: 'PREV' })
      backward.push(key(state))
    }

    expect(backward.reverse()).toEqual(forward)
  })

  /* End goes to the ending, never to the recap in front of it. */
  it('LAST lands on the closing message with the coda closed', () => {
    const state = reduce(openCoda(3), { type: 'LAST' })
    expect(state.coda).toBeNull()
    expect(key(state)).toBe(`${LAST}:${beats[LAST] - 1}`)
  })

  it.each([
    ['FIRST', { type: 'FIRST' } as const, 0],
    ['JUMP_TO_SCENE', { type: 'JUMP_TO_SCENE', sceneIndex: 11 } as const, 11],
  ])('%s closes the coda and leaves the deck', (_label, action, expected) => {
    const state = reduce(openCoda(2), action)
    expect(state.coda).toBeNull()
    expect(state.sceneIndex).toBe(expected)
    expect(state.beat).toBe(0)
  })

  it('NEXT_SCENE skips the rest of the rules and lands on the closing message', () => {
    const state = reduce(openCoda(1), { type: 'NEXT_SCENE' })
    expect(state.coda).toBeNull()
    expect(key(state)).toBe(`${LAST}:0`)
  })

  it('PREV_SCENE leaves it for the careers scene at rest', () => {
    const state = reduce(openCoda(4), { type: 'PREV_SCENE' })
    expect(state.coda).toBeNull()
    expect(key(state)).toBe(`${LAST - 1}:0`)
  })

  /* The load-bearing guarantee of the whole design: the coda is not a scene.
     If either of these moves, the 45-minute budget and the progress bar have
     silently changed meaning. */
  it('leaves the deck at 33 scenes and 106 beats', () => {
    expect(SCENES).toHaveLength(33)
    expect(getTotalBeats()).toBe(106)
  })

  it('starts closed', () => {
    expect(initialPresentationState(0).coda).toBeNull()
    expect(initialPresentationState(LAST).coda).toBeNull()
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
