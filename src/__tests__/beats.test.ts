import { describe, expect, it } from 'vitest'
import { SCENES } from '@/data/scenes'
import { INTERACTION_BY_ID } from '@/data/interactions'
import {
  areStepsStepped,
  getBeatLayout,
  getSceneBeatCount,
  getStepTiming,
} from '@/lib/beats'

describe('beat layout', () => {
  it('agrees with the beat count for every scene', () => {
    for (const scene of SCENES) {
      expect(getBeatLayout(scene).total).toBe(getSceneBeatCount(scene))
    }
  })

  it('leaves no beat unowned and none owned twice', () => {
    for (const scene of SCENES) {
      const layout = getBeatLayout(scene)
      const owners = new Map<number, string>()

      const claim = (beat: number, who: string) => {
        expect(owners.get(beat), `scene ${scene.index} beat ${beat}`).toBe(
          undefined,
        )
        owners.set(beat, who)
      }

      // Auto-paced steps cost no beat, so they claim none.
      if (areStepsStepped(scene)) {
        for (let i = 0; i < layout.stepCount; i++) {
          claim(layout.stepsStart + i, 'step')
        }
      }
      if (layout.groupsStart !== null) {
        for (let i = 0; i < layout.groupCount; i++) {
          claim(layout.groupsStart + i, 'group')
        }
      }
      if (layout.statementBeat !== null) claim(layout.statementBeat, 'statement')
      if (layout.interactionStart !== null) {
        for (let i = 0; i < layout.interactionBeats; i++) {
          claim(layout.interactionStart + i, 'interaction')
        }
      }
      if (layout.keyMessageBeat !== null) {
        claim(layout.keyMessageBeat, 'keyMessage')
      }

      for (let beat = 1; beat < layout.total; beat++) {
        expect(owners.has(beat), `scene ${scene.index} beat ${beat}`).toBe(true)
      }
    }
  })

  it('always starts steps at beat 1, straight after the scene at rest', () => {
    expect(SCENES.every((s) => getBeatLayout(s).stepsStart === 1)).toBe(true)
  })

  it('has an interaction range exactly when the scene has an interaction', () => {
    for (const scene of SCENES) {
      const hasRange = getBeatLayout(scene).interactionStart !== null
      expect(hasRange).toBe(scene.interaction !== undefined)
    }
  })

  it('has a statement beat exactly for statementReveal scenes', () => {
    for (const scene of SCENES) {
      const hasStatement = getBeatLayout(scene).statementBeat !== null
      expect(hasStatement).toBe(scene.transition === 'statementReveal')
    }
  })

  it('places the statement after any reveal steps', () => {
    const finale = SCENES[32]
    const layout = getBeatLayout(finale)
    expect(layout.stepCount).toBe(4)
    expect(layout.statementBeat).toBe(5)
  })

  it('has a keyMessage beat exactly when the scene has a keyMessage', () => {
    for (const scene of SCENES) {
      const hasBeat = getBeatLayout(scene).keyMessageBeat !== null
      expect(hasBeat, scene.id).toBe(scene.content.keyMessage !== undefined)
    }
  })

  /* The takeaway is a conclusion, so nothing may follow it — including the
     interaction on the five interactive scenes that carry one. */
  it('always lands the keyMessage on the final beat', () => {
    for (const scene of SCENES) {
      const layout = getBeatLayout(scene)
      if (layout.keyMessageBeat === null) continue
      expect(layout.keyMessageBeat, scene.id).toBe(layout.total - 1)
    }
  })

  it('has a group range exactly when the scene has comparison columns', () => {
    for (const scene of SCENES) {
      const hasRange = getBeatLayout(scene).groupsStart !== null
      expect(hasRange).toBe((scene.content.groups?.length ?? 0) > 0)
    }
  })

  /* Steps → groups → statement → interaction. A comparison must be able to
     resolve into a statement, so groups sit before it, not after. */
  it('orders groups after the steps and before the statement', () => {
    for (const scene of SCENES) {
      const layout = getBeatLayout(scene)
      if (layout.groupsStart === null) continue

      const stepBeats = areStepsStepped(scene) ? layout.stepCount : 0
      expect(layout.groupsStart).toBe(layout.stepsStart + stepBeats)
      if (layout.statementBeat !== null) {
        expect(layout.statementBeat).toBe(layout.groupsStart + layout.groupCount)
      }
    }
  })
})

