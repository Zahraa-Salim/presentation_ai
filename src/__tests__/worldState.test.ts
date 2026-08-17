import { describe, expect, it } from 'vitest'
import { SCENES, SCENE_BY_ID } from '@/data/scenes'
import { INTERACTION_BY_ID } from '@/data/interactions'
import { getBeatLayout } from '@/lib/beats'
import { getFinaleConvergence } from '@/lib/finaleConvergence'
import { getPromptFocus } from '@/lib/promptFocus'
import { getActiveDistrict } from '@/lib/toolDistricts'
import { getVaultSeparation } from '@/lib/vaultState'
import { getInteractionReveal } from '@/lib/worldReveal'
import { TOOL_CATEGORIES } from '@/types'

/**
 * The two mappings that drive World 3's machine and World 4's vault.
 *
 * Both feed straight into geometry interpolation, so a NaN here corrupts every
 * vertex, and both are derived from the beat layout rather than pinned to beat
 * numbers — which is what went wrong with the World 2 dissolve when the deck
 * added reveal steps beneath it.
 */

describe('prompt focus (World 3)', () => {
  /* The scene is about naming what is missing. A beam that tightened while the
     class listed the faults would be arguing the opposite. */
  it('never focuses on the weak prompt, at any beat', () => {
    const scene = SCENE_BY_ID.get('weak-prompt')!
    const { total } = getBeatLayout(scene)
    for (let beat = 0; beat < total; beat++) {
      expect(getPromptFocus('weak-prompt', beat), `beat ${beat}`).toBe(0)
    }
  })

  it('climbs to fully focused as the strong prompt is built', () => {
    const scene = SCENE_BY_ID.get('strong-prompt')!
    const layout = getBeatLayout(scene)

    expect(getPromptFocus('strong-prompt', 0)).toBeLessThan(0.5)
    expect(
      getPromptFocus('strong-prompt', layout.stepsStart + layout.stepCount - 1),
    ).toBe(1)
  })

  it('climbs once per Prompt Lab stage, landing on the last one', () => {
    const scene = SCENE_BY_ID.get('prompt-framework')!
    const layout = getBeatLayout(scene)
    expect(layout.interactionStart).not.toBeNull()

    const atStage = (i: number) =>
      getPromptFocus('prompt-framework', layout.interactionStart! + i)

    for (let i = 1; i < layout.interactionBeats; i++) {
      expect(atStage(i)).toBeGreaterThan(atStage(i - 1))
    }
    expect(atStage(layout.interactionBeats - 1)).toBe(1)
  })

  it('rises monotonically — a prompt does not get vaguer as you add to it', () => {
    for (const id of ['strong-prompt', 'prompt-framework']) {
      const { total } = getBeatLayout(SCENE_BY_ID.get(id)!)
      for (let beat = 1; beat < total; beat++) {
        expect(
          getPromptFocus(id, beat),
          `${id} beat ${beat}`,
        ).toBeGreaterThanOrEqual(getPromptFocus(id, beat - 1))
      }
    }
  })

  it('stays in 0..1 for every scene and beat, including unknown ones', () => {
    const values = [
      getPromptFocus('does-not-exist', 0),
      getPromptFocus('', 4),
      getPromptFocus('weak-prompt', -3),
      ...SCENES.flatMap((s) =>
        [0, 1, 3, 9, 99].map((b) => getPromptFocus(s.id, b)),
      ),
    ]
    expect(values.every((v) => Number.isFinite(v) && v >= 0 && v <= 1)).toBe(true)
  })
})

describe('tool districts (World 3)', () => {
  it.each([
    ['study-tools', 'study'],
    ['creative-tools', 'creative'],
    ['coding-tools', 'coding'],
  ])('lights the %s district on %s', (sceneId, category) => {
    expect(getActiveDistrict(sceneId)).toBe(category)
  })

  /* Scene 11 is the overview — the point is that the districts are different
     jobs, not that one wins. Scene 15 asks which tool fits which task, and
     lighting the answer in the scenery answers it for the class. */
  it.each(['tools-overview', 'which-ai-for-which-task'])(
    'lights nothing on %s',
    (sceneId) => {
      expect(getActiveDistrict(sceneId)).toBeNull()
    },
  )

  it('never names a district no tool could belong to', () => {
    for (const scene of SCENES) {
      const district = getActiveDistrict(scene.id)
      if (district === null) continue
      expect(TOOL_CATEGORIES, scene.id).toContain(district)
    }
  })

  it('lights at most one district per scene, and none for unknown ids', () => {
    expect(getActiveDistrict('does-not-exist')).toBeNull()
    expect(getActiveDistrict('')).toBeNull()
  })
})

