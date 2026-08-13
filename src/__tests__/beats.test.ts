import { describe, expect, it } from 'vitest'
import { SCENES } from '@/data/scenes'
import { INTERACTION_BY_ID } from '@/data/interactions'
import { getBeatLayout, getSceneBeatCount } from '@/lib/beats'

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

      for (let i = 0; i < layout.stepCount; i++) {
        claim(layout.stepsStart + i, 'step')
      }
      if (layout.statementBeat !== null) claim(layout.statementBeat, 'statement')
      if (layout.interactionStart !== null) {
        for (let i = 0; i < layout.interactionBeats; i++) {
          claim(layout.interactionStart + i, 'interaction')
        }
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
