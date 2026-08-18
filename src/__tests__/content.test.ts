import { describe, expect, it } from 'vitest'
import { SCENES, TOTAL_SCENES } from '@/data/scenes'
import { WORLDS } from '@/data/worlds'
import { INTERACTIONS, INTERACTION_BY_ID } from '@/data/interactions'
import { AI_HISTORY } from '@/data/aiHistory'
import { AI_PIPELINE } from '@/data/aiPipeline'
import { validateContent } from '@/lib/validateContent'
import { MAX_CHOICE_KEY } from '@/lib/keymap'
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

/**
 * The comparison columns carry meaning that must survive a washed-out
 * projector, so the Arabic label is mandatory — `tone` only reinforces it.
 */
describe('comparison columns', () => {
  const grouped = SCENES.filter((s) => (s.content.groups?.length ?? 0) > 0)

  it('gives every column a non-empty label, never colour alone', () => {
    for (const scene of grouped) {
      for (const group of scene.content.groups!) {
        expect(group.label.trim(), `${scene.id}/${group.id}`).not.toBe('')
      }
    }
  })

  it('gives every column a unique id within its scene', () => {
    for (const scene of grouped) {
      const ids = scene.content.groups!.map((g) => g.id)
      expect(new Set(ids).size, scene.id).toBe(ids.length)
    }
  })

  /* Four columns will not read at projection distance on a 1366×768 screen. */
  it('never compares more than three columns at once', () => {
    for (const scene of grouped) {
      expect(scene.content.groups!.length, scene.id).toBeLessThanOrEqual(3)
      expect(scene.content.groups!.length, scene.id).toBeGreaterThanOrEqual(2)
    }
  })

  it('never leaves a column empty', () => {
    for (const scene of grouped) {
      expect(
        scene.content.groups!.every((g) => g.items.length > 0),
        scene.id,
      ).toBe(true)
    }
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

  /*
    Which kinds the presenter drives with number keys. `reveal` states an answer
    rather than offering one, `lab` builds up a beat at a time, and `sorter`
    puts items into buckets — none of the three picks one of N.
  */
  const PICK_ONE_KINDS = new Set(['poll', 'explorer', 'quiz', 'branch'])

  it('keeps every pick-one interaction inside the number keys', () => {
    const pickOne = INTERACTIONS.filter((i) => PICK_ONE_KINDS.has(i.kind))
    expect(pickOne.length).toBeGreaterThan(0)
    for (const interaction of pickOne) {
      expect(interaction.options.length, interaction.id).toBeLessThanOrEqual(
        MAX_CHOICE_KEY,
      )
    }
  })

  /* The sorter carries twelve items, which no single digit could ever address —
     it is exempt because it is not a pick-one, not because the cap is wrong. */
  it('leaves the sorter off the number keys', () => {
    const sorter = INTERACTION_BY_ID['privacy-sorter']
    expect(sorter.kind).toBe('sorter')
    expect(PICK_ONE_KINDS.has(sorter.kind)).toBe(false)
    expect(sorter.options.length).toBeGreaterThan(MAX_CHOICE_KEY)
  })

  /*
    Four interactions share ChoiceReveal, which pairs option[i] with
    facilitationAr[i]. A list that is neither complete nor entirely unsupplied
    would silently attach the wrong consequence to a choice.
  */
  it('pairs every choice with its own line, or has supplied none yet', () => {
    for (const id of ['dependency', 'career', 'tool-explorer', 'study-companion'] as const) {
      const interaction = INTERACTION_BY_ID[id]
      const complete =
        interaction.facilitationAr.length === interaction.options.length
      const unsupplied = interaction.facilitationAr.every(isTodo)
      expect(complete || unsupplied, id).toBe(true)
    }
  })

  it('gives the Prompt Lab one question per build stage', () => {
    const lab = INTERACTION_BY_ID['prompt-lab']
    expect(lab.facilitationAr).toHaveLength(lab.options.length)
  })

  /* The sorter's verdict is safe-vs-never, not right-vs-wrong, and the word is
     what carries it — the tint alone would vanish on a bright projector. */
  it('gives the sorter its own verdict wording and a verdict for every item', () => {
    const sorter = INTERACTION_BY_ID['privacy-sorter']
    expect(sorter.verdictAr?.correct).toBeTruthy()
    expect(sorter.verdictAr?.incorrect).toBeTruthy()
    expect(sorter.verdictAr?.correct).not.toBe(sorter.verdictAr?.incorrect)
    expect(
      sorter.options.every((o) => typeof o.correct === 'boolean'),
    ).toBe(true)
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

  /* The milestone and the beat that reveals it are joined by these ids, the
     same way scene 9 is joined to AI_PIPELINE. Drift and the presenter narrates
     one milestone while another appears. */
  it('matches scene 4’s reveal steps, in order', () => {
    const scene = SCENES.find((s) => s.id === 'ai-is-not-new')!
    expect(scene.content.steps?.map((s) => s.id)).toEqual(
      AI_HISTORY.map((m) => m.id),
    )
    expect(scene.content.steps?.map((s) => s.text)).toEqual(
      AI_HISTORY.map((m) => m.captionAr),
    )
  })

  it('carries the deck’s caption for every milestone', () => {
    expect(AI_HISTORY.every((m) => !isTodo(m.captionAr) && m.captionAr !== '')).toBe(
      true,
    )
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

  it('carries the deck’s caption for every stage', () => {
    expect(
      AI_PIPELINE.every((s) => !isTodo(s.captionAr) && s.captionAr !== ''),
    ).toBe(true)
  })

  /* The 3D node that lights up and the DOM label beside it are joined by these
     captions — if they drift apart the presenter narrates one stage while the
     lattice highlights another. */
  it('matches scene 9’s step text word for word', () => {
    const scene = SCENES.find((s) => s.id === 'how-ai-works')!
    expect(scene.content.steps?.map((s) => s.text)).toEqual(
      AI_PIPELINE.map((s) => s.captionAr),
    )
    expect(scene.content.steps?.map((s) => s.label)).toEqual(
      AI_PIPELINE.map((s) => s.label),
    )
  })
})

describe('content gaps are tracked, not hidden', () => {
  /*
    85 → 0. The deck filled most of it; content-2.json supplied the column
    headings and speaker notes it lacked, and content-3.json the Real-or-Fake
    pair, the tool list and the closing entrepreneurship line.
  */
  /* Closed. Every slot is filled, so this is an equality now rather than a
     ceiling: a new TODO is a regression, not a known debt being worked down. */
  it('has no outstanding content gaps at all', () => {
    expect(validateContent().todoCount).toBe(0)
  })

  /*
    An empty `speakerNotes: []` carries no TODO marker, so `todoCount` cannot
    see it — presenter mode shipped complete while 30 of 33 scenes had nothing
    to show in it, and no gate said a word. Tracked as its own number.

    Now at full coverage, so this is an equality, not a floor: a scene added
    without notes fails here rather than quietly showing an empty panel.
  */
  it('gives every scene speaker notes — presenter mode has no empty panels', () => {
    const report = validateContent()
    expect(report.scenesWithSpeakerNotes).toBe(SCENES.length)
  })

  it('leaves no scene with a token single note', () => {
    const thin = SCENES.filter((s) => s.speakerNotes.length < 2).map((s) => s.id)
    // Scene 2's note came from the deck as one line about how the poll runs.
    expect(thin).toEqual(['opening-poll'])
  })

  /* The slots the merged deck actually lives in. Left uncounted, the ratchet
     above measured a shrinking fraction of the content. */
  it('counts a TODO wherever content can now hide', () => {
    const covered = SCENES.flatMap((s) => [
      s.content.example,
      s.content.keyMessage,
      ...(s.content.steps?.map((step) => step.label) ?? []),
      ...(s.content.groups?.flatMap((g) => [g.label, ...g.items]) ?? []),
    ]).filter((v): v is string => typeof v === 'string')

    expect(covered.length).toBeGreaterThan(0)
    expect(covered.some(isTodo)).toBe(false)
  })

  it('leaves no gap at all in Worlds 1 and 2', () => {
    const early = SCENES.filter(
      (s) => s.world === 'ai-world' || s.world === 'ai-lab',
    )
    const strings = early.flatMap((s) => [
      s.title,
      ...Object.values(s.content).flatMap((v) =>
        typeof v === 'string' ? [v] : [],
      ),
      ...(s.content.steps?.map((step) => step.text) ?? []),
      ...(s.content.groups?.flatMap((g) => [g.label, ...g.items]) ?? []),
    ])
    expect(strings.some(isTodo)).toBe(false)
  })
})
