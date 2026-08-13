import { describe, expect, it } from 'vitest'
import { SCENES, TOTAL_SCENES } from '@/data/scenes'
import { WORLDS } from '@/data/worlds'
import { INTERACTIONS, INTERACTION_BY_ID } from '@/data/interactions'
import { AI_HISTORY } from '@/data/aiHistory'
import { AI_PIPELINE } from '@/data/aiPipeline'
import { validateContent } from '@/lib/validateContent'
import { isTodo } from '@/lib/todo'

/**
 * Guards the presentation data itself: structure, timing and content
 * integrity. This is the suite that catches a scene going missing, a world
 * budget drifting, or invented copy slipping in.
 */

describe('deck structure', () => {
  const report = validateContent()

  it('has no structural errors', () => {
    expect(report.errors).toEqual([])
  })

  it('has no timing warnings', () => {
    expect(report.warnings).toEqual([])
  })

  it('holds exactly 33 scenes running 45 minutes', () => {
    expect(TOTAL_SCENES).toBe(33)
    expect(report.totalMinutes).toBe(45)
  })

  it('numbers scenes contiguously from 1', () => {
    SCENES.forEach((scene, index) => {
      expect(scene.index).toBe(index + 1)
    })
  })

  it('gives every scene a unique id', () => {
    expect(new Set(SCENES.map((s) => s.id)).size).toBe(SCENES.length)
  })

  it('keeps each world in one unbroken block', () => {
    const runs: string[] = []
    for (const scene of SCENES) {
      if (runs.at(-1) !== scene.world) runs.push(scene.world)
    }
    expect(runs).toEqual(WORLDS.map((w) => w.id))
  })
})

describe('world budgets', () => {
  it.each([
    ['ai-world', 5, 300],
    ['ai-lab', 5, 480],
    ['study-lab', 11, 780],
    ['privacy', 7, 660],
    ['future', 5, 480],
  ])('gives %s %i scenes and %i seconds', (world, count, seconds) => {
    const scenes = SCENES.filter((s) => s.world === world)
    expect(scenes).toHaveLength(count)
    expect(scenes.reduce((sum, s) => sum + s.durationSec, 0)).toBe(seconds)
  })

  it('sums to exactly 45 minutes', () => {
    expect(SCENES.reduce((sum, s) => sum + s.durationSec, 0)).toBe(2700)
  })
})

describe('interactions', () => {
  it('defines all nine', () => {
    expect(INTERACTIONS).toHaveLength(9)
  })

  it('cross-references its host scene both ways', () => {
    for (const interaction of INTERACTIONS) {
      const host = SCENES.find((s) => s.id === interaction.sceneId)
      expect(host, interaction.id).toBeDefined()
      expect(host?.interaction).toBe(interaction.id)
    }
  })

  it('gives every interactive scene a real interaction', () => {
    const interactive = SCENES.filter((s) => s.type === 'interactive')
    expect(interactive).toHaveLength(9)
    expect(
      interactive.every((s) => s.interaction && INTERACTION_BY_ID[s.interaction]),
    ).toBe(true)
  })

  it('fits every interaction inside its scene’s duration', () => {
    for (const interaction of INTERACTIONS) {
      const host = SCENES.find((s) => s.id === interaction.sceneId)
      expect(interaction.estimatedSec).toBeLessThanOrEqual(host!.durationSec)
    }
  })

  it('marks no mind-reader possibility as correct — none of them is the answer', () => {
    const mindReader = INTERACTION_BY_ID['mind-reader']
    expect(mindReader.options.every((o) => o.correct === undefined)).toBe(true)
  })
})

describe('World 1 reference data', () => {
  it('orders the history milestones chronologically with unique years', () => {
    expect(AI_HISTORY).toHaveLength(5)
    expect(
      AI_HISTORY.every((m, i) => i === 0 || m.year > AI_HISTORY[i - 1].year),
    ).toBe(true)
    expect(new Set(AI_HISTORY.map((m) => m.year)).size).toBe(AI_HISTORY.length)
  })

  it('leaves every milestone caption to the deck rather than inventing one', () => {
    expect(AI_HISTORY.every((m) => isTodo(m.captionAr))).toBe(true)
  })
})

describe('World 2 pipeline', () => {
  it('matches the stage ids to scene 9’s reveal steps, in order', () => {
    const scene = SCENES.find((s) => s.id === 'how-ai-works')!
    expect(scene.content.steps?.map((s) => s.id)).toEqual(
      AI_PIPELINE.map((s) => s.id),
    )
  })

  it('advances stage positions from 0 to 1', () => {
    expect(AI_PIPELINE).toHaveLength(5)
    expect(AI_PIPELINE[0].position).toBe(0)
    expect(AI_PIPELINE[4].position).toBe(1)
    expect(
      AI_PIPELINE.every(
        (s, i) => i === 0 || s.position > AI_PIPELINE[i - 1].position,
      ),
    ).toBe(true)
  })

  it('leaves every stage caption to the deck', () => {
    expect(AI_PIPELINE.every((s) => isTodo(s.captionAr))).toBe(true)
  })
})

describe('content gaps are tracked, not hidden', () => {
  it('reports the outstanding count so nothing ships as silent placeholder', () => {
    const report = validateContent()
    expect(report.todoCount).toBeGreaterThan(0)
    /* This number should FALL as the source deck arrives. If it rises
       unexpectedly, content was added as TODO rather than filled in. */
    expect(report.todoCount).toBeLessThanOrEqual(90)
  })
})
