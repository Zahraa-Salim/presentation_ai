import { describe, expect, it } from 'vitest'
import { SCENES } from '@/data/scenes'
import { getBeatLayout } from '@/lib/beats'
import {
  DURATIONS,
  RTL_SIGN,
  TRANSITION_PRESETS,
  getStatementPhase,
  getTransitionPreset,
  isStatementScene,
  toReducedMotion,
} from '@/lib/transitions'
import { TRANSITION_IDS } from '@/types'
import type { TransitionId } from '@/types'

describe('preset coverage', () => {
  it('has a preset for every TransitionId', () => {
    expect(TRANSITION_IDS.every((id) => TRANSITION_PRESETS[id])).toBe(true)
  })

  it('resolves every scene in the deck', () => {
    expect(SCENES.every((s) => TRANSITION_PRESETS[s.transition])).toBe(true)
  })

  it('has no orphan presets', () => {
    expect(Object.keys(TRANSITION_PRESETS)).toHaveLength(TRANSITION_IDS.length)
  })
})

describe('durations match the approved pace', () => {
  it.each<[TransitionId, number]>([
    ['fade', 0.45],
    ['fadeUp', 0.45],
    ['cameraPush', 0.55],
    ['worldShift', 0.9],
    ['statementReveal', 0.7],
  ])('%s runs for %ss', (id, seconds) => {
    expect(TRANSITION_PRESETS[id].durationSec).toBe(seconds)
  })

  it('keeps the JS durations in step with the CSS tokens', () => {
    expect(DURATIONS.scene).toBe(0.45)
    expect(DURATIONS.world).toBe(0.9)
  })
})

describe('RTL direction mirroring', () => {
  it('treats the next page as coming from the left', () => {
    expect(RTL_SIGN).toBe(-1)
  })

  it.each<TransitionId>(['fade', 'worldShift'])(
    '%s enters from the left going forward and mirrors going back',
    (id) => {
      const preset = TRANSITION_PRESETS[id]
      const forward = preset.initial(1).x as number
      const backward = preset.initial(-1).x as number

      expect(forward).toBeLessThan(0)
      expect(forward).toBe(-backward)
      expect(preset.exit(1).x).toBe(-forward)
    },
  )

  it('gives statementReveal no movement at all — the sentence simply exists', () => {
    const target = TRANSITION_PRESETS.statementReveal.initial(1)
    expect(target.x).toBeUndefined()
    expect(target.scale).toBeUndefined()
  })
})

describe('reduced motion', () => {
  it.each(TRANSITION_IDS)('strips all movement from %s', (id) => {
    const reduced = toReducedMotion(TRANSITION_PRESETS[id])
    const target = reduced.initial(1)

    expect(target.x).toBeUndefined()
    expect(target.y).toBeUndefined()
    expect(target.scale).toBeUndefined()
    expect(target.opacity).toBe(0)
    expect(reduced.durationSec).toBe(DURATIONS.fast)
  })

  it('is selected by the reducedMotion flag', () => {
    expect(getTransitionPreset('worldShift', true).initial(1).x).toBeUndefined()
    expect(getTransitionPreset('worldShift', false).initial(1).x).toBeDefined()
  })
})

describe('statement phases', () => {
  const statements = SCENES.filter(isStatementScene)

  it('covers exactly 5 scenes', () => {
    expect(statements).toHaveLength(5)
  })

  /* Reads the layout rather than re-deriving it. The hand-rolled
     `steps.length + 1` was right only while no statementReveal scene had
     comparison columns — it would have gone quietly wrong the moment one did,
     asserting the phase at a beat the scene no longer uses. */
  it('reveals only at each scene’s own statement beat, after any steps', () => {
    for (const scene of statements) {
      const { statementBeat } = getBeatLayout(scene)
      expect(statementBeat, scene.id).not.toBeNull()
      expect(getStatementPhase(scene, statementBeat! - 1)).toBe('sentence')
      expect(getStatementPhase(scene, statementBeat!)).toBe('revealed')
    }
  })

  it('holds the finale on its sentence through all four closing lines', () => {
    const finale = SCENES[32]
    for (const beat of [0, 1, 2, 3, 4]) {
      expect(getStatementPhase(finale, beat)).toBe('sentence')
    }
    expect(getStatementPhase(finale, 5)).toBe('revealed')
  })

  it('reports no phase for scenes that are not statements', () => {
    const others = SCENES.filter((s) => !isStatementScene(s))
    expect(others.every((s) => getStatementPhase(s, 0) === null)).toBe(true)
    expect(others.every((s) => getStatementPhase(s, 2) === null)).toBe(true)
  })
})
