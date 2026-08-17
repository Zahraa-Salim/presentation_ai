import { describe, expect, it } from 'vitest'
import { SCENES } from '@/data/scenes'
import {
  ON_TRACK_TOLERANCE_SEC,
  TOTAL_BUDGET_SEC,
  cumulativeBudgetSec,
  formatClock,
  getPacing,
} from '@/lib/presenterPacing'

/**
 * The presenter's pacing readout. The clock itself is `performance.now()` and
 * an interval — nothing worth testing. Everything that could actually be wrong
 * was extracted here, which is the point of the split.
 */

describe('formatClock', () => {
  it.each<[number, string]>([
    [0, '0:00'],
    [5, '0:05'],
    [59, '0:59'],
    [60, '1:00'],
    [599, '9:59'],
    [600, '10:00'],
    [2700, '45:00'],
  ])('renders %i seconds as %s', (seconds, expected) => {
    expect(formatClock(seconds)).toBe(expected)
  })

  /* A presenter 25 minutes over needs to read the overrun at a glance, not
     decode an hour field. */
  it('does not roll over into hours', () => {
    expect(formatClock(4215)).toBe('70:15')
    expect(formatClock(3600)).toBe('60:00')
  })

  it('clamps negatives rather than rendering a minus sign', () => {
    expect(formatClock(-1)).toBe('0:00')
    expect(formatClock(-9999)).toBe('0:00')
  })

  it('floors fractions and survives non-finite input', () => {
    expect(formatClock(61.9)).toBe('1:01')
    expect(formatClock(Number.NaN)).toBe('0:00')
    expect(formatClock(Number.POSITIVE_INFINITY)).toBe('0:00')
  })

  it('always renders exactly two digits after the colon', () => {
    for (let s = 0; s < 200; s++) {
      expect(formatClock(s).split(':')[1]).toHaveLength(2)
    }
  })
})

describe('deck budget', () => {
  /* Pins the presenter clock to the same 2700s the content suite asserts,
     without making the validator depend on this module. */
  it('totals the deck exactly', () => {
    expect(TOTAL_BUDGET_SEC).toBe(2700)
    expect(TOTAL_BUDGET_SEC).toBe(
      SCENES.reduce((sum, s) => sum + s.durationSec, 0),
    )
  })

  it('starts at zero and ends at the full budget', () => {
    expect(cumulativeBudgetSec(0)).toBe(0)
    expect(cumulativeBudgetSec(SCENES.length)).toBe(TOTAL_BUDGET_SEC)
  })

  it.each(SCENES.map((_, i) => i))('matches a naive sum at index %i', (index) => {
    const naive = SCENES.slice(0, index).reduce((sum, s) => sum + s.durationSec, 0)
    expect(cumulativeBudgetSec(index)).toBe(naive)
  })

  it('never decreases', () => {
    for (let i = 1; i <= SCENES.length; i++) {
      expect(cumulativeBudgetSec(i)).toBeGreaterThanOrEqual(
        cumulativeBudgetSec(i - 1),
      )
    }
  })

  /* A bad index must never reach the projector as NaN. */
  it('clamps out-of-range indices at both ends', () => {
    expect(cumulativeBudgetSec(-5)).toBe(0)
    expect(cumulativeBudgetSec(9999)).toBe(TOTAL_BUDGET_SEC)
    expect(cumulativeBudgetSec(Number.NaN)).toBe(0)
  })
})