describe('interaction reveal (shared)', () => {
  /* Cyber City's forged nodes and the vault's sort both hang off this. It must
     never fire early: the indistinguishable state IS the lesson. */
  it('holds at 0 until the interaction beat, for every interactive scene', () => {
    for (const scene of SCENES.filter((s) => s.interaction)) {
      const { interactionStart, total } = getBeatLayout(scene)
      expect(interactionStart, scene.id).not.toBeNull()

      for (let beat = 0; beat < interactionStart!; beat++) {
        expect(getInteractionReveal(scene.id, beat), `${scene.id} ${beat}`).toBe(0)
      }
      for (let beat = interactionStart!; beat < total; beat++) {
        expect(getInteractionReveal(scene.id, beat), `${scene.id} ${beat}`).toBe(1)
      }
    }
  })

  it('stays 0 for scenes with no interaction at all', () => {
    for (const scene of SCENES.filter((s) => !s.interaction)) {
      const { total } = getBeatLayout(scene)
      for (let beat = 0; beat < total; beat++) {
        expect(getInteractionReveal(scene.id, beat), scene.id).toBe(0)
      }
    }
  })

  it('never returns anything but 0 or 1, including for unknown scenes', () => {
    const values = [
      getInteractionReveal('does-not-exist', 3),
      getInteractionReveal('', 0),
      ...SCENES.flatMap((s) =>
        [0, 2, 99].map((b) => getInteractionReveal(s.id, b)),
      ),
    ]
    expect(values.every((v) => v === 0 || v === 1)).toBe(true)
  })
})

describe('finale convergence (scene 33)', () => {
  const finale = SCENE_BY_ID.get('final')!

  it('starts apart and arrives whole exactly on the statement', () => {
    const { statementBeat } = getBeatLayout(finale)
    expect(statementBeat).not.toBeNull()

    expect(getFinaleConvergence('final', 0)).toBe(0)
    expect(getFinaleConvergence('final', statementBeat!)).toBe(1)
  })

  it('draws closer with every closing line, never back', () => {
    const { total } = getBeatLayout(finale)
    for (let beat = 1; beat < total; beat++) {
      expect(
        getFinaleConvergence('final', beat),
        `beat ${beat}`,
      ).toBeGreaterThanOrEqual(getFinaleConvergence('final', beat - 1))
    }
  })

  /* Derived from the layout, so cutting or adding a closing line re-paces the
     convergence rather than desynchronising it from the words. */
  it('re-paces itself against the number of closing lines', () => {
    const { stepCount, statementBeat } = getBeatLayout(finale)
    expect(stepCount).toBeGreaterThan(0)
    expect(getFinaleConvergence('final', stepCount)).toBeCloseTo(
      stepCount / statementBeat!,
      5,
    )
  })

  it('leaves every other scene at zero, and survives unknown ids', () => {
    for (const scene of SCENES) {
      if (scene.id === 'final') continue
      expect(getFinaleConvergence(scene.id, 3), scene.id).toBe(0)
    }
    expect(getFinaleConvergence('does-not-exist', 2)).toBe(0)
    expect(getFinaleConvergence('final', -5)).toBe(0)
  })
})

describe('vault separation (World 4)', () => {
  it('holds everything undifferentiated until the class has answered', () => {
    const scene = SCENE_BY_ID.get('what-not-to-share')!
    const { interactionStart } = getBeatLayout(scene)
    expect(interactionStart).not.toBeNull()

    for (let beat = 0; beat < interactionStart!; beat++) {
      expect(getVaultSeparation('what-not-to-share', beat), `beat ${beat}`).toBe(0)
    }
    expect(getVaultSeparation('what-not-to-share', interactionStart!)).toBe(1)
  })

  /* The sort is scene 26's payoff. Any other scene in the world showing it
     would answer the question before it has been asked. */
  it.each([
    'is-chatgpt-a-friend',
    'why-ai-feels-like-a-friend',
    'friend-lifecoach-secretkeeper',
    'what-to-share',
    'before-send',
  ])('leaves %s unsorted at every beat', (sceneId) => {
    const { total } = getBeatLayout(SCENE_BY_ID.get(sceneId)!)
    for (let beat = 0; beat < total; beat++) {
      expect(getVaultSeparation(sceneId, beat), `beat ${beat}`).toBe(0)
    }
  })

  it('stays in 0..1 for every scene and beat, including unknown ones', () => {
    const values = [
      getVaultSeparation('does-not-exist', 0),
      getVaultSeparation('', 7),
      ...SCENES.flatMap((s) =>
        [0, 1, 3, 9, 99].map((b) => getVaultSeparation(s.id, b)),
      ),
    ]
    expect(values.every((v) => Number.isFinite(v) && v >= 0 && v <= 1)).toBe(true)
  })

  /* The vault reads which items pass from the sorter's own data. If every item
     were on one side, the separation would show nothing. */
  it('has both kinds of item to separate', () => {
    const items = INTERACTION_BY_ID['privacy-sorter'].options
    expect(items.some((o) => o.correct === true)).toBe(true)
    expect(items.some((o) => o.correct === false)).toBe(true)
  })
})