/**
 * Seven single words should not cost seven presses — but four scenes depend on
 * the presenter driving each line, and losing that would cost the deck its
 * ending.
 */
describe('step pacing', () => {
  const STEPPED = ['ai-is-not-new', 'how-ai-works', 'strong-prompt', 'final']

  it('keeps exactly the four scenes that need it presenter-stepped', () => {
    const stepped = SCENES.filter(areStepsStepped).map((s) => s.id)
    expect(stepped.sort()).toEqual([...STEPPED].sort())
  })

  it('costs no beat for an auto-paced list', () => {
    for (const scene of SCENES) {
      if (areStepsStepped(scene) || !scene.content.steps?.length) continue
      const layout = getBeatLayout(scene)
      // Whatever comes next starts immediately after the scene at rest.
      const next =
        layout.groupsStart ?? layout.statementBeat ?? layout.interactionStart
      if (next !== null && next !== undefined) expect(next, scene.id).toBe(1)
    }
  })

  it('shows every auto-paced step at rest, staggered in order', () => {
    const scene = SCENES.find((s) => s.id === 'ai-is-everywhere')!
    const layout = getBeatLayout(scene)
    expect(layout.stepCount).toBe(7)

    let previous = -1
    for (let i = 0; i < layout.stepCount; i++) {
      const timing = getStepTiming(scene, 0, i)
      expect(timing.revealed, `step ${i}`).toBe(true)
      expect(timing.delaySec, `step ${i}`).toBeGreaterThan(previous)
      previous = timing.delaySec
    }
  })

  it('holds a stepped list until its beat arrives, with no stagger', () => {
    const finale = SCENES.find((s) => s.id === 'final')!
    const layout = getBeatLayout(finale)

    for (let i = 0; i < layout.stepCount; i++) {
      const beat = layout.stepsStart + i
      expect(getStepTiming(finale, beat - 1, i).revealed, `step ${i}`).toBe(false)
      expect(getStepTiming(finale, beat, i).revealed, `step ${i}`).toBe(true)
      expect(getStepTiming(finale, beat, i).delaySec).toBe(0)
    }
  })

  /*
    Steps are addressed by index, never by beat number. Once auto-paced steps
    stopped consuming beats, `stepsStart + index` collided with whatever came
    next — on a three-step scene, step 0 and the keyMessage were both "beat 1",
    so the takeaway appeared at rest alongside the list it concludes.
  */
  it('never lets an auto-paced step reach the beat its scene lands on', () => {
    for (const scene of SCENES) {
      const layout = getBeatLayout(scene)
      const landing = layout.keyMessageBeat ?? layout.statementBeat
      if (landing === null || !scene.content.steps?.length) continue
      if (areStepsStepped(scene)) continue

      // The landing beat is past rest, so it cannot be showing at beat 0.
      expect(landing, scene.id).toBeGreaterThan(0)
    }
  })
})

describe('interaction beats', () => {
  it('gives the Prompt Lab one beat per build stage', () => {
    const lab = INTERACTION_BY_ID['prompt-lab']
    expect(lab.kind).toBe('lab')
    expect(getBeatLayout(SCENES[17]).interactionBeats).toBe(lab.options.length)
  })

  it('gives every other interaction a single resolution beat', () => {
    for (const scene of SCENES) {
      if (!scene.interaction) continue
      const interaction = INTERACTION_BY_ID[scene.interaction]
      if (interaction.kind === 'lab') continue
      expect(getBeatLayout(scene).interactionBeats).toBe(1)
    }
  })
})