describe('pacing status', () => {
  const at = (elapsedSec: number, sceneIndex = 0, sceneElapsedSec = 0) =>
    getPacing({ elapsedSec, sceneIndex, sceneElapsedSec })

  it('reads on time when exactly on budget', () => {
    const pacing = at(0)
    expect(pacing.status).toBe('onTrack')
    expect(pacing.driftSec).toBe(0)
  })

  it.each([0, 15, ON_TRACK_TOLERANCE_SEC])(
    'holds on time within the dead band, ±%i',
    (drift) => {
      expect(at(drift).status).toBe('onTrack')
      expect(at(-drift).status).toBe('onTrack')
    },
  )

  it.each([31, 120, 900])('reports behind at +%i', (drift) => {
    const pacing = at(drift)
    expect(pacing.status).toBe('behind')
    expect(pacing.driftSec).toBe(drift)
  })

  it.each([31, 120, 900])('reports ahead at -%i', (drift) => {
    // Sitting in scene 2 having spent no time in it: expected is scene 1's
    // budget, so an elapsed below that is genuinely ahead.
    const expected = cumulativeBudgetSec(1)
    const pacing = at(expected - drift, 1, 0)
    expect(pacing.status).toBe('ahead')
    expect(pacing.driftSec).toBe(drift)
  })

  /* The badge renders `متقدّم 2:00`, never `-2:00`. A leading minus beside
     Arabic reorders unpredictably, so the sign lives in the word instead. */
  it('never returns a negative drift, whatever the input', () => {
    const inputs = [-5000, 0, 37, 2700, 9999]
    for (const elapsedSec of inputs) {
      for (let sceneIndex = 0; sceneIndex < SCENES.length; sceneIndex++) {
        for (const sceneElapsedSec of [0, 45, 500]) {
          const { driftSec } = getPacing({
            elapsedSec,
            sceneIndex,
            sceneElapsedSec,
          })
          expect(driftSec).toBeGreaterThanOrEqual(0)
          expect(Number.isFinite(driftSec)).toBe(true)
        }
      }
    }
  })
})

describe('scene budget', () => {
  it('does not let an overrun inflate the expectation', () => {
    const short = getPacing({ elapsedSec: 0, sceneIndex: 0, sceneElapsedSec: 10 })
    const wild = getPacing({
      elapsedSec: 0,
      sceneIndex: 0,
      sceneElapsedSec: 99999,
    })
    expect(wild.expectedSec).toBe(SCENES[0].durationSec)
    expect(wild.expectedSec).toBeGreaterThan(short.expectedSec)
  })

  it('flags the overrun exactly past the scene’s duration', () => {
    const duration = SCENES[0].durationSec
    expect(getPacing({ elapsedSec: 0, sceneIndex: 0, sceneElapsedSec: duration }).sceneOverrun).toBe(false)
    expect(getPacing({ elapsedSec: 0, sceneIndex: 0, sceneElapsedSec: duration + 1 }).sceneOverrun).toBe(true)
  })

  it('keeps the budget bar within 0..1', () => {
    for (const sceneElapsedSec of [-10, 0, 30, 99999]) {
      const { sceneBudgetUsed } = getPacing({
        elapsedSec: 0,
        sceneIndex: 3,
        sceneElapsedSec,
      })
      expect(sceneBudgetUsed).toBeGreaterThanOrEqual(0)
      expect(sceneBudgetUsed).toBeLessThanOrEqual(1)
    }
  })
})

/**
 * The reason the expectation clamps to the scene's own budget. Without it the
 * drift sawtooths — climbing through each scene, then dropping by a whole
 * duration at the transition — which is unreadable at a glance.
 */
describe('pacing is continuous across scene boundaries', () => {
  it.each(SCENES.slice(0, -1).map((_, i) => i))(
    'hands over cleanly from scene %i to the next',
    (index) => {
      const endOfScene = getPacing({
        elapsedSec: 0,
        sceneIndex: index,
        sceneElapsedSec: SCENES[index].durationSec,
      })
      const startOfNext = getPacing({
        elapsedSec: 0,
        sceneIndex: index + 1,
        sceneElapsedSec: 0,
      })
      expect(endOfScene.expectedSec).toBe(startOfNext.expectedSec)
    },
  )

  it('banks the saved time when a scene finishes early', () => {
    const beforeMoving = getPacing({
      elapsedSec: 100,
      sceneIndex: 0,
      sceneElapsedSec: 10,
    })
    const afterMoving = getPacing({
      elapsedSec: 100,
      sceneIndex: 1,
      sceneElapsedSec: 0,
    })
    expect(afterMoving.expectedSec).toBeGreaterThan(beforeMoving.expectedSec)
  })

  it('stays on time walking the whole deck exactly to budget', () => {
    let elapsedSec = 0
    for (let index = 0; index < SCENES.length; index++) {
      const pacing = getPacing({ elapsedSec, sceneIndex: index, sceneElapsedSec: 0 })
      expect(pacing.driftSec, `scene ${index + 1}`).toBe(0)
      expect(pacing.status, `scene ${index + 1}`).toBe('onTrack')
      elapsedSec += SCENES[index].durationSec
    }
    expect(elapsedSec).toBe(TOTAL_BUDGET_SEC)
  })
})
