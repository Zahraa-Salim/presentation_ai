import { describe, expect, it } from 'vitest'
import { SCENES } from '@/data/scenes'
import { getPollWeights } from '@/lib/pollWeights'
import { getMindFormation } from '@/lib/mindFormation'
import { INTERACTION_BY_ID } from '@/data/interactions'

describe('poll weights (World 1, Interaction A)', () => {
  it('rests level and low before anything is chosen', () => {
    const resting = getPollWeights(3, null)
    expect(new Set(resting).size).toBe(1)
    expect(resting[0]).toBeLessThan(0.3)
  })

  it.each([0, 1, 2])('gives the chosen option %i full weight', (selected) => {
    const weights = getPollWeights(3, selected)
    expect(weights[selected]).toBe(1)
    expect(weights.filter((_, i) => i !== selected).every((w) => w < 1)).toBe(
      true,
    )
  })

  it('descends the runners-up in declared order', () => {
    expect(getPollWeights(4, 0)).toEqual([1, 0.45, 0.25, 0.15])
  })

  it('still descends the others when the last option wins', () => {
    const weights = getPollWeights(4, 3)
    expect(weights[3]).toBe(1)
    expect(weights[0]).toBeGreaterThan(weights[1])
    expect(weights[1]).toBeGreaterThan(weights[2])
  })

  /* The bars carry relative weight only. Showing invented percentages in a
     lesson about not trusting AI output would model exactly the wrong thing. */
  it('never exceeds 1, so nothing can read as a percentage over 100', () => {
    for (let selected = 0; selected < 6; selected++) {
      expect(getPollWeights(6, selected).every((w) => w <= 1)).toBe(true)
    }
  })

  it('is deterministic', () => {
    expect(getPollWeights(3, 1)).toEqual(getPollWeights(3, 1))
  })

  it('survives zero options and more options than preset weights', () => {
    expect(getPollWeights(0, null)).toEqual([])
    expect(getPollWeights(9, 0).every((w) => w > 0 && w <= 1)).toBe(true)
  })
})

describe('mind formation (World 2)', () => {
  it.each(['not-a-mind-reader', 'context'])(
    'keeps the brain intact through %s',
    (sceneId) => {
      expect([0, 1, 2, 5].every((b) => getMindFormation(sceneId, b) === 0)).toBe(
        true,
      )
    },
  )

  it('dissolves the brain on the second beat of AI مش سحر', () => {
    expect(getMindFormation('not-magic', 0)).toBe(0)
    expect(getMindFormation('not-magic', 1)).toBe(1)
    expect(getMindFormation('not-magic', 4)).toBe(1)
  })

  it.each(['how-ai-works', 'why-ai-makes-mistakes'])(
    'leaves %s as machinery — once broken it stays broken',
    (sceneId) => {
      expect([0, 1, 3, 5].every((b) => getMindFormation(sceneId, b) === 1)).toBe(
        true,
      )
    },
  )

  /* The value feeds straight into geometry interpolation, so a NaN would
     corrupt every vertex position. */
  it('always returns a finite value in 0..1, even for unknown scenes', () => {
    const values = [
      getMindFormation('does-not-exist', 0),
      getMindFormation('', 3),
      ...SCENES.flatMap((s) => [0, 1, 2, 5].map((b) => getMindFormation(s.id, b))),
    ]
    expect(
      values.every((v) => Number.isFinite(v) && v >= 0 && v <= 1),
    ).toBe(true)
  })
})

describe('World 1 shape', () => {
  const world1 = SCENES.filter((s) => s.world === 'ai-world')

  it('runs 5 scenes over 5 minutes', () => {
    expect(world1).toHaveLength(5)
    expect(world1.reduce((sum, s) => sum + s.durationSec, 0)).toBe(300)
  })

  it('opens on a cinematic and closes on a statement', () => {
    expect(world1[0].type).toBe('cinematic')
    expect(world1[4].type).toBe('statement')
  })

  it('splits its 3D between the opening and the timeline', () => {
    expect(world1.slice(0, 3).every((s) => s.scene3d === 'opening')).toBe(true)
    expect(world1.slice(3).every((s) => s.scene3d === 'aiHistory')).toBe(true)
  })

  it('covers the opening poll with number keys 1-3', () => {
    expect(world1[1].interaction).toBe('opening-poll')
    expect(INTERACTION_BY_ID['opening-poll'].options).toHaveLength(3)
  })
})

describe('World 2 shape', () => {
  const world2 = SCENES.filter((s) => s.world === 'ai-lab')

  it('runs 5 scenes over 8 minutes', () => {
    expect(world2).toHaveLength(5)
    expect(world2.reduce((sum, s) => sum + s.durationSec, 0)).toBe(480)
  })

  it('uses one environment throughout, so the dissolve reads as continuous', () => {
    expect(world2.every((s) => s.scene3d === 'aiMind')).toBe(true)
  })

  it('gives the mind reader a statement plus four unanswerable possibilities', () => {
    const mindReader = INTERACTION_BY_ID['mind-reader']
    expect(mindReader.kind).toBe('reveal')
    expect(mindReader.options[0].id).toBe('statement')
    expect(mindReader.options).toHaveLength(5)
    expect(
      mindReader.options.some((o) => o.id === 'reveal-context'),
    ).toBe(false)
  })
})
